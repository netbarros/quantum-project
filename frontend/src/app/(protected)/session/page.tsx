"use client";

import { useSession, type CompletionResult } from '@/hooks/useSession';
import { SessionBlockReader } from '@/components/session/SessionBlockReader';
import { CompletionScreen } from '@/components/session/CompletionScreen';
import { PaywallModal } from '@/components/PaywallModal';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SessionPage() {
  const { session, progress, loading, error, completeSession, paywallRequired, paywallCurrentDay } = useSession();
  const [completionData, setCompletionData] = useState<CompletionResult | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const router = useRouter();

  const handleComplete = async () => {
    setCompleteError(null);
    const result = await completeSession();

    if (!result) {
      setCompleteError('Não foi possível completar a sessão. Verifique sua conexão e tente novamente.');
      return;
    }

    setCompletionData(result);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-t-[var(--q-accent-6)] mb-4" />
        <p className="text-[var(--q-text-secondary)]">Preparando sua sessão diária...</p>
      </div>
    );
  }

  // If Paywall is intercepted, redirect immediately
  if (paywallRequired) {
    if (typeof window !== 'undefined') {
      router.replace('/plans');
    }
    return null;
  }

  if (error === 'ONBOARDING_INCOMPLETE') {
    if (typeof window !== 'undefined') {
      router.replace('/onboarding');
    }
    return null;
  }

  if (error || !session || !progress) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 text-center px-6">
        <p className="text-[var(--q-red-8)]">{error || 'Não foi possível carregar a sessão.'}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-3 bg-[var(--q-bg-surface)] border border-[var(--q-border-subtle)] rounded-full text-[var(--q-text-primary)] hover:border-[var(--q-border-default)] transition-colors"
        >
          Recarregar sessão
        </button>
      </div>
    );
  }

  // Se o usuário completou agora e temos os dados para animar
  if (completionData) {
    return (
      <CompletionScreen
        scoreDelta={completionData.scoreDelta}
        newScore={completionData.newScore}
        newStreak={completionData.newStreak}
        leveledUp={completionData.leveledUp}
        newLevel={completionData.newLevel}
        onContinue={() => router.push('/dashboard')}
        onViewProgress={() => router.push('/dashboard')}
      />
    );
  }

  // Se já estava completo antes de abrir
  if (session.isCompleted) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 text-center px-6">
        <div className="w-16 h-16 rounded-full bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] flex items-center justify-center text-2xl">
          ✓
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[var(--q-text-primary)] mb-2">Dia {session.day} Concluído</h2>
          <p className="text-[var(--q-text-secondary)]">Você já realizou a prática de hoje. Volte amanhã para o próximo passo.</p>
        </div>
        <button 
          onClick={() => router.push('/dashboard')} 
          className="px-8 h-12 bg-[var(--q-accent-8)] rounded-full text-white font-medium hover:scale-95 transition-transform"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--q-bg-void)]">
      <div className="max-w-xl mx-auto md:py-8 h-full">
        {completeError && (
          <div className="mx-6 mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-red-400 text-sm">{completeError}</p>
          </div>
        )}
        <SessionBlockReader
          contentId={session.id}
          content={session.content}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
