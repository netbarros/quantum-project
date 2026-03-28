'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProgress } from '../../../hooks/useProgress';
import { ScoreGauge } from '../../../components/dashboard/ScoreGauge';
import { StreakCounter } from '../../../components/dashboard/StreakCounter';
import { LevelBadge } from '../../../components/dashboard/LevelBadge';

export default function DashboardPage() {
  const { data, isLoading, error, refetch, freezeStreak } = useProgress();
  const [freezeLoading, setFreezeLoading] = useState(false);
  const [freezeError, setFreezeError] = useState<string | null>(null);

  const handleFreeze = async () => {
    setFreezeLoading(true);
    setFreezeError(null);
    try {
      await freezeStreak();
    } catch (err: unknown) {
      setFreezeError(err instanceof Error ? err.message : 'Erro ao usar proteção');
    } finally {
      setFreezeLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-orb" />
        <span>Carregando progresso…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="dashboard-error">
        <p>{error ?? 'Dados de progresso indisponíveis.'}</p>
        <button onClick={refetch} className="retry-btn">Tentar novamente</button>
      </div>
    );
  }

  // Last 7 history entries for mini-calendar
  const last7 = [...data.history].slice(0, 7).reverse();

  return (
    <div className="dashboard-root">
      {/* Ambient background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="dashboard-inner">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Seu Progresso</h1>
            <p className="dashboard-subtitle">Jornada de consciência quantica</p>
          </div>
          <Link href="/session" className="cta-session-link">
            Sessão do dia →
          </Link>
        </header>

        {/* Top row: gauge + streak */}
        <div className="top-row">
          <div className="gauge-card glass-card">
            <ScoreGauge
              score={data.consciousnessScore}
              level={data.level}
              levelProgress={data.levelProgress}
            />
          </div>

          <div className="side-column">
            <StreakCounter
              streak={data.streak}
              freezeAvailable={data.streakFreezeAvailable}
              onFreeze={handleFreeze}
              freezeLoading={freezeLoading}
            />
            {freezeError && <p className="freeze-err-text">{freezeError}</p>}
            {/* Stats pill row */}
            <div className="stat-pills">
              <div className="stat-pill">
                <span className="pill-value">{data.currentDay}</span>
                <span className="pill-label">Dia</span>
              </div>
              <div className="stat-pill">
                <span className="pill-value">{data.totalCompleted}</span>
                <span className="pill-label">Concluídas</span>
              </div>
              <div className="stat-pill">
                <span className="pill-value">{data.completionRate}%</span>
                <span className="pill-label">Taxa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Level badge */}
        <LevelBadge
          level={data.level}
          levelProgress={data.levelProgress}
          consciousnessScore={data.consciousnessScore}
        />

        {/* 7-day history mini calendar */}
        <div className="history-section glass-card">
          <h2 className="history-title">Últimos 7 dias</h2>
          <div className="history-dots">
            {last7.map((entry, i) => {
              const dateLabel = entry.completedAt
                ? new Date(entry.completedAt).toLocaleDateString('pt-BR', { weekday: 'short' })
                : `Dia ${entry.day}`;
              return (
                <div key={i} className="history-dot-item">
                  <div
                    className={`history-dot ${entry.isCompleted ? 'dot-done' : 'dot-missed'}`}
                    title={dateLabel}
                  >
                    {entry.isCompleted ? '✓' : ''}
                  </div>
                  <span className="dot-label">{dateLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-root {
          min-height: 100vh;
          background: var(--q-bg-void);
          color: var(--q-text-primary);
          font-family: var(--font-instrument, system-ui, sans-serif);
          position: relative;
          overflow: hidden;
          padding-bottom: 60px;
        }
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }
        .orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%);
          top: -150px; left: -150px;
          animation: drift 14s ease-in-out infinite alternate;
        }
        .orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(217,70,239,0.2), transparent 70%);
          bottom: -100px; right: -100px;
          animation: drift 18s ease-in-out infinite alternate-reverse;
        }
        @keyframes drift {
          from { transform: translate(0,0) scale(1); }
          to { transform: translate(40px,40px) scale(1.08); }
        }
        .dashboard-inner {
          position: relative;
          z-index: 1;
          max-width: 720px;
          margin: 0 auto;
          padding: 32px 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 12px;
        }
        .dashboard-title {
          font-size: 1.7rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 0;
          background: linear-gradient(135deg, #e0e7ff 30%, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .dashboard-subtitle {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.35);
          margin: 4px 0 0;
          letter-spacing: 0.05em;
        }
        .cta-session-link {
          display: inline-flex;
          align-items: center;
          padding: 10px 20px;
          border-radius: 999px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: #fff;
          font-weight: 700;
          font-size: 0.82rem;
          text-decoration: none;
          box-shadow: 0 0 20px rgba(99,102,241,0.4);
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .cta-session-link:hover {
          box-shadow: 0 0 30px rgba(99,102,241,0.6);
          transform: translateY(-1px);
        }
        .top-row {
          display: flex;
          gap: 20px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .gauge-card {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          flex-shrink: 0;
        }
        .glass-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 24px;
          backdrop-filter: blur(14px);
        }
        .side-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;
          min-width: 140px;
        }
        .stat-pills {
          display: flex;
          gap: 10px;
        }
        .stat-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          flex: 1;
        }
        .pill-value {
          font-size: 1.1rem;
          font-weight: 800;
          color: #e0e7ff;
        }
        .pill-label {
          font-size: 0.58rem;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }
        .history-section {
          padding: 22px 24px;
        }
        .history-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: rgba(255,255,255,0.6);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 18px;
        }
        .history-dots {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .history-dot-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .history-dot {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
          transition: transform 0.2s;
        }
        .history-dot:hover { transform: scale(1.1); }
        .dot-done {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: #fff;
          box-shadow: 0 0 12px rgba(99,102,241,0.45);
        }
        .dot-missed {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.18);
        }
        .dot-label {
          font-size: 0.58rem;
          color: rgba(255,255,255,0.35);
          text-transform: capitalize;
        }
        .dashboard-loading, .dashboard-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          gap: 16px;
          background: #0a0a14;
          color: rgba(255,255,255,0.5);
          font-size: 0.9rem;
        }
        .loading-orb {
          width: 48px; height: 48px;
          border-radius: 50%;
          border: 3px solid rgba(99,102,241,0.3);
          border-top-color: #6366f1;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .retry-btn {
          padding: 10px 24px;
          border-radius: 999px;
          background: rgba(99,102,241,0.2);
          border: 1px solid rgba(99,102,241,0.4);
          color: #a5b4fc;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }
        .retry-btn:hover { background: rgba(99,102,241,0.35); }
        .freeze-err-text {
          font-size: 0.7rem;
          color: #f87171;
          margin: 0;
        }
        @media (max-width: 480px) {
          .top-row { flex-direction: column; align-items: center; }
          .side-column { width: 100%; }
          .stat-pills { justify-content: center; }
        }
      `}</style>
    </div>
  );
}
