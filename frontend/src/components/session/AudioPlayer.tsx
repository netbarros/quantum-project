"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

interface AudioPlayerProps {
  text: string;
  lang?: string;
  autoPlay?: boolean;
  onPlayingChange?: (playing: boolean) => void;
}

function findFeminineVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const ptVoices = voices.filter((v) => v.lang.startsWith(lang.substring(0, 2)));
  if (ptVoices.length === 0) return null;
  const femKeywords = ["female", "feminino", "luciana", "vitória", "maria", "francisca", "raquel", "fernanda"];
  const feminine = ptVoices.find((v) => femKeywords.some((k) => v.name.toLowerCase().includes(k)));
  if (feminine) return feminine;
  const preferred = ptVoices.find((v) => v.name.toLowerCase().includes("google") || v.name.toLowerCase().includes("microsoft"));
  return preferred ?? ptVoices[0];
}

export function AudioPlayer({ text, lang = "pt-BR", onPlayingChange }: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSupported(true);
      window.speechSynthesis.getVoices();
    }
  }, []);

  const updatePlaying = useCallback((val: boolean) => {
    setPlaying(val);
    onPlayingChange?.(val);
  }, [onPlayingChange]);

  const stop = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    updatePlaying(false);
    setLoading(false);
  }, [updatePlaying]);

  useEffect(() => { stop(); }, [text, stop]);
  useEffect(() => { return () => { stop(); }; }, [stop]);

  const playElevenLabs = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/tts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''}`,
        },
        body: JSON.stringify({ text: text.substring(0, 2000) }),
      });

      if (!res.ok) return false;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => { updatePlaying(false); URL.revokeObjectURL(url); };
      audio.onerror = () => { updatePlaying(false); URL.revokeObjectURL(url); };

      await audio.play();
      setLoading(false);
      updatePlaying(true);
      return true;
    } catch {
      setLoading(false);
      return false;
    }
  }, [text, updatePlaying]);

  const playWebSpeech = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    utterance.pitch = 1.15;
    utterance.volume = 0.92;

    const voice = findFeminineVoice(lang);
    if (voice) utterance.voice = voice;

    utterance.onend = () => updatePlaying(false);
    utterance.onerror = () => updatePlaying(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    updatePlaying(true);
  }, [text, lang, updatePlaying]);

  const toggle = useCallback(async () => {
    if (!supported) return;

    if (playing || loading) {
      stop();
      return;
    }

    // Try ElevenLabs first, fallback to Web Speech
    const success = await playElevenLabs();
    if (!success) {
      playWebSpeech();
    }
  }, [supported, playing, loading, stop, playElevenLabs, playWebSpeech]);

  if (!supported) return null;

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggle}
      className={`relative flex items-center gap-2 h-9 rounded-full transition-all ${
        playing
          ? "bg-[var(--q-accent-dim)] border border-[var(--q-accent-8)] px-3.5"
          : loading
          ? "bg-white/5 border border-[var(--q-accent-8)]/50 w-9 justify-center"
          : "bg-white/5 border border-[var(--q-border-default)] hover:border-[var(--q-border-strong)] w-9 justify-center"
      }`}
      title={playing ? "Parar Sofia" : "Ouvir Sofia"}
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-3.5 h-3.5 border-2 border-[var(--q-accent-9)]/30 border-t-[var(--q-accent-9)] rounded-full"
        />
      ) : playing ? (
        <>
          <div className="flex items-center gap-[2px] h-4">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-[2px] rounded-full bg-[var(--q-accent-9)]"
                animate={{ height: ["4px", `${10 + Math.random() * 6}px`, "4px"] }}
                transition={{ duration: 0.6 + i * 0.1, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
              />
            ))}
          </div>
          <span className="text-[10px] text-[var(--q-accent-9)] font-medium tracking-wide">Sofia</span>
        </>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 1.5L12 7L3 12.5V1.5Z" fill="var(--q-text-secondary)" />
        </svg>
      )}
    </motion.button>
  );
}
