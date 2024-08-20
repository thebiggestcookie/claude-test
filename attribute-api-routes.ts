// pages/api/attributes/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getAttributes(req, res);
    case 'POST':
      return createAttribute(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getAttributes(req: NextApiRequest, res: NextApiResponse) {
  try {
    const attributes = await prisma.attribute.findMany({
      include: { category: true, options: true }
    });
    res.status(200).json(attributes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attributes', error });
  }
}

async function createAttribute(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, dataType, isRequired, categoryId, options } = req.body;
    const attribute = await prisma.attribute.create({
      data: {
        name,
        dataType,
        isRequired,
        category: { connect: { id: categoryId } },
        options: {
          create: options.map((option: string) => ({ value: option }))
        }
      },
      include: { category: true, options: true }
    });
    res.status(201).json(attribute);
  } catch (error) {
    res.status(400).json({ message: 'Error creating attribute', error });
  }
}

// pages/api/attributes/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      return getAttribute(req, res, Number(id));
    case 'PUT':
      return updateAttribute(req, res, Number(id));
    case 'DELETE':
      return deleteAttribute(req, res, Number(id));
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getAttribute(req: NextApiRequest, res: NextApiResponse, id: number) {
  try {
    const attribute = await prisma.attribute.findUnique({
      where: { id },
      include: { category: true, options: true }
    });
    if (attribute) {
      res.status(200).json(attribute);
    } else {
      res.status(404).json({ message: 'Attribute not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attribute', error });
  }
}

async function updateAttribute(req: NextApiRequest, res: NextApiResponse, id: number) {
  try {
    const { name, dataType, isRequired, categoryId, options } = req.body;
    const attribute = await prisma.attribute.update({
      where: { id },
      data: {
        name,
        dataType,
        isRequired,
        category: { connect: { id: categoryId } },
        options: {
          deleteMany: {},
          create: options.map((option: string) => ({ value: option }))
        }
      },
      include: { category: true, options: true }
    });
    res.status(200).json(attribute);
  } catch (error) {
    res.status(400).json({ message: 'Error updating attribute', error });
  }
}

async function deleteAttribute(req: NextApiRequest, res: NextApiResponse, id: number) {
  try {
    await prisma.attribute.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ message: 'Error deleting attribute', error });
  }
}
