"use client";

import { motion } from "framer-motion";
import { VARIANTS } from "@/lib/animations";

interface AdminStatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaPositive?: boolean;
  icon?: string;
  accent?: "purple" | "cyan" | "green" | "amber";
}

const ACCENT_STYLES = {
  purple: {
    border: "border-[var(--q-accent-8)]",
    text: "text-[var(--q-accent-9)]",
    bg: "bg-[var(--q-accent-dim)]",
  },
  cyan: {
    border: "border-[var(--q-cyan-8)]",
    text: "text-[var(--q-cyan-9)]",
    bg: "bg-[var(--q-cyan-dim)]",
  },
  green: {
    border: "border-[var(--q-green-8)]",
    text: "text-[var(--q-green-9)]",
    bg: "bg-[var(--q-green-dim)]",
  },
  amber: {
    border: "border-[var(--q-amber-8)]",
    text: "text-[var(--q-amber-9)]",
    bg: "bg-[var(--q-amber-dim)]",
  },
};

export function AdminStatCard({
  label,
  value,
  delta,
  deltaPositive,
  icon,
  accent = "purple",
}: AdminStatCardProps) {
  const styles = ACCENT_STYLES[accent];

  return (
    <motion.div
      variants={VARIANTS.cardReveal}
      whileHover={{ y: -2 }}
      className={`bg-[var(--q-bg-surface)] border rounded-[var(--q-radius-lg)] p-5 ${styles.border}`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-[var(--q-text-secondary)] text-xs uppercase tracking-wider">{label}</p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <p className={`text-3xl font-bold tabular-nums ${styles.text}`}>{value}</p>
      {delta && (
        <p
          className={`text-xs mt-1 ${
            deltaPositive !== false
              ? "text-[var(--q-green-8)]"
              : "text-[var(--q-red-8)]"
          }`}
        >
          {deltaPositive !== false ? "↑" : "↓"} {delta}
        </p>
      )}
    </motion.div>
  );
}
