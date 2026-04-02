"use client";

import { useSession, type CompletionResult } from '@/hooks/useSession';
import { SessionBlockReader } from '@/components/session/SessionBlockReader';
import { CompletionScreen } from '@/components/session/CompletionScreen';
import { SofiaOrb } from '@/components/session/SofiaOrb';
import { AmbientParticles } from '@/components/session/AmbientParticles';
import { PaywallModal } from '@/components/PaywallModal';
import { motion } from 'framer-motion';
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
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 text-center px-6 relative overflow-hidden">
        <AmbientParticles blockType="integration" count={8} />
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
          <SofiaOrb blockType="integration" size="md" level={progress?.level ?? "BEGINNER"} />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-[10px] text-[var(--q-text-tertiary)] uppercase tracking-[0.2em]">Sofia</motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h2 className="text-xl font-[family-name:var(--font-instrument)] italic text-[var(--q-text-primary)] mb-2">
            Dia {session.day} concluído
          </h2>
          <p className="text-sm text-[var(--q-text-secondary)] max-w-xs mx-auto">
            Bom trabalho. Permita-se absorver o que viveu hoje. Amanhã, iremos mais fundo.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex items-center gap-3 mt-2">
          <span className="text-sm">🔥 {progress?.streak ?? 0}d</span>
          <span className="text-sm text-[var(--q-accent-9)]">{progress?.consciousnessScore ?? 0} pts</span>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex flex-col gap-3 w-full max-w-xs mt-4">
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/dashboard')}
            className="h-12 rounded-full bg-[var(--q-accent-8)] text-white font-medium shadow-[var(--q-shadow-glow-accent)]">
            Ver meu progresso
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/history')}
            className="h-11 rounded-full bg-white/5 border border-[var(--q-border-default)] text-[var(--q-text-secondary)] text-sm hover:border-[var(--q-border-strong)] transition-colors">
            Explorar reflexões
          </motion.button>
        </motion.div>
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
          isStatic={session.isStatic}
          progress={progress}
        />
      </div>
    </div>
  );
}
