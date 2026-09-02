/**
 * StatCard — used on startup dashboard and department dashboard.
 * The big number uses Magic UI NumberTicker (M2b): counts up from 0 to value
 * once on first viewport entry, never on re-render.
 */
import React from 'react';
import { Card } from './ui/card';
import { NumberTicker } from './NumberTicker';

const colorMap = {
  indigo: { bg: '#EEF2FF', icon: '#4F46E5' },
  amber:  { bg: '#FEF3C7', icon: '#D97706' },
  green:  { bg: '#D1FAE5', icon: '#059669' },
  teal:   { bg: '#CCFBF1', icon: '#0D9488' },
  red:    { bg: '#FEE2E2', icon: '#DC2626' },
};

export default function StatCard({ icon: Icon, value, label, color = 'indigo', trend = null }) {
  const colors = colorMap[color] ?? colorMap.indigo;

  return (
    <Card className="p-5 rounded-xl border-[--border] shadow-sm transition-shadow duration-150 hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
          <Icon size={20} style={{ color: colors.icon }} />
        </div>
        {trend != null && (
          <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>

      {/* M2b — NumberTicker: once per mount, spring from 0 → value */}
      <div className="text-3xl font-space-grotesk font-bold text-[--text-primary]">
        <NumberTicker value={value ?? 0} className="text-3xl font-space-grotesk font-bold text-[--text-primary]" />
      </div>
      <div className="text-sm text-[--text-secondary] mt-1">{label}</div>
    </Card>
  );
}
