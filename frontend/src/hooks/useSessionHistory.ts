import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export interface SessionHistoryItem {
  id: string;
  day: number;
  isCompleted: boolean;
  completedAt: string | null;
  isFavorite: boolean;
  content: {
    direction: string;
    explanation: string;
    reflection: string;
    action: string;
    question: string;
    affirmation: string;
    practice: string;
    integration: string;
  } | null;
}

export function useSessionHistory(): {
  data: SessionHistoryItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<SessionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await api.get<SessionHistoryItem[]>('/sessions/history');
      setData(result.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar histórico');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { data, isLoading, error, refetch: fetchHistory };
}
