"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const BLOCK_PARTICLE_COLORS: Record<string, string> = {
  direction: "139,92,246",    // purple
  explanation: "34,211,238",  // cyan
  reflection: "16,185,129",   // green
  action: "245,158,11",       // amber
  question: "167,139,250",    // light purple
  affirmation: "139,92,246",  // purple
  practice: "34,211,238",     // cyan
  integration: "16,185,129",  // green
};

interface AmbientParticlesProps {
  blockType: string;
  count?: number;
}

export function AmbientParticles({ blockType, count = 14 }: AmbientParticlesProps) {
  const rgb = BLOCK_PARTICLE_COLORS[blockType] ?? "139,92,246";

  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 6 + Math.random() * 8,
      delay: Math.random() * 4,
      drift: -20 - Math.random() * 40,
      opacity: 0.08 + Math.random() * 0.12,
    })),
  [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={`${blockType}-${p.id}`}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `rgba(${rgb}, ${p.opacity})`,
            boxShadow: `0 0 ${p.size * 2}px rgba(${rgb}, ${p.opacity * 0.5})`,
          }}
          animate={{
            y: [0, p.drift, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}

      {/* Radial gradient at bottom — changes color per block */}
      <motion.div
        key={blockType}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center bottom, rgba(${rgb}, 0.06) 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}
