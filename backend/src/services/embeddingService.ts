import { openrouter } from '../config/ai.js';

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'openai/text-embedding-3-small';

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const vectors: number[][] = [];

  for (const t of texts) {
    try {
      const res = await openrouter.embeddings.create({
        model: EMBEDDING_MODEL,
        input: t,
        dimensions: 768,
      });
      const values = res?.data?.[0]?.embedding;
      if (!values || !values.length) {
        console.error('❌ Empty OpenRouter embedding for:', t.slice(0, 80));
        continue;
      }
      vectors.push(values);
    } catch (err: any) {
      console.error('❌ OpenRouter embedding failed:', err.message || err);
    }
  }

  return vectors;
}

export async function detectEmbeddingDim(): Promise<number> {
  try {
    const res = await openrouter.embeddings.create({
      model: EMBEDDING_MODEL,
      input: 'test',
      dimensions: 768,
    });
    const dim = res?.data?.[0]?.embedding?.length || 768;
    console.log(`✅ Detected OpenRouter embedding dimension: ${dim}`);
    return dim;
  } catch (err: any) {
    console.warn('⚠️ Failed to detect embedding dimension, using default 768:', err.message || err);
    return 768;
  }
}
