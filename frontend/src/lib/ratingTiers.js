export const RATING_TIERS = [
  { min: 1000, max: 1149, label: 'Rising Startup',     color: 'neutral', shieldColor: '#92400E' },
  { min: 1150, max: 1299, label: 'Promising Builder',  color: 'neutral', shieldColor: '#71717A' },
  { min: 1300, max: 1449, label: 'Impact Creator',     color: 'warning', shieldColor: '#CA8A04' },
  { min: 1450, max: 1599, label: 'Innovation Leader',  color: 'warning', shieldColor: '#0F766E' },
  { min: 1600, max: 1749, label: 'Trusted Innovator',  color: 'success', shieldColor: '#7C3AED' },
  { min: 1750, max: 1899, label: 'Star Innovator',     color: 'success', shieldColor: '#B91C1C' },
  { min: 1900, max: 9999, label: 'Platinum Innovator', color: 'success', shieldColor: '#18181B' },
];

export function getRatingTier(rating) {
  return RATING_TIERS.find(t => rating >= t.min && rating <= t.max) ?? RATING_TIERS[0];
}
