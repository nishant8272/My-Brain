import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { authenticateToken } from './auth.js';
import dotenv from 'dotenv';
dotenv.config();
import { ingestDocument, retrieveUserContext, answerWithRAG ,deleteContent} from './searching.js';
import { User, Content } from './db.js';

const { JWT_SECRET } = process.env;
const UserRoutes = express.Router();

UserRoutes.post('/content',authenticateToken, async (req, res) => {
  try { 
    console.log('Ingesting content:', req.body);
    const { userId, text, title = '', tags = [] ,link} = req.body;
    if (!userId || !text) return res.status(400).json({ error: 'userId and text are required' });
    const result = await ingestDocument({ userId, title, text, tags,link });
    res.json({ success: true, ...result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'ingestion_failed', details: e.message });
  }
});

UserRoutes.post('/search', authenticateToken,async (req, res) => {
  try {
    const{ userId ,q } = req.body;
    const topK = Number(req.query.topK || process.env.TOPK_DEFAULT);
    if (!userId || !q) return res.status(400).json({ error: 'userId and q are required' });

    const { matches, context, sources } = await retrieveUserContext({ userId, query: q, topK });
    res.json({ matches, previewContext: context, sources });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'search_failed', details: e.message });
  }
});

UserRoutes.post('/ask', authenticateToken, async (req, res) => {
  try {
    const { userId, query, topK = Number(process.env.TOPK_DEFAULT) } = req.body;
    if (!userId || !query) return res.status(400).json({ error: 'userId and query are required' });

 console.log('Asking question:', { userId, query, topK });
    const { answer, sources } = await answerWithRAG({ userId, query, topK });
    res.json({ answer, sources });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'ask_failed', details: e.message });
  }
});


UserRoutes.delete('/content', authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;
    const { userId } = req.body;
    console.log('Deleting content:', { id, userId });

    if (!id || !userId) {
      return res.status(400).json({ error: 'id and userId are required' });
    }

    const doc = await Content.findOne({ _id: id, userId });
    if (!doc) {
      return res.status(404).json({ error: 'not_found' });
    }

    // 1. Delete doc from Mongo
    await Content.deleteOne({ _id: new ObjectId(id) });

    // 2. Delete all vectors tied to this doc in Pinecone
    const res = await deleteContent({ id, userId });
   
     console.log('Content deleted successfully:', res);
    res.json({  message: 'Content deleted successfully'});
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'delete_failed', details: e.message });
  }
});


UserRoutes.post('/signup', async (req, res) => {
  try {
    const { username, password,email } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await User.create({
      username:username,
      password: hashedPassword,
      email: email ,
      createdAt: new Date(),
    });

    res.status(201).json({ success: true, userId: newUser._id.toString() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'signup_failed', details: e.message });
  }
});

// Sign-in route
UserRoutes.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: '24h', // Token expires in 1 hour
    });

    res.json({ success: true, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'signin_failed', details: e.message });
  }
});

export const UserRoute = UserRoutes;