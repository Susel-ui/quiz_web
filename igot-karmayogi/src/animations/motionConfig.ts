/**
 * motionConfig.ts — Single source of truth for all animation values.
 *
 * Decision: Centralising here means a single tweak propagates app-wide.
 * Components import from here; they never hardcode duration/easing values.
 */

import type { Variants } from 'framer-motion';

// ─── Durations (seconds for Framer Motion, ms for GSAP) ──────────────────────
export const DURATION = {
  fast:   0.15,
  normal: 0.3,
  slow:   0.5,
  slower: 0.8,
  // GSAP equivalents (milliseconds)
  gsap: {
    fast:   150,
    normal: 300,
    slow:   500,
    slower: 800,
  },
} as const;

// ─── Easing curves ────────────────────────────────────────────────────────────
// Custom cubic-bezier: spring-like feel without spring physics overhead.
// Matches GSAP's power3.out perceptually.
export const EASE = {
  out:      [0.16, 1, 0.3, 1]       as [number, number, number, number],
  in:       [0.7, 0, 0.84, 0]       as [number, number, number, number],
  inOut:    [0.76, 0, 0.24, 1]      as [number, number, number, number],
  bounce:   [0.34, 1.56, 0.64, 1]   as [number, number, number, number],
  // GSAP string equivalents
  gsap: {
    out:    'power3.out',
    in:     'power3.in',
    inOut:  'power3.inOut',
    bounce: 'back.out(1.4)',
  },
} as const;

// ─── Stagger config ───────────────────────────────────────────────────────────
export const STAGGER = {
  fast:   0.05,
  normal: 0.08,
  slow:   0.12,
} as const;

// ─── Framer Motion Variants ───────────────────────────────────────────────────

/** Fade up from 12px below — most common entry animation */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.normal, ease: EASE.out },
  },
};

/** Fade in only — for overlays, modals */
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.normal, ease: EASE.out } },
};

/** Scale in from 96% — for cards, popovers */
export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.normal, ease: EASE.out },
  },
};

/** Slide in from the right — for sidebars, drawers */
export const slideInRight: Variants = {
  hidden:  { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.normal, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    x: 24,
    transition: { duration: DURATION.fast, ease: EASE.in },
  },
};

/** Stagger container — wraps a list of children that each use a child variant */
export const staggerContainer: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: STAGGER.normal,
      delayChildren: 0.1,
    },
  },
};

/** Fast stagger — for dense lists (recommendation cards, table rows) */
export const staggerContainerFast: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: STAGGER.fast,
      delayChildren: 0.05,
    },
  },
};

/** Grow from bottom — for bar chart segments */
export const growFromBottom: Variants = {
  hidden:  { scaleY: 0, originY: 1 },
  visible: {
    scaleY: 1,
    transition: { duration: DURATION.slow, ease: EASE.out },
  },
};

// ─── Chart animation config (Recharts props, not Framer Motion) ───────────────
export const CHART_ANIMATION = {
  begin:    200,   // ms delay before chart animates
  duration: 800,   // ms for chart draw animation
  easing:   'ease-out' as const,
} as const;

// ─── Page transition config ───────────────────────────────────────────────────
export const pageTransition = {
  initial:   { opacity: 0, y: 8 },
  animate:   { opacity: 1, y: 0, transition: { duration: DURATION.normal, ease: EASE.out } },
  exit:      { opacity: 0, y: -8, transition: { duration: DURATION.fast, ease: EASE.in } },
};

// ─── GSAP intro timeline config ───────────────────────────────────────────────
export const INTRO_CONFIG = {
  totalDuration: 2.0,        // seconds — target total intro length
  nodeCount:     8,          // number of competency nodes in the graph
  edgeColor:     '#0EA5E9',  // accent-500
  nodeColor:     '#1A3A6B',  // primary-600
  wordmarkColor: '#FFFFFF',
} as const;
