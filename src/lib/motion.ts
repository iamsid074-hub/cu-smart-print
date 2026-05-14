/**
 * motion.ts — Bazzar Central Motion Config
 *
 * All framer-motion animations in the app should use these values.
 * This ensures a consistent Apple-like motion language everywhere.
 *
 * Apple's core principle:
 * "Nothing should feel instant or delayed. Everything should feel naturally responsive."
 */

// ── Easing Curves ──────────────────────────────────────────────────────────
export const ease = {
  /** Apple's primary easing — fast start, decelerates softly into rest */
  apple: [0.22, 1, 0.36, 1] as const,
  /** Springy but controlled — great for cards and modals */
  spring: [0.16, 1, 0.3, 1] as const,
  /** Clean deceleration — for slides and sheets */
  out: [0.0, 0.0, 0.2, 1] as const,
  /** Gentle ease in-out — for fades and subtle shifts */
  smooth: [0.4, 0, 0.2, 1] as const,
};

// ── Durations (seconds) ────────────────────────────────────────────────────
export const duration = {
  /** Button press / touch feedback — imperceptible but felt */
  tap: 0.10,
  /** Hover lift — responds before the user even consciously notices */
  hover: 0.15,
  /** Modal, dialog, popover open/close */
  modal: 0.18,
  /** Bottom sheet slide */
  sheet: 0.22,
  /** Page / route transition */
  page: 0.18,
  /** Slow hero entrance or card unboxing */
  slow: 0.35,
};

// ── Spring Configs ─────────────────────────────────────────────────────────
export const spring = {
  /** Snappy — for dock icons, buttons, immediate feedback */
  snappy: {
    type: 'spring' as const,
    stiffness: 420,
    damping: 36,
    mass: 0.8,
  },
  /** Smooth — for cards, modals, panels */
  smooth: {
    type: 'spring' as const,
    stiffness: 280,
    damping: 28,
    mass: 1.0,
  },
  /** Dock — for springboard icons, extra crisp */
  dock: {
    type: 'spring' as const,
    stiffness: 700,
    damping: 32,
    mass: 0.6,
  },
};

// ── Reusable Transition Objects ────────────────────────────────────────────

/** Button/icon tap transition */
export const tapTransition = {
  duration: duration.tap,
  ease: ease.apple,
};

/** Hover lift transition */
export const hoverTransition = {
  duration: duration.hover,
  ease: ease.apple,
};

/** Modal open/close transition */
export const modalTransition = {
  duration: duration.modal,
  ease: ease.apple,
};

/** Bottom sheet slide transition */
export const sheetTransition = {
  type: 'spring' as const,
  stiffness: 320,
  damping: 30,
  mass: 0.9,
};

/** Page route transition */
export const pageTransition = {
  duration: duration.page,
  ease: ease.apple,
};

// ── Framer-Motion Variant Presets ──────────────────────────────────────────

/** Standard fade + slight rise entrance */
export const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: 4 },
  transition: { duration: duration.modal, ease: ease.apple },
};

/** Modal scale entrance — Apple-style */
export const modalVariants = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1,    y: 0, transition: modalTransition },
  exit:    { opacity: 0, scale: 0.96, y: 4, transition: { duration: 0.18, ease: ease.smooth } },
};

/** Backdrop dimmer */
export const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: duration.modal, ease: ease.smooth } },
  exit:    { opacity: 0, transition: { duration: 0.18, ease: ease.smooth } },
};

/** Bottom sheet */
export const sheetVariants = {
  initial: { y: '100%' },
  animate: { y: 0,      transition: sheetTransition },
  exit:    { y: '100%', transition: { ...sheetTransition, stiffness: 400, damping: 40 } },
};

/** Page route variants */
export const pageVariants = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1,    transition: pageTransition },
  exit:    { opacity: 0, scale: 1.01, transition: { duration: 0.18, ease: ease.smooth } },
};

/** Standard card hover — subtle lift */
export const cardHover = {
  y: -2,
  scale: 1.01,
  transition: hoverTransition,
};

/** Touch feedback — universal tap compression */
export const tapFeedback = {
  scale: 0.97,
  transition: tapTransition,
};

/** Icon / button tap — smaller, more precise */
export const iconTap = {
  scale: 0.92,
  transition: tapTransition,
};
