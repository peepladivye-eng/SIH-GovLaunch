import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Shield, Clock, User, Activity, Search, Filter } from 'lucide-react';
import { api } from '../lib/api';

const ACTION_COLORS = {
  'Submitted application':   { bg: '#EEF2FF', text: '#4F46E5', dot: '#4F46E5' },
  'Generated contract':       { bg: '#ECFDF5', text: '#059669', dot: '#10B981' },
  'Ran novelty check':        { bg: '#F0FDFA', text: '#0D9488', dot: '#0D9488' },
  'Updated AI provider config':{ bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B' },
  'Submitted evaluation':     { bg: '#F5F3FF', text: '#7C3AED', dot: '#8B5CF6' },
  'Started prototype phase':  { bg: '#FFF7ED', text: '#C2410C', dot: '#EA580C' },
  'Posted challenge':         { bg: '#F0FDF4', text: '#166534', dot: '#16A34A' },
};
const getActionColor = (action) => {
  for (const key of Object.keys(ACTION_COLORS)) {
    if (action?.includes(key)) return ACTION_COLORS[key];
  }
  return { bg: '#F8FAFC', text: '#475569', dot: '#94A3B8' };
};

function StatPill({ icon: Icon, value, label, accent }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45 }}
      style={{ borderRadius: 14, padding: '18px 20px', background: '#fff',
        border: `1px solid ${accent}22`, boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        position: 'relative', overflow: 'hidden' }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: `${accent}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Icon size={18} color={accent} />
      </div>
      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 800, color: '#0B0F19', lineHeight: 1, marginBottom: 3 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: '#64748B' }}>{label}</div>
      <motion.div initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}} transition={{ duration: 0.6, delay: 0.2 }}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${accent}, ${accent}44)`, transformOrigin: 'left' }} />
    </motion.div>
  );
}

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getAuditLogs().then(d => setLogs(Array.isArray(d) ? d : d?.results ?? [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const relTime = (d) => {
    const diff = Date.now() - new Date(d);
    const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), dy = Math.floor(diff / 86400000);
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${dy}d ago`;
  };

  const filtered = logs.filter(l => !search ||
    l.actor?.toLowerCase().includes(search.toLowerCase()) ||
    l.action?.toLowerCase().includes(search.toLowerCase())
  );

  const uniqueActors  = [...new Set(logs.map(l => l.actor))].length;
  const uniqueActions = [...new Set(logs.map(l => l.action))].length;
  const recent24h     = logs.filter(l => (Date.now() - new Date(l.timestamp)) < 86400000).length;

  return (
    <div style={{ fontFamily: "'Inter',sans-serif" }}>
      {/* Dark header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{
          position: 'relative', overflow: 'hidden', borderRadius: 20, marginBottom: 28,
          background: 'linear-gradient(135deg, #0D1117 0%, #0A0E1A 55%, #0C1020 100%)',
          border: '1px solid rgba(255,255,255,0.08)', padding: '28px 32px',
        }}
      >
        <motion.div animate={{ x: [0,16,0], y: [0,-10,0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(220,38,38,0.2) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(220,38,38,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(220,38,38,0.25)' }}>
            <Shield size={22} color="#FCA5A5" />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>
              Audit Trail
            </h1>
            <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>System activity log and compliance tracking</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
        <StatPill icon={Activity} value={logs.length}   label="Total Events"    accent="#4F46E5" />
        <StatPill icon={User}     value={uniqueActors}   label="Active Users"    accent="#0D9488" />
        <StatPill icon={Clock}    value={recent24h}      label="Last 24h Events" accent="#D97706" />
        <StatPill icon={Shield}   value={uniqueActions}  label="Action Types"    accent="#DC2626" />
      </div>

      {/* Log panel */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        {/* Search bar */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Search size={15} color="#94A3B8" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by actor or action…"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, color: '#0B0F19', background: 'transparent' }}
          />
          <span style={{ fontSize: 12, color: '#94A3B8', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 100, padding: '2px 10px' }}>
            {filtered.length} events
          </span>
        </div>

        {/* Log items */}
        <div style={{ maxHeight: 520, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>
              No audit logs yet.
            </div>
          ) : (
            filtered.slice(0, 60).map((log, i) => {
              const ac = getActionColor(log.action);
              return (
                <motion.div key={log.id || i}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.015 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 20px', borderBottom: i < filtered.length - 1 ? '1px solid #F8FAFC' : 'none',
                  }}
                >
                  {/* Actor avatar */}
                  <div style={{
                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                    background: ac.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${ac.dot}22`,
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: ac.text }}>
                      {(log.actor || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0B0F19' }}>{log.actor}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100,
                        background: ac.bg, color: ac.text, border: `1px solid ${ac.dot}33`,
                      }}>
                        {log.action}
                      </span>
                    </div>
                    {log.target && (
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{log.target}</div>
                    )}
                  </div>

                  <div style={{ fontSize: 11, color: '#CBD5E1', flexShrink: 0 }}>
                    {log.timestamp && relTime(log.timestamp)}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
