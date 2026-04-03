"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { VARIANTS, TRANSITIONS, stagger } from "@/lib/animations";
import { SofiaOrb } from "@/components/session/SofiaOrb";

interface JournalEntry {
  id: string;
  contentId: string;
  reflection: string;
  createdAt: string;
}

export default function JournalPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["journal"],
    queryFn: () => api.get<{ entries: JournalEntry[] }>("/journal").then((r) => r.data.entries ?? []),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="min-h-screen bg-[var(--q-bg-void)] px-4 py-6 md:px-6">
      <div className="max-w-xl mx-auto">
        <motion.div variants={VARIANTS.pageEnter} initial="initial" animate="animate" className="mb-6">
          <h1 className="text-2xl font-[family-name:var(--font-instrument)] italic text-[var(--q-text-primary)] mb-1">
            Diário de Sofia
          </h1>
          <p className="text-sm text-[var(--q-text-secondary)]">Suas reflexões ao longo da jornada</p>
        </motion.div>

        {error ? (
          <div className="p-4 rounded-[var(--q-radius-lg)] bg-[var(--q-red-dim)] border border-[var(--q-red-8)]/20 text-center">
            <p className="text-[var(--q-red-9)] text-sm">Erro ao carregar reflexões.</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-[var(--q-bg-surface)] rounded-[var(--q-radius-lg)] border border-[var(--q-border-default)] animate-pulse" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <motion.div {...stagger(0.08)} initial="initial" animate="animate" className="space-y-3">
            {data.map((entry) => (
              <motion.div
                key={entry.id}
                variants={VARIANTS.cardReveal}
                transition={TRANSITIONS.spring}
                className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[var(--q-accent-9)] uppercase tracking-wider">Reflexão</span>
                  <span className="text-[10px] text-[var(--q-text-tertiary)]">
                    {new Date(entry.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
                <p className="text-sm text-[var(--q-text-primary)] leading-relaxed font-[family-name:var(--font-dm-sans)]">
                  {entry.reflection}
                </p>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={VARIANTS.pageEnter} initial="initial" animate="animate" className="text-center py-16">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mb-4 flex justify-center">
              <SofiaOrb blockType="reflection" size="sm" />
            </motion.div>
            <p className="text-[var(--q-text-secondary)] text-sm max-w-xs mx-auto mb-1">
              Seu diário está vazio.
            </p>
            <p className="text-[var(--q-text-tertiary)] text-xs">
              Escreva suas reflexões durante as sessões — elas aparecerão aqui.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
