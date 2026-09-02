import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Target, Rocket, TrendingUp, ArrowRight, Award, Wallet, Trophy, ShieldCheck, BarChart2, Users, Lock } from 'lucide-react';
import { api } from '../lib/api';
import { NumberTicker } from '../components/NumberTicker';

function extractList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

const isNew = (dateStr) => {
  if (!dateStr) return false;
  return (Date.now() - new Date(dateStr)) < 7 * 86400000;
};

const SECTOR_COLORS = {
  healthtech: '#4F46E5', 'defense-tech': '#475569',
  agritech: '#10B981', fintech: '#F59E0B', cleantech: '#0F766E',
};
const getSectorColor = (tags) => {
  const tag = (Array.isArray(tags) ? tags[0] : String(tags || '').split(',')[0])?.trim();
  return SECTOR_COLORS[tag?.toLowerCase()] ?? '#4F46E5';
};

const WHY_ITEMS = [
  { icon: Award,      title: 'Win Government Contracts',   desc: 'Top solutions get the opportunity to work with government departments.' },
  { icon: Wallet,     title: 'Funding & Support',          desc: 'Qualified finalists receive funding to build and test their prototypes.' },
  { icon: TrendingUp, title: 'Boost Your Rating',          desc: 'Improve your startup rating and unlock more opportunities.' },
  { icon: Trophy,     title: 'Earn Recognition',           desc: 'Get achievement badges and showcase your impact.' },
];

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: 'DPIIT Verified Platform' },
  { icon: BarChart2,   label: 'Transparent Evaluation' },
  { icon: Users,       label: 'Equal Opportunity' },
  { icon: Lock,        label: 'Data Security' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [stats,      setStats]      = useState({ challenges: 0, startups: 0, pilots: 0 });
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [statsData, chalData] = await Promise.allSettled([
          api.getPublicStats(),
          api.getChallenges().catch(() => []),
        ]);
        if (statsData.status === 'fulfilled') {
          const d = statsData.value;
          setStats({ challenges: d.open_challenges ?? 0, startups: d.startups ?? 0, pilots: d.pilots_scaled ?? 0 });
        }
        if (chalData.status === 'fulfilled') {
          const list = extractList(chalData.value);
          setChallenges(list.filter(c => c.status === 'open').slice(0, 3));
        }
      } catch (_) {}
    })();
  }, []);

  const formatCurrency = (n) => n
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
    : 'N/A';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E17', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Top Nav ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 40px',
        background: 'rgba(10,14,23,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: 'conic-gradient(from 0deg, #FF9933 0deg 120deg, #ffffff 120deg 240deg, #138808 240deg 360deg)',
            boxShadow: '0 0 12px rgba(255,153,51,0.45)',
          }} />
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700, color: '#fff' }}>
            GovLaunch
          </span>
        </div>

        {/* Centre links */}
        <div style={{ display: 'flex', gap: 28 }}>
          {[
            { label: 'Home',               href: '/' },
            { label: 'Problem Statements', href: '/discover' },
            { label: 'How It Works',       href: '#why' },
          ].map(l => (
            <a key={l.label} href={l.href}
               style={{ color: '#94A3B8', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'color .15s' }}
               onMouseEnter={e => e.target.style.color='#fff'}
               onMouseLeave={e => e.target.style.color='#94A3B8'}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Auth buttons — R9: both go to /login */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '8px 16px' }}>
            Log In
          </button>
          <button onClick={() => navigate('/login')}
            style={{
              background: 'none', border: '1px solid #0F766E', color: '#0F766E',
              fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '8px 20px', borderRadius: 8,
            }}
            onMouseEnter={e => { e.currentTarget.style.background='#0F766E'; e.currentTarget.style.color='#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='#0F766E'; }}
          >
            Government Login
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px' }}>
        {/* Animated tricolor mesh */}
        <motion.div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `
            radial-gradient(circle at 18% 25%, rgba(255,153,51,0.28) 0%, transparent 45%),
            radial-gradient(circle at 78% 72%, rgba(19,136,8,0.24) 0%, transparent 45%),
            radial-gradient(circle at 52% 48%, rgba(0,0,128,0.20) 0%, transparent 55%)`,
          backgroundSize: '200% 200%',
        }}
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
        />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 700 }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 100, padding: '6px 16px', marginBottom: 32,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF9933', boxShadow: '0 0 8px #FF9933' }} />
            <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500, letterSpacing: '0.08em' }}>DIGITAL INDIA · STARTUP INDIA</span>
          </div>

          <h1 style={{
            fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(36px,5vw,62px)',
            fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 24,
          }}>
            Where Startups{' '}
            <span style={{ background: 'linear-gradient(90deg,#FF9933,#138808)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Meet the State
            </span>
          </h1>
          <p style={{ fontSize: 18, color: '#94A3B8', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 40px' }}>
            Government departments post real problems. Startups compete on merit — not paperwork. Every bid timestamped, every contract auto-drafted.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login')} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff',
              fontWeight: 600, fontSize: 15, padding: '14px 28px', borderRadius: 10, border: 'none',
              cursor: 'pointer', boxShadow: '0 4px 20px rgba(79,70,229,0.4)',
            }}>
              Browse Open Challenges <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/login')} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#E2E8F0', fontWeight: 500, fontSize: 15, padding: '14px 28px', borderRadius: 10, cursor: 'pointer',
            }}>
              I'm a Government Department <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>

        {/* Stat cards */}
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
          style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginTop: 72, width: '100%', maxWidth: 640 }}>
          <StatCard icon={Target}     value={stats.challenges} label="Open Challenges"    accent="#FF9933" />
          <StatCard icon={Rocket}     value={stats.startups}   label="Startups Competing" accent="#138808" />
          <StatCard icon={TrendingUp} value={stats.pilots}     label="Pilots Scaled"      accent="#4F46E5" />
        </motion.div>
      </div>

      {/* ── Active Problem Statements ── */}
      <div style={{ background: '#0A0E17', padding: '80px 40px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 32, textAlign: 'center' }}>
          Active Problem Statements
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
          {challenges.length === 0
            ? [1,2,3].map(i => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, height: 160, opacity: 0.4 }} />
              ))
            : challenges.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay: i*0.07 }}
                  onClick={() => navigate('/login')}
                  style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: 16, padding: 24, cursor: 'pointer', position: 'relative',
                    borderLeft: `4px solid ${getSectorColor(c.sector_tags)}`,
                    transition: 'background .15s',
                  }}
                  whileHover={{ background: 'rgba(255,255,255,0.07)' }}
                >
                  {isNew(c.created_at) && (
                    <span style={{
                      position: 'absolute', top: 12, right: 12,
                      background: '#FF9933', color: '#0A0E17', fontSize: 10, fontWeight: 700,
                      padding: '2px 8px', borderRadius: 100, letterSpacing: '0.06em',
                    }}>NEW</span>
                  )}
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 6, paddingRight: 40 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>{c.department_name}</div>
                  <div style={{ fontSize: 13, color: '#64748B' }}>
                    {formatCurrency(c.budget_ceiling)} · {c.timeline_weeks}w
                  </div>
                </motion.div>
              ))
          }
        </div>
      </div>

      {/* ── Why Participate ── */}
      <div id="why" style={{ background: '#0D1220', padding: '80px 40px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 48, textAlign: 'center' }}>
          Why Participate
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 24, maxWidth: 900, margin: '0 auto' }}>
          {WHY_ITEMS.map(item => (
            <div key={item.title} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: 24,
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(79,70,229,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <item.icon size={22} color="#4F46E5" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 8 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Trust footer ── */}
      <div style={{
        background: '#0A0E17', padding: '32px 40px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 32,
      }}>
        {TRUST_ITEMS.map(t => (
          <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <t.icon size={16} color="#64748B" />
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Stat card inside hero
function StatCard({ icon: Icon, value, label, accent }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16, padding: '24px 20px', textAlign: 'center', backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: `${accent}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
      }}>
        <Icon size={22} color={accent} />
      </div>
      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: 1, marginBottom: 6 }}>
        <NumberTicker value={value} className="" />
      </div>
      <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// Missing ChevronRight import
function ChevronRight({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
