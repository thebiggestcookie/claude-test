// pages/api/categories/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
      include: { department: true, parentCategory: true }
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
        department: { connect: { id: departmentId } },
        parentCategory: parentCategoryId ? { connect: { id: parentCategoryId } } : undefined,
      },
      include: { department: true, parentCategory: true }
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: 'Error creating category', error });
  }
}

// pages/api/categories/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      return getCategory(req, res, Number(id));
    case 'PUT':
      return updateCategory(req, res, Number(id));
    case 'DELETE':
      return deleteCategory(req, res, Number(id));
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getCategory(req: NextApiRequest, res: NextApiResponse, id: number) {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { department: true, parentCategory: true, subCategories: true }
    });
    if (category) {
      res.status(200).json(category);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error });
  }
}

async function updateCategory(req: NextApiRequest, res: NextApiResponse, id: number) {
  try {
    const { name, departmentId, parentCategoryId } = req.body;
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        department: { connect: { id: departmentId } },
        parentCategory: parentCategoryId ? { connect: { id: parentCategoryId } } : { disconnect: true },
      },
      include: { department: true, parentCategory: true }
    });
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: 'Error updating category', error });
  }
}

async function deleteCategory(req: NextApiRequest, res: NextApiResponse, id: number) {
  try {
    await prisma.category.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ message: 'Error deleting category', error });
  }
}
