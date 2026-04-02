import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { ConfigCache } from '../services/ConfigCache';
import { logger } from '../lib/logger';

// In-memory audio cache — keyed by hash of (text + voiceId)
const audioCache = new Map<string, { audio: Buffer; contentType: string; createdAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function cacheKey(text: string, voiceId: string): string {
  return crypto.createHash('sha256').update(`${voiceId}:${text}`).digest('hex');
}

const TtsSchema = z.object({
  text: z.string().min(1).max(2000),
});

// POST /api/tts/generate — returns audio/mpeg
export async function generateTts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = TtsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
      return;
    }

    const config = await ConfigCache.getInstance().getAiConfig();
    if (!config.elevenlabsKey) {
      res.status(404).json({ error: { code: 'NO_TTS_KEY', message: 'ElevenLabs não configurado' } });
      return;
    }

    const { text } = parsed.data;
    const voiceId = config.elevenlabsVoiceId;
    const key = cacheKey(text, voiceId);

    // Check cache
    const cached = audioCache.get(key);
    if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
      res.set('Content-Type', cached.contentType);
      res.set('X-TTS-Cache', 'hit');
      res.send(cached.audio);
      return;
    }

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': config.elevenlabsKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.75,
            style: 0.4,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      logger.warn({ status: response.status, error: errorText }, 'ElevenLabs TTS error');
      res.status(502).json({ error: { code: 'TTS_ERROR', message: `ElevenLabs: ${response.status}` } });
      return;
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'audio/mpeg';

    // Cache
    audioCache.set(key, { audio: audioBuffer, contentType, createdAt: Date.now() });

    // Cleanup old entries (keep max 200)
    if (audioCache.size > 200) {
      const oldest = [...audioCache.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt);
      for (let i = 0; i < oldest.length - 150; i++) {
        audioCache.delete(oldest[i][0]);
      }
    }

    res.set('Content-Type', contentType);
    res.set('X-TTS-Cache', 'miss');
    res.send(audioBuffer);
  } catch (err) {
    next(err);
  }
}

// GET /api/tts/status — check if ElevenLabs is configured
export async function getTtsStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const config = await ConfigCache.getInstance().getAiConfig();
    res.json({
      enabled: config.elevenlabsKey.length > 0,
      voiceId: config.elevenlabsVoiceId,
      cacheSize: audioCache.size,
    });
  } catch (err) {
    next(err);
  }
}
