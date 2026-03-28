// lib/animations.ts — All Framer Motion variants and transitions
// Import these in every component — never create inline variants

export const TRANSITIONS = {
  spring: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  },
  springBounce: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 25,
  },
  smooth: {
    duration: 0.4,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
  fast: {
    duration: 0.15,
    ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
  },
};

export const VARIANTS = {
  pageEnter: {
    initial: { opacity: 0, y: 16, filter: 'blur(8px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -8, filter: 'blur(4px)' },
  },

  cardReveal: {
    initial: { opacity: 0, y: 24, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.98 },
  },

  contentBlock: {
    initial: { opacity: 0, x: -8 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 8 },
  },

  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },

  slideDown: {
    initial: { opacity: 0, y: -10, height: 0 },
    animate: { opacity: 1, y: 0, height: 'auto' },
    exit: { opacity: 0, y: -10, height: 0 },
  },

  slideHorizontal: {
    initial: (direction: number) => ({ opacity: 0, x: direction > 0 ? 30 : -30 }),
    animate: { opacity: 1, x: 0 },
    exit: (direction: number) => ({ opacity: 0, x: direction < 0 ? 30 : -30 }),
  },

  // Infinite animations (use with animate prop directly)
  orbPulse: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
  },

  streakFire: {
    scale: [1, 1.1, 0.95, 1.05, 1],
    rotate: [-2, 2, -1, 1, 0],
  },

  levelUp: {
    initial: { scale: 0.5, opacity: 0 },
    animate: {
      scale: [0.5, 1.2, 1],
      opacity: [0, 1, 1],
    },
  },
};

// Stagger container — apply to parent motion.div
export const stagger = (staggerChildren = 0.08, delayChildren = 0) => ({
  animate: { transition: { staggerChildren, delayChildren } },
  initial: {},
});
