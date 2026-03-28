/**
 * Level thresholds as defined in BLUEPRINT.md Phase 5
 * BEGINNER   : 0   – 200
 * AWARE      : 200 – 400
 * CONSISTENT : 400 – 600
 * ALIGNED    : 600 – 800
 * INTEGRATED : 800 – 1000
 */

export type Level = 'BEGINNER' | 'AWARE' | 'CONSISTENT' | 'ALIGNED' | 'INTEGRATED';

interface LevelBand {
  level: Level;
  min: number;
  max: number;
}

const LEVEL_BANDS: LevelBand[] = [
  { level: 'BEGINNER', min: 0, max: 200 },
  { level: 'AWARE', min: 200, max: 400 },
  { level: 'CONSISTENT', min: 400, max: 600 },
  { level: 'ALIGNED', min: 600, max: 800 },
  { level: 'INTEGRATED', min: 800, max: 1000 },
];

/**
 * Maps a consciousness score (0–1000) to the corresponding Level.
 */
export function calculateLevel(score: number): Level {
  const clamped = Math.max(0, Math.min(1000, score));
  // Walk bands in reverse so 1000 maps to INTEGRATED
  for (let i = LEVEL_BANDS.length - 1; i >= 0; i--) {
    if (clamped >= LEVEL_BANDS[i].min) {
      return LEVEL_BANDS[i].level;
    }
  }
  return 'BEGINNER';
}

/**
 * Returns the progress (0–100) within the current level band.
 * E.g. score=250 → AWARE band [200,400] → 25%
 */
export function getLevelProgress(score: number): number {
  const clamped = Math.max(0, Math.min(1000, score));
  const band = LEVEL_BANDS.find(
    (b) => clamped >= b.min && clamped < b.max
  ) ?? LEVEL_BANDS[LEVEL_BANDS.length - 1]; // max level: INTEGRATED

  if (band.level === 'INTEGRATED') {
    // Within final band: progress from 800 to 1000
    const progress = ((clamped - band.min) / (band.max - band.min)) * 100;
    return Math.round(Math.min(100, progress));
  }

  const progress = ((clamped - band.min) / (band.max - band.min)) * 100;
  return Math.round(progress);
}
