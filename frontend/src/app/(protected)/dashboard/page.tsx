'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useProgress } from '../../../hooks/useProgress';
import { ScoreGauge } from '../../../components/dashboard/ScoreGauge';
import { StreakCounter } from '../../../components/dashboard/StreakCounter';
import { LevelBadge } from '../../../components/dashboard/LevelBadge';
import { VARIANTS, TRANSITIONS, stagger } from '../../../lib/animations';

export default function DashboardPage() {
  const { data, isLoading, error, refetch, freezeStreak } = useProgress();
  const [freezeLoading, setFreezeLoading] = useState(false);
  const [freezeError, setFreezeError] = useState<string | null>(null);

  const handleFreeze = async () => {
    setFreezeLoading(true);
    setFreezeError(null);
    try {
      await freezeStreak();
    } catch (err: unknown) {
      setFreezeError(err instanceof Error ? err.message : 'Erro ao usar proteção');
    } finally {
      setFreezeLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--q-bg-void)] text-[var(--q-text-secondary)]">
        <div className="w-12 h-12 rounded-full border-[3px] border-[var(--q-accent-7)]/30 border-t-[var(--q-accent-7)] animate-spin" />
        <span className="text-sm">Carregando progresso…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--q-bg-void)] text-[var(--q-text-secondary)]">
        <p className="text-sm">{error ?? 'Dados de progresso indisponíveis.'}</p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={refetch}
          className="px-6 py-2.5 rounded-full bg-[var(--q-accent-7)]/20 border border-[var(--q-accent-7)]/40 text-[var(--q-accent-9)] font-semibold text-sm hover:bg-[var(--q-accent-7)]/35 transition-colors"
        >
          Tentar novamente
        </motion.button>
      </div>
    );
  }

  const last7 = [...data.history].slice(0, 7).reverse();

  return (
    <motion.div
      variants={VARIANTS.pageEnter}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-[var(--q-bg-void)] text-[var(--q-text-primary)] font-[family-name:var(--font-dm-sans)] relative overflow-hidden pb-16"
    >
      {/* Ambient background orbs */}
      <div className="fixed top-[-150px] left-[-150px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.25),transparent_70%)] blur-[80px] pointer-events-none z-0 animate-[drift_14s_ease-in-out_infinite_alternate]" />
      <div className="fixed bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(217,70,239,0.2),transparent_70%)] blur-[80px] pointer-events-none z-0 animate-[drift_18s_ease-in-out_infinite_alternate-reverse]" />

      <motion.div
        {...stagger(0.08)}
        initial="initial"
        animate="animate"
        className="relative z-[1] max-w-[720px] mx-auto px-5 py-8 flex flex-col gap-6"
      >
        {/* Header */}
        <motion.header variants={VARIANTS.slideUp} className="flex justify-between items-end flex-wrap gap-3">
          <div>
            <h1 className="text-[1.7rem] font-extrabold tracking-tight bg-gradient-to-br from-indigo-100/90 to-indigo-300 bg-clip-text text-transparent font-[family-name:var(--font-instrument)] italic">
              Seu Progresso
            </h1>
            <p className="text-xs text-white/35 mt-1 tracking-widest uppercase">
              Jornada de consciência quântica
            </p>
          </div>
          <motion.div whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.01 }}>
            <Link
              href="/session"
              className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-br from-[var(--q-accent-7)] to-purple-500 text-white font-bold text-[0.82rem] shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-shadow"
            >
              Sessão do dia →
            </Link>
          </motion.div>
        </motion.header>

        {/* Top row: gauge + streak */}
        <motion.div variants={VARIANTS.slideUp} className="flex gap-5 items-start flex-wrap">
          <div className="flex items-center justify-center p-5 bg-white/[0.04] border border-white/[0.09] rounded-3xl backdrop-blur-sm shrink-0">
            <ScoreGauge
              score={data.consciousnessScore}
              level={data.level}
              levelProgress={data.levelProgress}
            />
          </div>

          <div className="flex flex-col gap-4 flex-1 min-w-[140px]">
            <StreakCounter
              streak={data.streak}
              freezeAvailable={data.streakFreezeAvailable}
              onFreeze={handleFreeze}
              freezeLoading={freezeLoading}
            />
            {freezeError && <p className="text-[0.7rem] text-[var(--q-red-8)] m-0">{freezeError}</p>}

            {/* Stats pill row */}
            <div className="flex gap-2.5">
              {[
                { value: data.currentDay, label: 'Dia' },
                { value: data.totalCompleted, label: 'Concluídas' },
                { value: `${data.completionRate}%`, label: 'Taxa' },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  whileTap={{ scale: 0.97 }}
                  className="flex flex-col items-center gap-0.5 px-3.5 py-2.5 bg-white/5 border border-[var(--q-border-default)] rounded-[14px] flex-1"
                >
                  <span className="text-lg font-extrabold text-indigo-100 tabular-nums">{stat.value}</span>
                  <span className="text-[0.58rem] text-white/40 uppercase tracking-wider">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Level badge */}
        <motion.div variants={VARIANTS.slideUp}>
          <LevelBadge
            level={data.level}
            levelProgress={data.levelProgress}
            consciousnessScore={data.consciousnessScore}
          />
        </motion.div>

        {/* 7-day history mini calendar */}
        <motion.div
          variants={VARIANTS.cardReveal}
          transition={TRANSITIONS.spring}
          className="bg-white/[0.04] border border-white/[0.09] rounded-3xl backdrop-blur-sm px-6 py-5"
        >
          <h2 className="text-[0.85rem] font-bold text-white/60 uppercase tracking-wider mb-4">
            Últimos 7 dias
          </h2>
          <div className="flex gap-2.5 flex-wrap">
            {last7.map((entry, i) => {
              const dateLabel = entry.completedAt
                ? new Date(entry.completedAt).toLocaleDateString('pt-BR', { weekday: 'short' })
                : `Dia ${entry.day}`;
              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-[0.85rem] font-bold transition-transform ${
                      entry.isCompleted
                        ? 'bg-gradient-to-br from-[var(--q-accent-7)] to-purple-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.45)]'
                        : 'bg-white/[0.06] border border-white/10 text-white/[0.18]'
                    }`}
                    title={dateLabel}
                  >
                    {entry.isCompleted ? '✓' : ''}
                  </div>
                  <span className="text-[0.58rem] text-white/35 capitalize">{dateLabel}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
