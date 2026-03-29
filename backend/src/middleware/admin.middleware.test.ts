import { describe, it, expect, vi } from 'vitest';
import type { Response, NextFunction } from 'express';
import { adminMiddleware } from './admin.middleware';
import type { AuthRequest } from '../types/api.types';

describe('adminMiddleware', () => {
  it('responde 403 quando userRole não é ADMIN', () => {
    const req = { userRole: 'USER' } as AuthRequest;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('chama next quando userRole é ADMIN', () => {
    const req = { userRole: 'ADMIN' } as AuthRequest;
    const res = { status: vi.fn(), json: vi.fn() } as unknown as Response;
    const next = vi.fn() as NextFunction;

    adminMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
