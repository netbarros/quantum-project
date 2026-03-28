"use client";
import { motion } from "framer-motion";

interface OptionCardProps {
  icon: string;
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
}

export function OptionCard({ icon, label, description, selected, onSelect }: OptionCardProps) {
  return (
    <motion.button
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      animate={{
        scale: selected ? 1.02 : 1,
        borderColor: selected ? "var(--q-accent-8)" : "var(--q-border-default)",
        backgroundColor: selected ? "var(--q-accent-dim)" : "var(--q-bg-surface)",
      }}
      transition={{ duration: 0.15 }}
      className="w-full text-left p-4 rounded-[var(--q-radius-lg)] border transition-all"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-[var(--q-text-primary)] font-medium">{label}</p>
          {description && (
            <p className="text-[var(--q-text-secondary)] text-sm mt-0.5">{description}</p>
          )}
        </div>
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto w-5 h-5 rounded-full bg-[var(--q-accent-8)] flex items-center justify-center shrink-0"
          >
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}
