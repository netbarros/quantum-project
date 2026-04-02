"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VARIANTS, TRANSITIONS } from "@/lib/animations";
import { ReflectionInput } from "./ReflectionInput";

const BLOCK_KEYS = [
  "direction",
  "explanation",
  "reflection",
  "action",
  "question",
  "affirmation",
  "practice",
  "integration",
] as const;

type BlockKey = typeof BLOCK_KEYS[number];

const BLOCK_CONFIG: Record<
  BlockKey,
  { font: string; size: string; fullScreen: boolean; delay: number; glow?: boolean; hasInput?: boolean; isFinal?: boolean }
> = {
  direction: { font: "serif", size: "text-2xl", fullScreen: false, delay: 2 },
  explanation: { font: "sans", size: "text-base", fullScreen: false, delay: 0 },
  reflection: { font: "sans", size: "text-lg", fullScreen: false, delay: 0, hasInput: true },
  action: { font: "sans", size: "text-base", fullScreen: false, delay: 0 },
  question: { font: "serif", size: "text-xl", fullScreen: false, delay: 0 },
  affirmation: { font: "serif", size: "text-3xl", fullScreen: true, delay: 1.5, glow: true },
  practice: { font: "sans", size: "text-base", fullScreen: false, delay: 0 },
  integration: { font: "sans", size: "text-base", fullScreen: false, delay: 0, isFinal: true },
};

interface SessionBlockReaderProps {
  contentId: string;
  content: Record<string, string>;
  onComplete: () => void;
}

export function SessionBlockReader({
  contentId,
  content,
  onComplete,
}: SessionBlockReaderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const blockKey = BLOCK_KEYS[currentIndex];
  const config = BLOCK_CONFIG[blockKey];
  const isLast = currentIndex === BLOCK_KEYS.length - 1;

  const advance = () => {
    if (isLast) {
      onComplete();
    } else {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  };

  return (
    <div className="flex flex-col min-h-[75vh] bg-[var(--q-bg-void)] rounded-[var(--q-radius-xl)] overflow-hidden">
      {/* Progress bar */}
      <div className="flex gap-1 p-4 pt-safe z-10 w-full relative">
        {BLOCK_KEYS.map((_, i) => (
          <motion.div
            key={i}
            className="h-1 flex-1 rounded-full overflow-hidden bg-[var(--q-border-subtle)]"
          >
            <motion.div
              className="h-full bg-[var(--q-accent-8)]"
              initial={{ width: "0%" }}
              animate={{ width: i <= currentIndex ? "100%" : "0%" }}
              transition={TRANSITIONS.spring}
            />
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        {config.fullScreen ? (
          // Fullscreen Block (Affirmation)
          <motion.div
            key={blockKey}
            custom={direction}
            variants={VARIANTS.slideHorizontal}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={TRANSITIONS.smooth}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-[var(--q-bg-depth)] pb-safe"
          >
            {/* Background elements for full screen (glow effect) */}
            {config.glow && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.3, scale: 1 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                className="absolute w-64 h-64 rounded-full bg-[var(--q-accent-8)] blur-3xl pointer-events-none"
              />
            )}
            <p
              className={`text-center font-[family-name:var(--font-instrument)] italic text-3xl text-[var(--q-text-primary)] leading-relaxed relative z-10 drop-shadow-[0_0_30px_rgba(139,92,246,0.5)]`}
            >
              &quot;{content[blockKey]}&quot;
            </p>
            <motion.button
              onClick={advance}
              whileTap={{ scale: 0.97 }}
              className="absolute bottom-8 left-6 right-6 h-14 rounded-full bg-[var(--q-accent-8)] text-white font-medium text-base z-30"
            >
              Absorver
            </motion.button>
          </motion.div>
        ) : (
          // Regular Block Content
          <motion.div
            key={blockKey}
            custom={direction}
            variants={VARIANTS.slideHorizontal}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={TRANSITIONS.smooth}
            className="flex-1 flex flex-col"
          >
            <div className="flex-1 px-8 py-10 flex flex-col justify-center max-w-lg mx-auto w-full relative">
               <p
                 className={`
                   ${
                     config.font === "serif"
                       ? "font-[family-name:var(--font-instrument)] italic"
                       : "font-[family-name:var(--font-dm-sans)]"
                   }
                   ${config.size}
                   text-[var(--q-text-primary)] leading-relaxed
                 `}
               >
                 {content[blockKey]}
               </p>

               {config.hasInput && (
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.4 }}
                   className="mt-8"
                 >
                   <ReflectionInput contentId={contentId} />
                 </motion.div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Navigation CTA */}
      {!config.fullScreen && (
        <div className="p-6 pb-safe flex items-center justify-between z-10 mx-auto w-full max-w-lg">
          <motion.button
            onClick={goBack}
            disabled={currentIndex === 0}
            whileTap={{ scale: 0.97 }}
            className="w-12 h-12 flex items-center justify-center rounded-full text-[var(--q-text-tertiary)] hover:bg-[var(--q-bg-surface)] disabled:opacity-30 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
          
          <motion.button
            onClick={advance}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            className="flex-1 max-w-[200px] h-14 rounded-full bg-[var(--q-accent-8)] text-white font-medium text-base shadow-[var(--q-shadow-glow-accent)]"
          >
            {isLast ? "Completar dia ✓" : "Continuar"}
          </motion.button>
        </div>
      )}
    </div>
  );
}
