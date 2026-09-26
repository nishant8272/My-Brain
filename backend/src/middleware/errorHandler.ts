import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  console.error(`💥 [ERROR] ${req.method} ${req.url} ->`, err.message || err);

  // Mongoose validation error handling
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((el: any) => el.message);
    res.status(400).json({
      success: false,
      message: `Invalid input data. ${messages.join('. ')}`,
    });
    return;
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    res.status(400).json({
      success: false,
      message: `Duplicate field value for '${field}'. Please use another value!`,
    });
    return;
  }

  // CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
    return;
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  next(new AppError(`Cannot find endpoint ${req.originalUrl} on this server. Ensure HTTP method and route are correct.`, 404));
}
