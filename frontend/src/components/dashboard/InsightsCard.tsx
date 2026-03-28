"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { VARIANTS } from "@/lib/animations";

interface InsightsData {
  suggestions: string[];
  patterns: {
    completionRate: number;
    peakHour: number;
    journalEngagement: boolean;
    streakBreakPattern: string;
  } | null;
}

export function InsightsCard() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "insights"],
    queryFn: () => api.get<InsightsData>("/analytics/insights").then((r) => r.data),
    staleTime: 1000 * 60 * 30,
  });

  if (isLoading) {
    return (
      <div className="rounded-[var(--q-radius-lg)] bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] p-5 animate-pulse h-32" />
    );
  }

  if (!data || !data.patterns) return null;

  return (
    <motion.div
      variants={VARIANTS.cardReveal}
      initial="initial"
      animate="animate"
      className="rounded-[var(--q-radius-lg)] bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">✨</span>
        <p className="text-xs text-[var(--q-text-tertiary)] uppercase tracking-[0.15em]">
          Insights Personalizados
        </p>
      </div>
      <ul className="space-y-2">
        {data.suggestions.map((suggestion, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="text-sm text-[var(--q-text-secondary)] flex items-start gap-2"
          >
            <span className="text-[var(--q-accent-9)] mt-0.5 shrink-0">→</span>
            <span className="font-[family-name:var(--font-instrument)] italic leading-snug">
              {suggestion}
            </span>
          </motion.li>
        ))}
      </ul>

      {data.patterns.completionRate > 0 && (
        <div className="mt-4 pt-3 border-t border-[var(--q-border-subtle)]">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[var(--q-bg-raised)] h-1.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(data.patterns.completionRate * 100)}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-[var(--q-accent-8)] rounded-full"
              />
            </div>
            <span className="text-xs text-[var(--q-text-tertiary)] tabular-nums shrink-0">
              {Math.round(data.patterns.completionRate * 100)}%
            </span>
          </div>
          <p className="text-xs text-[var(--q-text-tertiary)] mt-1">Taxa de conclusão (14 dias)</p>
        </div>
      )}
    </motion.div>
  );
}
