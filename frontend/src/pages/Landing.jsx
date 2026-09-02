import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Target, Rocket, TrendingUp, ArrowRight, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { NumberTicker } from '../components/NumberTicker';

function extractList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  return [];
}
function extractCount(data) {
  if (!data) return 0;
  if (Array.isArray(data)) return data.length;
  if (typeof data.count === 'number') return data.count;
  if (Array.isArray(data.results)) return data.results.length;
  return 0;
}

export default function Landing() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ challenges: 0, startups: 0, pilots: 0 });

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getPublicStats();
        setStats({
          challenges: data.open_challenges ?? 0,
          startups:   data.startups        ?? 0,
          pilots:     data.pilots_scaled   ?? 0,
        });
      } catch (_) {}
    })();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E17', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 40px',
        background: 'rgba(10,14,23,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: 'conic-gradient(from 0deg, #FF9933 0deg 120deg, #ffffff 120deg 240deg, #138808 240deg 360deg)',
            boxShadow: '0 0 14px rgba(255,153,51,0.5)',
          }} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: '#fff' }}>
            GovLaunch
          </span>
        </div>

        {/* Nav actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '8px 16px' }}
          >
            Log In
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: '1px solid #0F766E',
              color: '#0F766E',
              fontSize: 14, fontWeight: 500,
              cursor: 'pointer',
              padding: '8px 20px',
              borderRadius: 8,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.target.style.background = '#0F766E'; e.target.style.color = '#fff'; }}
            onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.color = '#0F766E'; }}
          >
            Government Portal
          </button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px' }}>

        {/* Animated tricolor mesh — same as login left col */}
        <motion.div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `
              radial-gradient(circle at 18% 25%, rgba(255,153,51,0.30) 0%, transparent 45%),
              radial-gradient(circle at 78% 72%, rgba(19,136,8,0.26) 0%, transparent 45%),
              radial-gradient(circle at 52% 48%, rgba(0,0,128,0.22) 0%, transparent 55%)
            `,
            backgroundSize: '200% 200%',
          }}
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
        />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 680 }}
        >
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 100, padding: '6px 16px',
            marginBottom: 32,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF9933', boxShadow: '0 0 8px #FF9933' }} />
            <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500, letterSpacing: '0.08em' }}>
              DIGITAL INDIA · STARTUP INDIA
            </span>
          </div>

          {/* H1 */}
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(36px, 5vw, 62px)',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.1,
            marginBottom: 24,
          }}>
            Where Startups{' '}
            <span style={{
              background: 'linear-gradient(90deg, #FF9933, #138808)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Meet the State
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: 18, color: '#94A3B8', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 40px' }}>
            Government departments post real problems. Startups compete on merit — not paperwork. Every bid timestamped, every contract auto-drafted.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                color: '#fff', fontWeight: 600, fontSize: 15,
                padding: '14px 28px', borderRadius: 10, border: 'none',
                cursor: 'pointer', boxShadow: '0 4px 20px rgba(79,70,229,0.4)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(79,70,229,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(79,70,229,0.4)'; }}
            >
              Browse Open Challenges
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => navigate('/login')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#E2E8F0', fontWeight: 500, fontSize: 15,
                padding: '14px 28px', borderRadius: 10,
                cursor: 'pointer', backdropFilter: 'blur(8px)',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            >
              I'm a Government Department
              <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>

        {/* ── Stats strip ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
          style={{
            position: 'relative', zIndex: 1,
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24, marginTop: 72, width: '100%', maxWidth: 640,
          }}
        >
          <StatCard icon={Target}     value={stats.challenges} label="Open Challenges"   accent="#FF9933" />
          <StatCard icon={Rocket}     value={stats.startups}   label="Startups Competing" accent="#138808" />
          <StatCard icon={TrendingUp} value={stats.pilots}     label="Pilots Scaled"      accent="#4F46E5" />
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, accent }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: '24px 20px',
      textAlign: 'center',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${accent}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 12px',
      }}>
        <Icon size={22} color={accent} />
      </div>
      <div style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: 1,
        marginBottom: 6,
      }}>
        <NumberTicker
          value={value}
          className=""
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 700, color: '#fff' }}
        />
      </div>
      <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{label}</div>
    </div>
  );
}