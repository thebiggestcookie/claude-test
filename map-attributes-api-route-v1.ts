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
    const { product, subcategoryId, attributes } = req.body;

    // Fetch the subcategory
    const subcategory = await prisma.category.findUnique({
      where: { id: parseInt(subcategoryId) },
      include: { attributes: true },
    });

    if (!subcategory) {
      return res.status(400).json({ message: 'Invalid subcategory' });
    }

    // Prepare the attribute list for the prompt
    const attributeList = subcategory.attributes.map(attr => `${attr.name} (${attr.dataType})`).join(', ');

    // Use LLM to map attributes
    const prompt = `For the product "${product}" in the subcategory "${subcategory.name}", map the following attributes: ${attributeList}. Respond in JSON format where keys are attribute names and values are the corresponding values for this product.`;
    
    const llmResponse = await queryLLM({
      providerId: 1, // Assuming OpenAI is the default provider
      modelId: 1, // Assuming GPT-3.5-turbo is the default model
      prompt,
    });

    const mappedAttributes = JSON.parse(llmResponse);

    res.status(200).json({ 
      mappedAttributes,
      debug: {
        prompt,
        llmResponse
      }
    });
  } catch (error) {
    console.error('Error mapping attributes:', error);
    res.status(500).json({ message: 'Error mapping attributes' });
  }
}
