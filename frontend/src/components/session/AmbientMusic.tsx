"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const BLOCK_TRACK: Record<string, string> = {
  direction:   "/audio/ambient-calm.wav",
  explanation: "/audio/ambient-calm.wav",
  reflection:  "/audio/ambient-deep.wav",
  action:      "/audio/ambient-ethereal.wav",
  question:    "/audio/ambient-deep.wav",
  affirmation: "/audio/ambient-ethereal.wav",
  practice:    "/audio/ambient-ethereal.wav",
  integration: "/audio/ambient-calm.wav",
};

const VOLUME = 0.18;
const FADE_MS = 600;

interface AmbientMusicProps {
  blockType: string;
}

export function AmbientMusic({ blockType }: AmbientMusicProps) {
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<string>("");
  const [muted, setMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("quantum-music-muted") === "true";
  });
  const [playing, setPlaying] = useState(false);

  const track = BLOCK_TRACK[blockType] ?? BLOCK_TRACK.direction;

  // Start or crossfade to the right track
  useEffect(() => {
    if (muted) return;

    // Same track — no change needed
    if (currentTrackRef.current === track && currentAudioRef.current) return;

    // Fade out old track
    const oldAudio = currentAudioRef.current;
    if (oldAudio) {
      const fadeOut = setInterval(() => {
        if (oldAudio.volume > 0.02) {
          oldAudio.volume = Math.max(0, oldAudio.volume - 0.02);
        } else {
          clearInterval(fadeOut);
          oldAudio.pause();
          oldAudio.src = "";
        }
      }, FADE_MS / 10);
    }

    // Create and fade in new track
    const audio = new Audio(track);
    audio.loop = true;
    audio.volume = 0;
    currentAudioRef.current = audio;
    currentTrackRef.current = track;

    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => {
          setPlaying(true);
          // Fade in
          const fadeIn = setInterval(() => {
            if (audio.volume < VOLUME - 0.02) {
              audio.volume = Math.min(VOLUME, audio.volume + 0.02);
            } else {
              audio.volume = VOLUME;
              clearInterval(fadeIn);
            }
          }, FADE_MS / 10);
        })
        .catch(() => {
          // Autoplay blocked — user needs to interact first
          setPlaying(false);
        });
    }

    return () => {
      // Don't cleanup on block change — we handle crossfade above
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, muted]);

  // Handle mute toggle
  useEffect(() => {
    if (!currentAudioRef.current) return;
    if (muted) {
      currentAudioRef.current.volume = 0;
      currentAudioRef.current.pause();
      setPlaying(false);
    } else {
      currentAudioRef.current.volume = VOLUME;
      currentAudioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [muted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = "";
        currentAudioRef.current = null;
      }
    };
  }, []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    localStorage.setItem("quantum-music-muted", String(next));

    // If unmuting and no audio playing, start it
    if (!next && !currentAudioRef.current) {
      const audio = new Audio(track);
      audio.loop = true;
      audio.volume = VOLUME;
      currentAudioRef.current = audio;
      currentTrackRef.current = track;
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggleMute}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
        playing && !muted
          ? "bg-[var(--q-accent-dim)] border border-[var(--q-accent-8)]/40"
          : "bg-white/5 border border-[var(--q-border-default)]"
      }`}
      title={playing && !muted ? "Desligar música" : "Ligar música ambiente"}
    >
      {playing && !muted ? (
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
          <path d="M11 6L14 8L11 10" stroke="var(--q-text-tertiary)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )}
    </motion.button>
  );
}
