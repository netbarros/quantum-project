"use client";

import { motion, useSpring } from "framer-motion";
import { useEffect } from "react";

const LEVEL_COLORS: Record<string, [string, string]> = {
  BEGINNER:   ["#5A4FCF", "#3730A3"],
  AWARE:      ["#7C3AED", "#6D28D9"],
  CONSISTENT: ["#8B5CF6", "#0EA5E9"],
  ALIGNED:    ["#06B6D4", "#0891B2"],
  INTEGRATED: ["#10B981", "#6EE7B7"],
};

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER:   "Iniciante",
  AWARE:      "Consciente",
  CONSISTENT: "Consistente",
  ALIGNED:    "Alinhado",
  INTEGRATED: "Integrado",
};

const LEVEL_BOUNDS: Record<string, [number, number]> = {
  BEGINNER:   [0, 200],
  AWARE:      [200, 400],
  CONSISTENT: [400, 600],
  ALIGNED:    [600, 800],
  INTEGRATED: [800, 1000],
};

interface ConsciousnessOrbProps {
  score: number;
  level: string;
  streak: number;
  isActiveToday: boolean;
  size?: number;
}

export function ConsciousnessOrb({
  score,
  level,
  streak,
  isActiveToday,
  size = 200,
}: ConsciousnessOrbProps) {
  const [colorStart, colorEnd] = LEVEL_COLORS[level] ?? LEVEL_COLORS.BEGINNER;

  // Animated score with spring
  const animatedScore = useSpring(0, { stiffness: 100, damping: 30 });
  useEffect(() => {
    animatedScore.set(score);
  }, [score, animatedScore]);

  // Progress ring
  const [min, max] = LEVEL_BOUNDS[level] ?? [0, 200];
  const progress = Math.max(0, Math.min(1, (score - min) / (max - min)));
  const outerSize = size + 70;
  const cx = outerSize / 2;
  const cy = outerSize / 2;
  const ringRadius = size / 2 - 10;
  const circumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = circumference * (1 - progress);

  const orbitingDots = Math.min(streak, 12);
  const orbitRadius = size / 2 + 22;

  return (
    <div className="relative flex items-center justify-center" style={{ width: outerSize, height: outerSize }}>
      <svg
        width={outerSize}
        height={outerSize}
        viewBox={`0 0 ${outerSize} ${outerSize}`}
        className="overflow-visible"
      >
        <defs>
          <radialGradient id={`orbGrad-${level}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={colorEnd} stopOpacity="0.9" />
            <stop offset="100%" stopColor={colorStart} stopOpacity="0.6" />
          </radialGradient>
          <filter id="orbGlow">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="dotGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track ring */}
        <circle
          cx={cx}
          cy={cy}
          r={ringRadius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="3"
        />

        {/* Progress ring */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={ringRadius}
          fill="none"
          stroke={colorStart}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          transform={`rotate(-90 ${cx} ${cy})`}
          opacity={0.85}
        />

        {/* Orb core */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={size / 2 - 16}
          fill={`url(#orbGrad-${level})`}
          filter="url(#orbGlow)"
          animate={{
            scale: isActiveToday ? [1, 1.03, 1] : [1, 1.01, 1],
            opacity: isActiveToday ? [0.9, 1, 0.9] : [0.5, 0.65, 0.5],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Orbiting dots (streak days) */}
        {Array.from({ length: orbitingDots }).map((_, i) => {
          const angle = (i / orbitingDots) * 2 * Math.PI - Math.PI / 2;
          const x = cx + Math.cos(angle) * orbitRadius;
          const y = cy + Math.sin(angle) * orbitRadius;
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={2.5}
              fill={colorStart}
              filter="url(#dotGlow)"
              opacity={0.8}
              animate={{ rotate: 360 }}
              transition={{
                duration: 20 + i * 1.5,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.3,
              }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
          );
        })}
      </svg>

      {/* Score label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <motion.p
            className="text-3xl font-bold text-[var(--q-text-primary)]"
            style={{ fontVariantNumeric: "tabular-nums" }}
            key={score}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {score}
          </motion.p>
          <p className="text-xs text-[var(--q-text-secondary)] uppercase tracking-[0.15em] mt-1">
            {LEVEL_LABELS[level] ?? level}
          </p>
        </div>
      </div>
    </div>
  );
}
