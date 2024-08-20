import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session || session.user.role !== 'HUMAN_GRADER') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Find the first ungraded product
    const nextProduct = await prisma.product.findFirst({
      where: {
        generatedProduct: {
          humanGradedProduct: null
        }
      },
      include: {
        category: true,
        attributes: {
          include: {
            attribute: true
          }
        },
        generatedProduct: true
      }
    });

    if (!nextProduct) {
      return res.status(404).json({ message: 'No more products to grade' });
    }

    // Format the product data for the frontend
    const formattedProduct = {
      id: nextProduct.id,
      name: nextProduct.name,
      description: nextProduct.description,
      category: nextProduct.category,
      attributes: nextProduct.attributes.map(pa => ({
        id: pa.attributeId,
        name: pa.attribute.name,
        value: pa.value,
        dataType: pa.attribute.dataType,
        isRequired: pa.attribute.isRequired
      })),
      aiConfidence: nextProduct.generatedProduct?.aiConfidence
    };

    res.status(200).json(formattedProduct);
  } catch (error) {
    console.error('Error fetching next product:', error);
    res.status(500).json({ message: 'Error fetching next product' });
  }
}
