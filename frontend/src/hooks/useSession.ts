import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface ProgressData {
  currentDay: number;
  consciousnessScore: number;
  level: string;
  streak: number;
}

export interface CompletionResult {
  scoreDelta: number;
  newScore: number;
  newStreak: number;
  leveledUp: boolean;
  newLevel: string;
  levelProgress: number;
}

export interface SessionData {
  id: string;
  day: number;
  isCompleted: boolean;
  isStatic: boolean;
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
  };
}

export function useSession() {
  const { accessToken, updateUser } = useAuth();
  const [session, setSession] = useState<SessionData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paywallRequired, setPaywallRequired] = useState(false);
  const [paywallCurrentDay, setPaywallCurrentDay] = useState<number | undefined>(undefined);

  const fetchSession = useCallback(async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      setPaywallRequired(false);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/session/daily`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Paywall gate: free user past day 7
      if (res.status === 402) {
        const body = await res.json();
        setPaywallRequired(true);
        setPaywallCurrentDay(body.currentDay);
        return;
      }

      if (!res.ok) {
        if (res.status === 403) {
          try {
            const body = await res.json();
            if (body.error === 'Onboarding incomplete') {
              setError('ONBOARDING_INCOMPLETE');
              return;
            }
          } catch (e) { }
        }
        throw new Error('Falha ao carregar a sessão de hoje.');
      }
      const data = await res.json();
      setSession(data.session);
      setProgress(data.progress);
      
      // Sync streak and score in context if needed
      updateUser({ 
        streak: data.progress.streak, 
        consciousnessScore: data.progress.consciousnessScore,
        level: data.progress.level
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar a sessão de hoje.')
    } finally {
      setLoading(false);
    }
  }, [accessToken, updateUser]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const completeSession = async (): Promise<CompletionResult | null> => {
    if (!session || !accessToken) return null;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/session/${session.id}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseCompleted: false }),
      });
      if (!res.ok) throw new Error('Erro ao concluir sessão.');
      const data = await res.json();
      const p = data.newProgress;
      const oldLevel = progress?.level;
      setProgress({ currentDay: p.currentDay, consciousnessScore: p.consciousnessScore, level: p.level, streak: p.streak });
      setSession({ ...session, isCompleted: true });
      updateUser({
        streak: p.streak,
        consciousnessScore: p.consciousnessScore,
        level: p.level
      });
      return {
        scoreDelta: p.scoreDelta ?? (p.consciousnessScore - (progress?.consciousnessScore ?? 0)),
        newScore: p.consciousnessScore,
        newStreak: p.streak,
        leveledUp: oldLevel !== p.level,
        newLevel: p.level,
        levelProgress: p.levelProgress ?? 0,
      };
    } catch (err: unknown) {
      console.error('[useSession] completeSession failed:', err);
      return null;
    }
  };

  const toggleFavorite = async () => {
    if (!session || !accessToken) return;
    
    // Optimistic push
    const newState = !session.isFavorite;
    setSession({ ...session, isFavorite: newState });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/sessions/${session.id}/favorite`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Erro ao favoritar.');
      const data = await res.json();
      setSession({ ...session, isFavorite: data.isFavorite });
    } catch (err) {
      // Revert optimistic
      setSession({ ...session, isFavorite: !newState });
      console.error(err);
    }
  };

  return { session, progress, loading, error, completeSession, toggleFavorite, refetch: fetchSession, paywallRequired, paywallCurrentDay };
}
