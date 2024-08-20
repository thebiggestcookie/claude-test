import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session || session.user.role !== 'HUMAN_GRADER') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { productId, attributes, approved } = req.body;

    // Start a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create or update the HumanGradingSession
      let session = await prisma.humanGradingSession.findFirst({
        where: { userId: session.user.id, completedAt: null },
      });

      if (!session) {
        session = await prisma.humanGradingSession.create({
          data: { userId: session.user.id },
        });
      }

      // Create the HumanGradedProduct
      const humanGradedProduct = await prisma.humanGradedProduct.create({
        data: {
          productId,
          sessionId: session.id,
          categoryId: (await prisma.product.findUnique({ where: { id: productId } })).categoryId,
          aiAttributes: {}, // You may want to store the original AI-generated attributes here
          humanAttributes: attributes.reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
          isApproved: approved,
        },
      });

      // Update the Product attributes
      for (const attr of attributes) {
        await prisma.productAttribute.update({
          where: { productId_attributeId: { productId, attributeId: attr.id } },
          data: { value: attr.value },
        });
      }

      // Calculate grading stats
      const totalGraded = await prisma.humanGradedProduct.count({
        where: { session: { userId: session.user.id } },
      });

      const accuracySum = await prisma.humanGradedProduct.aggregate({
        where: { session: { userId: session.user.id } },
        _sum: { aiConfidence: true },
      });

      const accuracy = accuracySum._sum.aiConfidence / totalGraded * 100;

      return { totalGraded, accuracy };
    });

    res.status(200).json({
      message: 'Grading submitted successfully',
      stats: {
        reviewed: result.totalGraded,
        accuracy: result.accuracy,
      },
    });
  } catch (error) {
    console.error('Error submitting grading:', error);
    res.status(500).json({ message: 'Error submitting grading' });
  }
}
