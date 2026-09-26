import { Content } from './db.js';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const apiKey = process.env.OPENROUTER_API_KEY;
const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: apiKey ? apiKey.trim() : '',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'SecondBrain',
  },
});

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "openai/text-embedding-3-small";

let INDEX_DIM = 768;

// ---------- Detect embedding dimension ----------
async function detectEmbeddingDim() {
  try {
    const res = await openrouter.embeddings.create({
      model: EMBEDDING_MODEL,
      input: "test",
      dimensions: 768,
    });
    const dim = res?.data?.[0]?.embedding?.length || 768;
    INDEX_DIM = dim;
    console.log(`✅ Detected OpenRouter embedding dimension: ${INDEX_DIM}`);
  } catch (err) {
    console.warn("⚠️ Failed to detect embedding dimension, using default 768:", err.message || err);
  }
}

// ---------- Pinecone index management ----------
async function ensureIndex() {
  await detectEmbeddingDim();
  const indexName = process.env.PINECONE_INDEX || 'secondbrain-index';

  try {
    const list = await pinecone.listIndexes();
    const exists = list.indexes?.some(i => i.name === indexName || i === indexName);

    if (exists) {
      console.log(`✅ Pinecone index '${indexName}' ready.`);
      return;
    }

    console.log(`⏳ Creating Pinecone index '${indexName}' ...`);
    await pinecone.createIndex({
      name: indexName,
      dimension: 768,
      metric: "cosine",
      spec: {
        serverless: { cloud: "aws", region: "us-east-1" }
      }
    });

    console.log('✅ Index created successfully.');
  } catch (error) {
    if (error.message?.includes('ALREADY_EXISTS') || error.status === 409) {
      console.log(`✅ Pinecone index '${indexName}' already exists.`);
      return;
    }
    console.warn('⚠️ Pinecone index check note:', error.message);
  }
}

// Bootstrapping Pinecone safely
(async () => {
  try {
    await ensureIndex();
    const indexName = process.env.PINECONE_INDEX || 'secondbrain-index';
    global.pcIndex = pinecone.index(indexName);
    console.log(`✅ Pinecone instance bound to '${indexName}'`);
  } catch (err) {
    console.warn('⚠️ Pinecone initialization note:', err.message);
  }
})();

// ---------- Helpers ----------
function chunkText(text, maxTokens = Number(process.env.MAX_CHUNK_TOKENS) || 500) {
  const maxChars = maxTokens * 4;
  const parts = text.replace(/\r\n/g, '\n').split(/\n\n+/);
  const chunks = [];

  for (const para of parts) {
    if (para.length <= maxChars) {
      chunks.push(para);
    } else {
      const sentences = para.split(/(?<=[.!?])\s+/);
      let buf = '';
      for (const s of sentences) {
        if ((buf + ' ' + s).trim().length > maxChars) {
          if (buf) chunks.push(buf.trim());
          buf = s;
        } else {
          buf = (buf ? buf + ' ' : '') + s;
        }
      }
      if (buf) chunks.push(buf.trim());
    }
  }

  return chunks.flatMap(ch => {
    if (ch.length <= maxChars) return [ch];
    const out = [];
    for (let i = 0; i < ch.length; i += maxChars) out.push(ch.slice(i, i + maxChars));
    return out;
  }).filter(Boolean);
}

async function embedBatch(texts) {
  const vectors = [];

  for (const t of texts) {
    try {
      const res = await openrouter.embeddings.create({
        model: EMBEDDING_MODEL,
        input: t,
        dimensions: 768,
      });
      const values = res?.data?.[0]?.embedding;
      if (!values || !values.length) {
        console.error("❌ Empty OpenRouter embedding for:", t.slice(0, 80));
        continue;
      }
      console.log(`✅ OpenRouter embedding length ${values.length} for "${t.slice(0, 40)}..."`);
      vectors.push(values);
    } catch (err) {
      console.error("❌ OpenRouter embedding failed:", err.message || err);
    }
  }

  return vectors;
}

// Pinecone ID helpers
function toPineconeId(mongoId, userId, n = 0) {
  return `${userId}::${mongoId}::${n}`;
}
function parsePineconeId(id) {
  const [userId, mongoId, n] = id.split('::');
  return { userId, mongoId, n: Number(n) };
}

// ---------- Ingestion ----------
async function ingestDocument({ userId, title = '', text = '', tags = [], link = '', type = 'document' }) {
  if (!userId) throw new Error('userId is required');

  const now = new Date();
  const bodyText = text || title || 'Saved item';
  const newContent = new Content({
    userId,
    title: title || 'Untitled',
    text: bodyText,
    link,
    type,
    tags,
    createdAt: now,
    updatedAt: now,
  });
  const savedContent = await newContent.save();

  try {
    const chunks = chunkText(bodyText);
    const embeddings = await embedBatch(chunks);
    
    if (embeddings.length && global.pcIndex) {
      const vectors = embeddings.map((values, i) => ({
        id: toPineconeId(savedContent._id.toString(), userId, i),
        values,
        metadata: {
          userId,
          mongoId: savedContent._id.toString(),
          chunk: i,
          title,
          type,
          preview: chunks[i] ? chunks[i].slice(0, 400) : '',
          tags,
        },
      }));

      await global.pcIndex.upsert(vectors);
      console.log(`✅ Upserted ${vectors.length} vector chunks to Pinecone for doc ${savedContent._id}`);
      return { id: savedContent._id.toString(), chunks: chunks.length };
    }
  } catch (pineconeErr) {
    console.warn('⚠️ Pinecone vector upsert skipped/failed:', pineconeErr.message);
  }

  return { id: savedContent._id.toString(), chunks: 0 };
}

async function retrieveUserContext({ userId, query, topK = Number(process.env.TOPK_DEFAULT) || 5 }) {
  let scored = [];
  let matches = [];

  // Check if query is asking for general summary, list of items, or overview
  const isGeneralQuery = /summarize|summary|all|notes|cards|saved|list|overview|everything|what do i have|brain/i.test(query);

  try {
    const qVecArr = await embedBatch([query]);
    const qVec = qVecArr[0];

    if (qVec && global.pcIndex) {
      const result = await global.pcIndex.query({
        vector: qVec,
        topK,
        includeMetadata: true,
        filter: { userId: { $eq: userId } },
      });

      matches = result.matches || [];
      const byDoc = new Map();

      for (const m of matches) {
        const { mongoId } = m.metadata || {};
        if (!mongoId) continue;
        if (!byDoc.has(mongoId)) byDoc.set(mongoId, { score: m.score, pieces: [] });
        const entry = byDoc.get(mongoId);
        entry.score = Math.max(entry.score, m.score);
        if (m.metadata?.preview) entry.pieces.push(m.metadata.preview);
      }

      const ids = [...byDoc.keys()];
      const docs = ids.length ? await Content.find({ _id: { $in: ids } }) : [];

      scored = docs.map(d => ({
        doc: d,
        score: byDoc.get(d._id.toString())?.score ?? 0,
        previews: byDoc.get(d._id.toString())?.pieces ?? [],
      })).sort((a, b) => b.score - a.score);
    }
  } catch (err) {
    console.warn("⚠️ Vector retrieve error (falling back to Mongo text match):", err.message);
  }

  // If general query or vector search returned few/no results, supplement directly from MongoDB
  if (isGeneralQuery || scored.length < 3) {
    const existingIds = new Set(scored.map(s => s.doc._id.toString()));
    const recentDocs = await Content.find({ userId }).sort({ createdAt: -1 }).limit(10);
    
    for (const d of recentDocs) {
      if (!existingIds.has(d._id.toString())) {
        scored.push({
          doc: d,
          score: 0.6,
          previews: [d.text || d.title || 'Saved item'],
        });
      }
    }
  }

  // Build context string for LLM
  const MAX_CTX_CHARS = 7000;
  let used = 0;
  const contextBlocks = [];

  for (const item of scored) {
    const header = `# Title: ${item.doc.title || 'Untitled'} (Type: ${item.doc.type || 'document'})\n`;
    const details = item.doc.link ? `Link: ${item.doc.link}\n` : '';
    const tags = item.doc.tags?.length ? `Tags: ${item.doc.tags.join(', ')}\n` : '';
    const body = (item.previews.join('\n')) || item.doc.text?.slice(0, 1200) || '';
    const block = header + details + tags + body + '\n\n';
    if (used + block.length > MAX_CTX_CHARS) break;
    contextBlocks.push(block);
    used += block.length;
  }

  return {
    matches,
    context: contextBlocks.join('\n'),
    sources: scored.map(s => ({ id: s.doc._id.toString(), title: s.doc.title, type: s.doc.type, score: s.score }))
  };
}

// ---------- OpenRouter Provider Integration ----------
async function generateOpenRouterResponse(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    throw new Error('OPENROUTER_API_KEY is missing in backend/.env file.');
  }

  const models = [
    process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
    'openai/gpt-4o-mini',
    'google/gemini-flash-1.5-8b',
    'meta-llama/llama-3.3-70b-instruct',
    'deepseek/deepseek-r1',
    'google/gemini-2.0-flash-exp:free',
    'mistralai/mistral-7b-instruct:free'
  ];

  let lastError = null;
  for (const modelName of models) {
    try {
      console.log(`⏳ Querying OpenRouter (${modelName})...`);
      const response = await openrouter.chat.completions.create({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
      });
      const text = response.choices[0]?.message?.content;
      if (text) {
        console.log(`✅ OpenRouter AI response successfully generated using '${modelName}'`);
        return text;
      }
    } catch (err) {
      console.warn(`⚠️ OpenRouter model '${modelName}' notice:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('OpenRouter generation failed across all candidate models');
}

// ---------- RAG Generation ----------
async function generateContentWithFallback(prompt) {
  return await generateOpenRouterResponse(prompt);
}

async function answerWithRAG({ userId, query, topK }) {
  // Step 1: Run retrieval and query embedding via OpenRouter
  const { context, sources } = await retrieveUserContext({ userId, query, topK });

  // Step 2: Fetch actual card objects for top sources to recommend in chatbot UI
  const sourceIds = sources.map(s => s.id).filter(Boolean);
  const relevantCards = sourceIds.length > 0 
    ? await Content.find({ _id: { $in: sourceIds }, userId }).limit(3)
    : [];

  // Step 3: Build helpful, constructive prompt
  const prompt = `You are SecondBrain AI, a friendly and intelligent personal knowledge assistant.
Analyze the user's question and answer directly based on their saved SecondBrain cards below.

Guidelines:
1. Always use the provided cards context (titles, types, links, tags, and text contents) to construct your response.
2. If the user asks to summarize, list, or overview their saved notes or cards, summarize all provided cards directly using clean Markdown bullet points.
3. Be helpful, concise, and well-structured. Bold key titles and terms.
4. Only state that no information is saved if the context is completely empty and zero cards exist.

User Question: ${query}

Saved Cards Context:
${context}

Response:
`;

  // Step 4: Generate response via OpenRouter
  const answer = await generateContentWithFallback(prompt);

  return { answer, sources, relevantCards };
}

async function deleteContent({ id, userId }) {
  if (!id || !userId) throw new Error('id and userId are required');

  try {
    if (global.pcIndex) {
      await global.pcIndex.deleteOne(toPineconeId(id, userId));
    }
  } catch (err) {
    console.warn("⚠️ Pinecone delete warning:", err.message);
  }
  return { success: true };
}

export { ingestDocument, retrieveUserContext, answerWithRAG, toPineconeId, parsePineconeId, chunkText, deleteContent };
