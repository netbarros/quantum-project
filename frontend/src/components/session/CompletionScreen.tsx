"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TRANSITIONS } from "@/lib/animations";

interface CompletionScreenProps {
  scoreDelta: number;
  newScore: number;
  newStreak: number;
  leveledUp?: boolean;
  newLevel?: string;
  onContinue: () => void;
  onViewProgress: () => void;
}

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER:   "Iniciante",
  AWARE:      "Consciente",
  CONSISTENT: "Consistente",
  ALIGNED:    "Alinhado",
  INTEGRATED: "Integrado",
};

export function CompletionScreen({
  scoreDelta,
  newScore,
  newStreak,
  leveledUp,
  newLevel,
  onContinue,
  onViewProgress,
}: CompletionScreenProps) {
  useEffect(() => {
    if (leveledUp) {
      // Dynamic import for canvas-confetti — heavy lib only loaded on level-up
      import("canvas-confetti").then((confettiModule) => {
        const confetti = confettiModule.default;
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"],
        });
      });
    }
  }, [leveledUp]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-[var(--q-bg-void)] flex flex-col items-center justify-center px-6 z-50 pb-safe"
    >
      {/* Check icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.2 }}
        className="w-20 h-20 rounded-full bg-[var(--q-green-dim)] border border-[var(--q-green-8)] flex items-center justify-center mb-8"
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <motion.path
            d="M6 16L13 23L26 9"
            stroke="var(--q-green-8)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          />
        </svg>
      </motion.div>

      {/* Score delta */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...TRANSITIONS.spring, delay: 0.5 }}
        className="text-[var(--q-accent-9)] text-6xl font-bold mb-1 tabular-nums"
      >
        +{scoreDelta}
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-[var(--q-text-secondary)] text-sm mb-8"
      >
        pontos de consciência · total: {newScore}
      </motion.p>

      {/* Streak */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...TRANSITIONS.spring, delay: 0.6 }}
        className="flex items-center gap-2 bg-[var(--q-amber-dim)] px-4 py-2 rounded-full border border-[var(--q-amber-8)] mb-10"
      >
        <motion.span
          animate={{ rotate: [-5, 5, -3, 3, 0] }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-xl"
        >
          🔥
        </motion.span>
        <span className="text-[var(--q-amber-9)] font-semibold">
          {newStreak} {newStreak === 1 ? "dia" : "dias"} seguidos
        </span>
      </motion.div>

      {/* Level up badge */}
      <AnimatePresence>
        {leveledUp && newLevel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ ...TRANSITIONS.spring, delay: 0.9 }}
            className="bg-[var(--q-accent-dim)] border border-[var(--q-accent-8)] rounded-[var(--q-radius-xl)] px-6 py-4 text-center mb-8"
          >
            <p className="text-[var(--q-accent-9)] font-semibold text-xs uppercase tracking-widest mb-1">
              Novo Nível
            </p>
            <p className="font-[family-name:var(--font-instrument)] text-2xl text-[var(--q-text-primary)] italic">
              {LEVEL_LABELS[newLevel] ?? newLevel}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="w-full space-y-3 max-w-sm"
      >
        <motion.button
          onClick={onViewProgress}
          whileTap={{ scale: 0.97 }}
          className="w-full h-14 rounded-full bg-[var(--q-accent-8)] text-white font-medium text-base"
        >
          Ver meu progresso
        </motion.button>
        <motion.button
          onClick={onContinue}
          whileTap={{ scale: 0.97 }}
          className="w-full h-12 rounded-full border border-[var(--q-border-default)] text-[var(--q-text-secondary)] text-base"
        >
          Voltar ao início
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
