import { Content } from './db.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "embedding-001"; 
const CHAT_MODEL = process.env.CHAT_MODEL || "gemini-1.5-pro"; 

let INDEX_DIM = 0; // will auto-detect

// ---------- Detect embedding dimension ----------
async function detectEmbeddingDim() {
  try {
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    const result = await model.embedContent("test");
    const dim = result?.embedding?.values?.length || 0;
    if (dim > 0) {
      INDEX_DIM = dim;
      console.log(`✅ Detected embedding dimension: ${INDEX_DIM}`);
    } else {
      throw new Error("Could not detect embedding dimension");
    }
  } catch (err) {
    console.error("❌ Failed to detect embedding dimension:", err.message || err);
    throw err;
  }
}

// ---------- Pinecone index management ----------
async function ensureIndex() {
  if (!INDEX_DIM) await detectEmbeddingDim();
  const indexName = process.env.PINECONE_INDEX || 'secondbrain-index';

  try {
    const list = await pinecone.listIndexes();
    const exists = list.indexes?.some(i => i === indexName);

    if (exists) {
      console.log(`✅ Pinecone index '${indexName}' already exists.`);
      return;
    }

    console.log(`⏳ Creating Pinecone index '${indexName}' ...`);
    await pinecone.createIndex({
  name: process.env.PINECONE_INDEX ||"secondbrain-index",
  dimension: 768,
  metric: "cosine",
  spec: {
    serverless: { cloud: "aws", region: "us-east-1" }
  }
});

    console.log('✅ Index created. It may take a minute to be ready.');
  } catch (error) {
    if (error.message?.includes('ALREADY_EXISTS') || error.status === 409) {
      console.log(`✅ Pinecone index '${indexName}' already exists.`);
      return;
    }
    console.error('❌ Failed to create Pinecone index:', error.message);
    throw error;
  }
}

// Bootstrapping Pinecone
(async () => {
  await ensureIndex();
  global.pcIndex = pinecone.index(process.env.PINECONE_INDEX);
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
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const vectors = [];

  for (const t of texts) {
    try {
      const result = await model.embedContent(t);
      const values = result?.embedding?.values;
      if (!values || !values.length) {
        console.error("❌ Empty embedding for:", t.slice(0, 80));
        continue;
      }
      console.log(`✅ Embedding length ${values.length} for "${t.slice(0, 40)}..."`);
      vectors.push(values);
    } catch (err) {
      console.error("❌ Embedding failed:", err.message || err);
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
async function ingestDocument({ userId, title = '', text, tags = [], link = '' }) {
  if (!text || !userId) throw new Error('userId and text are required');

  const now = new Date();
  const newContent = new Content({
    userId,
    title,
    text,
    link,
    tags,
    createdAt: now,
    updatedAt: now,
  });
  const savedContent = await newContent.save();

  const chunks = chunkText(text);
  const embeddings = await embedBatch(chunks);

  if (!embeddings.length) {
    console.error("❌ No embeddings generated, skipping Pinecone upsert.");
    return { id: savedContent._id.toString(), chunks: 0 };
  }

  const vectors = embeddings.map((values, i) => ({
    id: toPineconeId(savedContent._id.toString(), userId, i),
    values,
    metadata: {
      userId,
      mongoId: savedContent._id.toString(),
      chunk: i,
      title,
      preview: chunks[i].slice(0, 400),
      tags,
    },
  }));

  await pcIndex.upsert(vectors);

  return { id: savedContent._id.toString(), chunks: chunks.length };
}

// ---------- Retrieval ----------
async function retrieveUserContext({ userId, query, topK = Number(process.env.TOPK_DEFAULT) || 5 }) {
  // Debug listing with dummy vector
  console.log("🔍 Debugging docs for user:", userId);
  const debugRes = await pcIndex.query({
    vector: Array(INDEX_DIM).fill(0),
    topK: 5,
    includeMetadata: true,
    filter: { userId: { $eq: userId } }
  });
  console.log("Debug matches:", JSON.stringify(debugRes, null, 2));

  // Real query
  const [qVec] = await embedBatch([query]);
  if (!qVec) throw new Error("❌ Query embedding failed.");

  const result = await pcIndex.query({
    vector: qVec,
    topK,
    includeMetadata: true,
    filter: { userId: { $eq: userId } },
  });

  const matches = result.matches || [];
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
  const scored = docs.map(d => ({
      doc: d,
      score: byDoc.get(d._id.toString())?.score ?? 0,
      previews: byDoc.get(d._id.toString())?.pieces ?? [],
    }))
    .sort((a, b) => b.score - a.score);

  const MAX_CTX_CHARS = 7000;
  const contextBlocks = [];
  let used = 0;
  for (const item of scored) {
    const header = `# ${item.doc.title || 'Untitled'} (doc:${item.doc._id})\n`;
    const body = (item.previews.join('\n')) || item.doc.text.slice(0, 1200);
    const block = header + body + '\n\n';
    if (used + block.length > MAX_CTX_CHARS) break;
    contextBlocks.push(block);
    used += block.length;
  }

  return { matches, context: contextBlocks.join('\n'), sources: scored.map(s => ({ id: s.doc._id.toString(), title: s.doc.title, score: s.score })) };
}

// ---------- RAG ----------
async function answerWithRAG({ userId, query, topK }) {
  const { context, sources } = await retrieveUserContext({ userId, query, topK });
  console.log('Context for query:', context);
  console.log('Sources for query:', sources);

  const prompt = `
You are a helpful assistant. 
Only answer using the provided context. 
If the context does not contain enough info, say "I don't have enough information."

Question: ${query}

Context:
${context}

Answer:
`;

  const model = genAI.getGenerativeModel({ model: CHAT_MODEL });
  const result = await model.generateContent(prompt);
  const answer = result.response.text();

  return { answer, sources };
}

async function deleteContent({ id, userId }) {
  if (!id || !userId) throw new Error('id and userId are required');
  
const index = pinecone.index(process.env.PINECONE_INDEX);

const ns = index.namespace('__default__');
await ns.deleteOne(toPineconeId(id, userId));
  return { success: true };
}

export { ingestDocument, retrieveUserContext, answerWithRAG, toPineconeId, parsePineconeId ,chunkText,deleteContent};
