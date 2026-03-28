"use client";

interface ProgressIndicatorProps {
  totalSteps: number;
  currentStep: number; // 0-indexed
}

export default function ProgressIndicator({ totalSteps, currentStep }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center gap-2" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemax={totalSteps}>
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;
        return (
          <div key={i} className="flex items-center gap-2">
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: isActive
                  ? 'var(--accent-primary)'
                  : isDone
                  ? 'var(--accent-primary)'
                  : 'var(--border-default, #d1d5db)',
                opacity: isDone ? 0.5 : 1,
                transition: 'all 0.3s ease',
                transform: isActive ? 'scale(1.3)' : 'scale(1)',
              }}
              aria-label={isDone ? `Step ${i + 1} complete` : isActive ? `Step ${i + 1} active` : `Step ${i + 1}`}
            />
            {i < totalSteps - 1 && (
              <div
                style={{
                  width: 24,
                  height: 1,
                  background: isDone ? 'var(--accent-primary)' : 'var(--border-default, #d1d5db)',
                  opacity: isDone ? 0.5 : 0.3,
                  transition: 'background 0.3s ease',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
