import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useSpring } from 'motion/react';
import {
  ArrowLeft, Building2, IndianRupee, Clock, FileText,
  Target, CheckCircle, Lightbulb, Zap
} from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/toast';
import { ShimmerButton } from '../components/ShimmerButton';

const SECTOR_COLORS = {
  healthtech: '#4F46E5', 'defense-tech': '#475569',
  agritech: '#10B981', fintech: '#F59E0B', cleantech: '#0D9488',
};
const getSC = (tags) => {
  const t = (Array.isArray(tags) ? tags[0] : String(tags || '').split(',')[0])?.trim().toLowerCase();
  return SECTOR_COLORS[t] ?? '#4F46E5';
};

const FIELD = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1.5px solid #E2E8F0', background: '#F8FAFC',
  fontSize: 14, color: '#0B0F19', outline: 'none',
  boxSizing: 'border-box', fontFamily: "'Inter',sans-serif",
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

function Field({ label, value, onChange, placeholder, type = 'text', required, hint }) {
  const [f, setF] = useState(false);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</label>
        {hint && <span style={{ fontSize: 11, color: '#94A3B8' }}>{hint}</span>}
      </div>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{ ...FIELD, height: 44, borderColor: f ? '#4F46E5' : '#E2E8F0', boxShadow: f ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none' }} />
    </div>
  );
}

// 3D tilt card
function TiltCard({ children, style }) {
  const ref = useRef(null);
  const rx = useSpring(0, { stiffness: 180, damping: 20 });
  const ry = useSpring(0, { stiffness: 180, damping: 20 });
  const onMove = useCallback((e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    rx.set(((e.clientY - r.top) / r.height - 0.5) * -8);
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 8);
  }, [rx, ry]);
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={() => { rx.set(0); ry.set(0); }}
      style={{ ...style, rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d', perspective: 800 }}
    >{children}</motion.div>
  );
}

const fmt = (n) => n ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n) : 'N/A';

export default function ApplyToChallenge() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ solution_brief: '', proposed_timeline: '', budget_quote: '' });
  const [briefFocus, setBriefFocus] = useState(false);

  useEffect(() => {
    api.getChallenge(id).then(setChallenge).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createApplication({
        challenge: parseInt(id, 10),
        solution_brief: form.solution_brief,
        proposed_timeline: form.proposed_timeline ? parseInt(form.proposed_timeline, 10) : null,
        budget_quote: form.budget_quote ? parseInt(form.budget_quote, 10) : null,
      });
      setSubmitted(true);
      setTimeout(() => navigate('/my-applications'), 1800);
    } catch (err) {
      let msg = 'Failed to submit application';
      try { const p = JSON.parse(err.message); msg = Object.entries(p).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | '); } catch (_) { if (!err.message?.startsWith('{')) msg = err.message; }
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ padding: 24, color: '#94A3B8', fontSize: 14 }}>Loading…</div>;
  if (!challenge) return <div style={{ padding: 24, color: '#94A3B8', fontSize: 14 }}>Challenge not found.</div>;

  const sectorColor = getSC(challenge.sector_tags);
  const tags = (Array.isArray(challenge.sector_tags) ? challenge.sector_tags : String(challenge.sector_tags || '').split(',')).filter(Boolean);

  return (
    <div style={{ fontFamily: "'Inter',sans-serif" }}>
      {/* Back */}
      <motion.button onClick={() => navigate('/discover')} whileHover={{ x: -3 }}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0 }}>
        <ArrowLeft size={16} /> Back to Challenges
      </motion.button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        {/* ── Left: challenge info ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Hero card */}
          <TiltCard style={{ borderRadius: 20, overflow: 'hidden', background: '#fff', border: `1px solid ${sectorColor}22`, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ height: 5, background: `linear-gradient(90deg, ${sectorColor}, ${sectorColor}55)`, boxShadow: `0 0 12px ${sectorColor}55` }} />
            <div style={{ padding: '24px 28px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {tags.map(t => (
                  <span key={t} style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: `${getSC(t)}15`, color: getSC(t), border: `1px solid ${getSC(t)}33`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.trim()}</span>
                ))}
              </div>
              <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 800, color: '#0B0F19', lineHeight: 1.3, marginBottom: 10 }}>
                {challenge.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#64748B', marginBottom: 18 }}>
                <Building2 size={14} />
                {challenge.department_name || `Dept #${challenge.department}`}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { icon: IndianRupee, label: 'Budget', value: fmt(challenge.budget_ceiling), color: sectorColor },
                  { icon: Clock,       label: 'Timeline', value: `${challenge.timeline_weeks} weeks`, color: '#64748B' },
                ].map(s => (
                  <div key={s.label} style={{ background: '#F8FAFC', borderRadius: 10, padding: '12px 14px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
                      <s.icon size={12} /> {s.label}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#0B0F19' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </TiltCard>

          {/* Info sections */}
          {[
            { icon: Lightbulb, title: 'Background', content: challenge.background },
            { icon: Target,    title: 'Outcome Metrics', content: challenge.outcome_metrics },
            ...(challenge.constraints ? [{ icon: Zap, title: 'Constraints', content: challenge.constraints }] : []),
          ].map(s => (
            <motion.div key={s.title}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: `${sectorColor}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={14} color={sectorColor} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0B0F19' }}>{s.title}</span>
              </div>
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{s.content}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Right: Application form ── */}
        <div style={{ position: 'sticky', top: 24 }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
            style={{ background: '#fff', borderRadius: 20, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
          >
            <div style={{ height: 4, background: `linear-gradient(90deg, ${sectorColor}, ${sectorColor}66)` }} />
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${sectorColor}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={16} color={sectorColor} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0B0F19' }}>Apply Now</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>Your application is timestamped</div>
                </div>
              </div>

              {submitted ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  style={{ textAlign: 'center', padding: '24px 16px' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 0 0 8px rgba(16,185,129,0.1)' }}>
                    <CheckCircle size={28} color="#10B981" />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0B0F19', marginBottom: 4 }}>Application Submitted!</div>
                  <div style={{ fontSize: 13, color: '#94A3B8' }}>Redirecting to your applications…</div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Solution brief */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Solution Brief</label>
                      <span style={{ fontSize: 11, color: form.solution_brief.length > 800 ? '#DC2626' : '#94A3B8' }}>
                        {form.solution_brief.length}/1000
                      </span>
                    </div>
                    <textarea value={form.solution_brief} onChange={e => setForm(p => ({ ...p, solution_brief: e.target.value }))}
                      placeholder="Describe your approach, technical solution, and why your team is uniquely positioned…"
                      rows={6} required maxLength={1000}
                      onFocus={() => setBriefFocus(true)} onBlur={() => setBriefFocus(false)}
                      style={{
                        ...FIELD, height: 'auto', resize: 'vertical', lineHeight: 1.6,
                        borderColor: briefFocus ? sectorColor : '#E2E8F0',
                        boxShadow: briefFocus ? `0 0 0 3px ${sectorColor}18` : 'none',
                      }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="Timeline (weeks)" type="number" value={form.proposed_timeline}
                      onChange={e => setForm(p => ({ ...p, proposed_timeline: e.target.value }))}
                      placeholder="e.g., 8" hint="Optional" />
                    <Field label="Budget Quote (₹)" type="number" value={form.budget_quote}
                      onChange={e => setForm(p => ({ ...p, budget_quote: e.target.value }))}
                      placeholder="e.g., 500000" hint="Optional" />
                  </div>

                  {/* Trust line */}
                  <div style={{ display: 'flex', gap: 6, background: '#F8FAFC', borderRadius: 8, padding: '10px 12px', border: '1px solid #E2E8F0' }}>
                    <CheckCircle size={14} color="#10B981" style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5 }}>
                      Your submission is timestamped and hash-sealed. DPIIT not required to apply.
                    </span>
                  </div>

                  <ShimmerButton type="submit" disabled={submitting}
                    background={`rgba(${parseInt(sectorColor.slice(1,3),16)},${parseInt(sectorColor.slice(3,5),16)},${parseInt(sectorColor.slice(5,7),16)},1)`}
                    shimmerColor="#ffffff" shimmerDuration="2.5s" borderRadius="12px"
                    className="w-full h-12 text-sm font-semibold text-white">
                    {submitting ? 'Submitting…' : 'Submit Application'}
                  </ShimmerButton>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
