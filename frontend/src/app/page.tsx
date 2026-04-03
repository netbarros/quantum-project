"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { SofiaOrb } from "@/components/session/SofiaOrb";
import { VARIANTS, TRANSITIONS, stagger } from "@/lib/animations";

const FEATURES = [
  {
    title: "Sofia IA",
    description: "Terapeuta espiritualista personalizada que se adapta ao seu momento de vida",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="12" stroke="var(--q-accent-9)" strokeWidth="1.5" />
        <circle cx="14" cy="14" r="5" fill="var(--q-accent-8)" opacity="0.6" />
        <circle cx="14" cy="14" r="2" fill="var(--q-accent-9)" />
      </svg>
    ),
  },
  {
    title: "365 Dias",
    description: "Jornada completa com sessoes adaptativas que evoluem com voce",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4v20M4 14h20" stroke="var(--q-accent-9)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="14" cy="14" r="10" stroke="var(--q-accent-9)" strokeWidth="1.5" opacity="0.4" />
      </svg>
    ),
  },
  {
    title: "Consciencia",
    description: "Score, streaks e niveis que refletem sua evolucao real de identidade",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4L18 12L26 13L20 19L21.5 27L14 23L6.5 27L8 19L2 13L10 12L14 4Z" stroke="var(--q-accent-9)" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
];

export default function LandingPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.push(user.onboardingComplete ? "/home" : "/onboarding");
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Always show the landing — redirect happens silently in background
  return (
    <div className="min-h-screen bg-nebula flex flex-col items-center overflow-x-hidden relative">
      {/* Background glow */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-[var(--q-accent-8)] rounded-full mix-blend-screen filter blur-[160px] opacity-[0.07] pointer-events-none" />

      {/* Hero */}
      <motion.section
        {...stagger(0.12)}
        initial="initial"
        animate="animate"
        className="w-full max-w-lg mx-auto flex flex-col items-center text-center px-6 pt-16 pb-10 z-10"
      >
        {/* Logo */}
        <motion.p
          variants={VARIANTS.fadeIn}
          className="text-sm text-[var(--q-accent-9)] uppercase tracking-[0.25em] mb-10"
        >
          Quantum
        </motion.p>

        {/* Orb */}
        <motion.div variants={VARIANTS.fadeIn} className="mb-8">
          <SofiaOrb blockType="affirmation" size="lg" level="ALIGNED" />
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={VARIANTS.slideUp}
          className="font-[family-name:var(--font-instrument)] italic text-4xl md:text-5xl text-[var(--q-text-primary)] leading-tight mb-4"
        >
          Sua jornada de despertar comeca aqui
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={VARIANTS.slideUp}
          className="text-[var(--q-text-secondary)] text-base max-w-sm leading-relaxed mb-8"
        >
          365 dias de transformacao comportamental com Sofia, sua guia de consciencia.
        </motion.p>

        {/* CTA */}
        <motion.button
          variants={VARIANTS.slideUp}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => router.push("/plans")}
          className="h-14 px-10 rounded-full bg-[var(--q-accent-8)] text-white font-medium text-base shadow-[var(--q-shadow-glow-accent)] transition-shadow hover:shadow-[0_0_40px_rgba(139,92,246,0.4)]"
        >
          Comecar Transformacao
        </motion.button>
      </motion.section>

      {/* Features */}
      <motion.section
        {...stagger(0.1, 0.3)}
        initial="initial"
        animate="animate"
        className="w-full max-w-lg mx-auto px-6 pb-12 z-10"
      >
        <div className="grid gap-4">
          {FEATURES.map((feat) => (
            <motion.div
              key={feat.title}
              variants={VARIANTS.cardReveal}
              transition={TRANSITIONS.spring}
              className="flex items-start gap-4 p-5 rounded-[var(--q-radius-lg)] bg-[var(--q-bg-surface)]/60 border border-[var(--q-border-default)] backdrop-blur-sm"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--q-accent-8)]/10 flex items-center justify-center">
                {feat.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--q-text-primary)] mb-1">
                  {feat.title}
                </h3>
                <p className="text-xs text-[var(--q-text-secondary)] leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Social Proof */}
      <motion.section
        variants={VARIANTS.fadeIn}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.8 }}
        className="w-full max-w-lg mx-auto px-6 pb-8 z-10"
      >
        <div className="text-center py-6 rounded-[var(--q-radius-lg)] border border-[var(--q-border-default)] bg-[var(--q-bg-surface)]/40 backdrop-blur-sm">
          <p className="text-2xl font-bold text-[var(--q-text-primary)] font-[family-name:var(--font-instrument)] italic">
            4.200+
          </p>
          <p className="text-xs text-[var(--q-text-tertiary)] mt-1">
            pessoas em transformacao
          </p>
        </div>
      </motion.section>

      {/* Footer CTA */}
      <motion.footer
        variants={VARIANTS.fadeIn}
        initial="initial"
        animate="animate"
        transition={{ delay: 1 }}
        className="w-full max-w-lg mx-auto px-6 pb-16 z-10 text-center"
      >
        <p className="text-sm text-[var(--q-text-secondary)]">
          Ja tem conta?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-[var(--q-accent-9)] hover:text-white transition-colors font-medium"
          >
            Entrar
          </button>
        </p>
      </motion.footer>
    </div>
  );
}
