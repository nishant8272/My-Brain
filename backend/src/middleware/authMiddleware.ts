import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError } from '../utils/AppError.js';

export function userMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const header = req.headers['authorization'];
  if (!header) {
    return next(new AppError('No Authorization token provided', 401));
  }

  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new AppError('JWT_SECRET is missing in server configuration', 500));
  }

  try {
    const decoded = jwt.verify(token, secret) as { id: string };
    if (decoded && decoded.id) {
      req.userId = decoded.id;
      next();
    } else {
      next(new AppError('Invalid authentication token', 403));
    }
  } catch (err) {
    next(new AppError('Authentication failed or token expired', 403));
  }
}
