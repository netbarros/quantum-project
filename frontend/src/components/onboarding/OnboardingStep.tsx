"use client";

import { motion } from "framer-motion";

interface Option {
  value: string;
  label: string;
  emoji?: string;
  description?: string;
}

interface OnboardingStepProps {
  title: string;
  description: string;
  options: Option[];
  selected: string | null;
  onSelect: (value: string) => void;
}

export default function OnboardingStep({
  title,
  description,
  options,
  selected,
  onSelect,
}: OnboardingStepProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-[family-name:var(--font-instrument)] italic text-[var(--q-text-primary)] mb-2 leading-tight">
        {title}
      </h2>
      <p className="text-sm text-[var(--q-text-secondary)] mb-8 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-col gap-3">
        {options.map((opt, i) => {
          const isSelected = selected === opt.value;
          return (
            <motion.button
              key={opt.value}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(opt.value)}
              className={`flex items-center gap-4 w-full p-4 rounded-[var(--q-radius-lg)] border-2 text-left transition-all ${
                isSelected
                  ? "border-[var(--q-accent-8)] bg-[var(--q-accent-dim)] shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                  : "border-[var(--q-border-default)] bg-[var(--q-bg-surface)] hover:border-[var(--q-border-strong)]"
              }`}
            >
              {opt.emoji && (
                <span className="text-2xl shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-white/5">
                  {opt.emoji}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium block ${
                  isSelected ? "text-[var(--q-text-primary)]" : "text-[var(--q-text-secondary)]"
                }`}>
                  {opt.label}
                </span>
                {opt.description && (
                  <span className="text-xs text-[var(--q-text-tertiary)] block mt-0.5 line-clamp-1">
                    {opt.description}
                  </span>
                )}
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 rounded-full bg-[var(--q-accent-8)] flex items-center justify-center shrink-0"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
