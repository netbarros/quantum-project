"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// Picsum photo IDs curated per block mood (free, no API key, reliable)
const BLOCK_IMAGE_IDS: Record<string, number> = {
  direction: 1039,    // sunrise/golden light
  explanation: 1069,   // starry cosmos
  reflection: 1036,    // calm water/lake
  action: 866,         // mountain landscape
  question: 1040,      // misty forest
  affirmation: 1062,   // galaxy/night sky
  practice: 1053,      // zen/nature
  integration: 1056,   // ocean horizon
};

const SVG_COLORS: Record<string, { primary: string; secondary: string }> = {
  direction:   { primary: "#7C3AED", secondary: "#A78BFA" },
  explanation: { primary: "#0891B2", secondary: "#67E8F9" },
  reflection:  { primary: "#059669", secondary: "#6EE7B7" },
  action:      { primary: "#D97706", secondary: "#FCD34D" },
  question:    { primary: "#7C3AED", secondary: "#C4B5FD" },
  affirmation: { primary: "#8B5CF6", secondary: "#DDD6FE" },
  practice:    { primary: "#0891B2", secondary: "#A5F3FC" },
  integration: { primary: "#059669", secondary: "#A7F3D0" },
};

// Sacred geometry SVG paths for each block type
function SacredGeometry({ blockType, colors }: { blockType: string; colors: { primary: string; secondary: string } }) {
  const c = colors;
  const common = { fill: "none", strokeWidth: "0.5", strokeOpacity: "0.12" };

  switch (blockType) {
    case "direction": // Mandala — concentric expanding circles
      return (
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {[60, 90, 120, 150, 180].map((r, i) => (
            <motion.circle key={i} cx="200" cy="200" r={r} stroke={i % 2 === 0 ? c.primary : c.secondary} {...common}
              animate={{ r: [r, r + 8, r], strokeOpacity: [0.08, 0.15, 0.08] }}
              transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
            />
          ))}
          {[0, 30, 60, 90, 120, 150].map((angle, i) => (
            <motion.line key={`l${i}`} x1="200" y1="200"
              x2={200 + Math.cos(angle * Math.PI / 180) * 180} y2={200 + Math.sin(angle * Math.PI / 180) * 180}
              stroke={c.secondary} {...common} strokeOpacity="0.06"
              animate={{ strokeOpacity: [0.04, 0.1, 0.04] }}
              transition={{ duration: 6, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </svg>
      );

    case "explanation": // Flowing sine waves
      return (
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {[0, 1, 2, 3].map((i) => (
            <motion.path key={i}
              d={`M0 ${200 + i * 30} Q100 ${170 + i * 30} 200 ${200 + i * 30} T400 ${200 + i * 30}`}
              stroke={i % 2 === 0 ? c.primary : c.secondary} {...common}
              animate={{ d: [
                `M0 ${200 + i * 30} Q100 ${170 + i * 30} 200 ${200 + i * 30} T400 ${200 + i * 30}`,
                `M0 ${200 + i * 30} Q100 ${230 + i * 30} 200 ${200 + i * 30} T400 ${200 + i * 30}`,
                `M0 ${200 + i * 30} Q100 ${170 + i * 30} 200 ${200 + i * 30} T400 ${200 + i * 30}`,
              ]}}
              transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </svg>
      );

    case "reflection": // Golden spiral
      return (
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <motion.g animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "200px 200px" }}>
            <motion.path
              d="M200 200 Q200 130 260 130 Q330 130 330 200 Q330 300 220 300 Q100 300 100 180 Q100 50 240 50"
              stroke={c.primary} {...common} strokeOpacity="0.1"
              animate={{ strokeOpacity: [0.06, 0.14, 0.06] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.path
              d="M200 200 Q200 155 240 155 Q290 155 290 200 Q290 265 225 265 Q145 265 145 190 Q145 90 235 90"
              stroke={c.secondary} {...common} strokeOpacity="0.08"
              animate={{ strokeOpacity: [0.05, 0.12, 0.05] }}
              transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            />
          </motion.g>
        </svg>
      );

    case "action": // Sun rays radiating
      return (
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <motion.circle cx="200" cy="200" r="40" stroke={c.primary} {...common} strokeOpacity="0.1"
            animate={{ r: [40, 50, 40], strokeOpacity: [0.08, 0.15, 0.08] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            return (
              <motion.line key={i}
                x1={200 + Math.cos(angle) * 55} y1={200 + Math.sin(angle) * 55}
                x2={200 + Math.cos(angle) * 180} y2={200 + Math.sin(angle) * 180}
                stroke={i % 2 === 0 ? c.primary : c.secondary} {...common}
                animate={{ strokeOpacity: [0.04, 0.12, 0.04] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.15 }}
              />
            );
          })}
        </svg>
      );

    case "affirmation": // Flower of life
      return (
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {[0, 60, 120, 180, 240, 300].map((angle, i) => {
            const cx = 200 + Math.cos(angle * Math.PI / 180) * 60;
            const cy = 200 + Math.sin(angle * Math.PI / 180) * 60;
            return (
              <motion.circle key={i} cx={cx} cy={cy} r="60" stroke={c.primary} {...common}
                animate={{ strokeOpacity: [0.06, 0.14, 0.06] }}
                transition={{ duration: 6, repeat: Infinity, delay: i * 0.4 }}
              />
            );
          })}
          <motion.circle cx="200" cy="200" r="60" stroke={c.secondary} {...common} strokeOpacity="0.1"
            animate={{ strokeOpacity: [0.08, 0.16, 0.08] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.circle cx="200" cy="200" r="120" stroke={c.primary} {...common} strokeOpacity="0.05" />
        </svg>
      );

    default: // Generic concentric circles for question, practice, integration
      return (
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {[50, 80, 110, 140, 170].map((r, i) => (
            <motion.circle key={i} cx="200" cy="200" r={r} stroke={i % 2 === 0 ? c.primary : c.secondary} {...common}
              strokeDasharray={`${4 + i * 2} ${8 + i * 3}`}
              animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
              transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "200px 200px" }}
            />
          ))}
        </svg>
      );
  }
}

interface BlockBackgroundProps {
  blockType: string;
}

export function BlockBackground({ blockType }: BlockBackgroundProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const colors = SVG_COLORS[blockType] ?? SVG_COLORS.direction;

  // Load Unsplash image
  useEffect(() => {
    setImageLoaded(false);
    const photoId = BLOCK_IMAGE_IDS[blockType];
    if (!photoId) return;

    const cacheKey = `bg-${blockType}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setImageUrl(cached);
      return;
    }

    const url = `https://picsum.photos/id/${photoId}/800/600`;
    const img = new Image();
    const timer = setTimeout(() => { /* 4s timeout — skip if slow */ }, 4000);

    img.onload = () => {
      clearTimeout(timer);
      sessionStorage.setItem(cacheKey, url);
      setImageUrl(url);
    };
    img.onerror = () => clearTimeout(timer);
    img.src = url;

    return () => clearTimeout(timer);
  }, [blockType]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Layer 1: Sacred geometry SVG */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`svg-${blockType}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <SacredGeometry blockType={blockType} colors={colors} />
        </motion.div>
      </AnimatePresence>

      {/* Layer 2: Unsplash image overlay */}
      {imageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? 0.14 : 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(3px) saturate(0.6)",
          }}
        >
          <img
            src={imageUrl}
            alt=""
            className="hidden"
            onLoad={() => setImageLoaded(true)}
          />
        </motion.div>
      )}

      {/* Layer 3: Gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--q-bg-void)] via-[var(--q-bg-void)]/80 to-[var(--q-bg-void)]" />
    </div>
  );
}
