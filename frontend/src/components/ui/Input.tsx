import React, { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-2 w-full">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-[var(--q-text-secondary)] font-[family-name:var(--font-dm-sans)]">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            'flex h-12 w-full rounded-[var(--q-radius-md)] border border-[var(--q-border-subtle)] bg-[var(--q-bg-surface)] px-4 py-2 text-base text-[var(--q-text-primary)] placeholder-[var(--q-text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--q-accent-8)] focus:border-[var(--q-accent-8)] disabled:cursor-not-allowed disabled:opacity-50 transition-all font-[family-name:var(--font-dm-sans)]',
            error && 'border-[var(--q-amber-8)] focus:ring-[var(--q-amber-8)] focus:border-[var(--q-amber-8)]',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-[var(--q-amber-8)] font-medium mt-1">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
