"use client";

import { motion } from "framer-motion";

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function ToggleSwitch({ id, checked, onChange, disabled, label }: ToggleSwitchProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--q-accent-8)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--q-bg-surface)] disabled:opacity-40 disabled:cursor-not-allowed ${
          checked ? "bg-[var(--q-accent-8)]" : "bg-[var(--q-bg-raised)]"
        }`}
        style={{
          border: `1px solid ${checked ? "var(--q-accent-7)" : "var(--q-border-default)"}`,
        }}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
          className={`absolute top-0.5 w-5 h-5 rounded-full shadow-sm ${
            checked ? "bg-white" : "bg-[var(--q-text-tertiary)]"
          }`}
          style={{ left: checked ? "calc(100% - 22px)" : "2px" }}
        />
      </button>
      {label && (
        <label
          htmlFor={id}
          className="text-sm text-[var(--q-text-primary)] cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
}
