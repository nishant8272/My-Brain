import { Router } from 'express';
import authRoutes from './authRoutes.js';
import contentRoutes from './contentRoutes.js';
import chatRoutes from './chatRoutes.js';
import shareRoutes from './shareRoutes.js';
import { 
  askAi, 
  getChatHistory, 
  clearChatHistory, 
  getSessions, 
  createSession, 
  getSessionMessages, 
  deleteSession 
} from '../controllers/chatController.js';
import { signup, signin, getProfile } from '../controllers/authController.js';
import { 
  createContent, 
  getContents, 
  updateContent, 
  toggleFavorite, 
  deleteContent, 
  batchDeleteContent, 
  getContentStats 
} from '../controllers/contentController.js';
import { shareBrain, getSharedBrain } from '../controllers/shareController.js';
import { userMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Modular Routers
router.use('/v1/auth', authRoutes);
router.use('/v1/content', contentRoutes);
router.use('/v1/chat', chatRoutes);
router.use('/v1/brain', shareRoutes);

router.use('/auth', authRoutes);
router.use('/content', contentRoutes);
router.use('/chat', chatRoutes);
router.use('/brain', shareRoutes);

// Direct Endpoints (Compatibility for frontend api.ts and direct calls)
router.post('/signup', signup);
router.post('/signin', signin);
router.get('/me', userMiddleware, getProfile);

router.post('/content', userMiddleware, createContent);
router.get('/content', userMiddleware, getContents);
router.get('/content/stats', userMiddleware, getContentStats);
router.put('/content/:id', userMiddleware, updateContent);
router.patch('/content/:id/favorite', userMiddleware, toggleFavorite);
router.delete('/content/:id', userMiddleware, deleteContent);
router.delete('/content', userMiddleware, deleteContent);
router.post('/content/batch-delete', userMiddleware, batchDeleteContent);

router.post('/share', userMiddleware, shareBrain);
router.get('/share/:sharelink', getSharedBrain);

router.post('/ask', userMiddleware, askAi);
router.get('/chat', userMiddleware, getChatHistory);
router.delete('/chat', userMiddleware, clearChatHistory);
router.get('/chat/sessions', userMiddleware, getSessions);
router.post('/chat/sessions', userMiddleware, createSession);
router.get('/chat/sessions/:sessionId', userMiddleware, getSessionMessages);
router.delete('/chat/sessions/:sessionId', userMiddleware, deleteSession);

export default router;
