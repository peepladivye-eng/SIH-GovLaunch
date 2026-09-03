import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useSpring } from 'motion/react';
import { Scale, ShieldCheck, Lock, CheckCircle, FileSignature, ArrowLeft, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/toast';
import TierBadge from '../components/TierBadge';
import { ShimmerButton } from '../components/ShimmerButton';

// SVG progress ring
function Ring({ pct, size = 40, color = '#0D9488' }) {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={3} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3}
        strokeLinecap="round"
        initial={{ strokeDasharray: `0 ${circ}` }}
        animate={{ strokeDasharray: `${fill} ${circ}` }}
        transition={{ duration: 0.5, ease: 'easeOut' }} />
    </svg>
  );
}

const FIELD = {
  width: '100%', padding: '8px 12px', borderRadius: 8,
  border: '1.5px solid #E2E8F0', background: '#F8FAFC',
  fontSize: 13, color: '#0B0F19', outline: 'none', boxSizing: 'border-box',
  fontFamily: "'Inter',sans-serif",
};

const CLAUSES = [
  {
    icon: Scale, key: 'ip', label: 'IP Clause',
    text: 'All intellectual property developed during this pilot project shall be jointly owned by the Department and the Startup. The Department shall have exclusive rights to use the solution for government purposes, while the Startup retains commercial rights for private sector deployment.',
  },
  {
    icon: ShieldCheck, key: 'data', label: 'Data Clause',
    text: 'All data collected during the pilot shall remain the property of the Government of India. The Startup shall not use, share, or disclose any government data without explicit written consent. Data anonymization protocols must be followed for any published research or case studies.',
  },
  {
    icon: Lock, key: 'cyber', label: 'Cybersecurity Checklist',
    text: 'The Startup must comply with all government cybersecurity standards, including data encryption at rest and in transit, multi-factor authentication, regular security audits, and incident reporting within 24 hours of any security breach.',
  },
];

export default function GenerateContract() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [milestones, setMilestones] = useState([
    { description: '', due_weeks: '', payment_percent: 34 },
    { description: '', due_weeks: '', payment_percent: 33 },
    { description: '', due_weeks: '', payment_percent: 33 },
  ]);

  useEffect(() => {
    api.getApplication(id).then(setApplication).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const totalPct = milestones.reduce((s, m) => s + (parseInt(m.payment_percent) || 0), 0);
  const canSubmit = totalPct === 100 && milestones.every(m => m.description && m.due_weeks);
  const requiresDpiit = application?.require_dpiit_recognition;
  const isDpiit = application?.startup_registration_status === 'dpiit_recognized';
  const canGenerate = !requiresDpiit || isDpiit;

  const setM = (i, field, value) => {
    const u = [...milestones]; u[i][field] = value; setMilestones(u);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createContract({ application: id, milestones });
      setShowSuccess(true);
      setTimeout(() => navigate('/challenges'), 400);
    } catch (err) {
      let msg = 'Failed to generate contract';
      try { msg = JSON.parse(err.message).detail || msg; } catch (_) {}
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ padding: 24, color: '#94A3B8', fontSize: 14 }}>Loading…</div>;
  if (!application) return <div style={{ padding: 24, color: '#94A3B8', fontSize: 14 }}>Application not found.</div>;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', fontFamily: "'Inter',sans-serif" }}>
      {/* Back */}
      <motion.button onClick={() => navigate(-1)} whileHover={{ x: -3 }}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0 }}>
        <ArrowLeft size={16} /> Back
      </motion.button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{
          position: 'relative', overflow: 'hidden', borderRadius: 18, marginBottom: 24,
          background: 'linear-gradient(135deg, #0D1117 0%, #0A0E1A 55%, #0C1020 100%)',
          border: '1px solid rgba(255,255,255,0.08)', padding: '24px 28px',
        }}>
        <motion.div animate={{ x: [0,18,0], y: [0,-12,0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(13,148,136,0.22) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(13,148,136,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileSignature size={20} color="#2DD4BF" />
              </div>
              <div>
                <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>Generate Pilot Agreement</h1>
                <p style={{ fontSize: 12, color: '#64748B', margin: '3px 0 0' }}>{application.challenge_title}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{application.startup_name}</div>
              {application.startup_registration_status && (
                <div style={{ marginTop: 4 }}><TierBadge registrationStatus={application.startup_registration_status} /></div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* DPIIT gate */}
      {!canGenerate && (
        <div style={{ display: 'flex', gap: 10, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
          <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#92400E' }}>DPIIT Recognition Required</div>
            <div style={{ fontSize: 12, color: '#A16207', marginTop: 2 }}>DPIIT recognition required before contracting — this startup can still compete and be evaluated.</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Clauses */}
        {CLAUSES.map((clause, i) => (
          <motion.div key={clause.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.4 }}
            style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ height: 3, background: 'linear-gradient(90deg, #0D9488, #0891B2)' }} />
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <clause.icon size={15} color="#0D9488" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0B0F19' }}>{clause.label}</span>
              </div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.65, margin: 0, fontFamily: 'Georgia, serif' }}>
                {clause.text}
              </p>
            </div>
          </motion.div>
        ))}

        {/* Milestones */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0B0F19', margin: 0 }}>Milestone Schedule</h3>
            <span style={{ fontSize: 12, color: totalPct === 100 ? '#059669' : '#D97706', fontWeight: 600, background: totalPct === 100 ? '#ECFDF5' : '#FFFBEB', padding: '3px 10px', borderRadius: 100 }}>
              {totalPct}% allocated
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {milestones.map((m, i) => (
              <motion.div key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: i * 0.08 }}
                style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '16px', position: 'relative', overflow: 'hidden' }}>
                {/* Faint number watermark */}
                <div style={{ position: 'absolute', top: -8, right: 8, fontSize: 64, fontWeight: 900, color: '#F8FAFC', lineHeight: 1, pointerEvents: 'none', fontFamily: "'Space Grotesk',sans-serif" }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#0D9488', marginBottom: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Milestone {i + 1}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input style={{ ...FIELD, height: 38 }} placeholder="Description" value={m.description} onChange={e => setM(i, 'description', e.target.value)} />
                  <input style={{ ...FIELD, height: 38 }} type="number" placeholder="Due (weeks)" value={m.due_weeks} onChange={e => setM(i, 'due_weeks', e.target.value)} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input style={{ ...FIELD, height: 38, flex: 1 }} type="number" placeholder="%" value={m.payment_percent} onChange={e => setM(i, 'payment_percent', e.target.value)} />
                    <Ring pct={Math.min(parseInt(m.payment_percent) || 0, 100)} size={38} color="#0D9488" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <ShimmerButton
          type="submit"
          disabled={!canSubmit || submitting || !canGenerate}
          background="rgba(13,118,110,1)"
          shimmerColor="#2DD4BF"
          shimmerDuration="2.5s"
          borderRadius="12px"
          className="w-full h-12 text-sm font-semibold text-white"
        >
          {showSuccess ? (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={20} /> Contract Generated!
            </motion.span>
          ) : submitting ? 'Generating…' : 'Finalize & Generate PDF'}
        </ShimmerButton>
      </form>
    </div>
  );
}
