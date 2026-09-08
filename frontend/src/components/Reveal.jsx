/**
 * Reveal — wraps any content and animates it into view on scroll.
 * Uses Framer Motion useInView with once:true so it plays once.
 *
 * Props:
 *   direction: 'up' | 'left' | 'right' | 'scale'  (default 'up')
 *   delay: number (seconds, default 0)
 *   duration: number (seconds, default 0.6)
 *   margin: string (viewport margin, default '-60px')
 */
import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';

const VARIANTS = {
  up:    { hidden: { opacity: 0, y: 40 },    visible: { opacity: 1, y: 0 } },
  down:  { hidden: { opacity: 0, y: -30 },   visible: { opacity: 1, y: 0 } },
  left:  { hidden: { opacity: 0, x: -40 },   visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 40 },    visible: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.88 }, visible: { opacity: 1, scale: 1 } },
  fade:  { hidden: { opacity: 0 },            visible: { opacity: 1 } },
};

export default function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  margin = '-60px',
  className,
  style,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin });
  const variants = VARIANTS[direction] ?? VARIANTS.up;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerReveal — wraps a list of children and staggers each one.
 * Each direct child gets animated in sequence.
 */
export function StaggerReveal({
  children,
  stagger = 0.08,
  delayChildren = 0,
  direction = 'up',
  margin = '-40px',
  className,
  style,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin });
  const childVariants = VARIANTS[direction] ?? VARIANTS.up;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger, delayChildren } } }}
    >
      {React.Children.map(children, (child) =>
        child ? (
          <motion.div
            variants={childVariants}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {child}
          </motion.div>
        ) : null
      )}
    </motion.div>
  );
}
