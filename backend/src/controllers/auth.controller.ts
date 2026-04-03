import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { config } from '../config';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  language: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth',
};

function setRefreshCookie(res: Response, refreshToken: string): void {
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
}

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data = registerSchema.parse(req.body);
      const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingUser) {
        res.status(400).json({ error: 'Email already exists' });
        return;
      }

      const hashedPassword = await bcrypt.hash(data.password, 12);
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          language: data.language
        }
      });

      const payload = { userId: user.id, email: user.email, role: user.role };
      const accessToken = jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN as any });
      const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, { expiresIn: config.JWT_REFRESH_EXPIRES_IN as any });

      setRefreshCookie(res, refreshToken);

      res.status(201).json({
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        accessToken,
        refreshToken, // kept for backward compat — frontend can migrate to cookie-only
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.issues });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const data = loginSchema.parse(req.body);
      const user = await prisma.user.findUnique({ where: { email: data.email } });
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const isValidPassword = await bcrypt.compare(data.password, user.password);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastAccess: new Date() }
      });

      const payload = { userId: user.id, email: user.email, role: user.role };
      const accessToken = jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN as any });
      const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, { expiresIn: config.JWT_REFRESH_EXPIRES_IN as any });

      setRefreshCookie(res, refreshToken);

      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          onboardingComplete: user.onboardingComplete,
          isPremium: user.isPremium,
          level: user.level
        },
        accessToken,
        refreshToken, // kept for backward compat
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.issues });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      // Read refresh token from cookie first, fallback to body for backward compat
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!refreshToken) {
        res.status(401).json({ error: 'Refresh token required' });
        return;
      }

      const payload = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as any;
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      const newPayload = { userId: user.id, email: user.email, role: user.role };
      const newAccessToken = jwt.sign(newPayload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN as any });
      const newRefreshToken = jwt.sign(newPayload, config.JWT_REFRESH_SECRET, { expiresIn: config.JWT_REFRESH_EXPIRES_IN as any });

      setRefreshCookie(res, newRefreshToken);

      res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken, // kept for backward compat
      });
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
  }
};

// ── Password Reset + Email Verification ─────────────────────────

import crypto from 'crypto';
import { prisma as authPrisma } from '../config/database';

// In-memory token store (production: use Redis)
const resetTokens = new Map<string, { userId: string; expiresAt: number }>();
const loginAttempts = new Map<string, { count: number; blockedUntil: number }>();

const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function checkLoginRateLimit(email: string): { allowed: boolean; retryAfterMs?: number } {
  const attempt = loginAttempts.get(email);
  if (!attempt) return { allowed: true };
  if (Date.now() < attempt.blockedUntil) {
    return { allowed: false, retryAfterMs: attempt.blockedUntil - Date.now() };
  }
  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    loginAttempts.delete(email);
  }
  return { allowed: true };
}

export function recordLoginFailure(email: string): void {
  const attempt = loginAttempts.get(email) ?? { count: 0, blockedUntil: 0 };
  attempt.count += 1;
  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    attempt.blockedUntil = Date.now() + BLOCK_DURATION_MS;
  }
  loginAttempts.set(email, attempt);
}

export function clearLoginAttempts(email: string): void {
  loginAttempts.delete(email);
}

// POST /api/auth/forgot-password
export async function forgotPassword(req: import('express').Request, res: import('express').Response): Promise<void> {
  try {
    const { email } = req.body;
    if (!email) { res.status(400).json({ error: 'Email obrigatório' }); return; }

    const user = await authPrisma.user.findUnique({ where: { email } });
    // Always return success (don't reveal if email exists)
    if (!user) { res.json({ message: 'Se o email existir, um link de reset foi enviado.' }); return; }

    const token = crypto.randomBytes(32).toString('hex');
    resetTokens.set(token, { userId: user.id, expiresAt: Date.now() + 30 * 60 * 1000 }); // 30 min

    // In production: send email with reset link
    // For now: log the token (admin can see it in logs)
    const { logger } = await import('../lib/logger');
    logger.info({ email, token, resetUrl: `${process.env.APP_URL}/reset-password?token=${token}` }, 'Password reset requested');

    res.json({ message: 'Se o email existir, um link de reset foi enviado.' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/auth/reset-password
export async function resetPassword(req: import('express').Request, res: import('express').Response): Promise<void> {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) { res.status(400).json({ error: 'Token e nova senha obrigatórios' }); return; }
    if (newPassword.length < 8) { res.status(400).json({ error: 'Senha deve ter mínimo 8 caracteres' }); return; }

    const stored = resetTokens.get(token);
    if (!stored || Date.now() > stored.expiresAt) {
      res.status(400).json({ error: 'Token inválido ou expirado' });
      return;
    }

    const hashedPassword = await (await import('bcryptjs')).default.hash(newPassword, 12);
    await authPrisma.user.update({ where: { id: stored.userId }, data: { password: hashedPassword } });
    resetTokens.delete(token);

    res.json({ message: 'Senha alterada com sucesso. Faça login com a nova senha.' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
