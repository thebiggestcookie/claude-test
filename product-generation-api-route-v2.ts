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
    const { input } = req.body;

    // Use LLM to generate product list
    const prompt = `Generate a list of 5 specific products related to: ${input}. Format the response as a JSON array of strings.`;
    const llmResponse = await queryLLM({
      providerId: 1, // Assuming OpenAI is the default provider
      modelId: 1, // Assuming GPT-3.5-turbo is the default model
      prompt,
    });

    // Parse the LLM response into an array of products
    const products = JSON.parse(llmResponse);

    res.status(200).json({ 
      products,
      debug: {
        prompt,
        llmResponse
      }
    });
  } catch (error) {
    console.error('Error generating products:', error);
    res.status(500).json({ message: 'Error generating products' });
  }
}
