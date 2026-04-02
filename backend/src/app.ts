import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config';
import authRoutes from './routes/auth.routes';
import onboardingRoutes from './routes/onboarding.routes';
import profileRoutes from './routes/profile.routes';
import sessionRoutes from './routes/session.routes';
import progressRoutes from './routes/progress.routes';
import subscriptionRoutes from './routes/subscription.routes';
import usageRoutes from './routes/usage.routes';
import notificationRoutes from './routes/notification.routes';
import settingsRoutes from './routes/settings.routes';
import journalRoutes from './routes/journal.routes';
import adminRoutes from './routes/admin.routes';
import analyticsRoutes from './routes/analytics.routes';
import ttsRoutes from './routes/tts.routes';

import { AgentRegistry } from './agents/AgentRegistry';
import { ProgressAgent } from './agents/ProgressAgent';
import { MonetizationAgent } from './agents/MonetizationAgent';
import { NotificationAgent } from './agents/NotificationAgent';
import { PersonalizationAgent } from './agents/PersonalizationAgent';
import { ContentAgent } from './agents/ContentAgent';
import { errorHandler } from './middleware/errorHandler';

// ── Register all agents ────────────────────────────────────────────────────────
const registry = AgentRegistry.getInstance();
registry.register(new ProgressAgent());
registry.register(new MonetizationAgent());
registry.register(new NotificationAgent());
registry.register(new PersonalizationAgent());
registry.register(new ContentAgent());

const app = express();

// ── Security middleware ────────────────────────────────────────────────────────
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));

const allowedOrigins = [
  process.env.APP_URL,
  ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:3000', 'http://127.0.0.1:3000'] : []),
].filter(Boolean) as string[];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'", process.env.APP_URL ?? ''].filter(Boolean),
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    } : false,
    hsts: process.env.NODE_ENV === 'production' ? {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    } : false,
  })
);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', sessionRoutes);
app.use('/api', progressRoutes);
app.use('/api', subscriptionRoutes);
app.use('/api', usageRoutes);
app.use('/api', notificationRoutes);
app.use('/api', settingsRoutes);
app.use('/api', journalRoutes);
app.use('/api', adminRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', ttsRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Global error handler (MUST be last middleware) ────────────────────────────
app.use(errorHandler);

export default app;
