import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ChatSession } from '../models/ChatSession.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { answerWithRAG } from '../services/ragService.js';

async function getOrCreateSession(userId: string, titlePrompt?: string) {
  let session = await ChatSession.findOne({ userId }).sort({ updatedAt: -1 });
  if (!session) {
    const title = titlePrompt ? titlePrompt.slice(0, 35) + (titlePrompt.length > 35 ? '...' : '') : 'AI Assistant Session';
    session = await ChatSession.create({ userId, title });
  }
  return session;
}

export const askAi = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const q = req.body.question || req.body.query;
  const topK = req.body.topK || 5;
  const reqSessionId = req.body.sessionId;
  const userId = req.userId;

  if (!userId) {
    return next(new AppError('User authentication required', 401));
  }

  if (!q || typeof q !== 'string' || !q.trim()) {
    return next(new AppError('Please provide a question', 400));
  }

  const questionText = q.trim();

  let session: any;
  if (reqSessionId) {
    session = await ChatSession.findOne({ _id: reqSessionId, userId });
  }
  if (!session) {
    session = await getOrCreateSession(userId, questionText);
  }

  // Update session title if default
  if (session.title === 'AI Assistant Session' || session.title === 'AI Chat' || session.title === 'New Conversation') {
    session.title = questionText.slice(0, 35) + (questionText.length > 35 ? '...' : '');
    await session.save();
  }

  // Save User Question
  await ChatMessage.create({
    sessionId: session._id,
    userId,
    sender: 'user',
    text: questionText,
  });

  // Run RAG Answer Generation
  const { answer, sources, relevantCards } = await answerWithRAG({
    userId,
    query: questionText,
    topK,
  });

  const formattedSources = Array.isArray(sources)
    ? sources.map((s: any) => typeof s === 'object' && s !== null ? { ...s } : { title: String(s) })
    : [];

  const formattedCards = Array.isArray(relevantCards) ? relevantCards : [];

  // Save AI Response
  await ChatMessage.create({
    sessionId: session._id,
    userId,
    sender: 'ai',
    text: answer,
    sources: formattedSources,
    relevantCards: formattedCards,
  });

  // Touch session updatedAt
  session.updatedAt = new Date();
  await session.save();

  // Return full thread
  const messages = await ChatMessage.find({ sessionId: session._id }).sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    sessionId: session._id,
    sessionTitle: session.title,
    answer,
    sources: formattedSources,
    relevantCards: formattedCards,
    messages,
  });
});

export const getSessions = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.userId;
  if (!userId) {
    return next(new AppError('User authentication required', 401));
  }

  const sessions = await ChatSession.find({ userId }).sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    sessions,
  });
});

export const createSession = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.userId;
  if (!userId) {
    return next(new AppError('User authentication required', 401));
  }

  const title = req.body.title || 'New Conversation';
  const session = await ChatSession.create({ userId, title });

  res.status(201).json({
    success: true,
    session,
  });
});

export const getSessionMessages = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.userId;
  const { sessionId } = req.params;

  if (!userId) {
    return next(new AppError('User authentication required', 401));
  }

  const session = await ChatSession.findOne({ _id: sessionId, userId });
  if (!session) {
    return next(new AppError('Chat session not found', 404));
  }

  const messages = await ChatMessage.find({ sessionId: session._id }).sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    session,
    messages,
  });
});

export const deleteSession = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.userId;
  const { sessionId } = req.params;

  if (!userId) {
    return next(new AppError('User authentication required', 401));
  }

  const session = await ChatSession.findOne({ _id: sessionId, userId });
  if (!session) {
    return next(new AppError('Chat session not found', 404));
  }

  await ChatMessage.deleteMany({ sessionId: session._id });
  await ChatSession.deleteOne({ _id: session._id });

  res.status(200).json({
    success: true,
    message: 'Chat session deleted successfully',
  });
});

export const getChatHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.userId;
  if (!userId) {
    return next(new AppError('User authentication required', 401));
  }

  const reqSessionId = req.query.sessionId as string;
  let session: any;

  if (reqSessionId) {
    session = await ChatSession.findOne({ _id: reqSessionId, userId });
  } else {
    session = await ChatSession.findOne({ userId }).sort({ updatedAt: -1 });
  }

  if (!session) {
    res.status(200).json({ success: true, messages: [], sessions: [] });
    return;
  }

  const messages = await ChatMessage.find({ sessionId: session._id }).sort({ createdAt: 1 });
  const sessions = await ChatSession.find({ userId }).sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    sessionId: session._id,
    sessionTitle: session.title,
    messages,
    sessions,
  });
});

export const clearChatHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.userId;
  const reqSessionId = req.body.sessionId || req.query.sessionId;

  if (!userId) {
    return next(new AppError('User authentication required', 401));
  }

  let session: any;
  if (reqSessionId) {
    session = await ChatSession.findOne({ _id: reqSessionId, userId });
  } else {
    session = await ChatSession.findOne({ userId }).sort({ updatedAt: -1 });
  }

  if (session) {
    await ChatMessage.deleteMany({ sessionId: session._id });
  }

  res.status(200).json({
    success: true,
    message: 'Chat history cleared successfully',
  });
});
