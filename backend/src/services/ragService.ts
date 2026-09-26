import { Content } from '../models/Content.js';
import { pcIndex, openrouter } from '../config/ai.js';
import { embedBatch } from './embeddingService.js';

export async function retrieveUserContext({ userId, query, topK = Number(process.env.TOPK_DEFAULT) || 5 }: { userId: string; query: string; topK?: number }) {
  let scored: Array<{ doc: any; score: number; previews: string[] }> = [];
  let matches: any[] = [];

  const isGeneralQuery = /summarize|summary|all|notes|cards|saved|list|overview|everything|what do i have|brain/i.test(query);

  try {
    const qVecArr = await embedBatch([query]);
    const qVec = qVecArr[0];

    if (qVec && pcIndex) {
      const result = await pcIndex.query({
        vector: qVec,
        topK,
        includeMetadata: true,
        filter: { userId: { $eq: userId } },
      });

      matches = result.matches || [];
      const byDoc = new Map<string, { score: number; pieces: string[] }>();

      for (const m of matches) {
        const mongoId = m.metadata?.mongoId;
        if (!mongoId) continue;
        if (!byDoc.has(mongoId)) byDoc.set(mongoId, { score: m.score, pieces: [] });
        const entry = byDoc.get(mongoId)!;
        entry.score = Math.max(entry.score, m.score);
        if (m.metadata?.preview) entry.pieces.push(m.metadata.preview);
      }

      const ids = [...byDoc.keys()];
      const docs = ids.length ? await Content.find({ _id: { $in: ids } }) : [];

      scored = docs.map((d: any) => ({
        doc: d,
        score: byDoc.get((d._id as any).toString())?.score ?? 0,
        previews: byDoc.get((d._id as any).toString())?.pieces ?? [],
      })).sort((a, b) => b.score - a.score);
    }
  } catch (err: any) {
    console.warn("⚠️ Vector retrieve error (falling back to Mongo text match):", err.message);
  }

  // Fallback / General Query handler
  if (isGeneralQuery || scored.length < 3) {
    const existingIds = new Set(scored.map(s => (s.doc._id as any).toString()));
    const recentDocs = await Content.find({ userId }).sort({ createdAt: -1 }).limit(10);
    
    for (const d of recentDocs) {
      if (!existingIds.has((d._id as any).toString())) {
        scored.push({
          doc: d,
          score: 0.6,
          previews: [d.text || d.title || 'Saved item'],
        });
      }
    }
  }

  // Build context text
  const MAX_CTX_CHARS = 7000;
  let used = 0;
  const contextBlocks: string[] = [];

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
    sources: scored.map(s => ({ id: (s.doc._id as any).toString(), title: s.doc.title, type: s.doc.type, score: s.score }))
  };
}

export async function generateOpenRouterResponse(prompt: string): Promise<string> {
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

  let lastError: any = null;
  for (const modelName of models) {
    try {
      console.log(`⏳ Querying OpenRouter (${modelName})...`);
      const response = await openrouter.chat.completions.create({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
      });
      const text = response.choices[0]?.message?.content;
      if (text) {
        console.log(`✅ OpenRouter AI response generated using '${modelName}'`);
        return text;
      }
    } catch (err: any) {
      console.warn(`⚠️ OpenRouter model '${modelName}' notice:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('OpenRouter generation failed across all candidate models');
}

export async function answerWithRAG({ userId, query, topK = 5 }: { userId: string; query: string; topK?: number }) {
  const { context, sources } = await retrieveUserContext({ userId, query, topK });

  const sourceIds = sources.map(s => s.id).filter(Boolean);
  const relevantCards = sourceIds.length > 0 
    ? await Content.find({ _id: { $in: sourceIds }, userId }).limit(3)
    : [];

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

  const answer = await generateOpenRouterResponse(prompt);
  return { answer, sources, relevantCards };
}
