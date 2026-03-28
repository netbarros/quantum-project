'use client';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

const LEVEL_COLORS = {
  BEGINNER:   ['#5A4FCF', '#3730A3'],
  AWARE:      ['#7C3AED', '#6D28D9'],
  CONSISTENT: ['#8B5CF6', '#0EA5E9'],
  ALIGNED:    ['#06B6D4', '#0891B2'],
  INTEGRATED: ['#10B981', '#6EE7B7'],
} as const;

interface OrbProps {
  score: number;
  level: keyof typeof LEVEL_COLORS;
  streak: number;
  isActiveToday: boolean;
  size?: number;
}

export function ConsciousnessOrb({ score, level, streak, isActiveToday, size = 200 }: OrbProps) {
  const [colorStart, colorEnd] = LEVEL_COLORS[level];
  
  // Score animado com spring
  const springScore = useSpring(score, { stiffness: 100, damping: 30 });
  
  // Progress ring: % para próximo nível
  const levelBounds = { BEGINNER: [0,200], AWARE: [200,400], CONSISTENT: [400,600], ALIGNED: [600,800], INTEGRATED: [800,1000] };
  const [min, max] = levelBounds[level];
  const progress = (score - min) / (max - min);
  const circumference = 2 * Math.PI * (size / 2 - 12);
  const strokeDashoffset = circumference * (1 - progress);
  
  const orbitingDots = Math.min(streak, 12);
  const radius = size / 2 + 20;

  return (
    <div className="relative" style={{ width: size + 60, height: size + 60 }}>
      <svg
        width={size + 60}
        height={size + 60}
        viewBox={`0 0 ${size + 60} ${size + 60}`}
        className="overflow-visible"
      >
        <defs>
          <radialGradient id={`orbGrad-${level}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={colorEnd} stopOpacity="0.9" />
            <stop offset="100%" stopColor={colorStart} stopOpacity="0.6" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Progress ring */}
        <motion.circle
          cx={(size + 60) / 2}
          cy={(size + 60) / 2}
          r={size / 2 - 12}
          fill="none"
          stroke={colorStart}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          transform={`rotate(-90 ${(size + 60) / 2} ${(size + 60) / 2})`}
          opacity={0.8}
        />

        {/* Orb core */}
        <motion.circle
          cx={(size + 60) / 2}
          cy={(size + 60) / 2}
          r={size / 2 - 16}
          fill={`url(#orbGrad-${level})`}
          filter="url(#glow)"
          animate={{
            scale: isActiveToday ? [1, 1.03, 1] : [1, 1.01, 1],
            opacity: isActiveToday ? [0.9, 1, 0.9] : [0.6, 0.7, 0.6],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Orbiting dots (streak) */}
        {Array.from({ length: orbitingDots }).map((_, i) => {
          const angle = (i / orbitingDots) * 2 * Math.PI;
          const x = (size + 60) / 2 + Math.cos(angle) * radius;
          const y = (size + 60) / 2 + Math.sin(angle) * radius;
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={3}
              fill={colorStart}
              opacity={0.7}
              animate={{ rotate: 360 }}
              transition={{
                duration: 20 + i * 2,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 0.5,
              }}
              style={{ transformOrigin: `${(size + 60) / 2}px ${(size + 60) / 2}px` }}
            />
          );
        })}
      </svg>

      {/* Score no centro */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.p
            className="text-3xl font-bold text-[var(--q-text-primary)] tabular-nums"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {Math.round(score)}
          </motion.p>
          <p className="text-xs text-[var(--q-text-secondary)] uppercase tracking-widest mt-1">
            {level.toLowerCase()}
          </p>
        </div>
      </div>
    </div>
  );
}
