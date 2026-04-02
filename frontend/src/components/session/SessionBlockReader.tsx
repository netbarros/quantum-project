"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VARIANTS, TRANSITIONS } from "@/lib/animations";
import { ReflectionInput } from "./ReflectionInput";
import { SofiaOrb } from "./SofiaOrb";
import { AudioPlayer } from "./AudioPlayer";
import { AmbientParticles } from "./AmbientParticles";
import { BlockBackground } from "./BlockBackground";
import { AmbientMusic } from "./AmbientMusic";

const BLOCK_KEYS = [
  "direction", "explanation", "reflection", "action",
  "question", "affirmation", "practice", "integration",
] as const;

type BlockKey = typeof BLOCK_KEYS[number];

const BLOCK_CONFIG: Record<BlockKey, {
  font: string; size: string; fullScreen: boolean; glow?: boolean;
  hasInput?: boolean; isFinal?: boolean; icon: string; label: string; accent: string;
}> = {
  direction:   { font: "serif", size: "text-2xl",  fullScreen: false, icon: "✦", label: "Direção",      accent: "var(--q-accent-9)" },
  explanation: { font: "sans",  size: "text-base",  fullScreen: false, icon: "◈", label: "Compreensão",  accent: "var(--q-cyan-9)" },
  reflection:  { font: "sans",  size: "text-lg",    fullScreen: false, hasInput: true, icon: "❂", label: "Reflexão", accent: "var(--q-green-9)" },
  action:      { font: "sans",  size: "text-base",  fullScreen: false, icon: "⟡", label: "Ação",         accent: "var(--q-amber-9)" },
  question:    { font: "serif", size: "text-xl",    fullScreen: false, icon: "✧", label: "Pergunta",     accent: "var(--q-accent-9)" },
  affirmation: { font: "serif", size: "text-3xl",   fullScreen: true, glow: true, icon: "✺", label: "Afirmação", accent: "var(--q-accent-9)" },
  practice:    { font: "sans",  size: "text-base",  fullScreen: false, icon: "◎", label: "Prática",      accent: "var(--q-cyan-9)" },
  integration: { font: "sans",  size: "text-base",  fullScreen: false, isFinal: true, icon: "∞", label: "Integração", accent: "var(--q-green-9)" },
};

function getSofiaGreeting(streak: number, level: string, day: number): string {
  if (day === 1) return "Bem-vinda à sua primeira jornada. Eu sou Sofia, e estarei com você.";
  if (streak > 7) return `${streak} dias consecutivos. Sua constância é poderosa.`;
  if (streak > 3) return `Dia ${streak} consecutivo. Sua presença aqui transforma.`;
  if (streak === 1) return "Novo começo. Cada retorno é uma prova de coragem.";
  if (level === "ALIGNED" || level === "INTEGRATED") return "Sua consciência está se expandindo. Sinta isso.";
  if (level === "CONSISTENT") return "Você está construindo algo profundo. Continue.";
  return "Respire. Este momento é seu.";
}

interface SessionBlockReaderProps {
  contentId: string;
  content: Record<string, string>;
  onComplete: () => void;
  isStatic?: boolean;
  progress?: { currentDay: number; consciousnessScore: number; level: string; streak: number };
}

export function SessionBlockReader({
  contentId, content, onComplete, isStatic, progress,
}: SessionBlockReaderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [speaking, setSpeaking] = useState(false);

  const blockKey = BLOCK_KEYS[currentIndex];
  const config = BLOCK_CONFIG[blockKey];
  const isLast = currentIndex === BLOCK_KEYS.length - 1;
  const level = progress?.level ?? "BEGINNER";

  // Stop speech on block change
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, [currentIndex]);

  // Toggle speech — called when orb is clicked
  const toggleSpeech = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const text = content[blockKey];
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.85;
    utterance.pitch = 1.15;
    utterance.volume = 0.92;

    // Find feminine Portuguese voice
    const voices = window.speechSynthesis.getVoices();
    const ptVoices = voices.filter((v) => v.lang.startsWith("pt"));
    const femKeywords = ["female", "feminino", "luciana", "vitória", "maria", "francisca", "raquel", "fernanda"];
    const femVoice = ptVoices.find((v) => femKeywords.some((k) => v.name.toLowerCase().includes(k)));
    const preferred = femVoice ?? ptVoices.find((v) => v.name.toLowerCase().includes("google") || v.name.toLowerCase().includes("microsoft"));
    if (preferred) utterance.voice = preferred;
    else if (ptVoices[0]) utterance.voice = ptVoices[0];

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }, [blockKey, content, speaking]);

  const advance = () => {
    if (isLast) onComplete();
    else { setDirection(1); setCurrentIndex((i) => i + 1); }
  };

  const goBack = () => {
    if (currentIndex > 0) { setDirection(-1); setCurrentIndex((i) => i - 1); }
  };

  return (
    <div className="flex flex-col min-h-[80vh] bg-[var(--q-bg-void)] rounded-[var(--q-radius-xl)] overflow-hidden relative">
      {/* Layer 0: Sacred geometry + Unsplash image backgrounds */}
      <BlockBackground blockType={blockKey} />
      {/* Layer 1: Floating particles */}
      <AmbientParticles blockType={blockKey} />

      {/* Progress bar */}
      <div className="flex gap-1 p-4 pt-safe z-10 w-full relative">
        {BLOCK_KEYS.map((_, i) => (
          <motion.div key={i} className="h-1 flex-1 rounded-full overflow-hidden bg-[var(--q-border-subtle)]">
            <motion.div
              className="h-full bg-[var(--q-accent-8)]"
              initial={{ width: "0%" }}
              animate={{ width: i <= currentIndex ? "100%" : "0%" }}
              transition={TRANSITIONS.spring}
            />
          </motion.div>
        ))}
      </div>

      {/* Sofia presence — fixed top section for non-fullscreen blocks */}
      {!config.fullScreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-1 py-2 z-10 relative"
        >
          <SofiaOrb blockType={blockKey} size="md" level={level} speaking={speaking} onClick={toggleSpeech} />
          <p className="text-[10px] text-[var(--q-text-tertiary)] uppercase tracking-[0.2em]">
            Sofia · {config.label}
          </p>
          {/* Sofia greeting on first block */}
          {currentIndex === 0 && progress && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xs text-[var(--q-text-secondary)] italic font-[family-name:var(--font-instrument)] mt-1 text-center max-w-xs px-4"
            >
              {getSofiaGreeting(progress.streak, progress.level, progress.currentDay)}
            </motion.p>
          )}
          {/* AI indicator */}
          {currentIndex === 0 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className={`text-[9px] uppercase tracking-widest mt-1 ${
                isStatic === false ? "text-[var(--q-accent-9)]" : "text-[var(--q-text-tertiary)]"
              }`}
            >
              {isStatic === false ? "✦ Personalizado por IA" : "Conteúdo base"}
            </motion.span>
          )}
        </motion.div>
      )}

      <AnimatePresence mode="wait" custom={direction}>
        {config.fullScreen ? (
          <motion.div
            key={blockKey}
            custom={direction}
            initial={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-[var(--q-bg-depth)] pb-safe"
          >
            <AmbientParticles blockType="affirmation" count={20} />

            {config.glow && (
              <>
                <motion.div
                  animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute w-72 h-72 rounded-full bg-[var(--q-accent-8)] blur-[80px] pointer-events-none"
                />
                <motion.div
                  animate={{ opacity: [0.1, 0.2, 0.1], scale: [0.9, 1.15, 0.9] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  className="absolute w-56 h-56 rounded-full bg-purple-500 blur-[60px] pointer-events-none translate-x-16 -translate-y-8"
                />
              </>
            )}

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="mb-3 relative z-10"
            >
              <SofiaOrb blockType="affirmation" size="lg" level={level} speaking={speaking} onClick={toggleSpeech} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[10px] text-[var(--q-text-tertiary)] uppercase tracking-[0.25em] mb-8 relative z-10"
            >
              Sofia · Afirmação
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="text-center font-[family-name:var(--font-instrument)] italic text-3xl text-[var(--q-text-primary)] leading-relaxed relative z-10 drop-shadow-[0_0_30px_rgba(139,92,246,0.5)] max-w-md"
            >
              &quot;{content[blockKey]}&quot;
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-5 relative z-10"
            >
              <AudioPlayer text={content[blockKey]} />
            </motion.div>

            <motion.button
              onClick={advance}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="absolute bottom-8 left-6 right-6 h-14 rounded-full bg-[var(--q-accent-8)] text-white font-medium text-base z-30 shadow-[var(--q-shadow-glow-accent)]"
            >
              Absorver
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key={blockKey}
            custom={direction}
            initial={{ opacity: 0, scale: 0.96, filter: "blur(10px)", y: 24, rotate: direction > 0 ? 0.5 : -0.5 }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.02, filter: "blur(12px)", y: -12, rotate: direction > 0 ? -0.5 : 0.5 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col relative z-10"
          >
            <div className="flex-1 px-8 py-6 flex flex-col justify-center max-w-lg mx-auto w-full">
              {/* Block type + audio */}
              <div className="flex items-center gap-2.5 mb-4">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
                  className="text-xl"
                  style={{ color: config.accent }}
                >
                  {config.icon}
                </motion.span>
                <span className="text-[10px] text-[var(--q-text-tertiary)] uppercase tracking-widest flex-1">{config.label}</span>
              </div>

              {/* Animated accent line */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 32 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                className="h-[2px] rounded-full mb-5"
                style={{ background: config.accent, opacity: 0.5 }}
              />

              {/* Content text */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`
                  ${config.font === "serif" ? "font-[family-name:var(--font-instrument)] italic" : "font-[family-name:var(--font-dm-sans)]"}
                  ${config.size} text-[var(--q-text-primary)] leading-relaxed
                `}
              >
                {content[blockKey]}
              </motion.p>

              {config.hasInput && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8"
                >
                  <ReflectionInput contentId={contentId} />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer navigation */}
      {!config.fullScreen && (
        <div className="p-6 pb-safe flex items-center justify-between z-10 mx-auto w-full max-w-lg relative">
          <div className="flex items-center gap-2">
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
            <AmbientMusic blockType={blockKey} />
          </div>

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
