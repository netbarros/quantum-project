"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";

export function PushPermissionBanner() {
  const { permission, isSupported, subscribe, isLoading } = useNotifications();

  // Only show if supported and permission not yet decided
  if (!isSupported || permission !== "default") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mx-4 mt-3 p-3 rounded-[var(--q-radius-md)] bg-[var(--q-accent-dim)] border border-[var(--q-accent-8)] flex items-center gap-3"
      >
        <span className="text-xl shrink-0">🔔</span>
        <p className="text-sm text-[var(--q-text-secondary)] flex-1">
          Ative notificações para manter sua prática diária.
        </p>
        <motion.button
          onClick={() => subscribe()}
          disabled={isLoading}
          whileTap={{ scale: 0.95 }}
          className="shrink-0 px-3 py-1.5 rounded-[var(--q-radius-sm)] bg-[var(--q-accent-8)] text-white text-xs font-medium disabled:opacity-50"
        >
          {isLoading ? "..." : "Ativar"}
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
