import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface LLMQueryParams {
  providerId: number;
  modelId: number;
  prompt: string;
  maxTokens?: number;
}

interface LLMProvider {
  id: number;
  name: string;
  apiKey: string;
}

interface LLMModel {
  id: number;
  name: string;
}

export async function queryLLM({ providerId, modelId, prompt, maxTokens = 500 }: LLMQueryParams): Promise<string> {
  try {
    const provider = await fetchProvider(providerId);
    const model = await fetchModel(modelId);

    const response = await makeAPICall(provider, model, prompt, maxTokens);

    // Log the query for debugging and analysis
    await logLLMQuery(providerId, modelId, prompt, response);

    return response;
  } catch (error) {
    console.error('Error querying LLM:', error);
    throw new Error('Failed to query LLM');
  }
}

async function fetchProvider(providerId: number): Promise<LLMProvider> {
  const provider = await prisma.lLMProvider.findUnique({
    where: { id: providerId },
  });

  if (!provider) {
    throw new Error(`Provider with id ${providerId} not found`);
  }

  return provider;
}

async function fetchModel(modelId: number): Promise<LLMModel> {
  const model = await prisma.lLMModel.findUnique({
    where: { id: modelId },
  });

  if (!model) {
    throw new Error(`Model with id ${modelId} not found`);
  }

  return model;
}

async function makeAPICall(provider: LLMProvider, model: LLMModel, prompt: string, maxTokens: number): Promise<string> {
  switch (provider.name.toLowerCase()) {
    case 'openai':
      return makeOpenAICall(provider.apiKey, model.name, prompt, maxTokens);
    case 'anthropic':
      return makeAnthropicCall(provider.apiKey, model.name, prompt, maxTokens);
    default:
      throw new Error(`Unsupported LLM provider: ${provider.name}`);
  }
}

async function makeOpenAICall(apiKey: string, model: string, prompt: string, maxTokens: number): Promise<string> {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.choices[0].message.content.trim();
}

async function makeAnthropicCall(apiKey: string, model: string, prompt: string, maxTokens: number): Promise<string> {
  const response = await axios.post(
    'https://api.anthropic.com/v1/complete',
    {
      model: model,
      prompt: prompt,
      max_tokens_to_sample: maxTokens,
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.completion.trim();
}

async function logLLMQuery(providerId: number, modelId: number, prompt: string, response: string) {
  try {
    await prisma.lLMQuery.create({
      data: {
        providerId,
        modelId,
        prompt,
        response,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Error logging LLM query:', error);
  }
}
