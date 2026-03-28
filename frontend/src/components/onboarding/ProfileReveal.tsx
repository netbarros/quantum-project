"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TRANSITIONS } from "@/lib/animations";

interface ProfileRevealProps {
  name: string;
  goal: string;
  onContinue: () => void;
}

export function ProfileReveal({ name, goal, onContinue }: ProfileRevealProps) {
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCTA(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-[var(--q-bg-void)] flex flex-col items-center justify-center px-6 z-50 overflow-hidden"
    >
      {/* Background radial expansion */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle_at_center,var(--q-bg-surface),transparent_70%)] opacity-30 pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        {/* Core Identity Orb Placeholder */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...TRANSITIONS.spring, delay: 0.5 }}
          className="relative w-32 h-32 mb-8"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.8, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-[var(--q-accent-8)] opacity-40 blur-2xl filter"
          />
          <div className="absolute inset-2 rounded-full border border-[var(--q-border-subtle)] bg-[var(--q-bg-depth)] flex items-center justify-center overflow-hidden">
             <div className="w-full h-full bg-[radial-gradient(circle_at_30%_30%,var(--q-border-default),transparent)] opacity-20" />
             <div className="absolute">
               <span className="text-3xl">🌱</span>
             </div>
          </div>
        </motion.div>

        {/* Text Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <p className="text-[var(--q-text-tertiary)] text-xs uppercase tracking-widest mb-3">
            Perfil Identificado
          </p>
          <h2 className="font-[family-name:var(--font-instrument)] text-3xl text-[var(--q-text-primary)] italic mb-2">
            O Despertar de {name}
          </h2>
          <p className="text-[var(--q-text-secondary)] text-sm">
            Sua jornada começa hoje. Foco primário: {goal}.
          </p>
        </motion.div>

        {/* CTA */}
        <AnimatePresence>
          {showCTA && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <motion.button
                onClick={onContinue}
                whileTap={{ scale: 0.97 }}
                className="w-full h-14 rounded-full bg-[var(--q-accent-8)] text-white font-medium text-base shadow-[var(--q-shadow-glow-accent)]"
              >
                Iniciar Dia 1
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
