import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, X, FileText, Target, IndianRupee, Clock, ShieldCheck, Zap } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/toast';
import { ShimmerButton } from '../components/ShimmerButton';

const SECTORS = [
  { id: 'healthtech',   label: 'Healthtech',   bg: '#EEF2FF', text: '#4F46E5' },
  { id: 'defense-tech', label: 'Defense-tech', bg: '#F1F5F9', text: '#475569' },
  { id: 'agritech',     label: 'Agritech',     bg: '#ECFDF5', text: '#059669' },
  { id: 'fintech',      label: 'Fintech',       bg: '#FFFBEB', text: '#D97706' },
  { id: 'cleantech',    label: 'Cleantech',     bg: '#F0FDFA', text: '#0D9488' },
];

const FIELD = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1.5px solid #E2E8F0', background: '#F8FAFC',
  fontSize: 14, color: '#0B0F19', outline: 'none', boxSizing: 'border-box',
  fontFamily: "'Inter',sans-serif", transition: 'border-color 0.15s, box-shadow 0.15s',
};
const TEXTAREA = { ...FIELD, resize: 'vertical', lineHeight: 1.6 };

function Field({ label, value, onChange, placeholder, type = 'text', required, hint }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</label>
        {hint && <span style={{ fontSize: 11, color: '#94A3B8' }}>{hint}</span>}
      </div>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ ...FIELD, height: 44, borderColor: focused ? '#0D9488' : '#E2E8F0', boxShadow: focused ? '0 0 0 3px rgba(13,148,136,0.1)' : 'none' }} />
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder, rows = 4, required, hint }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</label>
        {hint && <span style={{ fontSize: 11, color: '#94A3B8' }}>{hint}</span>}
      </div>
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} required={required}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ ...TEXTAREA, borderColor: focused ? '#0D9488' : '#E2E8F0', boxShadow: focused ? '0 0 0 3px rgba(13,148,136,0.1)' : 'none' }} />
    </div>
  );
}

function Section({ icon: Icon, title, children, accent = '#0D9488' }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}44)` }} />
      <div style={{ padding: '20px 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${accent}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={16} color={accent} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#0B0F19' }}>{title}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function PostChallenge() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', background: '', outcome_metrics: '', constraints: '',
    budget_ceiling: '', timeline_weeks: '', sector_tags: [],
    require_dpiit_recognition: false, require_minimum_turnover: false, require_no_prior_blacklist: true,
  });

  const set = (key) => (e) => setFormData(p => ({ ...p, [key]: e.target.value }));
  const toggleSector = (id) => setFormData(p => ({
    ...p, sector_tags: p.sector_tags.includes(id) ? p.sector_tags.filter(s => s !== id) : [...p.sector_tags, id]
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createChallenge(formData);
      toast({ title: 'Challenge published!', description: 'Your challenge is now live.' });
      navigate('/challenges');
    } catch (err) {
      let msg = 'Failed to create challenge';
      try { msg = JSON.parse(err.message).detail || msg; } catch (_) {}
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', fontFamily: "'Inter',sans-serif" }}>
      {/* Back + header */}
      <div style={{ marginBottom: 24 }}>
        <motion.button onClick={() => navigate('/challenges')}
          whileHover={{ x: -3 }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer', marginBottom: 16, padding: 0 }}>
          <ArrowLeft size={16} /> Back to Challenges
        </motion.button>

        {/* Mini hero */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{
            position: 'relative', overflow: 'hidden', borderRadius: 18,
            background: 'linear-gradient(135deg, #0D1117 0%, #0A0E1A 55%, #0C1020 100%)',
            border: '1px solid rgba(255,255,255,0.08)', padding: '24px 28px',
          }}>
          <motion.div animate={{ x: [0,18,0], y: [0,-12,0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(13,148,136,0.25) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(13,148,136,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={20} color="#2DD4BF" />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>
                Post a New Challenge
              </h1>
              <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>
                Define your problem statement clearly — the best solutions come from precise problems
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Basic info */}
        <Section icon={FileText} title="Basic Information" accent="#4F46E5">
          <Field label="Challenge Title" value={formData.title} onChange={set('title')}
            placeholder="e.g., AI-Assisted Triage for Rural PHCs" required
            hint="Keep it clear and specific" />
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Sector</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SECTORS.map(s => {
                const active = formData.sector_tags.includes(s.id);
                return (
                  <motion.button key={s.id} type="button" onClick={() => toggleSector(s.id)}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 13px', borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      background: active ? s.bg : '#F8FAFC', color: active ? s.text : '#94A3B8',
                      border: `1.5px solid ${active ? s.text + '44' : '#E2E8F0'}`, transition: 'all 0.15s' }}>
                    {s.label}
                    {active && <X size={12} />}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Details */}
        <Section icon={Zap} title="Challenge Details" accent="#7C3AED">
          <TextareaField label="Background & Problem Statement" value={formData.background} onChange={set('background')}
            placeholder="Describe the problem, its context, and why it matters…" rows={4} required />
          <TextareaField label="Outcome Metrics" value={formData.outcome_metrics} onChange={set('outcome_metrics')}
            placeholder="Define measurable success criteria…" rows={3} required />
          <TextareaField label="Constraints" value={formData.constraints} onChange={set('constraints')}
            placeholder="Technical, regulatory, or operational constraints…" rows={3}
            hint="Optional but recommended" />
        </Section>

        {/* Budget + timeline */}
        <Section icon={IndianRupee} title="Budget & Timeline" accent="#D97706">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Budget Ceiling (INR)" type="number" value={formData.budget_ceiling}
              onChange={set('budget_ceiling')} placeholder="e.g., 2500000" required />
            <Field label="Timeline (weeks)" type="number" value={formData.timeline_weeks}
              onChange={set('timeline_weeks')} placeholder="e.g., 12" required />
          </div>
        </Section>

        {/* Eligibility */}
        <Section icon={ShieldCheck} title="Eligibility Requirements" accent="#059669">
          {[
            { key: 'require_dpiit_recognition', label: 'Require DPIIT Recognition', desc: 'Applicants must hold valid DPIIT recognition' },
            { key: 'require_minimum_turnover',  label: 'Require Minimum Turnover',  desc: 'Applicants must meet minimum revenue threshold' },
            { key: 'require_no_prior_blacklist',label: 'No Prior Blacklist',         desc: 'Applicants must not be blacklisted' },
          ].map(r => (
            <label key={r.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
              <div
                onClick={() => setFormData(p => ({ ...p, [r.key]: !p[r.key] }))}
                style={{
                  width: 20, height: 20, borderRadius: 5, marginTop: 1, flexShrink: 0,
                  border: `2px solid ${formData[r.key] ? '#059669' : '#E2E8F0'}`,
                  background: formData[r.key] ? '#059669' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s', cursor: 'pointer',
                }}
              >
                {formData[r.key] && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0B0F19' }}>{r.label}</div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>{r.desc}</div>
              </div>
            </label>
          ))}
        </Section>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <motion.button type="button" onClick={() => navigate('/challenges')}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '10px 22px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </motion.button>
          <ShimmerButton type="submit" disabled={loading} background="rgba(13,148,136,1)" shimmerColor="#2DD4BF" shimmerDuration="2s" borderRadius="10px"
            className="h-11 px-6 text-sm font-semibold text-white">
            {loading ? 'Publishing…' : 'Publish Challenge'}
          </ShimmerButton>
        </div>
      </form>
    </div>
  );
}
