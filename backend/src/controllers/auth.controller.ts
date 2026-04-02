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
