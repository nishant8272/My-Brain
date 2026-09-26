import { Router } from 'express';
import { 
  askAi, 
  getChatHistory, 
  clearChatHistory,
  getSessions,
  createSession,
  getSessionMessages,
  deleteSession
} from '../controllers/chatController.js';
import { userMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(userMiddleware);

router.post('/ask', askAi);
router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);

router.get('/sessions', getSessions);
router.post('/sessions', createSession);
router.get('/sessions/:sessionId', getSessionMessages);
router.delete('/sessions/:sessionId', deleteSession);

export default router;
