"use client";

import { motion } from "framer-motion";
import { VARIANTS } from "@/lib/animations";

export default function HistoryPage() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-6">
      <motion.div variants={VARIANTS.pageEnter} initial="initial" animate="animate" className="text-center">
        <div className="w-24 h-24 rounded-full bg-[var(--q-bg-surface)] border border-[var(--q-border-subtle)] flex items-center justify-center mx-auto mb-6 relative">
          <div className="absolute inset-0 rounded-full border border-[var(--q-accent-8)] opacity-20 scale-110 pointer-events-none" />
          <span className="text-4xl">❂</span>
        </div>
        <h1 className="text-2xl font-[family-name:var(--font-instrument)] italic text-[var(--q-text-primary)] mb-3 glow-accent">
          Sua Jornada
        </h1>
        <p className="text-[var(--q-text-secondary)] text-sm max-w-xs mx-auto">
          O registro das suas epifanias e transformações está sendo preparado. Continue praticando para revelar esta visão.
        </p>
      </motion.div>
    </div>
  );
}
