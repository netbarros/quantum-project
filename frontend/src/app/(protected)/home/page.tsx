"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { useEffect } from "react";
import { SofiaOrb } from "@/components/session/SofiaOrb";
import { AmbientParticles } from "@/components/session/AmbientParticles";
import { BlockBackground } from "@/components/session/BlockBackground";
import { VARIANTS, TRANSITIONS, stagger } from "@/lib/animations";

interface Progress {
  consciousnessScore: number;
  level: string;
  streak: number;
  currentDay: number;
  totalCompleted: number;
  completionRate: number;
  lastSessionDate: string | null;
}

interface SessionCheck {
  session: { day: number; isCompleted: boolean };
  progress: { currentDay: number; consciousnessScore: number; level: string; streak: number };
}

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Iniciante", AWARE: "Consciente", CONSISTENT: "Consistente",
  ALIGNED: "Alinhado", INTEGRATED: "Integrado",
};

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "var(--q-text-tertiary)", AWARE: "var(--q-cyan-9)",
  CONSISTENT: "var(--q-green-9)", ALIGNED: "var(--q-amber-9)", INTEGRATED: "var(--q-accent-9)",
};

function getSofiaGreeting(name: string, streak: number, level: string, day: number, completed: boolean): string {
  if (completed) {
    if (streak > 7) return `Você brilhou hoje, ${name}. ${streak} dias consecutivos de presença. Descanse — amanhã, iremos mais fundo.`;
    return `Bom trabalho hoje, ${name}. Permita-se absorver o que viveu. Amanhã, um novo passo.`;
  }
  if (day === 1) return `Bem-vinda à sua jornada, ${name}. Eu sou Sofia, e estarei com você a cada passo.`;
  if (streak === 0) return `Olá, ${name}. Que bom te ver de volta. Cada retorno é uma prova de coragem. Vamos recomeçar?`;
  if (streak >= 7) return `${name}, ${streak} dias sem parar. Isso é raro. Isso é transformação real. Pronta para o dia ${day}?`;
  if (streak >= 3) return `Dia ${day}, ${streak} dias seguidos. Sua constância está construindo algo profundo, ${name}.`;
  return `${name}, você voltou. Dia ${day} te espera. Vamos juntas?`;
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const name = user?.name || "viajante";

  const toast = useToast();
  const searchParams = useSearchParams();

  // Detect payment success redirect from Stripe
  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      toast.show("Premium ativado com sucesso!", "success");
      // Clean URL
      window.history.replaceState({}, "", "/home");
    }
  }, [searchParams, toast]);

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["session", "daily-check"],
    queryFn: () => api.get<SessionCheck>("/session/daily").then((r) => r.data),
    staleTime: 1000 * 60,
    retry: false,
  });

  const { data: progress } = useQuery({
    queryKey: ["progress"],
    queryFn: () => api.get<Progress>("/progress").then((r) => r.data),
    staleTime: 1000 * 60,
  });

  const streak = session?.progress?.streak ?? progress?.streak ?? 0;
  const level = session?.progress?.level ?? progress?.level ?? "BEGINNER";
  const score = session?.progress?.consciousnessScore ?? progress?.consciousnessScore ?? 0;
  const day = session?.session?.day ?? progress?.currentDay ?? 1;
  const completed = session?.session?.isCompleted ?? false;

  if (sessionLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[var(--q-bg-void)]">
        <div className="w-12 h-12 rounded-full border-[3px] border-[var(--q-accent-7)]/30 border-t-[var(--q-accent-7)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-[var(--q-bg-void)] relative overflow-hidden">
      <BlockBackground blockType="direction" />
      <AmbientParticles blockType="direction" count={10} />

      <motion.div
        {...stagger(0.12)}
        initial="initial"
        animate="animate"
        className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-6 py-12 max-w-lg mx-auto text-center"
      >
        {/* Sofia Orb */}
        <motion.div variants={VARIANTS.fadeIn} className="mb-4">
          <SofiaOrb blockType="direction" size="lg" level={level} />
        </motion.div>

        {/* Sofia name */}
        <motion.p
          variants={VARIANTS.fadeIn}
          className="text-[10px] text-[var(--q-text-tertiary)] uppercase tracking-[0.25em] mb-6"
        >
          Sofia
        </motion.p>

        {/* Personalized greeting */}
        <motion.p
          variants={VARIANTS.slideUp}
          transition={TRANSITIONS.smooth}
          className="text-xl font-[family-name:var(--font-instrument)] italic text-[var(--q-text-primary)] leading-relaxed mb-8 max-w-md"
        >
          {getSofiaGreeting(name, streak, level, day, completed)}
        </motion.p>

        {/* Mini stats row */}
        <motion.div variants={VARIANTS.slideUp} className="flex items-center gap-4 mb-10">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-[var(--q-border-subtle)]">
            <span className="text-sm">🔥</span>
            <span className="text-xs text-[var(--q-text-primary)] font-medium tabular-nums">{streak}d</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-[var(--q-border-subtle)]">
            <span className="text-xs font-bold tabular-nums" style={{ color: "var(--q-accent-9)" }}>{score}</span>
            <span className="text-[10px] text-[var(--q-text-tertiary)]">pts</span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-white/5 border border-[var(--q-border-subtle)]">
            <span className="text-xs font-medium" style={{ color: LEVEL_COLORS[level] ?? "var(--q-text-tertiary)" }}>
              {LEVEL_LABELS[level] ?? level}
            </span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div variants={VARIANTS.slideUp} className="flex flex-col gap-3 w-full max-w-xs">
          {!completed ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => router.push("/session")}
              className="h-14 rounded-full bg-[var(--q-accent-8)] text-white font-medium text-base shadow-[var(--q-shadow-glow-accent)]"
            >
              Iniciar sessão do dia {day}
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => router.push("/dashboard")}
              className="h-14 rounded-full bg-[var(--q-accent-8)] text-white font-medium text-base shadow-[var(--q-shadow-glow-accent)]"
            >
              Ver meu progresso
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(completed ? "/history" : "/dashboard")}
            className="h-12 rounded-full bg-white/5 border border-[var(--q-border-default)] text-[var(--q-text-secondary)] text-sm font-medium hover:border-[var(--q-border-strong)] transition-colors"
          >
            {completed ? "Explorar reflexões" : "Ver progresso"}
          </motion.button>
        </motion.div>

        {/* Day indicator */}
        <motion.p
          variants={VARIANTS.fadeIn}
          className="mt-8 text-[10px] text-[var(--q-text-tertiary)] uppercase tracking-widest"
        >
          Dia {day} de 365
        </motion.p>
      </motion.div>
    </div>
  );
}
