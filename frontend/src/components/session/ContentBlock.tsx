"use client";

import { useState } from 'react';

interface ContentBlockProps {
  title: string;
  content: string;
  icon?: string;
  defaultExpanded?: boolean;
}

export function ContentBlock({ title, content, icon, defaultExpanded = true }: ContentBlockProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div style={{
      background: 'white',
      borderRadius: '0.75rem',
      border: '1px solid var(--border-default, #e5e7eb)',
      marginBottom: '1rem',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {icon && <span style={{ fontSize: '1.25rem' }}>{icon}</span>}
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            {title}
          </span>
        </div>
        <span style={{ 
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', 
          transition: 'transform 0.2s ease',
          color: 'var(--text-secondary)'
        }}>
          👇
        </span>
      </button>

      <div style={{
        maxHeight: expanded ? '500px' : '0px',
        opacity: expanded ? 1 : 0,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ padding: '0 1.25rem 1.25rem 1.25rem' }}>
          <p style={{ 
            fontSize: '1.05rem', 
            lineHeight: 1.6, 
            color: 'var(--text-secondary)',
            margin: 0 
          }}>
            {content}
          </p>
        </div>
      </div>
    </div>
  );
}
