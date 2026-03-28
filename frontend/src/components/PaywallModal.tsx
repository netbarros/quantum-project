"use client";

import { motion, AnimatePresence } from "framer-motion";
import { VARIANTS, TRANSITIONS } from "@/lib/animations";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScore: number;
  currentStreak: number;
  currentDay: number;
}

export function PaywallModal({
  isOpen,
  onClose,
  currentScore,
  currentStreak,
  currentDay,
}: PaywallModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {/* Sheet */}
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--q-bg-depth)] rounded-t-[var(--q-radius-xl)] overflow-hidden pb-safe"
            style={{ maxHeight: "95vh", overflowY: "auto" }}
          >
            {/* Handle bar */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 rounded-full bg-[var(--q-border-strong)]" />
            </div>

            <div className="px-6 pb-8">
              {/* Headline */}
              <motion.div
                variants={VARIANTS.slideUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.1 }}
                className="text-center mb-6"
              >
                <h2 className="font-[family-name:var(--font-instrument)] text-3xl text-[var(--q-text-primary)] italic leading-tight mb-2">
                  Sua consciência está despertando.
                </h2>
                <p className="text-[var(--q-text-secondary)] text-sm">
                  Você chegou até aqui. O que acontece quando você não para?
                </p>
              </motion.div>

              {/* Orb locked visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...TRANSITIONS.spring, delay: 0.2 }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <svg width="140" height="140" viewBox="0 0 140 140">
                    <defs>
                      <radialGradient id="lockedOrbGrad" cx="50%" cy="40%" r="60%">
                        <stop offset="0%" stopColor="#5A4FCF" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#3730A3" stopOpacity="0.3" />
                      </radialGradient>
                    </defs>
                    {/* Dimmed orb */}
                    <circle cx="70" cy="70" r="55" fill="url(#lockedOrbGrad)" opacity="0.5" />
                    {/* Lock ring */}
                    <circle
                      cx="70"
                      cy="70"
                      r="62"
                      fill="none"
                      stroke="rgba(139,92,246,0.3)"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                    />
                    {/* Chain segments */}
                    {[0, 60, 120, 180, 240, 300].map((deg) => {
                      const rad = (deg * Math.PI) / 180;
                      const x = 70 + Math.cos(rad) * 62;
                      const y = 70 + Math.sin(rad) * 62;
                      return (
                        <circle
                          key={deg}
                          cx={x}
                          cy={y}
                          r="4"
                          fill="rgba(139,92,246,0.4)"
                        />
                      );
                    })}
                  </svg>
                  {/* Lock icon center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-4xl">🔒</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Current progress proof */}
              <motion.div
                variants={VARIANTS.cardReveal}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.3 }}
                className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-4 mb-5"
              >
                <p className="text-[var(--q-text-secondary)] text-xs mb-3 text-center">
                  Em {currentDay} dias você conquistou:
                </p>
                <div className="flex justify-around">
                  <div className="text-center">
                    <p className="text-[var(--q-accent-9)] text-2xl font-bold">{currentScore}</p>
                    <p className="text-[var(--q-text-tertiary)] text-xs mt-0.5">pontos</p>
                  </div>
                  <div className="w-px bg-[var(--q-border-subtle)]" />
                  <div className="text-center">
                    <p className="text-[var(--q-amber-9)] text-2xl font-bold">{currentStreak}</p>
                    <p className="text-[var(--q-text-tertiary)] text-xs mt-0.5">dias de streak</p>
                  </div>
                  <div className="w-px bg-[var(--q-border-subtle)]" />
                  <div className="text-center">
                    <p className="text-[var(--q-cyan-9)] text-2xl font-bold">{currentDay}</p>
                    <p className="text-[var(--q-text-tertiary)] text-xs mt-0.5">dia da jornada</p>
                  </div>
                </div>
                <p className="text-center text-[var(--q-text-secondary)] text-sm mt-3 font-[family-name:var(--font-instrument)] italic">
                  Imagine onde vai estar no dia 365.
                </p>
              </motion.div>

              {/* Journey timeline */}
              <motion.div
                variants={VARIANTS.fadeIn}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.4 }}
                className="mb-6"
              >
                <div className="flex items-center gap-2">
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full bg-[var(--q-accent-dim)] border border-[var(--q-accent-8)] flex items-center justify-center text-xs text-[var(--q-accent-9)] font-bold">
                      {currentDay}
                    </div>
                    <p className="text-[10px] text-[var(--q-text-tertiary)] mt-1">Agora</p>
                  </div>
                  <div className="flex-1 flex items-center gap-0.5">
                    <div className="flex-1 h-0.5 bg-[var(--q-accent-8)]" />
                    <div className="w-2 h-2 rounded-full bg-[var(--q-border-strong)] shrink-0" />
                    <div className="flex-1 h-0.5 bg-[var(--q-border-subtle)]" />
                    <div className="w-2 h-2 rounded-full bg-[var(--q-border-subtle)] shrink-0" />
                    <div className="flex-1 h-0.5 bg-[var(--q-border-subtle)]" />
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full bg-[var(--q-bg-raised)] border border-[var(--q-border-subtle)] flex items-center justify-center text-xs text-[var(--q-text-tertiary)]">
                      365
                    </div>
                    <p className="text-[10px] text-[var(--q-text-tertiary)] mt-1">Completo</p>
                  </div>
                </div>
              </motion.div>

              {/* Pricing */}
              <motion.div
                variants={VARIANTS.slideUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.5 }}
                className="bg-[var(--q-accent-dim)] border border-[var(--q-accent-8)] rounded-[var(--q-radius-lg)] p-4 mb-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-[var(--q-text-primary)] font-semibold">Plano Anual</p>
                    <p className="text-[var(--q-text-secondary)] text-xs">Economia de 47%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[var(--q-accent-9)] text-xl font-bold">R$ 297</p>
                    <p className="text-[var(--q-text-tertiary)] text-xs">R$ 24,75/mês</p>
                  </div>
                </div>
                <div className="border-t border-[var(--q-border-subtle)] pt-2 flex justify-between items-center">
                  <p className="text-[var(--q-text-secondary)] text-xs">Plano Mensal</p>
                  <p className="text-[var(--q-text-secondary)] text-sm">R$ 47/mês</p>
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div
                variants={VARIANTS.slideUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="w-full h-14 rounded-full bg-[var(--q-accent-8)] text-white font-semibold text-base shadow-[var(--q-shadow-glow-accent)]"
                >
                  Continuar minha jornada
                </motion.button>
                <button
                  onClick={onClose}
                  className="w-full text-center text-sm text-[var(--q-text-tertiary)] py-2"
                >
                  Ver mais detalhes
                </button>
              </motion.div>

              {/* Social proof */}
              <motion.p
                variants={VARIANTS.fadeIn}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.7 }}
                className="text-center text-xs text-[var(--q-text-tertiary)] mt-4"
              >
                4.200+ pessoas em transformação hoje
              </motion.p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
