'use client';

import { useEffect, useRef } from 'react';
import { Level } from '../../hooks/useProgress';

interface ScoreGaugeProps {
  score: number;           // 0 – 1000
  level: Level;
  levelProgress: number;  // 0 – 100
}

const LEVEL_META: Record<Level, { label: string; color: string; glow: string }> = {
  BEGINNER:   { label: 'Iniciante',    color: '#6366f1', glow: 'rgba(99,102,241,0.35)' },
  AWARE:      { label: 'Consciente',   color: '#8b5cf6', glow: 'rgba(139,92,246,0.35)' },
  CONSISTENT: { label: 'Consistente',  color: '#a855f7', glow: 'rgba(168,85,247,0.35)' },
  ALIGNED:    { label: 'Alinhado',     color: '#d946ef', glow: 'rgba(217,70,239,0.35)' },
  INTEGRATED: { label: 'Integrado',    color: '#f59e0b', glow: 'rgba(245,158,11,0.45)' },
};

export function ScoreGauge({ score, level, levelProgress }: ScoreGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { label, color, glow } = LEVEL_META[level];

  // Arc goes from 215° to 325° (270° sweep) — bottom-centered gap
  const START_DEG = 215;
  const SWEEP = 290;
  const toRad = (d: number) => (d * Math.PI) / 180;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2 + 10;
    const radius = W * 0.38;
    const lineWidth = W * 0.06;

    ctx.clearRect(0, 0, W, H);

    // Track (background arc)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, toRad(START_DEG), toRad(START_DEG + SWEEP));
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Filled arc — progress relative to overall 0-1000
    const pct = Math.max(0, Math.min(1000, score)) / 1000;
    if (pct > 0) {
      const gradient = ctx.createLinearGradient(0, 0, W, H);
      gradient.addColorStop(0, color + 'bb');
      gradient.addColorStop(1, color);

      ctx.shadowColor = glow;
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, toRad(START_DEG), toRad(START_DEG + SWEEP * pct));
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = gradient;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }, [score, color, glow, START_DEG, SWEEP]);

  return (
    <div className="score-gauge-wrapper">
      <canvas ref={canvasRef} width={220} height={220} className="score-gauge-canvas" />
      <div className="score-gauge-center">
        <span className="score-value">{score}</span>
        <span className="score-label">/ 1000</span>
        <span className="score-level" style={{ color }}>{label}</span>
        <span className="score-sublabel">{levelProgress}% no nível</span>
      </div>

      <style>{`
        .score-gauge-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 220px;
          height: 220px;
        }
        .score-gauge-canvas {
          position: absolute;
          inset: 0;
        }
        .score-gauge-center {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          margin-top: 16px;
        }
        .score-value {
          font-size: 2.4rem;
          font-weight: 800;
          line-height: 1;
          background: linear-gradient(135deg, #e0e7ff, #fff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .score-label {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.05em;
        }
        .score-level {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 4px;
        }
        .score-sublabel {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.35);
        }
      `}</style>
    </div>
  );
}
