import React from 'react';
import {
  ShieldCheck, Rocket, ClipboardCheck, TrendingUp, Wrench,
  Award, Trophy, Leaf, Lightbulb, Star, Crown, Lock
} from 'lucide-react';
import { BADGE_CATALOG } from '../lib/badgeCatalog';
import { RATING_TIERS } from '../lib/ratingTiers';

const ICON_MAP = {
  ShieldCheck, Rocket, ClipboardCheck, TrendingUp, Wrench,
  Award, Trophy, Leaf, Lightbulb, Star, Crown, Lock,
};

// Heraldic shield SVG path (64px viewBox)
const SHIELD_PATH = "M32 4 L58 14 L58 36 C58 50 46 60 32 64 C18 60 6 50 6 36 L6 14 Z";

/**
 * BadgeIcon — renders a heraldic shield badge.
 * @param {string}  badgeKey   — key from BADGE_CATALOG or a tier-label for rating tiers
 * @param {number}  size       — 64 (grid) or 40 (compact/inline)
 * @param {boolean} showLabel  — show text label below shield
 * @param {string}  earnedAt   — ISO date string, shows below label if present
 * @param {boolean} locked     — render at 40% opacity with Lock icon
 * @param {string}  shieldColor — override shield fill color
 * @param {string}  iconName   — override icon name
 */
export default function BadgeIcon({
  badgeKey,
  size = 64,
  showLabel = true,
  earnedAt,
  locked = false,
  shieldColor: shieldColorOverride,
  iconName: iconNameOverride,
}) {
  const meta = BADGE_CATALOG[badgeKey] ?? {};
  const shieldColor = shieldColorOverride ?? meta.shieldColor ?? '#4F46E5';
  const rawIcon = locked ? 'Lock' : (iconNameOverride ?? meta.icon ?? 'Award');
  const isPlatinum = badgeKey === 'platinum_tier' || shieldColor === '#18181B';
  const IconComponent = ICON_MAP[isPlatinum ? 'Crown' : rawIcon] ?? Award;

  const iconSize = Math.round(size * 0.38);
  const iconOffset = Math.round((size - iconSize) / 2);

  return (
    <div
      className="flex flex-col items-center gap-1"
      style={{ opacity: locked ? 0.4 : 1 }}
    >
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          viewBox="0 0 64 68"
          width={size}
          height={size}
          style={{ display: 'block', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
        >
          {/* Shield fill */}
          <path d={SHIELD_PATH} fill={shieldColor} />
          {/* Gold border */}
          <path d={SHIELD_PATH} fill="none" stroke="#D4AF37" strokeWidth="1.5" />
          {/* Shine overlay */}
          <path
            d="M32 6 L54 15 L54 36 C54 47 44 56 32 60"
            fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" strokeLinecap="round"
          />
        </svg>
        {/* Lucide icon centered over shield */}
        <div style={{
          position: 'absolute',
          top: Math.round(size * 0.28),
          left: Math.round((size - iconSize) / 2),
          color: 'white',
          lineHeight: 0,
        }}>
          <IconComponent size={iconSize} strokeWidth={2} />
        </div>
      </div>

      {showLabel && meta.label && (
        <span className="text-xs font-medium text-center text-[--text-primary] leading-tight" style={{ maxWidth: size + 8 }}>
          {meta.label}
        </span>
      )}
      {showLabel && earnedAt && (
        <span className="text-[10px] text-gray-400">
          {new Date(earnedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </span>
      )}
    </div>
  );
}

/** Compact tier badge — just shield + label inline */
export function RatingTierBadge({ rating, size = 40 }) {
  const tier = RATING_TIERS.find(t => rating >= t.min && rating <= t.max) ?? RATING_TIERS[0];
  const isPlatinum = tier.label === 'Platinum Innovator';
  const IconComponent = isPlatinum ? Crown : Star;
  const iconSize = Math.round(size * 0.38);

  return (
    <div className="flex items-center gap-1.5">
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg viewBox="0 0 64 68" width={size} height={size} style={{ display: 'block' }}>
          <path d={SHIELD_PATH} fill={tier.shieldColor} />
          <path d={SHIELD_PATH} fill="none" stroke="#D4AF37" strokeWidth="1.5" />
        </svg>
        <div style={{
          position: 'absolute',
          top: Math.round(size * 0.28),
          left: Math.round((size - iconSize) / 2),
          color: 'white',
          lineHeight: 0,
        }}>
          <IconComponent size={iconSize} strokeWidth={2} />
        </div>
      </div>
      <span className="text-xs font-medium text-[--text-primary]">{tier.label}</span>
    </div>
  );
}
