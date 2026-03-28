"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateJournalEntry } from "@/hooks/useJournal";

interface ReflectionInputProps {
  contentId: string;
  onHasText?: (hasText: boolean) => void;
}

export function ReflectionInput({ contentId, onHasText }: ReflectionInputProps) {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { mutate: createEntry } = useCreateJournalEntry();

  const MAX_CHARS = 2000;
  const remaining = MAX_CHARS - text.length;

  useEffect(() => {
    onHasText?.(text.trim().length >= 10);
  }, [text, onHasText]);

  const autoSave = useCallback(
    (value: string) => {
      if (value.trim().length < 10) return;
      // Fire-and-forget — no await
      createEntry({ contentId, reflection: value });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    [contentId, createEntry]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.slice(0, MAX_CHARS);
    setText(value);
    setSaved(false);

    // Debounce auto-save 1000ms
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => autoSave(value), 1000);
  };

  return (
    <div className="mt-4">
      {!isExpanded ? (
        <motion.button
          onClick={() => setIsExpanded(true)}
          whileTap={{ scale: 0.97 }}
          className="w-full h-11 rounded-[var(--q-radius-md)] border border-[var(--q-border-subtle)] text-[var(--q-text-tertiary)] text-sm text-left px-4 flex items-center gap-2 transition-colors hover:border-[var(--q-border-default)]"
        >
          <span className="text-base">✍️</span>
          <span>Escreva sua reflexão... (opcional)</span>
        </motion.button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="relative">
              <textarea
                value={text}
                onChange={handleChange}
                autoFocus
                placeholder="Escreva sua reflexão aqui... O que esse bloco despertou em você?"
                className="w-full min-h-[120px] bg-[var(--q-bg-raised)] border border-[var(--q-border-default)] rounded-[var(--q-radius-md)] p-4 text-[var(--q-text-primary)] text-sm resize-none focus:outline-none focus:border-[var(--q-accent-8)] transition-colors placeholder:text-[var(--q-text-tertiary)] leading-relaxed"
              />
              {/* Character count + saved indicator */}
              <div className="flex items-center justify-between mt-2 px-1">
                <AnimatePresence>
                  {saved && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-[var(--q-green-8)] flex items-center gap-1"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6L5 9L10 3"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      Salvo
                    </motion.span>
                  )}
                </AnimatePresence>
                <span
                  className={`text-xs ml-auto ${
                    remaining < 100
                      ? "text-[var(--q-amber-8)]"
                      : "text-[var(--q-text-tertiary)]"
                  }`}
                >
                  {remaining} restantes
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
