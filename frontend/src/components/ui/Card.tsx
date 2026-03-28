"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TRANSITIONS } from '@/lib/animations';

interface CardProps extends HTMLMotionProps<"div"> {
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hoverable ? { y: -2, transition: TRANSITIONS.fast } : {}}
        className={cn(
          'rounded-[var(--q-radius-xl)] border border-[var(--q-border-subtle)] bg-[var(--q-bg-depth)] shadow-sm overflow-hidden p-6 relative',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Card.displayName = 'Card';
