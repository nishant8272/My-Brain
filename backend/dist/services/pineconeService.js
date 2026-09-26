import { pcIndex } from '../config/ai.js';
import { toPineconeId } from '../utils/helpers.js';
import { embedBatch } from './embeddingService.js';
import { chunkText } from '../utils/helpers.js';
export async function upsertDocumentVectors(savedContent) {
    try {
        const bodyText = savedContent.text || savedContent.title || 'Saved item';
        const chunks = chunkText(bodyText);
        const embeddings = await embedBatch(chunks);
        if (embeddings.length && pcIndex) {
            const vectors = embeddings.map((values, i) => ({
                id: toPineconeId(savedContent._id.toString(), savedContent.userId.toString(), i),
                values,
                metadata: {
                    userId: savedContent.userId.toString(),
                    mongoId: savedContent._id.toString(),
                    chunk: i,
                    title: savedContent.title,
                    type: savedContent.type,
                    preview: chunks[i] ? chunks[i].slice(0, 400) : '',
                    tags: savedContent.tags,
                },
            }));
            await pcIndex.upsert(vectors);
            console.log(`✅ Upserted ${vectors.length} vector chunks to Pinecone for doc ${savedContent._id}`);
            return chunks.length;
        }
    }
    catch (pineconeErr) {
        console.warn('⚠️ Pinecone vector upsert skipped/failed:', pineconeErr.message);
    }
    return 0;
}
export async function deleteDocumentVector(id, userId) {
    try {
        if (pcIndex) {
            await pcIndex.deleteOne(toPineconeId(id, userId));
        }
    }
    catch (err) {
        console.warn('⚠️ Pinecone delete warning:', err.message);
    }
}
