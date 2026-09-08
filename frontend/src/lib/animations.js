/**
 * animations.js — shared Framer Motion variants and hooks for GovLaunch
 * Import these everywhere to keep motion consistent.
 */

// ── Page-level entrance ───────────────────────────────────────────────────────
export const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.25, ease: 'easeIn' } },
};

// ── Stagger container: children animate one after another ────────────────────
export const staggerContainer = (stagger = 0.08, delayChildren = 0) => ({
  animate: { transition: { staggerChildren: stagger, delayChildren } },
});

// ── Individual stagger item ───────────────────────────────────────────────────
export const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] } },
});

export const fadeLeft = (delay = 0) => ({
  initial: { opacity: 0, x: -32 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] } },
});

export const fadeScale = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.88 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] } },
});

// ── Scroll-triggered variant (use with useInView) ────────────────────────────
export const scrollReveal = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const scrollRevealLeft = {
  hidden:  { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const scrollRevealScale = {
  hidden:  { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ── Card hover (use as whileHover prop) ──────────────────────────────────────
export const cardHover = {
  scale: 1.015,
  y: -3,
  boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
  transition: { duration: 0.2, ease: 'easeOut' },
};

export const cardTap = { scale: 0.98, transition: { duration: 0.1 } };

// ── List item: used inside stagger containers ─────────────────────────────────
export const listItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ── Slide in from right (drawer/panel) ───────────────────────────────────────
export const slideInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ── Floating animation (infinite) ────────────────────────────────────────────
export const floatAnim = {
  y: [0, -10, 0],
  transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
};

// ── Pulse glow (infinite) ────────────────────────────────────────────────────
export const pulseGlow = (color = 'rgba(79,70,229,0.4)') => ({
  boxShadow: [`0 0 0 0 ${color}`, `0 0 0 8px rgba(0,0,0,0)`, `0 0 0 0 rgba(0,0,0,0)`],
  transition: { duration: 2.2, repeat: Infinity, ease: 'easeOut' },
});
