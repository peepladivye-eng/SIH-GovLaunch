/**
 * Aceternity UI — Card Spotlight
 * Source: ui.aceternity.com/components/card-spotlight
 * MIT License. Animation logic preserved exactly; only color tokens adapted.
 *
 * Effect: a radial-gradient spotlight follows the cursor across the card on hover.
 * Used on the 3 landing-page hero stat-strip cards only (per spec Block M2).
 */
import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function CardSpotlight({ children, className, radius = 350, color = 'rgba(255,255,255,0.06)', ...props }) {
  const divRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className={cn('relative overflow-hidden rounded-xl border border-white/10 bg-white/5', className)}
      style={{
        background: visible
          ? `radial-gradient(${radius}px circle at ${position.x}px ${position.y}px, ${color}, transparent 80%), rgba(255,255,255,0.04)`
          : 'rgba(255,255,255,0.04)',
        transition: 'background 0.15s ease',
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}