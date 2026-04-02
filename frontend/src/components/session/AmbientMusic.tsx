"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

const BLOCK_FREQUENCIES: Record<string, { base: number; beat: number; label: string }> = {
  direction:   { base: 432, beat: 8, label: "calm" },    // alpha waves
  explanation: { base: 432, beat: 8, label: "calm" },
  reflection:  { base: 396, beat: 4, label: "deep" },    // theta waves
  action:      { base: 528, beat: 6, label: "ethereal" }, // high theta
  question:    { base: 396, beat: 4, label: "deep" },
  affirmation: { base: 528, beat: 6, label: "ethereal" },
  practice:    { base: 528, beat: 6, label: "ethereal" },
  integration: { base: 432, beat: 8, label: "calm" },
};

interface AmbientMusicProps {
  blockType: string;
  enabled?: boolean;
}

export function AmbientMusic({ blockType, enabled = true }: AmbientMusicProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<{ osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null>(null);
  const [muted, setMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("quantum-music-muted") === "true";
  });
  const [active, setActive] = useState(false);

  const freqs = BLOCK_FREQUENCIES[blockType] ?? BLOCK_FREQUENCIES.direction;

  const startAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);

      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.value = freqs.base;
      osc1.connect(gain);
      osc1.start();

      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = freqs.base + freqs.beat;
      osc2.connect(gain);
      osc2.start();

      // Fade in
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1);

      oscillatorsRef.current = { osc1, osc2, gain };
      setActive(true);
    } catch {
      // AudioContext not available
    }
  }, [freqs.base, freqs.beat]);

  // Update frequencies when block changes
  useEffect(() => {
    if (!oscillatorsRef.current || !audioCtxRef.current) return;
    const { osc1, osc2 } = oscillatorsRef.current;
    const ctx = audioCtxRef.current;

    osc1.frequency.linearRampToValueAtTime(freqs.base, ctx.currentTime + 0.5);
    osc2.frequency.linearRampToValueAtTime(freqs.base + freqs.beat, ctx.currentTime + 0.5);
  }, [freqs.base, freqs.beat]);

  // Handle mute/unmute
  useEffect(() => {
    if (!oscillatorsRef.current || !audioCtxRef.current) return;
    const { gain } = oscillatorsRef.current;
    const ctx = audioCtxRef.current;
    gain.gain.linearRampToValueAtTime(muted ? 0 : 0.12, ctx.currentTime + 0.3);
  }, [muted]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
        oscillatorsRef.current = null;
      }
    };
  }, []);

  const toggleMute = () => {
    if (!active) {
      startAudio();
      setMuted(false);
      localStorage.setItem("quantum-music-muted", "false");
      return;
    }
    const next = !muted;
    setMuted(next);
    localStorage.setItem("quantum-music-muted", String(next));
  };

  if (!enabled) return null;

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggleMute}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
        active && !muted
          ? "bg-[var(--q-accent-dim)] border border-[var(--q-accent-8)]/40"
          : "bg-white/5 border border-[var(--q-border-default)]"
      }`}
      title={active && !muted ? "Desligar música" : "Ligar música ambiente"}
    >
      {active && !muted ? (
        <div className="flex items-center gap-[1.5px]">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-[2px] rounded-full bg-[var(--q-accent-9)]"
              animate={{ height: ["3px", `${6 + i * 2}px`, "3px"] }}
              transition={{ duration: 0.8 + i * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
            />
          ))}
        </div>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3L4 6H2V10H4L8 13V3Z" fill="var(--q-text-tertiary)" />
          {!active && <path d="M11 6L14 8L11 10" stroke="var(--q-text-tertiary)" strokeWidth="1.2" strokeLinecap="round" />}
        </svg>
      )}
    </motion.button>
  );
}
