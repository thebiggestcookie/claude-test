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
      return getLLMModels(req, res);
    case 'POST':
      return createLLMModel(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getLLMModels(req: NextApiRequest, res: NextApiResponse) {
  try {
    const models = await prisma.lLMModel.findMany({
      include: { provider: true },
    });
    res.status(200).json(models);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching LLM models', error });
  }
}

async function createLLMModel(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, providerId } = req.body;
    const model = await prisma.lLMModel.create({
      data: {
        name,
        provider: { connect: { id: parseInt(providerId) } },
      },
      include: { provider: true },
    });
    res.status(201).json(model);
  } catch (error) {
    res.status(400).json({ message: 'Error creating LLM model', error });
  }
}
