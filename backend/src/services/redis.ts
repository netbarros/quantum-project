import Redis from 'ioredis';
import { logger } from '../lib/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://:redispass@localhost:6379';

let redis: Redis | null = null;
let isConnected = false;

function createRedisClient(): Redis {
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times: number): number | null {
      if (times > 5) {
        logger.error('Redis max reconnection attempts reached, giving up');
        return null;
      }
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
    connectTimeout: 5000,
  });

  client.on('connect', () => {
    isConnected = true;
    logger.info('Redis connected');
  });

  client.on('error', (err: Error) => {
    isConnected = false;
    logger.error({ err: err.message }, 'Redis connection error');
  });

  client.on('close', () => {
    isConnected = false;
  });

  return client;
}

export function getRedis(): Redis | null {
  if (!redis) {
    try {
      redis = createRedisClient();
      redis.connect().catch((err: Error) => {
        logger.warn({ err: err.message }, 'Redis initial connection failed, will retry');
      });
    } catch (err) {
      logger.warn({ err }, 'Redis failed to create client');
      return null;
    }
  }
  return isConnected ? redis : null;
}

export function isRedisAvailable(): boolean {
  return isConnected;
}
