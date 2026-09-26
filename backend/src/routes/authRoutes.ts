import { Router } from 'express';
import { signup, signin, getProfile } from '../controllers/authController.js';
import { userMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/me', userMiddleware, getProfile);

export default router;
