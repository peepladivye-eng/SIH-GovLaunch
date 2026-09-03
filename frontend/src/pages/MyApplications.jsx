import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useSpring, useInView } from 'motion/react';
import { AlertCircle, Building2, IndianRupee, Clock, FileText, ArrowRight, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';
import TierBadge from '../components/TierBadge';

const STAGES = [
  { key: 'submitted',       label: 'Submitted',       color: '#94A3B8' },
  { key: 'screening',       label: 'Screening',       color: '#818CF8' },
  { key: 'eligible',        label: 'Eligible',        color: '#34D399' },
  { key: 'under_evaluation',label: 'Evaluating',      color: '#FBBF24' },
  { key: 'shortlisted',     label: 'Shortlisted',     color: '#10B981' },
  { key: 'contracted',      label: 'Contracted',      color: '#059669' },
];

const STATUS_META = {
  submitted:        { gradient: 'linear-gradient(90deg,#818CF8,#A5B4FC)', label: 'Submitted' },
  screening:        { gradient: 'linear-gradient(90deg,#6366F1,#818CF8)', label: 'Screening' },
  eligible:         { gradient: 'linear-gradient(90deg,#10B981,#34D399)', label: 'Eligible' },
  under_evaluation: { gradient: 'linear-gradient(90deg,#F59E0B,#FBBF24)', label: 'Under Evaluation' },
  shortlisted:      { gradient: 'linear-gradient(90deg,#059669,#10B981)', label: 'Shortlisted' },
  contracted:       { gradient: 'linear-gradient(90deg,#047857,#059669)', label: 'Contracted' },
  rejected:         { gradient: 'linear-gradient(90deg,#DC2626,#EF4444)', label: 'Rejected' },
  ineligible:       { gradient: 'linear-gradient(90deg,#6B7280,#9CA3AF)', label: 'Ineligible' },
};

// 3D tilt card
function TiltCard({ children, style, onClick }) {
  const ref = useRef(null);
  const rx = useSpring(0, { stiffness: 180, damping: 20 });
  const ry = useSpring(0, { stiffness: 180, damping: 20 });
  const onMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    rx.set(((e.clientY - rect.top) / rect.height - 0.5) * -8);
    ry.set(((e.clientX - rect.left) / rect.width - 0.5) * 8);
  }, [rx, ry]);
  return (
    <motion.div ref={ref} onMouseMove={onMove}
      onMouseLeave={() => { rx.set(0); ry.set(0); }}
      onClick={onClick}
      style={{ ...style, rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d', perspective: 800, cursor: 'pointer' }}
      whileHover={{ scale: 1.01, boxShadow: '0 12px 36px rgba(0,0,0,0.1)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      {children}
    </motion.div>
  );
}

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}>
      {children}
    </motion.div>
  );
}

export default function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyApplications()
      .then(d => setApplications(Array.isArray(d) ? d : (d?.results ?? [])))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => n != null
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
    : null;

  const getStageIdx = (status) => {
    const norm = String(status || '').toLowerCase().replace(/\s+/g, '_');
    const idx = STAGES.findIndex(s => s.key === norm);
    return idx >= 0 ? idx : 0;
  };

  const active    = applications.filter(a => !['rejected','ineligible','contracted'].includes(a.status));
  const completed = applications.filter(a => ['contracted'].includes(a.status));
  const rejected  = applications.filter(a => ['rejected','ineligible'].includes(a.status));

  return (
    <div style={{ fontFamily: "'Inter',sans-serif" }}>
      {/* ── Dark header ── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{
          position: 'relative', overflow: 'hidden', borderRadius: 20, marginBottom: 28,
          background: 'linear-gradient(135deg, #0D1117 0%, #0A0E1A 55%, #0C1020 100%)',
          border: '1px solid rgba(255,255,255,0.08)', padding: '28px 32px',
        }}
      >
        <motion.div animate={{ x: [0,22,0], y: [0,-14,0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -50, right: -50, width: 260, height: 260, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)', filter: 'blur(35px)', pointerEvents: 'none' }} />
        <motion.div animate={{ x: [0,-14,0], y: [0,18,0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)', filter: 'blur(35px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99,102,241,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
              <FileText size={22} color="#818CF8" />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>
                My Applications
              </h1>
              <p style={{ fontSize: 13, color: '#64748B', margin: '2px 0 0' }}>
                {applications.length} total · {active.length} active · {completed.length} contracted
              </p>
            </div>
          </div>
          {/* Stats pills */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'Active',     value: active.length,    color: '#818CF8' },
              { label: 'Won',        value: completed.length, color: '#10B981' },
              { label: 'Rejected',   value: rejected.length,  color: '#EF4444' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '8px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Empty state ── */}
      {!loading && applications.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <FileText size={28} color="#4F46E5" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#0B0F19', marginBottom: 6 }}>No applications yet</div>
          <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 20 }}>Browse challenges and apply to get started.</div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/discover')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', fontWeight: 600, fontSize: 14 }}>
            Discover Challenges <ArrowRight size={16} />
          </motion.button>
        </div>
      )}

      {/* ── Application cards ── */}
      {!loading && applications.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {applications.map((app, i) => {
            const stageIdx    = getStageIdx(app.status);
            const normStatus  = String(app.status || '').toLowerCase();
            const isRejected  = normStatus === 'rejected' || normStatus === 'ineligible';
            const isWon       = normStatus === 'contracted';
            const meta        = STATUS_META[normStatus] ?? STATUS_META.submitted;
            const pct         = ((stageIdx + 1) / STAGES.length) * 100;
            const brief       = app.solution_brief?.slice(0, 110) + (app.solution_brief?.length > 110 ? '…' : '');

            return (
              <Reveal key={app.id || i} delay={i * 0.06}>
                <TiltCard
                  onClick={() => navigate(`/applications/${app.id}`)}
                  style={{ borderRadius: 16, background: '#fff', border: isWon ? '1px solid #A7F3D0' : isRejected ? '1px solid #FECACA' : '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
                >
                  {/* Status top bar */}
                  <div style={{ height: 4, background: meta.gradient }} />

                  <div style={{ padding: '18px 22px' }}>
                    {/* Header row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0B0F19', marginBottom: 4, lineHeight: 1.3 }}>
                          {app.challenge_title || 'Challenge Application'}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748B' }}>
                          <Building2 size={13} />
                          {app.department_name || `Dept #${app.challenge}`}
                        </div>
                        {brief && (
                          <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 6, fontStyle: 'italic', lineHeight: 1.5 }}>
                            "{brief}"
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                        {/* Status pill */}
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: isRejected ? '#FEE2E2' : isWon ? '#D1FAE5' : '#EEF2FF', color: isRejected ? '#DC2626' : isWon ? '#059669' : '#4F46E5' }}>
                          {meta.label}
                        </span>
                        {app.startup_registration_status && (
                          <TierBadge registrationStatus={app.startup_registration_status} />
                        )}
                      </div>
                    </div>

                    {/* Progress track */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ position: 'relative', height: 6, background: '#F1F5F9', borderRadius: 100, overflow: 'hidden', marginBottom: 8 }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 + i * 0.05 }}
                          style={{ position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: 100, background: isRejected ? '#EF4444' : meta.gradient }}
                        />
                      </div>
                      {/* Stage dots */}
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        {STAGES.map((stage, idx) => {
                          const isActive = idx === stageIdx;
                          const isPast = idx < stageIdx;
                          return (
                            <div key={stage.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                              <div style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: isActive ? stage.color : isPast ? '#C7D2FE' : '#E2E8F0',
                                boxShadow: isActive ? `0 0 6px ${stage.color}` : 'none',
                                transition: 'all 0.3s',
                              }} />
                              <span style={{ fontSize: 9.5, color: isActive ? '#0B0F19' : '#CBD5E1', fontWeight: isActive ? 700 : 400 }}>
                                {stage.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Rejection notice */}
                    {isRejected && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#DC2626', background: '#FEF2F2', padding: '7px 12px', borderRadius: 8, marginBottom: 12 }}>
                        <AlertCircle size={14} />
                        Not selected for this round
                      </div>
                    )}
                    {isWon && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#059669', background: '#ECFDF5', padding: '7px 12px', borderRadius: 8, marginBottom: 12 }}>
                        <CheckCircle size={14} />
                        Contract won! 🎉
                      </div>
                    )}

                    {/* Footer row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #F8FAFC' }}>
                      <div style={{ display: 'flex', gap: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                          <IndianRupee size={14} color="#94A3B8" />
                          <span style={{ color: app.budget_quote != null ? '#0B0F19' : '#CBD5E1', fontWeight: app.budget_quote != null ? 600 : 400 }}>
                            {fmt(app.budget_quote) ?? 'No quote'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                          <Clock size={14} color="#94A3B8" />
                          <span style={{ color: app.proposed_timeline != null ? '#0B0F19' : '#CBD5E1', fontWeight: app.proposed_timeline != null ? 600 : 400 }}>
                            {app.proposed_timeline != null ? `${app.proposed_timeline}w` : 'No timeline'}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#94A3B8' }}>
                        View details <ArrowRight size={13} />
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
