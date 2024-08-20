import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      return getProducts(req, res);
    case 'POST':
      return createProduct(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getProducts(req: NextApiRequest, res: NextApiResponse) {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, attributes: { include: { attribute: true } } },
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
}

async function createProduct(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, description, categoryId, attributes } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        description,
        category: { connect: { id: parseInt(categoryId) } },
        attributes: {
          create: attributes.map((attr: any) => ({
            attribute: { connect: { id: attr.attributeId } },
            value: attr.value,
          })),
        },
      },
      include: { category: true, attributes: { include: { attribute: true } } },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Error creating product', error });
  }
}
