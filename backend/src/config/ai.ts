import { Pinecone, Index } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY || '';
const pineconeKey = process.env.PINECONE_API_KEY || 'dummy_pinecone_key';

export const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: apiKey.trim(),
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'SecondBrain',
  },
});

export const pinecone = new Pinecone({
  apiKey: pineconeKey,
});

export let pcIndex: Index | null = null;

export async function initPinecone(): Promise<Index | null> {
  const indexName = process.env.PINECONE_INDEX || 'secondbrain-index';
  try {
    const list = await pinecone.listIndexes();
    const exists = list.indexes?.some((i: any) => i.name === indexName || i === indexName);

    if (!exists) {
      console.log(`⏳ Creating Pinecone index '${indexName}' ...`);
      await pinecone.createIndex({
        name: indexName,
        dimension: 768,
        metric: 'cosine',
        spec: {
          serverless: { cloud: 'aws', region: 'us-east-1' },
        },
      });
      console.log(`✅ Pinecone index created successfully.`);
    }

    pcIndex = pinecone.index(indexName);
    console.log(`✅ Pinecone bound to index '${indexName}'`);
    return pcIndex;
  } catch (error: any) {
    console.warn(`⚠️ Pinecone init note:`, error.message);
    try {
      pcIndex = pinecone.index(indexName);
      return pcIndex;
    } catch {
      return null;
    }
  }
}
