import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import BadgeIcon, { RatingTierBadge } from './BadgeIcon';
import { api } from '../lib/api';

/**
 * Compact trust profile card — shown on ApplicationDetail to dept/evaluator.
 * Shows rating, tier badge, and up to 4 recent earned badges.
 */
export default function StartupTrustProfile({ startupId, startupName, rating = 1000 }) {
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (!startupId) return;
    api.getStartupBadges(startupId).then(setBadges).catch(() => {});
  }, [startupId]);

  return (
    <Card className="rounded-xl border-[--border] shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          Startup Trust Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rating + tier */}
        <div className="flex items-center gap-3">
          <div>
            <div className="text-xl font-bold text-[--text-primary]">{rating}</div>
            <div className="text-xs text-[--text-secondary]">Rating</div>
          </div>
          <RatingTierBadge rating={rating} size={40} />
        </div>

        {/* Badge strip */}
        {badges.length > 0 ? (
          <div className="flex gap-3 flex-wrap">
            {badges.slice(0, 4).map(b => (
              <BadgeIcon
                key={b.badge_key}
                badgeKey={b.badge_key}
                size={40}
                showLabel={true}
                earnedAt={b.earned_at}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No badges earned yet</p>
        )}
      </CardContent>
    </Card>
  );
}
