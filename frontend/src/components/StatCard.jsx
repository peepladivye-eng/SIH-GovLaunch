/**
 * StatCard — used on startup dashboard and department dashboard.
 * Uses a plain animated number so it updates live when value changes.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Card } from './ui/card';
import { motion, useSpring, useTransform } from 'motion/react';

const colorMap = {
  indigo: { bg: '#EEF2FF', icon: '#4F46E5' },
  amber:  { bg: '#FEF3C7', icon: '#D97706' },
  green:  { bg: '#D1FAE5', icon: '#059669' },
  teal:   { bg: '#CCFBF1', icon: '#0D9488' },
  red:    { bg: '#FEE2E2', icon: '#DC2626' },
};

// Animated counter that re-animates every time `value` changes
function AnimatedNumber({ value }) {
  const spring = useSpring(0, { stiffness: 120, damping: 20 });
  const display = useTransform(spring, v => Math.round(v).toLocaleString('en-IN'));

  useEffect(() => { spring.set(value ?? 0); }, [value, spring]);

  return <motion.span>{display}</motion.span>;
}

export default function StatCard({ icon: Icon, value, label, color = 'indigo', hint = null }) {
  const colors = colorMap[color] ?? colorMap.indigo;

  return (
    <Card className="p-5 rounded-xl border-[--border] shadow-sm transition-shadow duration-150 hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
          <Icon size={20} style={{ color: colors.icon }} />
        </div>
      </div>

      <div className="text-3xl font-space-grotesk font-bold text-[--text-primary]">
        <AnimatedNumber value={value ?? 0} />
      </div>
      <div className="text-sm text-[--text-secondary] mt-1">{label}</div>
      {hint && (
        <div style={{ fontSize: 11, color: '#D97706', marginTop: 4, fontWeight: 600 }}>{hint}</div>
      )}
    </Card>
  );
}
