import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://:redispass@localhost:6379';

let redis: Redis | null = null;
let isConnected = false;

function createRedisClient(): Redis {
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times: number): number | null {
      if (times > 5) {
        console.error('[Redis] Max reconnection attempts reached. Giving up.');
        return null;
      }
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
    connectTimeout: 5000,
  });

  client.on('connect', () => {
    isConnected = true;
    console.info('[Redis] Connected');
  });

  client.on('error', (err: Error) => {
    isConnected = false;
    console.error('[Redis] Connection error:', err.message);
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
        console.warn('[Redis] Initial connection failed, will retry:', err.message);
      });
    } catch (err) {
      console.warn('[Redis] Failed to create client:', err);
      return null;
    }
  }
  return isConnected ? redis : null;
}

export function isRedisAvailable(): boolean {
  return isConnected;
}
