"use client";

import { motion } from "framer-motion";

export default function ProtectedError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 px-6 bg-[var(--q-bg-void)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-16 h-16 rounded-full bg-[var(--q-red-dim)] border border-[var(--q-red-8)]/30 flex items-center justify-center"
      >
        <span className="text-2xl text-[var(--q-red-9)]">!</span>
      </motion.div>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[var(--q-text-primary)] mb-2">Algo deu errado</h2>
        <p className="text-sm text-[var(--q-text-secondary)] max-w-xs">{error.message || "Erro inesperado. Tente recarregar."}</p>
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={reset}
        className="px-6 py-3 rounded-full bg-[var(--q-accent-8)] text-white font-medium shadow-[var(--q-shadow-glow-accent)]"
      >
        Tentar novamente
      </motion.button>
    </div>
  );
}
