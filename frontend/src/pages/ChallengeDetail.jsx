import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Target, IndianRupee, ShieldCheck, Zap, Users, TrendingUp, ChevronDown } from 'lucide-react';
import { api } from '../lib/api';
import StatusBadge from '../components/StatusBadge';
import TierBadge from '../components/TierBadge';
import { RatingTierBadge } from '../components/BadgeIcon';
import { useToast } from '../components/ui/toast';

const COLUMNS = [
  { key: 'submitted',        label: 'Submitted',       color: '#94A3B8' },
  { key: 'screening',        label: 'Screening',       color: '#818CF8' },
  { key: 'eligible',         label: 'Eligible',        color: '#34D399' },
  { key: 'under_evaluation', label: 'Evaluating',      color: '#FBBF24' },
  { key: 'shortlisted',      label: 'Shortlisted',     color: '#10B981' },
  { key: 'contracted',       label: 'Contracted',      color: '#059669' },
];

const SECTOR_COLORS = {
  healthtech: '#4F46E5', 'defense-tech': '#475569',
  agritech: '#10B981', fintech: '#F59E0B', cleantech: '#0F766E',
};
const getSC = (tag) => SECTOR_COLORS[tag?.toLowerCase()] ?? '#4F46E5';

const fmt = (n) => n ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n) : 'N/A';

export default function ChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [challenge, setChallenge] = useState(null);
  const [applications, setApplications] = useState([]);
  const [rejectedApps, setRejectedApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRejected, setShowRejected] = useState(false);
  const [finalizeRound, setFinalizeRound] = useState('round1_application');
  const [finalizeResult, setFinalizeResult] = useState(null);
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const chal = await api.getChallenge(id);
        setChallenge(chal);
        let apps = [];
        try { apps = await api.getApplications(`?challenge=${id}`); }
        catch { const all = await api.getApplications(); apps = all.filter(a => String(a.challenge) === String(id)); }
        setRejectedApps(apps.filter(a => a.status === 'rejected' || a.status === 'ineligible'));
        setApplications(apps.filter(a => a.status !== 'rejected' && a.status !== 'ineligible'));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchDetail();
  }, [id]);

  const handleFinalizeRound = async () => {
    setFinalizing(true);
    try {
      const r = await api.finalizeRound(id, finalizeRound);
      setFinalizeResult(r);
      toast({ title: `Ratings updated for ${r.results?.length ?? 0} startups.` });
    } catch (err) {
      toast({ title: 'Finalize failed', description: err.message, variant: 'destructive' });
    } finally { setFinalizing(false); }
  };

  if (loading) return <div style={{ padding: 24, color: '#94A3B8', fontSize: 14 }}>Loading…</div>;
  if (!challenge) return <div style={{ padding: 24, color: '#94A3B8', fontSize: 14 }}>Challenge not found.</div>;

  const tags = (Array.isArray(challenge.sector_tags) ? challenge.sector_tags : String(challenge.sector_tags || '').split(',')).filter(Boolean);
  const primaryColor = getSC(tags[0]);
  const totalApps = applications.length + rejectedApps.length;

  return (
    <div style={{ fontFamily: "'Inter',sans-serif" }}>
      <motion.button onClick={() => navigate('/challenges')} whileHover={{ x: -3 }}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0 }}>
        <ArrowLeft size={16} /> My Challenges
      </motion.button>

      {/* ── Hero header ── */}
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{
          position: 'relative', overflow: 'hidden', borderRadius: 20, marginBottom: 24,
          background: 'linear-gradient(135deg, #0D1117 0%, #0A0E1A 55%, #0C1020 100%)',
          border: '1px solid rgba(255,255,255,0.08)', padding: '28px 32px',
        }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%',
          background: `radial-gradient(circle, ${primaryColor}33 0%, transparent 70%)`, filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {tags.map(t => (
                  <span key={t} style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
                    background: `${getSC(t)}25`, color: getSC(t), border: `1px solid ${getSC(t)}44`,
                    textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.trim()}</span>
                ))}
              </div>
              <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 8px', lineHeight: 1.25 }}>
                {challenge.title}
              </h1>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>{challenge.department_name}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
              <StatusBadge status={challenge.status} />
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { icon: IndianRupee, value: fmt(challenge.budget_ceiling) },
                  { icon: Clock,       value: `${challenge.timeline_weeks}w` },
                  { icon: Users,       value: `${totalApps} applicants` },
                ].map(s => (
                  <div key={s.value} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#94A3B8' }}>
                    <s.icon size={12} />{s.value}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Info + sidebar grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, marginBottom: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: Zap,        title: 'Background',      content: challenge.background },
            { icon: Target,     title: 'Outcome Metrics', content: challenge.outcome_metrics },
            { icon: ShieldCheck,title: 'Constraints',     content: challenge.constraints },
          ].filter(s => s.content).map(s => (
            <div key={s.title} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '18px 22px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: `${primaryColor}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={14} color={primaryColor} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0B0F19' }}>{s.title}</span>
              </div>
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{s.content}</p>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ height: 3, background: `linear-gradient(90deg,${primaryColor},${primaryColor}44)` }} />
            <div style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Challenge Details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Budget', value: fmt(challenge.budget_ceiling) },
                  { label: 'Timeline', value: `${challenge.timeline_weeks} weeks` },
                  { label: 'DPIIT Required', value: challenge.eligibility_rules?.requires_dpiit ? 'Yes' : 'No' },
                  { label: 'No Blacklist', value: challenge.eligibility_rules?.requires_no_blacklist ? 'Yes' : 'No' },
                ].map(d => (
                  <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#94A3B8' }}>{d.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0B0F19' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Finalize round */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0B0F19', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={14} color="#0D9488" /> Finalize Round
            </div>
            <select value={finalizeRound} onChange={e => setFinalizeRound(e.target.value)}
              style={{ width: '100%', height: 36, padding: '0 10px', borderRadius: 8, border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontSize: 13, color: '#0B0F19', outline: 'none', marginBottom: 10 }}>
              <option value="round1_application">Round 1: Application</option>
              <option value="round2_prototype">Round 2: Prototype</option>
            </select>
            <motion.button onClick={handleFinalizeRound} disabled={finalizing}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{
                width: '100%', padding: '9px', borderRadius: 8, border: 'none', cursor: finalizing ? 'wait' : 'pointer',
                background: finalizing ? '#94A3B8' : 'linear-gradient(135deg,#0D9488,#0891B2)',
                color: '#fff', fontWeight: 700, fontSize: 13,
                boxShadow: finalizing ? 'none' : '0 3px 10px rgba(13,148,136,0.3)',
              }}>
              {finalizing ? 'Finalizing…' : 'Finalize & Update Ratings'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Finalize result ── */}
      {finalizeResult && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: '#ECFDF5', borderRadius: 14, border: '1px solid #A7F3D0', padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#065F46' }}>
              Round Finalized — Cohort Average: {finalizeResult.cohort_average}/50
            </span>
            <button onClick={() => setFinalizeResult(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.04)' }}>
                  {['Startup','Score','Rating +Δ','New Rating'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#065F46', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(finalizeResult.results ?? []).map(r => (
                  <tr key={r.application_id} style={{ borderTop: '1px solid #A7F3D0' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#065F46' }}>{r.startup_name}</td>
                    <td style={{ padding: '8px 12px', color: '#047857' }}>{r.score}/50</td>
                    <td style={{ padding: '8px 12px', color: '#059669', fontWeight: 700 }}>+{r.delta}</td>
                    <td style={{ padding: '8px 12px', color: '#047857', fontWeight: 700 }}>{r.new_rating}</td>
                  </tr>
                ))}
                {!finalizeResult.results?.length && (
                  <tr><td colSpan={4} style={{ padding: '12px', color: '#6EE7B7', textAlign: 'center', fontSize: 12 }}>{finalizeResult.message ?? 'No new results to show'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ── Rejected link ── */}
      {rejectedApps.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => setShowRejected(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#DC2626', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
            {rejectedApps.length} rejected
            <motion.span animate={{ rotate: showRejected ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={14} />
            </motion.span>
          </button>
          {showRejected && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 8, background: '#FEF2F2', borderRadius: 10, border: '1px solid #FECACA', padding: '10px 14px' }}>
              {rejectedApps.map(app => (
                <div key={app.id} onClick={() => navigate(`/applications/${app.id}`)}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', cursor: 'pointer', borderBottom: '1px solid #FCA5A5', fontSize: 13 }}>
                  <span style={{ color: '#991B1B', fontWeight: 500 }}>{app.startup_name || `Startup #${app.startup}`}</span>
                  <span style={{ color: '#DC2626', fontSize: 11 }}>{app.status}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* ── Kanban board ── */}
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 16 }}>
        {COLUMNS.map(col => {
          const colApps = applications.filter(a => a.status === col.key);
          return (
            <div key={col.key} style={{ flexShrink: 0, width: 252 }}>
              {/* Column header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#fff', borderRadius: 10, padding: '10px 14px', marginBottom: 10,
                border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, boxShadow: `0 0 6px ${col.color}` }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0B0F19' }}>{col.label}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: col.color, background: `${col.color}14`, padding: '2px 8px', borderRadius: 100 }}>
                  {colApps.length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {colApps.map((app, index) => (
                  <motion.div key={app.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                    onClick={() => navigate(`/applications/${app.id}`)}
                    style={{
                      background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0',
                      padding: '12px 14px', cursor: 'pointer', position: 'relative', overflow: 'hidden',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* Status dot accent */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: col.color, borderRadius: '3px 0 0 3px' }} />
                    <div style={{ paddingLeft: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0B0F19', marginBottom: 6, lineHeight: 1.3 }}>
                        {app.startup_name || `Startup #${app.startup}`}
                      </div>
                      {app.startup_registration_status && (
                        <div style={{ marginBottom: 6 }}><TierBadge registrationStatus={app.startup_registration_status} /></div>
                      )}
                      {app.startup_rating != null && (
                        <div style={{ marginBottom: 6 }}><RatingTierBadge rating={app.startup_rating} size={26} /></div>
                      )}
                      {/* Sector tags */}
                      {app.sector_tags && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                          {(Array.isArray(app.sector_tags) ? app.sector_tags : String(app.sector_tags).split(',')).slice(0, 2).map((t, i) => (
                            <span key={i} style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 100, background: `${getSC(t)}14`, color: getSC(t) }}>
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Score + proto countdown */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {app.average_score != null && (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: app.average_score >= 35 ? '#D1FAE5' : app.average_score >= 25 ? '#FEF3C7' : '#FEE2E2', color: app.average_score >= 35 ? '#059669' : app.average_score >= 25 ? '#D97706' : '#DC2626' }}>
                            {app.average_score}/50
                          </span>
                        )}
                        {app.prototype_deadline && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#D97706' }}>
                            <Clock size={11} />
                            {Math.max(0, Math.ceil((new Date(app.prototype_deadline) - new Date()) / 86400000))}d
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {colApps.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 10px', color: '#CBD5E1', fontSize: 12, background: '#F8FAFC', borderRadius: 10, border: '1px dashed #E2E8F0' }}>
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
