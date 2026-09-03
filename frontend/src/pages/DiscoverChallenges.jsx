import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useSpring } from 'motion/react';
import { Search, Filter, IndianRupee, Clock, Building2, Target, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';

const SECTOR_COLORS = {
  healthtech:    { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE', glow: 'rgba(79,70,229,0.15)' },
  'defense-tech':{ bg: '#F1F5F9', text: '#475569', border: '#CBD5E1', glow: 'rgba(71,85,105,0.15)' },
  agritech:      { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0', glow: 'rgba(5,150,105,0.15)' },
  fintech:       { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A', glow: 'rgba(217,119,6,0.15)' },
  cleantech:     { bg: '#F0FDFA', text: '#0D9488', border: '#99F6E4', glow: 'rgba(13,148,136,0.15)' },
};

const getSectorColor = (tags) => {
  const t = (Array.isArray(tags) ? tags[0] : String(tags || '').split(',')[0])?.trim().toLowerCase();
  return SECTOR_COLORS[t] ?? { bg: '#F8FAFC', text: '#4F46E5', border: '#E2E8F0', glow: 'rgba(79,70,229,0.15)' };
};

// 3D tilt card
function TiltCard({ children, style, onClick }) {
  const ref = useRef(null);
  const rx = useSpring(0, { stiffness: 200, damping: 22 });
  const ry = useSpring(0, { stiffness: 200, damping: 22 });
  const glowX = useSpring(50, { stiffness: 200, damping: 22 });
  const glowY = useSpring(50, { stiffness: 200, damping: 22 });

  const onMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rx.set((py - 0.5) * -12); ry.set((px - 0.5) * 12);
    glowX.set(px * 100); glowY.set(py * 100);
  }, [rx, ry, glowX, glowY]);

  return (
    <motion.div ref={ref} onMouseMove={onMove}
      onMouseLeave={() => { rx.set(0); ry.set(0); glowX.set(50); glowY.set(50); }}
      onClick={onClick}
      style={{ ...style, rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d', perspective: 800, position: 'relative', overflow: 'hidden' }}
      whileHover={{ scale: 1.02, boxShadow: '0 16px 48px rgba(0,0,0,0.1)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <motion.div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
        background: `radial-gradient(circle at ${glowX.get()}% ${glowY.get()}%, rgba(255,255,255,0.12) 0%, transparent 60%)`,
      }} />
      {children}
    </motion.div>
  );
}

export default function DiscoverChallenges() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', sector: 'All', department: 'All', minBudget: '', maxBudget: '' });

  useEffect(() => {
    (async () => {
      try {
        const [chals, depts] = await Promise.all([api.getChallenges(), api.getDepartments()]);
        setChallenges((Array.isArray(chals) ? chals : chals?.results ?? []).filter(c => c.status === 'open'));
        setDepartments(Array.isArray(depts) ? depts : depts?.results ?? []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const fmt = (n) => n ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n) : 'N/A';
  const f = filters;
  const filtered = challenges.filter(c => {
    if (f.search && !c.title.toLowerCase().includes(f.search.toLowerCase())) return false;
    if (f.sector !== 'All') {
      const tags = Array.isArray(c.sector_tags) ? c.sector_tags : String(c.sector_tags || '').split(',');
      if (!tags.some(t => t.trim().toLowerCase() === f.sector.toLowerCase())) return false;
    }
    if (f.department !== 'All' && String(c.department) !== String(f.department)) return false;
    if (f.minBudget && Number(c.budget_ceiling) < Number(f.minBudget)) return false;
    if (f.maxBudget && Number(c.budget_ceiling) > Number(f.maxBudget)) return false;
    return true;
  });

  const inputStyle = {
    width: '100%', height: 38, padding: '0 12px', borderRadius: 8,
    border: '1.5px solid #E2E8F0', background: '#F8FAFC',
    fontSize: 13, color: '#0B0F19', outline: 'none', boxSizing: 'border-box',
  };
  const selectStyle = { ...inputStyle, appearance: 'none', cursor: 'pointer' };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Filter sidebar ── */}
      <div style={{
        width: 272, background: '#fff', borderRight: '1px solid #E2E8F0',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0,
      }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Filter size={16} color="#4F46E5" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0B0F19' }}>Filters</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>{filtered.length} results</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Search */}
          <div>
            <label style={labelStyle}>Search</label>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input style={{ ...inputStyle, paddingLeft: 30 }} placeholder="Search challenges…"
                value={f.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} />
            </div>
          </div>

          {/* Sector chips */}
          <div>
            <label style={labelStyle}>Sector</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['All', 'healthtech', 'defense-tech', 'agritech', 'fintech', 'cleantech'].map(s => {
                const active = f.sector === s;
                const sc = getSectorColor(s);
                return (
                  <motion.button key={s} whileTap={{ scale: 0.95 }}
                    onClick={() => setFilters(p => ({ ...p, sector: s }))}
                    style={{
                      padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      background: active ? sc.bg : '#F8FAFC',
                      color: active ? sc.text : '#94A3B8',
                      border: `1.5px solid ${active ? sc.border : '#E2E8F0'}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    {s === 'All' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Department */}
          <div>
            <label style={labelStyle}>Department</label>
            <select style={selectStyle} value={f.department} onChange={e => setFilters(p => ({ ...p, department: e.target.value }))}>
              <option value="All">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          {/* Budget */}
          <div>
            <label style={labelStyle}>Budget Range (INR)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={{ ...inputStyle, flex: 1 }} type="number" placeholder="Min"
                value={f.minBudget} onChange={e => setFilters(p => ({ ...p, minBudget: e.target.value }))} />
              <input style={{ ...inputStyle, flex: 1 }} type="number" placeholder="Max"
                value={f.maxBudget} onChange={e => setFilters(p => ({ ...p, maxBudget: e.target.value }))} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid area ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', background: '#F8FAFC' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={20} color="#4F46E5" />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 800, color: '#0B0F19', margin: 0 }}>
                Discover Challenges
              </h1>
              <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
                {filtered.length} open challenge{filtered.length !== 1 ? 's' : ''} matching your filters
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ height: 200, borderRadius: 16, background: '#fff', border: '1px solid #E2E8F0',
                animation: 'pulse 2s infinite' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Search size={28} color="#4F46E5" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#0B0F19', marginBottom: 6 }}>No challenges found</div>
            <div style={{ fontSize: 14, color: '#94A3B8' }}>Try adjusting your filters</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
            {filtered.map((chal, index) => {
              const sc = getSectorColor(Array.isArray(chal.sector_tags) ? chal.sector_tags[0] : chal.sector_tags);
              const tags = (Array.isArray(chal.sector_tags) ? chal.sector_tags : String(chal.sector_tags || '').split(',')).filter(Boolean);
              return (
                <motion.div key={chal.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                >
                  <TiltCard
                    onClick={() => navigate(`/discover/${chal.id}`)}
                    style={{
                      borderRadius: 16, background: '#fff',
                      border: `1px solid ${sc.border}`,
                      cursor: 'pointer', overflow: 'hidden',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                    }}
                  >
                    {/* Top accent bar */}
                    <div style={{ height: 4, background: `linear-gradient(90deg, ${sc.text}, ${sc.text}66)`, boxShadow: `0 0 8px ${sc.glow}` }} />

                    <div style={{ padding: '18px 20px 20px' }}>
                      {/* Title + dept */}
                      <div style={{ marginBottom: 14 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0B0F19', lineHeight: 1.4, marginBottom: 5 }}>
                          {chal.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748B' }}>
                          <Building2 size={13} />
                          {chal.department_name || `Dept #${chal.department}`}
                        </div>
                      </div>

                      {/* Sector tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
                        {tags.map((tag, i) => {
                          const tsc = getSectorColor(tag);
                          return (
                            <span key={i} style={{
                              fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 100,
                              background: tsc.bg, color: tsc.text, border: `1px solid ${tsc.border}`,
                            }}>
                              {tag.trim()}
                            </span>
                          );
                        })}
                      </div>

                      {/* Stats row */}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        paddingTop: 14, borderTop: '1px solid #F1F5F9',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                          <IndianRupee size={14} color={sc.text} />
                          <span style={{ fontWeight: 700, color: '#0B0F19' }}>{fmt(chal.budget_ceiling)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                          <Clock size={14} color="#94A3B8" />
                          <span style={{ color: '#64748B' }}>{chal.timeline_weeks}w</span>
                        </div>
                      </div>

                      {/* CTA */}
                      <motion.div
                        whileHover={{ gap: 10 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14,
                          fontSize: 13, fontWeight: 600, color: sc.text, cursor: 'pointer' }}
                      >
                        View & Apply <ArrowRight size={14} />
                      </motion.div>
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
