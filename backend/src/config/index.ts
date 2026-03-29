import dotenv from 'dotenv';
dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(
      `[config] Required environment variable "${name}" is missing or empty. ` +
      `Check your .env file or container environment.`
    );
  }
  return value.trim();
}

export const config = {
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  // These three are required — the process will exit if they are absent.
  DATABASE_URL: requireEnv('DATABASE_URL'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY?.trim() || '',
  APP_URL: process.env.APP_URL?.trim() || 'http://localhost:3000',
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY?.trim() || '',
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY?.trim() || '',
  VAPID_EMAIL: process.env.VAPID_EMAIL?.trim() || '',
  /** Opcional — refresh distribuído / rate limit multi-instância (ver docker-compose serviço `redis`) */
  REDIS_URL: process.env.REDIS_URL?.trim() || '',
};
