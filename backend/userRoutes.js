import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { authenticateToken } from './auth.js';
import dotenv from 'dotenv';
dotenv.config();
import { ingestDocument, retrieveUserContext, answerWithRAG, deleteContent } from './searching.js';
import { User, Content, Link, ChatSession, ChatMessage } from './db.js';

import { random } from './util.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const UserRoutes = express.Router();

// Helper to infer content type from URL or text
function detectContentType(link, text, requestedType) {
  if (requestedType && ['youtube', 'twitter', 'document', 'link', 'note'].includes(requestedType)) {
    return requestedType;
  }
  if (link) {
    const l = link.toLowerCase();
    if (l.includes('youtube.com') || l.includes('youtu.be')) return 'youtube';
    if (l.includes('twitter.com') || l.includes('x.com')) return 'twitter';
    return 'link';
  }
  return text && text.trim().length > 0 ? 'document' : 'note';
}

// GET /api/user/me - Get active user details
UserRoutes.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const count = await Content.countDocuments({ userId: req.userId });
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      contentCount: count
    });
  } catch (e) {
    res.status(500).json({ error: 'failed_to_fetch_me', details: e.message });
  }
});

// GET /api/user/content - Fetch user contents (with optional filters)
UserRoutes.get('/content', authenticateToken, async (req, res) => {
  try {
    const { type, tag, search } = req.query;
    const filter = { userId: req.userId };

    if (type && type !== 'all') {
      filter.type = type;
    }
    if (tag) {
      filter.tags = tag;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { text: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const contents = await Content.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: contents.length, contents });
  } catch (e) {
    console.error('Fetch content error:', e);
    res.status(500).json({ error: 'fetch_content_failed', details: e.message });
  }
});

// POST /api/user/content - Add content
UserRoutes.post('/content', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { title = '', text = '', tags = [], link = '', type: reqType } = req.body;

    if (!title && !text && !link) {
      return res.status(400).json({ error: 'Title, text, or link is required' });
    }

    const contentType = detectContentType(link, text, reqType);
    const contentTitle = title || (contentType === 'youtube' ? 'YouTube Video' : contentType === 'twitter' ? 'Tweet' : 'Untitled');

    // 1. Ingest document into Pinecone & MongoDB
    let result = { id: null, chunks: 0 };
    try {
      result = await ingestDocument({ userId, title: contentTitle, text: text || contentTitle, tags, link, type: contentType });
    } catch (ingestErr) {
      console.warn('⚠️ Pinecone/RAG ingestion warning (creating Mongo record anyway):', ingestErr.message);
      // Fallback: save to MongoDB directly if vector embedding failed
      const newDoc = await Content.create({
        userId,
        title: contentTitle,
        text,
        link,
        type: contentType,
        tags,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      result = { id: newDoc._id.toString(), chunks: 0 };
    }

    // Fetch the newly created doc to return full object
    const createdContent = await Content.findById(result.id);

    res.json({ success: true, docId: result.id, content: createdContent, chunks: result.chunks });
  } catch (e) {
    console.error('Ingest error:', e);
    res.status(500).json({ error: 'ingestion_failed', details: e.message });
  }
});

// Helper to get or create user chat session
async function getOrCreateSession(userId) {
  let session = await ChatSession.findOne({ userId }).sort({ updatedAt: -1 });
  if (!session) {
    session = await ChatSession.create({ userId, title: 'SecondBrain AI Conversation' });
  }
  return session;
}

// GET /api/user/chat - Fetch conversation history
UserRoutes.get('/chat', authenticateToken, async (req, res) => {
  try {
    const session = await getOrCreateSession(req.userId);
    const messages = await ChatMessage.find({ sessionId: session._id })
      .populate('relevantCards')
      .sort({ createdAt: 1 });
    res.json({ success: true, session, messages });
  } catch (e) {
    res.status(500).json({ error: 'get_chat_failed', details: e.message });
  }
});

// DELETE /api/user/chat - Clear conversation history
UserRoutes.delete('/chat', authenticateToken, async (req, res) => {
  try {
    const session = await getOrCreateSession(req.userId);
    await ChatMessage.deleteMany({ sessionId: session._id });
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (e) {
    res.status(500).json({ error: 'clear_chat_failed', details: e.message });
  }
});

// POST /api/user/search - RAG search
UserRoutes.post('/search', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { q } = req.body;
    const topK = Number(req.query.topK || process.env.TOPK_DEFAULT || 5);
    if (!q) return res.status(400).json({ error: 'Search query q is required' });

    const { matches, context, sources } = await retrieveUserContext({ userId, query: q, topK });
    res.json({ matches, previewContext: context, sources });
  } catch (e) {
    console.error('Search error:', e);
    res.status(500).json({ error: 'search_failed', details: e.message });
  }
});

// POST /api/user/ask - Ask RAG AI Question & Persist Chat History
UserRoutes.post('/ask', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { query, topK = Number(process.env.TOPK_DEFAULT || 5) } = req.body;
    if (!query) return res.status(400).json({ error: 'query is required' });

    const session = await getOrCreateSession(userId);

    // 1. Save User Message into ChatMessage DB
    await ChatMessage.create({
      sessionId: session._id,
      userId,
      sender: 'user',
      text: query,
    });

    // 2. Perform RAG AI Answer generation
    const { answer, sources, relevantCards } = await answerWithRAG({ userId, query, topK });

    // 3. Save AI Response Message into ChatMessage DB
    const cardIds = relevantCards ? relevantCards.map(c => c._id) : [];
    await ChatMessage.create({
      sessionId: session._id,
      userId,
      sender: 'ai',
      text: answer,
      sources: sources || [],
      relevantCards: cardIds
    });

    // 4. Fetch updated conversation history
    const messages = await ChatMessage.find({ sessionId: session._id })
      .populate('relevantCards')
      .sort({ createdAt: 1 });

    res.json({ success: true, answer, sources, relevantCards, messages });
  } catch (e) {
    console.error('Ask error:', e);
    res.status(500).json({ error: 'ask_failed', details: e.message });
  }
});


// DELETE /api/user/content/:id or /api/user/content?id=...
const handleDeleteContent = async (req, res) => {
  try {
    const id = req.params.id || req.query.id;
    const userId = req.userId;

    if (!id) {
      return res.status(400).json({ error: 'Content id is required' });
    }

    const doc = await Content.findOne({ _id: id, userId });
    if (!doc) {
      return res.status(404).json({ error: 'Content not found' });
    }

    await Content.deleteOne({ _id: id, userId });

    // Try Pinecone delete in background without blocking
    try {
      await deleteContent({ id, userId });
    } catch (pineconeErr) {
      console.warn('Pinecone delete note:', pineconeErr.message);
    }

    res.json({ success: true, message: 'Content deleted successfully', deletedId: id });
  } catch (e) {
    console.error('Delete content error:', e);
    res.status(500).json({ error: 'delete_failed', details: e.message });
  }
};

UserRoutes.delete('/content/:id', authenticateToken, handleDeleteContent);
UserRoutes.delete('/content', authenticateToken, handleDeleteContent);


// POST /api/user/signup
UserRoutes.post('/signup', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
    });

    const token = jwt.sign({ userId: newUser._id, username: newUser.username }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      success: true,
      token,
      user: { id: newUser._id, username: newUser.username, email: newUser.email }
    });
  } catch (e) {
    console.error('Signup error:', e);
    res.status(500).json({ error: 'signup_failed', details: e.message });
  }
});

// POST /api/user/signin
UserRoutes.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({
      $or: [{ username: username.trim() }, { email: username.trim().toLowerCase() }]
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      success: true,
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (e) {
    console.error('Signin error:', e);
    res.status(500).json({ error: 'signin_failed', details: e.message });
  }
});

// POST /api/user/share - Enable or disable share link
UserRoutes.post("/share", authenticateToken, async (req, res) => {
  try {
    const { share } = req.body;
    const userId = req.userId;

    if (share) {
      const exist = await Link.findOne({ userId });
      if (exist) {
        return res.json({ success: true, hash: exist.hash });
      }
      const hash = random(10);
      await Link.create({ userId, hash });
      return res.json({ success: true, hash });
    } else {
      await Link.deleteOne({ userId });
      return res.json({ success: true, message: "Share link disabled" });
    }
  } catch (e) {
    console.error('Share link error:', e);
    res.status(500).json({ error: 'share_failed', details: e.message });
  }
});

// GET /api/user/share/:sharelink - Public view for shared brain
UserRoutes.get("/share/:sharelink", async (req, res) => {
  try {
    const hash = req.params.sharelink;
    const linkRecord = await Link.findOne({ hash });
    
    if (!linkRecord) {
      return res.status(404).json({ error: "Share link not found or disabled" });
    }
    
    const user = await User.findById(linkRecord.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const contents = await Content.find({ userId: linkRecord.userId }).sort({ createdAt: -1 });

    return res.json({
      username: user.username,
      contentCount: contents.length,
      contents: contents
    });
  } catch (e) {
    console.error('Get shared content error:', e);
    res.status(500).json({ error: 'get_shared_failed', details: e.message });
  }
});

export const UserRoute = UserRoutes;