"use client";

import { motion } from "framer-motion";

const BLOCK_COLORS: Record<string, [string, string]> = {
  direction:   ["#7C3AED", "#C4B5FD"],
  explanation: ["#0891B2", "#67E8F9"],
  reflection:  ["#059669", "#6EE7B7"],
  action:      ["#D97706", "#FCD34D"],
  question:    ["#7C3AED", "#A78BFA"],
  affirmation: ["#8B5CF6", "#DDD6FE"],
  practice:    ["#0891B2", "#A5F3FC"],
  integration: ["#059669", "#A7F3D0"],
};

const LEVEL_INTENSITY: Record<string, number> = {
  BEGINNER: 0.55, AWARE: 0.7, CONSISTENT: 0.85, ALIGNED: 0.95, INTEGRATED: 1.0,
};

interface SofiaOrbProps {
  blockType?: string;
  size?: "sm" | "md" | "lg";
  level?: string;
  speaking?: boolean;
  onClick?: () => void;
  className?: string;
}

export function SofiaOrb({
  blockType = "direction", size = "md", level = "BEGINNER",
  speaking = false, onClick, className = "",
}: SofiaOrbProps) {
  const [c1, c2] = BLOCK_COLORS[blockType] ?? BLOCK_COLORS.direction;
  const intensity = LEVEL_INTENSITY[level] ?? 0.55;
  const dims = size === "sm" ? 72 : size === "lg" ? 140 : 100;
  const r = dims / 2;
  const breathDur = speaking ? 1.8 : 3.5;
  const orbCount = Math.round(5 + intensity * 4);

  return (
    <motion.div
      className={`relative cursor-pointer select-none ${className}`}
      style={{ width: dims + 32, height: dims + 32 }}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
    >
      {/* Deep ambient glow */}
      <motion.div
        animate={{
          opacity: [0.25 * intensity, 0.55 * intensity, 0.25 * intensity],
          scale: [1, 1.35, 1],
        }}
        transition={{ duration: breathDur, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-[-20px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${c1}55, ${c1}25, transparent 65%)`,
          filter: "blur(16px)",
        }}
      />

      {/* Secondary glow — offset for depth */}
      <motion.div
        animate={{
          opacity: [0.1 * intensity, 0.3 * intensity, 0.1 * intensity],
          scale: [0.9, 1.2, 0.9],
        }}
        transition={{ duration: breathDur * 1.3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute inset-[-10px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${c2}40, transparent 60%)`,
          filter: "blur(12px)",
        }}
      />

      {/* Orbiting particles */}
      {Array.from({ length: orbCount }).map((_, i) => {
        const angle = (i * 2 * Math.PI) / orbCount;
        const orbitR = r + 10;
        const sz = 2 + (i % 3);
        return (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: sz, height: sz,
              background: c2,
              boxShadow: `0 0 ${sz * 3}px ${c2}`,
              top: "50%", left: "50%",
            }}
            animate={{
              x: [
                Math.cos(angle) * orbitR,
                Math.cos(angle + Math.PI) * orbitR,
                Math.cos(angle + Math.PI * 2) * orbitR,
              ],
              y: [
                Math.sin(angle) * orbitR,
                Math.sin(angle + Math.PI) * orbitR,
                Math.sin(angle + Math.PI * 2) * orbitR,
              ],
              opacity: [0.3 * intensity, 0.8 * intensity, 0.3 * intensity],
            }}
            transition={{ duration: 7 + i * 1.5, repeat: Infinity, ease: "linear" }}
          />
        );
      })}

      {/* Speaking pulse ring */}
      {speaking && (
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 m-4 rounded-full pointer-events-none"
          style={{ border: `1.5px solid ${c2}` }}
        />
      )}

      <svg
        viewBox={`0 0 ${dims} ${dims}`}
        width={dims} height={dims}
        className="relative z-10"
        style={{ margin: 16 }}
      >
        <defs>
          <radialGradient id={`sg-${blockType}-${size}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor={c2} stopOpacity={0.95 * intensity} />
            <stop offset="40%" stopColor={c1} stopOpacity={0.8 * intensity} />
            <stop offset="100%" stopColor={c1} stopOpacity={0.1} />
          </radialGradient>
          <filter id={`sgf-${blockType}-${size}`}>
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Outer ring — slow rotate */}
        <motion.circle
          cx={r} cy={r} r={r - 2}
          fill="none" stroke={c2} strokeWidth="0.8"
          strokeDasharray="5 8" strokeOpacity={0.45 * intensity}
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "center" }}
        />

        {/* Mid ring — counter-rotate, thicker */}
        <motion.circle
          cx={r} cy={r} r={r - 7}
          fill="none" stroke={c1} strokeWidth="0.5"
          strokeDasharray="3 12" strokeOpacity={0.35 * intensity}
          animate={{ rotate: -360 }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "center" }}
        />

        {/* Inner ring — fast rotate when speaking */}
        <motion.circle
          cx={r} cy={r} r={r - 12}
          fill="none" stroke={c2} strokeWidth="0.3"
          strokeDasharray="2 6" strokeOpacity={0.2 * intensity}
          animate={{ rotate: speaking ? 360 : 0 }}
          transition={{ duration: speaking ? 4 : 40, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "center" }}
        />

        {/* Core orb — breathing */}
        <motion.circle
          cx={r} cy={r} r={r - 16}
          fill={`url(#sg-${blockType}-${size})`}
          filter={`url(#sgf-${blockType}-${size})`}
          animate={{ r: [r - 16, r - 13, r - 16] }}
          transition={{ duration: breathDur, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Specular highlight — upper left */}
        <motion.circle
          cx={r * 0.72} cy={r * 0.72} r={r * 0.2}
          fill={c2} opacity={0.45 * intensity}
          animate={{ opacity: [0.25 * intensity, 0.55 * intensity, 0.25 * intensity] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Small sparkle — lower right */}
        <motion.circle
          cx={r * 1.2} cy={r * 1.25} r={r * 0.06}
          fill="white" opacity={0.3 * intensity}
          animate={{ opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
        />
      </svg>

      {/* Click hint — tap icon when not speaking */}
      {!speaking && onClick && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" opacity="0.5">
            <path d="M3 2L12 7L3 12V2Z" fill="var(--q-text-tertiary)" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}
