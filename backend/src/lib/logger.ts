import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino/file',
    options: { destination: 1 }, // stdout
  } : undefined,
  formatters: {
    level: (label: string) => ({ level: label }),
  },
  base: { service: 'quantum-api' },
  timestamp: pino.stdTimeFunctions.isoTime,
});
