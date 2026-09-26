import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './config/db.js';
import { initPinecone } from './config/ai.js';
import apiRouter from './routes/index.js';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler.js';
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: '*',
    credentials: true,
}));
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});
// API Routes & Path Compatibility Aliases
app.use('/api', apiRouter);
app.use('/api/user', apiRouter);
app.use('/api/v1', apiRouter);
app.use('/api/v1/user', apiRouter);
// 404 & Global Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);
// Server Bootstrapping
async function bootstrap() {
    await connectDB();
    await initPinecone();
    app.listen(PORT, () => {
        console.log(`🚀 SecondBrain TypeScript Backend running at http://localhost:${PORT}`);
    });
}
bootstrap();
