'use client';

interface StreakCounterProps {
  streak: number;
  freezeAvailable: boolean;
  onFreeze?: () => void;
  freezeLoading?: boolean;
}

export function StreakCounter({ streak, freezeAvailable, onFreeze, freezeLoading }: StreakCounterProps) {
  const isHot = streak >= 3;
  const flameColor = isHot ? '#f97316' : '#fbbf24';
  const flameGlow = isHot ? 'rgba(249,115,22,0.5)' : 'rgba(251,191,36,0.3)';

  return (
    <div className="streak-card">
      {/* Animated flame */}
      <div className="streak-flame" style={{ filter: `drop-shadow(0 0 10px ${flameGlow})` }}>
        <svg width="48" height="56" viewBox="0 0 48 56" fill="none">
          <path
            d="M24 4 C24 4 34 16 34 28 C34 34 30 38 24 40 C18 38 14 34 14 28 C14 16 24 4 24 4Z"
            fill={flameColor}
            opacity="0.9"
          />
          <path
            d="M24 20 C24 20 30 28 30 34 C30 38 27 42 24 44 C21 42 18 38 18 34 C18 28 24 20 24 20Z"
            fill="#fef3c7"
            opacity="0.85"
          />
          <path
            d="M24 34 C24 34 26 38 26 42 C26 44 25 46 24 47 C23 46 22 44 22 42 C22 38 24 34 24 34Z"
            fill="#fff"
            opacity="0.7"
          />
        </svg>
      </div>

      <div className="streak-count">{streak}</div>
      <div className="streak-label">
        {streak === 1 ? 'dia seguido' : 'dias seguidos'}
      </div>

      {/* Freeze button */}
      {freezeAvailable ? (
        <button
          className="freeze-btn"
          onClick={onFreeze}
          disabled={freezeLoading}
          aria-label="Usar proteção de streak"
        >
          {freezeLoading ? (
            <span className="freeze-spinner" />
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 7a5 5 0 100 10A5 5 0 0012 7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              </svg>
              Proteção
            </>
          )}
        </button>
      ) : (
        <span className="freeze-used">Proteção usada esta semana</span>
      )}

      <style>{`
        .streak-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 24px 20px 20px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          backdrop-filter: blur(12px);
          min-width: 140px;
        }
        .streak-flame {
          animation: flicker 2.5s ease-in-out infinite;
        }
        @keyframes flicker {
          0%, 100% { transform: scaleY(1) scaleX(1); }
          30% { transform: scaleY(1.06) scaleX(0.97); }
          60% { transform: scaleY(0.97) scaleX(1.03); }
        }
        .streak-count {
          font-size: 2.8rem;
          font-weight: 900;
          line-height: 1;
          background: linear-gradient(135deg, #fef3c7, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .streak-label {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .freeze-btn {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid rgba(167,243,208,0.4);
          background: rgba(167,243,208,0.08);
          color: #6ee7b7;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .freeze-btn:hover:not(:disabled) {
          background: rgba(167,243,208,0.18);
        }
        .freeze-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .freeze-spinner {
          width: 12px; height: 12px;
          border: 2px solid #6ee7b7;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .freeze-used {
          margin-top: 8px;
          font-size: 0.65rem;
          color: rgba(255,255,255,0.3);
          text-align: center;
        }
      `}</style>
    </div>
  );
}
