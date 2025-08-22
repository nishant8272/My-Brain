import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { authenticateToken } from './auth.js';
import dotenv from 'dotenv';
dotenv.config();
import { ingestDocument, retrieveUserContext, answerWithRAG, deleteContent } from './searching.js';
import { User, Content, Link } from './db.js';
import { random } from './util.js';

const { JWT_SECRET } = process.env;
const UserRoutes = express.Router();

UserRoutes.post('/content', authenticateToken, async (req, res) => {
  try {
    console.log('Ingesting content:', req.body);
    const { userId, text, title = '', tags = [], link } = req.body;
    if (!userId || !text) return res.status(400).json({ error: 'userId and text are required' });
    const result = await ingestDocument({ userId, title, text, tags, link });
    res.json({ success: true, ...result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'ingestion_failed', details: e.message });
  }
});

UserRoutes.post('/search', authenticateToken, async (req, res) => {
  try {
    const { userId, q } = req.body;
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.query;
    const { userId } = req.body;
    console.log('Deleting content:', { id, userId });

    if (!id || !userId) {
      return res.status(400).json({ error: 'id and userId are required' });
    }

    // 1. Find doc inside transaction
    const doc = await Content.findOne({ _id: id, userId }).session(session);
    if (!doc) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'not_found' });
    }

    // 2. Delete doc from Mongo (inside transaction)
    await Content.deleteOne({ _id: new ObjectId(id), userId }).session(session);

    // 3. Try Pinecone delete
    try {
      await deleteContent({ id, userId });
    } catch (pineconeErr) {
      console.error('❌ Pinecone delete failed, rolling back Mongo:', pineconeErr);

      // rollback Mongo delete (doc is restored)
      await session.abortTransaction();
      return res.status(500).json({
        error: 'pinecone_delete_failed',
        details: pineconeErr.message,
      });
    }

    // 4. Commit Mongo transaction only if Pinecone delete succeeded
    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Content deleted from Mongo + Pinecone successfully' });

  } catch (e) {
    console.error(e);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: 'delete_failed', details: e.message });
  }
});



UserRoutes.post('/signup', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await User.create({
      username: username,
      password: hashedPassword,
      email: email,
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

UserRoutes.post("/share", authenticateToken, async (req, res) => {
  const { share } = req.body;
  const hash =random(10)
  if (share) {
    const exist = await Link.findOne({
      userId: req.body.userId
    })
    if (exist) {
      return res.json({
        hash: exist.hash
      })
    }
    await Link.create({
      userId: req.body.userId,
      hash: hash
    })
  } else {
    const exist = await Link.findOne({
      userId: req.body.userId
    })
    if (!exist) {
      return res.json({
        msg: "link in not available"
      })
    }
    await Link.deleteOne({
      userId: req.body.userId
    })
    return res.json({
      msg: "link is deleted successfully."
    })
  }
  return res.json({
    hash:hash
  })
});

UserRoutes.get("/share/:sharelink", async (req, res) => {
  const hash = req.params.sharelink;
  console.log(typeof(hash))
  const links = await Link.findOne({
     hash
  })
  if (!links) { 
    return res.status(401).json({
      msg: "sorry incorrect link"
    })
  }
  const content =await  Content.findOne({
    userId: links.userId
  })
  const user = await  User.findOne({ _id: links.userId })

  if (!user) {
    return res.status(401).json({
      msg: "sorry user not found"
    })
  }

  return res.json({
    "username": user?.username,
    "content": content
  })
})

export const UserRoute = UserRoutes;