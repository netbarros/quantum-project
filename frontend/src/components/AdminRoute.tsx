"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push('/session');
    }
  }, [isLoading, isAuthenticated, user?.role, router]);

  if (isLoading || !isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--q-bg-void)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--q-accent-8)]" />
      </div>
    );
  }

  return <>{children}</>;
}
