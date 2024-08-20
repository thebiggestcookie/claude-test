// pages/api/users/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getUsers(req, res);
    case 'POST':
      return createUser(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getUsers(req: NextApiRequest, res: NextApiResponse) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true }
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
}

async function createUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { username, email, password, role } = req.body;
    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
      },
    });
    res.status(201).json({ id: user.id, username: user.username, email: user.email, role: user.role });
  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error });
  }
}

// pages/api/users/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      return getUser(req, res, Number(id));
    case 'PUT':
      return updateUser(req, res, Number(id));
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getUser(req: NextApiRequest, res: NextApiResponse, id: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, email: true, role: true }
    });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
}

async function updateUser(req: NextApiRequest, res: NextApiResponse, id: number) {
  try {
    const { username, email, role } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: { username, email, role },
      select: { id: true, username: true, email: true, role: true }
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error updating user', error });
  }
}
