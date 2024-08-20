import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { queryLLM } from '../../../utils/llmQuery';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { product, categoryId, subcategoryId } = req.body;

    // Fetch the selected category and subcategory
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) },
      include: { department: true },
    });

    const subcategory = await prisma.category.findUnique({
      where: { id: parseInt(subcategoryId) },
    });

    if (!category || !subcategory) {
      return res.status(400).json({ message: 'Invalid category or subcategory' });
    }

    // Use LLM to confirm or suggest a different category and subcategory
    const prompt = `Given the product "${product}", the suggested category "${category.name}" in the department "${category.department.name}", and the subcategory "${subcategory.name}", confirm if these are correct or suggest more appropriate ones.`;
    const llmResponse = await queryLLM({
      providerId: 1, // Assuming OpenAI is the default provider
      modelId: 1, // Assuming GPT-3.5-turbo is the default model
      prompt,
    });

    // TODO: Parse the LLM response to determine if the category and subcategory are confirmed or new ones are suggested

    res.status(200).json({ 
      product,
      suggestedCategory: category.name,
      suggestedSubcategory: subcategory.name,
      llmResponse,
    });
  } catch (error) {
    console.error('Error identifying category:', error);
    res.status(500).json({ message: 'Error identifying category' });
  }
}
