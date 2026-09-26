import { Router } from 'express';
import { shareBrain, getSharedBrain } from '../controllers/shareController.js';
import { userMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/share', userMiddleware, shareBrain);
router.get('/share/:sharelink', getSharedBrain);

export default router;
