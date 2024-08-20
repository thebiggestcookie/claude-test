import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session || session.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      return getCategories(req, res);
    case 'POST':
      return createCategory(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getCategories(req: NextApiRequest, res: NextApiResponse) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        department: true,
        parentCategory: true,
        subCategories: true,
      },
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
}

async function createCategory(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, departmentId, parentCategoryId } = req.body;
    const category = await prisma.category.create({
      data: {
        name,
        department: { connect: { id: parseInt(departmentId) } },
        parentCategory: parentCategoryId ? { connect: { id: parseInt(parentCategoryId) } } : undefined,
      },
      include: {
        department: true,
        parentCategory: true,
      },
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: 'Error creating category', error });
  }
}
