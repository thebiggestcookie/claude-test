import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session || session.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;
  const categoryId = parseInt(id as string);

  switch (req.method) {
    case 'GET':
      return getCategory(req, res, categoryId);
    case 'PUT':
      return updateCategory(req, res, categoryId);
    case 'DELETE':
      return deleteCategory(req, res, categoryId);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getCategory(req: NextApiRequest, res: NextApiResponse, id: number) {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        department: true,
        parentCategory: true,
        subCategories: true,
      },
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
        department: { connect: { id: parseInt(departmentId) } },
        parentCategory: parentCategoryId
          ? { connect: { id: parseInt(parentCategoryId) } }
          : { disconnect: true },
      },
      include: {
        department: true,
        parentCategory: true,
      },
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
