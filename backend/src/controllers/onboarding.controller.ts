import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest } from '../types/api.types';
import { mapProfile } from '../utils/profileMapper';

const onboardingSchema = z.object({
  painPoint: z.enum([
    'anxiety',
    'lack_of_purpose',
    'emotional_instability',
    'spiritual_disconnection',
    'lack_of_discipline',
    'identity_crisis',
  ]),
  goal: z.enum([
    'inner_peace',
    'clarity',
    'emotional_mastery',
    'spiritual_growth',
    'discipline',
    'self_knowledge',
  ]),
  emotionalState: z.enum([
    'anxious',
    'lost',
    'frustrated',
    'hopeful',
    'neutral',
    'motivated',
  ]),
  timeAvailable: z.number().int().positive(),
});

const profileUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  language: z.string().optional(),
  notificationTime: z.string().optional(),
});

export const onboardingController = {
  async submitOnboarding(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const data = onboardingSchema.parse(req.body);
      const profileType = mapProfile(data);

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          painPoint: data.painPoint,
          goal: data.goal,
          emotionalState: data.emotionalState,
          timeAvailable: data.timeAvailable,
          profileType,
          onboardingComplete: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          profileType: true,
          level: true,
          consciousnessScore: true,
          onboardingComplete: true,
          isPremium: true,
          painPoint: true,
          goal: true,
          emotionalState: true,
          timeAvailable: true,
          language: true,
        },
      });

      res.status(200).json({ user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.issues });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          profileType: true,
          level: true,
          consciousnessScore: true,
          streak: true,
          isPremium: true,
          onboardingComplete: true,
          painPoint: true,
          goal: true,
          emotionalState: true,
          timeAvailable: true,
          language: true,
          notificationTime: true,
          createdAt: true,
          lastAccess: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({ user });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const data = profileUpdateSchema.parse(req.body);

      const user = await prisma.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          profileType: true,
          level: true,
          consciousnessScore: true,
          streak: true,
          isPremium: true,
          onboardingComplete: true,
          painPoint: true,
          goal: true,
          emotionalState: true,
          timeAvailable: true,
          language: true,
          notificationTime: true,
        },
      });

      res.status(200).json({ user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.issues });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
