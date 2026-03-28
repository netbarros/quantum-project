"use client";

import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";

interface StreakCardProps {
  streak: number;
  streakFreezeAvailable: boolean;
}

export function StreakCard({ streak, streakFreezeAvailable }: StreakCardProps) {
  const queryClient = useQueryClient();
  const [freezeUsed, setFreezeUsed] = useState(false);

  const freezeMutation = useMutation({
    mutationFn: () => api.post("/streak/freeze"),
    onSuccess: () => {
      setFreezeUsed(true);
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });

  const hasGlow = streak > 7;
  const isOnFire = streak > 30;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-[var(--q-radius-lg)] bg-[var(--q-bg-surface)] border p-5 ${
        hasGlow
          ? "border-[var(--q-amber-8)] shadow-[0_0_24px_rgba(245,158,11,0.2)]"
          : "border-[var(--q-border-default)]"
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Left: streak info */}
        <div className="flex items-center gap-3">
          <motion.span
            className="text-4xl"
            animate={streak > 0 ? { scale: [1, 1.1, 0.95, 1.05, 1], rotate: [-2, 2, -1, 1, 0] } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {streak === 0 ? "💤" : "🔥"}
          </motion.span>

          <div>
            <motion.p
              key={streak}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="text-[var(--q-text-primary)] font-bold leading-none"
              style={{ fontSize: 48, fontVariantNumeric: "tabular-nums" }}
            >
              {streak}
            </motion.p>
            <p className="text-[var(--q-text-secondary)] text-xs mt-0.5">
              {streak === 1 ? "dia seguido" : "dias seguidos"}
            </p>
          </div>
        </div>

        {/* Right: freeze button */}
        {(streakFreezeAvailable && !freezeUsed) && (
          <motion.button
            onClick={() => freezeMutation.mutate()}
            disabled={freezeMutation.isPending}
            whileTap={{ scale: 0.95 }}
            whileHover={{ y: -1 }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[var(--q-radius-md)] border border-[var(--q-accent-8)] bg-[var(--q-accent-dim)] text-[var(--q-accent-9)] text-xs font-medium disabled:opacity-50 transition-opacity"
          >
            <ShieldIcon />
            <span>Freeze</span>
          </motion.button>
        )}

        {(freezeUsed || !streakFreezeAvailable) && (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-[var(--q-radius-md)] border border-[var(--q-border-subtle)] text-[var(--q-text-tertiary)] text-xs">
            <ShieldIcon />
            <span>Usado</span>
          </div>
        )}
      </div>

      {/* On fire badge */}
      {isOnFire && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3 inline-flex items-center gap-1 bg-[var(--q-amber-dim)] border border-[var(--q-amber-8)] rounded-full px-3 py-1 text-xs text-[var(--q-amber-9)] font-medium"
        >
          🔥 Em chamas
        </motion.div>
      )}

      {/* Freeze success animation */}
      {freezeUsed && freezeMutation.isSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-xs text-[var(--q-accent-9)] flex items-center gap-1"
        >
          <ShieldIcon />
          Streak protegido por hoje!
        </motion.div>
      )}
    </motion.div>
  );
}

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
      <path
        d="M7 1.5L2 3.5v4c0 2.5 2.1 4.8 5 5.5 2.9-.7 5-3 5-5.5v-4L7 1.5z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
