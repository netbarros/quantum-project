import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export type Level = 'BEGINNER' | 'AWARE' | 'CONSISTENT' | 'ALIGNED' | 'INTEGRATED';

export interface HistoryEntry {
  day: number;
  isCompleted: boolean;
  completedAt: string | null;
  date: string;
}

export interface ProgressData {
  consciousnessScore: number;
  level: Level;
  levelProgress: number;          // 0–100 % within current level band
  streak: number;
  currentDay: number;
  totalCompleted: number;
  completionRate: number;
  streakFreezeAvailable: boolean;
  lastSessionDate: string | null;
  history: HistoryEntry[];
}

export function useProgress() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await api.get<ProgressData>('/progress');
      setData(result.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar progresso');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const freezeStreak = async () => {
    try {
      const result = await api.post<{ streak: number }>('/streak/freeze', {});
      const newStreak = result.data.streak;
      setData((prev) => prev ? { ...prev, streakFreezeAvailable: false, streak: newStreak } : prev);
      return result.data;
    } catch (err: unknown) {
      throw err;
    }
  };

  return { data, isLoading, error, refetch: fetchProgress, freezeStreak };
}
