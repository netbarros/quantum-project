import { z, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  name: z.string().optional(),
  language: z.string().optional().default('pt-BR'),
});

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const onboardingSchema = z.object({
  painPoint: z.string().min(1, 'Ponto de dor é obrigatório'),
  goal: z.string().min(1, 'Meta é obrigatória'),
  emotionalState: z.string().min(1, 'Estado emocional é obrigatório'),
  timeAvailable: z.number().int().min(1).max(120),
  language: z.string().optional(),
  notificationTime: z.string().optional(),
  profileType: z
    .enum(['REACTIVE', 'LOST', 'INCONSISTENT', 'SEEKING', 'STRUCTURED'])
    .optional(),
});

export const completeSessionSchema = z.object({
  exerciseCompleted: z.boolean().optional().default(false),
});

export const upgradeSubscriptionSchema = z.object({
  promoCode: z.string().optional(),
});

export const freezeStreakSchema = z.object({});

export const profileUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  notificationTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato inválido (HH:MM)')
    .optional(),
  language: z.string().optional(),
  emotionalState: z.string().optional(),
  timeAvailable: z.number().int().min(1).max(120).optional(),
});

// ─── Middleware factory ───────────────────────────────────────────────────────

type ZodSchema = z.ZodTypeAny;

/**
 * validate(schema) — validates req.body against a Zod schema.
 * Returns 400 with structured error details on failure.
 * Compatible with Zod v4 (uses .issues instead of .errors).
 */
export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const zodError = result.error as ZodError;
      res.status(400).json({
        error: 'Dados inválidos',
        details: zodError.issues.map((issue) => ({
          field: issue.path.join('.') || 'body',
          message: issue.message,
        })),
      });
      return;
    }
    req.body = result.data;
    next();
  };
