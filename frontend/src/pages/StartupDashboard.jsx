import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useSpring, useInView, AnimatePresence } from 'motion/react';
import { FileText, Star, CheckCircle, Clock, Activity } from 'lucide-react';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import TierBadge from '../components/TierBadge';
import BadgeIcon, { RatingTierBadge } from '../components/BadgeIcon';
import { getRatingTier, RATING_TIERS } from '../lib/ratingTiers';
import { BADGE_CATALOG } from '../lib/badgeCatalog';
import { NumberTicker } from '../components/NumberTicker';

// ── 3D Tilt stat card ─────────────────────────────────────────────────────────
function Stat3DCard({ icon: Icon, value, label, color, accentColor, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const rotateX = useSpring(0, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 20 });

  const onMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateX.set((py - 0.5) * -16);
    rotateY.set((px - 0.5) * 16);
  }, [rotateX, rotateY]);

  const onLeave = useCallback(() => { rotateX.set(0); rotateY.set(0); }, [rotateX, rotateY]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX, rotateY,
        transformStyle: 'preserve-3d', perspective: 1000,
        borderRadius: 16, padding: '22px 20px',
        background: '#ffffff',
        border: `1px solid ${accentColor}22`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`,
        position: 'relative', overflow: 'hidden', cursor: 'default',
      }}
      whileHover={{ boxShadow: `0 8px 40px ${accentColor}25, 0 2px 8px rgba(0,0,0,0.06)` }}
    >
      {/* Background gradient shine */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 80, height: 80, borderRadius: '50%',
        background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`,
        transform: 'translate(20px,-20px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${accentColor}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={22} color={accentColor} />
        </div>
      </div>

      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 38, fontWeight: 800, color: '#0B0F19', lineHeight: 1, marginBottom: 6 }}>
        <NumberTicker value={value ?? 0} className="" />
      </div>
      <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{label}</div>

      {/* Bottom accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}44)`,
          transformOrigin: 'left', borderRadius: '0 0 16px 16px',
        }}
      />
    </motion.div>
  );
}

// Scroll reveal
function Reveal({ children, delay = 0, direction = 'up' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const dirs = {
    up:    { hidden: { opacity: 0, y: 40 },   visible: { opacity: 1, y: 0 } },
    left:  { hidden: { opacity: 0, x: -40 },  visible: { opacity: 1, x: 0 } },
    scale: { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } },
  };
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'}
      variants={dirs[direction]} transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}>
      {children}
    </motion.div>
  );
}

// Simple SVG sparkline for last 5 rating deltas
function Sparkline({ deltas }) {
  if (!deltas || deltas.length < 2) return null;
  const vals = deltas.slice(-5);
  const min = Math.min(0, ...vals);
  const max = Math.max(1, ...vals);
  const range = max - min || 1;
  const w = 80, h = 24, pad = 2;
  const pts = vals.map((v, i) => {
    const x = pad + (i / (vals.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const getRelativeTime = (d) => {
  const diff = Date.now() - new Date(d);
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), dy = Math.floor(diff / 86400000);
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${dy}d ago`;
};

const BADGE_ELEMENTS = [
  { icon: '🛡', label: 'Shield = Trust & Security' },
  { icon: '⭐', label: 'Star = Excellence & Quality' },
  { icon: '🔰', label: 'Icon overlay = Achievement type' },
  { icon: '👑', label: 'Crown = Top Performer' },
];

export default function StartupDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [startupData, setStartupData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [ratingHistory, setRatingHistory] = useState([]);
  const [badges, setBadges] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [me, apps, chals] = await Promise.all([
          api.me(),
          api.getApplications(),
          api.getChallenges(),
        ]);
        const appList = Array.isArray(apps) ? apps : (apps?.results ?? []);
        setApplications(appList);
        setChallenges(Array.isArray(chals) ? chals : (chals?.results ?? []));
        setStartupData(me);

        if (me.startup_id) {
          const [history, earnedBadges, logs] = await Promise.all([
            api.getStartupRatingHistory(me.startup_id),
            api.getStartupBadges(me.startup_id),
            api.getAuditLogs().catch(() => []),
          ]);
          setRatingHistory(Array.isArray(history) ? history : []);
          setBadges(Array.isArray(earnedBadges) ? earnedBadges : []);
          const logList = Array.isArray(logs) ? logs : (logs?.results ?? []);
          setAuditLogs(logList.filter(l => l.actor === me.username).slice(0, 20));
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
    };
    fetchAll();
  }, []);

  const rating     = startupData?.rating ?? 1000;
  const tier       = getRatingTier(rating);
  const deltas     = ratingHistory.map(r => r.delta);

  // Stats
  const activeStatuses = ['submitted', 'screening', 'eligible', 'under_evaluation'];
  const qualified   = badges.filter(b => b.badge_key === 'round1_qualifier' || b.badge_key === 'round2_qualifier').length;
  const prototypes  = applications.filter(a => a.prototype_start_date).length;
  const contracted  = applications.filter(a => a.status === 'contracted').length;

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB' }}>

      {/* ── Hero Header Card ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'relative', overflow: 'hidden', borderRadius: 20, marginBottom: 24,
          background: 'linear-gradient(135deg, #0D1117 0%, #0A0E1A 50%, #0C1020 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '32px 36px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
        }}
      >
        {/* Ambient orbs */}
        <motion.div animate={{ x: [0,20,0], y: [0,-15,0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -40, left: -40, width: 280, height: 280, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <motion.div animate={{ x: [0,-15,0], y: [0,20,0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{ position: 'absolute', bottom: -30, right: -30, width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(13,148,136,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 20,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 50%, transparent 100%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
          {/* Left — identity */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 0 2px rgba(255,255,255,0.1), 0 4px 16px rgba(79,70,229,0.4)',
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 800, color: '#fff',
                }}
              >
                {(startupData?.name || user.name || 'S').charAt(0).toUpperCase()}
              </motion.div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}>
                    {startupData?.name || user.name}
                  </h1>
                  {startupData?.registration_status && (
                    <TierBadge registrationStatus={startupData.registration_status} />
                  )}
                </div>
                {/* Sector tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {(startupData?.sector_tags ?? []).map(t => (
                    <motion.span
                      key={t}
                      whileHover={{ scale: 1.05 }}
                      style={{
                        padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
                        background: 'rgba(99,102,241,0.2)', color: '#818CF8',
                        border: '1px solid rgba(99,102,241,0.3)', letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {t}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>

            {startupData?.pitch_summary && (
              <p style={{ fontSize: 14, color: '#64748B', maxWidth: 520, lineHeight: 1.6, margin: '12px 0 0' }}>
                {startupData.pitch_summary}
              </p>
            )}
          </div>

          {/* Right — Rating widget */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              textAlign: 'right', flexShrink: 0,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '20px 24px',
              backdropFilter: 'blur(8px)',
              minWidth: 160,
            }}
          >
            <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
              Rating
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 42, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
              {rating}
            </div>
            <div style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>/ 2000</div>

            {/* Tier badge */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <RatingTierBadge rating={rating} size={36} />
            </div>

            {/* Sparkline */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <Sparkline deltas={deltas} />
            </div>

            {/* Progress bar */}
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 100, height: 4, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(rating, 2000) / 2000 * 100}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #4F46E5, #7C3AED)', borderRadius: 100 }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="badges">Awards & Badges</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Stat3DCard icon={FileText}    value={applications.length} label="Applications"    accentColor="#4F46E5" index={0} />
              <Stat3DCard icon={Star}        value={qualified}            label="Qualified"        accentColor="#D97706" index={1} />
              <Stat3DCard icon={CheckCircle} value={prototypes}           label="Prototypes Built" accentColor="#0D9488" index={2} />
              <Stat3DCard icon={CheckCircle} value={contracted}           label="Contracts Won"    accentColor="#16A34A" index={3} />
            </div>
            {/* Recommended challenges */}
            {challenges.length > 0 && (
              <div>
                <Reveal direction="up" delay={0.1}>
                  <h2 className="text-lg font-semibold text-[--text-primary] mb-3">Open Challenges</h2>
                </Reveal>
                <div className="grid grid-cols-2 gap-4">
                  {challenges.slice(0, 4).map((c, i) => (
                    <Reveal key={c.id} direction="up" delay={0.15 + i * 0.08}>
                      <Card key={c.id} className="rounded-xl border-[--border] shadow-sm card-hover cursor-pointer"
                            onClick={() => navigate(`/discover/${c.id}`)}>
                        <CardContent className="p-4">
                          <div className="font-medium text-[--text-primary]">{c.title}</div>
                          <div className="text-sm text-[--text-secondary] mt-1">{c.department_name}</div>
                        </CardContent>
                      </Card>
                    </Reveal>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Applications performance table */}
        <TabsContent value="applications">
          <Card className="rounded-xl border-[--border] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[--surface-alt]">
                  <tr>
                    <th className="text-left p-4 text-[--text-secondary] font-medium">Challenge</th>
                    <th className="text-left p-4 text-[--text-secondary] font-medium">Round</th>
                    <th className="text-left p-4 text-[--text-secondary] font-medium">Score</th>
                    <th className="text-left p-4 text-[--text-secondary] font-medium">Status</th>
                    <th className="text-left p-4 text-[--text-secondary] font-medium">Rating Change</th>
                  </tr>
                </thead>
                <tbody>
                  {ratingHistory.map(rh => (
                    <tr key={rh.id} className="border-t border-[--border]">
                      <td className="p-4 font-medium text-[--text-primary]">{rh.challenge_title || `App #${rh.application}`}</td>
                      <td className="p-4 text-[--text-secondary]">{rh.round === 'round1_application' ? 'Round 1' : 'Round 2'}</td>
                      <td className="p-4 text-[--text-primary]">{rh.score}/50</td>
                      <td className="p-4 text-[--text-secondary]">—</td>
                      <td className="p-4 text-green-600 font-semibold">+{rh.delta}</td>
                    </tr>
                  ))}
                  {ratingHistory.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-[--text-secondary]">No rating history yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Awards & Badges */}
        <TabsContent value="badges">
          <div className="space-y-8">
            {/* Earned badges grid */}
            <div>
              <h2 className="text-lg font-semibold text-[--text-primary] mb-4">Your Badges</h2>
              {badges.length > 0 ? (
                <div className="flex flex-wrap gap-6">
                  {badges.map(b => (
                    <BadgeIcon key={b.badge_key} badgeKey={b.badge_key} size={64} showLabel earnedAt={b.earned_at} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No badges earned yet — submit your first application to start.</p>
              )}
            </div>

            {/* Tier progression strip — R10 with /2000 + bar */}
            <div>
              <h2 className="text-lg font-semibold text-[--text-primary] mb-4">Rating Tiers</h2>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xl font-space-grotesk font-bold text-[--text-primary]">{rating} / 2000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="h-2 rounded-full bg-[--accent]"
                     style={{ width: `${Math.min(rating, 2000) / 2000 * 100}%` }} />
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {RATING_TIERS.map(t => {
                  const isActive = tier.label === t.label;
                  return (
                    <div key={t.label}
                         className={`flex flex-col items-center transition-transform ${isActive ? 'scale-110' : ''}`}
                         style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(79,70,229,0.4))' } : {}}>
                      <BadgeIcon
                        badgeKey={`tier_${t.label}`}
                        shieldColor={t.shieldColor}
                        iconName="Star"
                        size={isActive ? 56 : 44}
                        showLabel
                      />
                      <span className="text-[10px] text-gray-400 mt-0.5">{t.min}+</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Badge elements guide */}
            <div className="pt-4 border-t border-[--border]">
              <h3 className="text-sm font-semibold text-[--text-secondary] mb-3">Badge Elements Guide</h3>
              <div className="flex flex-wrap gap-4">
                {BADGE_ELEMENTS.map(e => (
                  <div key={e.label} className="flex items-center gap-2 text-xs text-[--text-secondary]">
                    <span className="text-base">{e.icon}</span>
                    <span>{e.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Activity log */}
        <TabsContent value="activity">
          <Card className="rounded-xl border-[--border] shadow-sm">
            <CardContent className="pt-6">
              {auditLogs.length === 0 ? (
                <p className="text-sm text-[--text-secondary]">No activity yet.</p>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <Activity size={14} className="text-gray-400 shrink-0" />
                      <span className="text-[--text-secondary] flex-1">{log.action}</span>
                      <span className="text-xs text-gray-400">{getRelativeTime(log.timestamp)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
