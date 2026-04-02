import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Zod validation errors
  if (err instanceof ZodError) {
    logger.warn({ path: req.path, issues: err.issues }, 'Validation error');
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      },
    });
    return;
  }

  // Log with appropriate level
  if (statusCode >= 500) {
    logger.error(
      { err, path: req.path, method: req.method, statusCode },
      'Unhandled server error'
    );
  } else {
    logger.warn(
      { path: req.path, method: req.method, statusCode, message: err.message },
      'Client error'
    );
  }

  res.status(statusCode).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: isProduction && statusCode >= 500
        ? 'An unexpected error occurred'
        : err.message,
      ...((!isProduction && statusCode >= 500) ? { stack: err.stack } : {}),
    },
  });
}
