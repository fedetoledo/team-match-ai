import { DEFAULT_EMBEDDING_MODEL_NAME } from '@/lib/constants';
import { google } from '@ai-sdk/google';
import { embed } from 'ai';

export const generateEmbedding = async ({ query }: { query: string }) => {
  try {
    const { embedding, usage } = await embed({
      model: google.textEmbeddingModel(DEFAULT_EMBEDDING_MODEL_NAME),
      value: query,
    });

    return { embedding, usage };
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
};
