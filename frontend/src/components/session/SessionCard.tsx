"use client";

import { SessionData, ProgressData } from '@/hooks/useSession';
import { ContentBlock } from './ContentBlock';

interface SessionCardProps {
  session: SessionData;
  progress: ProgressData;
  onComplete: () => void;
  onToggleFavorite: () => void;
}

export function SessionCard({ session, progress, onComplete, onToggleFavorite }: SessionCardProps) {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', width: '100%' }}>
      
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Dia {session.day}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
            🔥 Sequência: {progress.streak} dias
          </p>
        </div>
        
        <button
          onClick={onToggleFavorite}
          style={{
            background: session.isFavorite ? 'var(--accent-primary)' : 'var(--surface-secondary)',
            color: session.isFavorite ? 'white' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '1.1rem'
          }}
          aria-label="Favoritar Sessão"
        >
          {session.isFavorite ? '★' : '☆'}
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <p style={{ 
          fontSize: '1.2rem', 
          lineHeight: 1.5, 
          color: 'var(--text-primary)', 
          fontWeight: 500,
          marginBottom: '2rem',
          paddingLeft: '1rem',
          borderLeft: '4px solid var(--accent-primary)'
        }}>
          {session.content.direction}
        </p>

        <ContentBlock title="Explicação" icon="📖" content={session.content.explanation} />
        <ContentBlock title="Reflexão" icon="🪞" content={session.content.reflection} />
        <ContentBlock title="Espaço de Consciência" icon="👁️" content={session.content.question} />
        <ContentBlock title="Afirmação Diária" icon="✨" content={session.content.affirmation} />
        <ContentBlock title="Prática" icon="🧘" content={session.content.practice} />
        <ContentBlock title="Ação" icon="⚡" content={session.content.action} />
        <ContentBlock title="Integração" icon="🔄" content={session.content.integration} defaultExpanded={false} />
      </div>

      <button
        onClick={onComplete}
        disabled={session.isCompleted}
        style={{
          width: '100%',
          padding: '1rem',
          borderRadius: '0.75rem',
          background: session.isCompleted ? 'var(--surface-tertiary, #f3f4f6)' : 'var(--accent-primary)',
          color: session.isCompleted ? 'var(--text-tertiary, #9ca3af)' : 'white',
          border: 'none',
          fontSize: '1.1rem',
          fontWeight: 600,
          cursor: session.isCompleted ? 'default' : 'pointer',
          transition: 'all 0.2s',
          boxShadow: session.isCompleted ? 'none' : '0 4px 14px 0 rgba(0,0,0,0.1)',
        }}
      >
        {session.isCompleted ? 'Sessão Concluída ✓' : 'Concluir Dia'}
      </button>
    </div>
  );
}
