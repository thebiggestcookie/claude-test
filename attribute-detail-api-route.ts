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
  const attributeId = parseInt(id as string);

  switch (req.method) {
    case 'GET':
      return getAttribute(req, res, attributeId);
    case 'PUT':
      return updateAttribute(req, res, attributeId);
    case 'DELETE':
      return deleteAttribute(req, res, attributeId);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getAttribute(req: NextApiRequest, res: NextApiResponse, id: number) {
  try {
    const attribute = await prisma.attribute.findUnique({
      where: { id },
      include: { category: true },
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
    const { name, dataType, categoryId, isRequired } = req.body;
    const attribute = await prisma.attribute.update({
      where: { id },
      data: {
        name,
        dataType,
        isRequired,
        category: { connect: { id: parseInt(categoryId) } },
      },
      include: { category: true },
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
