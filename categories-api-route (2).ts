import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { validateCategoryForm } from '../../utils/categoryValidation';

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
  const { page = '1', limit = '10' } = req.query;
  const pageNumber = parseInt(page as string);
  const limitNumber = parseInt(limit as string);

  try {
    const [categories, totalCount] = await prisma.$transaction([
      prisma.category.findMany({
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        include: {
          department: true,
          parentCategory: true,
          subCategories: true,
        },
        orderBy: { name: 'asc' },
      }),
      prisma.category.count(),
    ]);

    res.status(200).json({
      categories,
      totalPages: Math.ceil(totalCount / limitNumber),
      currentPage: pageNumber,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
}

async function createCategory(req: NextApiRequest, res: NextApiResponse) {
  const { name, departmentId, parentCategoryId } = req.body;
  const errors = validateCategoryForm({ name, departmentId, parentCategoryId });

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Validation error', errors });
  }

  try {
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
    res.status(500).json({ message: 'Error creating category', error });
  }
}
