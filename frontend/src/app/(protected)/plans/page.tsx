'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { ConsciousnessOrb } from '@/components/ui/ConsciousnessOrb';
import { TRANSITIONS, VARIANTS } from '@/lib/animations';

export default function PlansPage() {
  const router = useRouter();
  const { user, accessToken, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const res = await fetch(`${BASE_URL}/subscription/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ plan: 'yearly' }), // Mock body
      });

      if (!res.ok) {
        throw new Error('Falha ao processar assinatura. Tente novamente.');
      }

      const { user: updatedUser } = await res.json();
      updateUser(updatedUser);
      router.push('/session'); // Liberado
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro genérico');
      setLoading(false);
    }
  };

  const currentScore = user?.consciousnessScore || 70;
  const currentLevel = user?.level || 'BEGINNER';
  const currentStreak = user?.streak || 7;

  return (
    <div className="min-h-screen bg-[var(--q-bg-void)] flex flex-col items-center justify-center p-6 pb-12 overflow-x-hidden relative">
      
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[var(--q-accent-8)] rounded-full mix-blend-screen filter blur-[120px] opacity-10 pointer-events-none" />

      <motion.div
        variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
        initial="initial"
        animate="animate"
        className="w-full max-w-md z-10 flex flex-col items-center"
      >
        <motion.div variants={VARIANTS.slideUp} className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-instrument)] italic text-4xl text-[var(--q-text-primary)] mb-3">
            Sua consciência está despertando.
          </h1>
          <p className="text-[var(--q-text-secondary)] text-base font-[family-name:var(--font-dm-sans)]">
            Você chegou até aqui. O que acontece quando você não para?
          </p>
        </motion.div>

        <motion.div variants={VARIANTS.slideUp} className="relative mb-10 mt-6">
          <ConsciousnessOrb 
            score={currentScore} 
            level={currentLevel as any} 
            streak={currentStreak} 
            isActiveToday={false} 
            size={160}
          />
          {/* Anel de bloqueio simbólico */}
          <div className="absolute inset-0 border border-dashed border-[var(--q-accent-6)] rounded-full opacity-50 scale-110 pointer-events-none" />
        </motion.div>

        <motion.div variants={VARIANTS.slideUp} className="text-center mb-10 w-full">
          <p className="text-[var(--q-text-primary)] text-sm mb-4">
            Em <span className="font-bold text-[var(--q-accent-9)]">{currentStreak} dias</span> você chegou a {currentScore} pontos. <br/> Imagine em 365.
          </p>
          
          {/* Timeline Visual */}
          <div className="w-full relative mt-6 mb-2">
            <div className="h-1 w-full bg-[var(--q-border-subtle)] rounded-full relative">
              <div className="absolute top-0 left-0 h-1 bg-[var(--q-accent-8)] rounded-full" style={{ width: '12%' }} />
            </div>
            <div className="flex justify-between w-full text-xs text-[var(--q-text-tertiary)] mt-2">
              <span className="text-[var(--q-accent-9)]">Dia 7 (Você está aqui)</span>
              <span>Dia 365</span>
            </div>
          </div>
        </motion.div>

        {/* Offers Card */}
        <motion.div variants={VARIANTS.slideUp} className="w-full bg-[var(--q-bg-surface)] border border-[var(--q-accent-6)] rounded-[var(--q-radius-xl)] p-5 mb-8 shadow-[var(--q-shadow-glow-accent)] relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[var(--q-accent-8)] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
            Recomendado
          </div>
          <p className="text-[var(--q-text-primary)] font-semibold mb-1 mt-1 text-lg">Acesso Completo</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-[family-name:var(--font-instrument)] italic text-[var(--q-text-primary)]">R$ 297</span>
            <span className="text-[var(--q-text-secondary)] text-sm">/ ano</span>
          </div>
          <ul className="space-y-3 mb-6">
            {['Sessões adaptativas Ilimitadas', 'Personalização via I.A.', 'Modo Focus + Integração'].map((benefit, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-[var(--q-text-secondary)]">
                <span className="text-[var(--q-accent-9)]">✓</span> {benefit}
              </li>
            ))}
          </ul>
        </motion.div>

        {error && (
          <motion.div variants={VARIANTS.slideUp} className="w-full mb-4 text-center">
            <p className="text-[var(--q-red-9)] text-sm">{error}</p>
          </motion.div>
        )}

        <motion.div variants={VARIANTS.slideUp} className="w-full space-y-4">
          <motion.button
            onClick={handleUpgrade}
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="w-full h-14 rounded-full bg-[var(--q-accent-8)] text-white font-medium shadow-md transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loading ? 'Processando (Mock) ...' : 'Continuar minha jornada'}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full h-12 rounded-full border border-[var(--q-border-subtle)] text-[var(--q-text-secondary)] font-medium bg-[var(--q-bg-surface)] hover:text-[var(--q-text-primary)] transition-all"
          >
            Ver mais detalhes (R$ 47/m)
          </motion.button>
        </motion.div>

        <motion.div variants={VARIANTS.slideUp} className="mt-8 text-center">
          <p className="text-xs text-[var(--q-text-tertiary)] flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[var(--q-green-9)] inline-block flash-anim" /> 
            4.200+ pessoas em transformação hoje
          </p>
        </motion.div>

      </motion.div>
    </div>
  );
}
