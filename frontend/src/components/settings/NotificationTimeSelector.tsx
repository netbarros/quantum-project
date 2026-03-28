"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TIME_OPTIONS = Array.from({ length: 17 }, (_, i) => {
  const hour = i + 6; // 06:00 to 22:00
  return `${String(hour).padStart(2, "0")}:00`;
});

interface NotificationTimeSelectorProps {
  value: string | null;
  onChange: (time: string) => void;
  disabled?: boolean;
}

export function NotificationTimeSelector({
  value,
  onChange,
  disabled,
}: NotificationTimeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pendingValue, setPendingValue] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (time: string) => {
    setPendingValue(time);
    setOpen(false);
    setSaved(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(time);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500);
  };

  const displayValue = pendingValue ?? value ?? "Escolher horário";

  return (
    <div ref={containerRef} className="relative">
      <button
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-[var(--q-radius-md)] border bg-[var(--q-bg-raised)] text-sm transition-colors disabled:opacity-40 ${
          open
            ? "border-[var(--q-accent-8)] text-[var(--q-text-primary)]"
            : "border-[var(--q-border-default)] text-[var(--q-text-secondary)] hover:border-[var(--q-border-strong)]"
        }`}
      >
        <span className="flex items-center gap-2">
          <span>🕐</span>
          <span>{displayValue}</span>
        </span>

        <div className="flex items-center gap-2">
          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="text-[var(--q-green-8)]"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2.5 7L5.5 10L11.5 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.span>
            )}
          </AnimatePresence>
          <motion.svg
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M3 5L7 9L11 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </motion.svg>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-0 right-0 mt-1 bg-[var(--q-bg-overlay)] border border-[var(--q-border-default)] rounded-[var(--q-radius-md)] overflow-hidden shadow-[var(--q-shadow-lg)] max-h-60 overflow-y-auto"
          >
            {TIME_OPTIONS.map((time) => (
              <button
                key={time}
                onClick={() => handleSelect(time)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[var(--q-bg-raised)] ${
                  (pendingValue ?? value) === time
                    ? "text-[var(--q-accent-9)] bg-[var(--q-accent-dim)]"
                    : "text-[var(--q-text-primary)]"
                }`}
              >
                {time}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
