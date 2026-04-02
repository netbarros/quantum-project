import { prisma } from '../config/database';
import { encrypt, decrypt } from '../utils/crypto';

export interface AiConfigValues {
  apiKey: string;
  temperature: number;
  maxTokens: number;
  allowPaid: boolean;
  enabledModels: string[];
  elevenlabsKey: string;
  elevenlabsVoiceId: string;
}

const DEFAULTS: AiConfigValues = {
  apiKey: '',
  temperature: 0.7,
  maxTokens: 1200,
  allowPaid: false,
  enabledModels: [],
  elevenlabsKey: '',
  elevenlabsVoiceId: '',
};

const CACHE_TTL_MS = 60_000;

interface CacheEntry {
  value: string;
  expiresAt: number;
}

export class ConfigCache {
  private static instance: ConfigCache;
  private cache = new Map<string, CacheEntry>();

  static getInstance(): ConfigCache {
    if (!ConfigCache.instance) ConfigCache.instance = new ConfigCache();
    return ConfigCache.instance;
  }

  async get(key: string): Promise<string | null> {
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    try {
      const row = await prisma.systemConfig.findUnique({ where: { key } });
      if (!row) return null;
      const value = row.encrypted ? decrypt(row.value) : row.value;
      this.cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
      return value;
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, encrypted: boolean, updatedBy: string): Promise<void> {
    const stored = encrypted ? encrypt(value) : value;
    await prisma.systemConfig.upsert({
      where: { key },
      create: { key, value: stored, encrypted, updatedBy },
      update: { value: stored, encrypted, updatedBy },
    });
    // Update cache with plain value
    this.cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  }

  async getAiConfig(): Promise<AiConfigValues> {
    const [apiKey, temp, tokens, paid, models, elKey, elVoice] = await Promise.all([
      this.get('OPENROUTER_API_KEY'),
      this.get('AI_TEMPERATURE'),
      this.get('AI_MAX_TOKENS'),
      this.get('AI_ALLOW_PAID'),
      this.get('AI_ENABLED_MODELS'),
      this.get('ELEVENLABS_API_KEY'),
      this.get('ELEVENLABS_VOICE_ID'),
    ]);

    let enabledModels: string[] = [];
    if (models) {
      try { enabledModels = JSON.parse(models); } catch { enabledModels = []; }
    }

    return {
      apiKey: apiKey || process.env.OPENROUTER_API_KEY?.trim() || DEFAULTS.apiKey,
      temperature: temp ? parseFloat(temp) : DEFAULTS.temperature,
      maxTokens: tokens ? parseInt(tokens, 10) : DEFAULTS.maxTokens,
      allowPaid: paid ? paid === 'true' : (process.env.OPENROUTER_ALLOW_PAID === 'true'),
      enabledModels,
      elevenlabsKey: elKey || '',
      elevenlabsVoiceId: elVoice || 'EXAVITQu4vr4xnSDxMaL', // Default: "Sarah" (female, warm)
    };
  }

  invalidate(key?: string): void {
    if (key) this.cache.delete(key);
    else this.cache.clear();
  }
}
