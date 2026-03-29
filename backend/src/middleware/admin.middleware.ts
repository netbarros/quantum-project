import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/api.types';

/**
 * Requires authenticated user with role ADMIN (JWT payload).
 */
export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.userRole !== 'ADMIN') {
    res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Acesso restrito a administradores.' },
    });
    return;
  }
  next();
}
