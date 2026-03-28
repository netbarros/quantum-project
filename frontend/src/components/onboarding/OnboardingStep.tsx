"use client";

interface Option {
  value: string;
  label: string;
  emoji?: string;
}

interface OnboardingStepProps {
  title: string;
  description: string;
  options: Option[];
  selected: string | null;
  onSelect: (value: string) => void;
}

export default function OnboardingStep({
  title,
  description,
  options,
  selected,
  onSelect,
}: OnboardingStepProps) {
  return (
    <div style={{ width: '100%' }}>
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '0.5rem',
          lineHeight: 1.3,
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: '0.95rem',
          color: 'var(--text-secondary)',
          marginBottom: '1.75rem',
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.75rem',
        }}
      >
        {options.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.875rem 1rem',
                borderRadius: '0.75rem',
                border: isSelected
                  ? '2px solid var(--accent-primary)'
                  : '2px solid var(--border-default, #e5e7eb)',
                background: isSelected
                  ? 'color-mix(in srgb, var(--accent-primary) 8%, transparent)'
                  : 'var(--surface-secondary, #fafafa)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.18s ease, background 0.18s ease, transform 0.12s ease',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    'color-mix(in srgb, var(--accent-primary) 40%, transparent)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    'var(--border-default, #e5e7eb)';
                }
              }}
            >
              {opt.emoji && (
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{opt.emoji}</span>
              )}
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                  lineHeight: 1.4,
                }}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
