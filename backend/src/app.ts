import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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

import { AgentRegistry } from './agents/AgentRegistry';
import { ProgressAgent } from './agents/ProgressAgent';
import { MonetizationAgent } from './agents/MonetizationAgent';
import { NotificationAgent } from './agents/NotificationAgent';
import { PersonalizationAgent } from './agents/PersonalizationAgent';
import { ContentAgent } from './agents/ContentAgent';

// ── Register all agents ────────────────────────────────────────────────────────
const registry = AgentRegistry.getInstance();
registry.register(new ProgressAgent());
registry.register(new MonetizationAgent());
registry.register(new NotificationAgent());
registry.register(new PersonalizationAgent());
registry.register(new ContentAgent());

const app = express();

app.use(express.json({ limit: '10kb' }));
app.use(
  cors({
    origin: [
      process.env.APP_URL ?? 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    credentials: true,
  })
);
app.use(
  helmet({
    contentSecurityPolicy: false, // configured per-environment
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

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
