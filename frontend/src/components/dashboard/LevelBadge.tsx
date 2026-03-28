'use client';

import { Level } from '../../hooks/useProgress';

interface LevelBadgeProps {
  level: Level;
  levelProgress: number;  // 0–100
  consciousnessScore: number;
}

const LEVEL_META: Record<Level, {
  label: string;
  subtitle: string;
  from: string;
  to: string;
  icon: string;
}> = {
  BEGINNER:   { label: 'Iniciante',   subtitle: '0 – 200 pts',   from: '#6366f1', to: '#818cf8', icon: '🌱' },
  AWARE:      { label: 'Consciente',  subtitle: '200 – 400 pts',  from: '#8b5cf6', to: '#a78bfa', icon: '🌿' },
  CONSISTENT: { label: 'Consistente', subtitle: '400 – 600 pts',  from: '#a855f7', to: '#c084fc', icon: '⚡' },
  ALIGNED:    { label: 'Alinhado',    subtitle: '600 – 800 pts',  from: '#d946ef', to: '#e879f9', icon: '🔮' },
  INTEGRATED: { label: 'Integrado',   subtitle: '800 – 1000 pts', from: '#f59e0b', to: '#fcd34d', icon: '✨' },
};

export function LevelBadge({ level, levelProgress, consciousnessScore }: LevelBadgeProps) {
  const meta = LEVEL_META[level];

  return (
    <div className="level-badge-card">
      <div className="level-icon">{meta.icon}</div>

      <div className="level-info">
        <div className="level-header">
          <span className="level-name" style={{ background: `linear-gradient(90deg,${meta.from},${meta.to})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {meta.label}
          </span>
          <span className="level-score">{consciousnessScore} pts</span>
        </div>
        <span className="level-subtitle">{meta.subtitle}</span>

        {/* Progress bar */}
        <div className="level-bar-track">
          <div
            className="level-bar-fill"
            style={{
              width: `${levelProgress}%`,
              background: `linear-gradient(90deg, ${meta.from}, ${meta.to})`,
            }}
          />
        </div>
        <div className="level-bar-label">{levelProgress}% completo</div>
      </div>

      <style>{`
        .level-badge-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 22px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          backdrop-filter: blur(12px);
          width: 100%;
          max-width: 360px;
        }
        .level-icon {
          font-size: 2rem;
          line-height: 1;
          flex-shrink: 0;
        }
        .level-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }
        .level-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }
        .level-name {
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .level-score {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.5);
          font-weight: 600;
        }
        .level-subtitle {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.05em;
        }
        .level-bar-track {
          margin-top: 8px;
          height: 6px;
          background: rgba(255,255,255,0.08);
          border-radius: 999px;
          overflow: hidden;
        }
        .level-bar-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.8s cubic-bezier(0.4,0,0.2,1);
        }
        .level-bar-label {
          font-size: 0.62rem;
          color: rgba(255,255,255,0.3);
          text-align: right;
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}
