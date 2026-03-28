import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export interface SubscriptionStatus {
  isPremium: boolean;
  premiumSince: string | null;
  premiumUntil: string | null;
  daysRemaining: number | null;
  currentDay: number;
  freeLimit: number;
  paywallApproaching: boolean;
  paywallReached: boolean;
}

export function useSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<SubscriptionStatus>('/subscription/status');
      setStatus(response.data);
    } catch (err: unknown) {
      console.error('[useSubscription] Failed to fetch status:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const upgrade = async () => {
    setIsUpgrading(true);
    setUpgradeError(null);
    try {
      const result = await api.post<SubscriptionStatus>('/subscription/upgrade', {});
      const data = result.data;
      setIsSuccess(true);
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              isPremium: data.isPremium,
              premiumSince: data.premiumSince,
              premiumUntil: data.premiumUntil,
              paywallReached: false,
              paywallApproaching: false,
            }
          : prev
      );
    } catch (err: unknown) {
      setUpgradeError(
        err instanceof Error ? err.message : 'Erro ao ativar premium. Tente novamente.'
      );
    } finally {
      setIsUpgrading(false);
    }
  };

  return {
    status,
    isLoading,
    isUpgrading,
    upgradeError,
    isSuccess,
    upgrade,
    refetch: fetchStatus,
  };
}
