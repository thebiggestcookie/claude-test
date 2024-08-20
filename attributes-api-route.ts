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
      return getAttributes(req, res);
    case 'POST':
      return createAttribute(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getAttributes(req: NextApiRequest, res: NextApiResponse) {
  const { page = '1', limit = '10' } = req.query;
  const pageNumber = parseInt(page as string);
  const limitNumber = parseInt(limit as string);

  try {
    const [attributes, totalCount] = await prisma.$transaction([
      prisma.attribute.findMany({
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        include: {
          category: true,
        },
        orderBy: { name: 'asc' },
      }),
      prisma.attribute.count(),
    ]);

    res.status(200).json({
      attributes,
      totalPages: Math.ceil(totalCount / limitNumber),
      currentPage: pageNumber,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attributes', error });
  }
}

async function createAttribute(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, dataType, categoryId, isRequired } = req.body;
    const attribute = await prisma.attribute.create({
      data: {
        name,
        dataType,
        isRequired,
        category: { connect: { id: parseInt(categoryId) } },
      },
      include: {
        category: true,
      },
    });
    res.status(201).json(attribute);
  } catch (error) {
    res.status(400).json({ message: 'Error creating attribute', error });
  }
}
