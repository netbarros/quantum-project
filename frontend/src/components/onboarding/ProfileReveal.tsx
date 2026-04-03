"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SofiaOrb } from "@/components/session/SofiaOrb";

interface ProfileRevealProps {
  name: string;
  goal: string;
  onContinue: () => void;
}

export function ProfileReveal({ name, goal, onContinue }: ProfileRevealProps) {
  const [phase, setPhase] = useState(0); // 0: orb grows, 1: text reveals, 2: CTA

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500);
    const t2 = setTimeout(() => setPhase(2), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-nebula-centered flex flex-col items-center justify-center px-6 z-50 overflow-hidden"
    >
      {/* Deep glow background */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 0.4 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.3), rgba(109,40,217,0.15), transparent 70%)", filter: "blur(40px)" }}
      />

      {/* Second glow layer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ delay: 0.5, duration: 1.5 }}
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.3), transparent 65%)", filter: "blur(30px)", transform: "translate(50px, -30px)" }}
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        {/* Title — appears first */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: phase >= 0 ? 0.7 : 0, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-[var(--q-text-tertiary)] text-xs uppercase tracking-[0.3em] mb-8 font-[family-name:var(--font-dm-sans)]"
        >
          Sua alma cósmica se revela...
        </motion.p>

        {/* Massive cosmic orb */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, type: "spring", stiffness: 100, damping: 15 }}
          className="mb-10"
        >
          <SofiaOrb blockType="affirmation" size="lg" level="INTEGRATED" />
        </motion.div>

        {/* Name reveal */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-10"
            >
              <h2 className="font-[family-name:var(--font-instrument)] text-4xl text-[var(--q-text-primary)] italic mb-3 drop-shadow-[0_0_30px_rgba(139,92,246,0.4)]">
                {name}
              </h2>
              <p className="text-[var(--q-text-secondary)] text-sm leading-relaxed max-w-xs">
                Viajante em busca de {goal.toLowerCase()}, pronta para uma jornada de transformação profunda.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full"
            >
              <motion.button
                onClick={onContinue}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
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
