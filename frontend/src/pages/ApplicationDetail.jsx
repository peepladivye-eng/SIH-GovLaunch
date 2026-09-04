import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft, IndianRupee, Clock, FileText, Lock, Sparkles,
  Loader2, CheckCircle, ShieldCheck, Eye
} from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import StatusBadge from '../components/StatusBadge';
import TierBadge from '../components/TierBadge';
import ProofOfDisclosure from '../components/ProofOfDisclosure';
import StartupTrustProfile from '../components/StartupTrustProfile';

const VERDICT_COLORS = {
  likely_novel:   { bg: '#D1FAE5', text: '#059669', label: 'Likely Novel' },
  similar_exists: { bg: '#FEF3C7', text: '#D97706', label: 'Similar Solutions Exist' },
  not_assessed:   { bg: '#F3F4F6', text: '#6B7280', label: 'Not Assessed' },
};

const STATUS_GLOW = {
  submitted: '#818CF8', screening: '#6366F1', eligible: '#10B981',
  under_evaluation: '#F59E0B', shortlisted: '#059669', contracted: '#047857',
  rejected: '#EF4444', ineligible: '#9CA3AF',
};

const fmt = (n) => n ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n) : 'N/A';

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noveltyCheck, setNoveltyCheck] = useState(null);
  const [noveltyLoading, setNoveltyLoading] = useState(false);
  const [noveltyError, setNoveltyError] = useState('');
  const [protoStarting, setProtoStarting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const app = await api.getApplication(id);
        setApplication(app);
        if (['department', 'evaluator', 'admin'].includes(user.role)) {
          api.logApplicationView(id).catch(() => {});
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchApplication();
  }, [id, user.role]);

  const handleRunNoveltyCheck = async () => {
    setNoveltyLoading(true); setNoveltyError('');
    try {
      const r = await api.runNoveltyCheck(id);
      setNoveltyCheck(r);
    } catch (err) {
      let msg = 'Something went wrong.';
      try { const p = JSON.parse(err.message); msg = p.error || p.detail || msg; } catch (_) { msg = err.message || msg; }
      setNoveltyError(msg);
    } finally { setNoveltyLoading(false); }
  };

  const handleStartPrototype = async () => {
    setProtoStarting(true);
    try { setApplication(await api.startPrototypePhase(id)); }
    catch (e) { console.error(e); }
    finally { setProtoStarting(false); }
  };

  const getDaysLeft = (d) => d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null;

  const isOwn = user.role === 'startup' && (
    String(application?.startup) === String(user.startup_id) ||
    application?.startup_name === user.name
  );
  const shouldRedact = application && !isOwn && !['shortlisted','contracted'].includes(application.status);

  if (loading) return <div style={{ padding: 24, color: '#94A3B8', fontSize: 14 }}>Loading…</div>;
  if (!application) return <div style={{ padding: 24, color: '#94A3B8', fontSize: 14 }}>Application not found.</div>;

  const statusGlow = STATUS_GLOW[application.status] ?? '#94A3B8';

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", maxWidth: 1000, margin: '0 auto' }}>
      {/* Back */}
      <motion.button onClick={() => navigate(-1)} whileHover={{ x: -3 }}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0 }}>
        <ArrowLeft size={16} /> Back
      </motion.button>

      {/* ── Header hero ── */}
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{
          position: 'relative', overflow: 'hidden', borderRadius: 20, marginBottom: 24,
          background: 'linear-gradient(135deg, #0D1117 0%, #0A0E1A 55%, #0C1020 100%)',
          border: '1px solid rgba(255,255,255,0.08)', padding: '24px 28px',
        }}>
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%',
          background: `radial-gradient(circle, ${statusGlow}33 0%, transparent 70%)`, filter: 'blur(30px)', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>
              {application.challenge_title || 'Application'}
            </h1>
            <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
              {application.department_name || `Dept #${application.challenge}`}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <StatusBadge status={application.status} />
            {application.startup_registration_status && (
              <TierBadge registrationStatus={application.startup_registration_status} />
            )}
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        {/* ── Main column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Trust profile */}
          {['department','evaluator','admin'].includes(user.role) && application.startup && (
            <StartupTrustProfile
              startupId={application.startup}
              startupName={application.startup_name}
              rating={application.startup_rating ?? 1000}
            />
          )}

          {/* Startup info */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Applicant</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0B0F19' }}>
              {application.startup_name || `Startup #${application.startup}`}
            </div>
          </div>

          {/* Solution brief */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={14} color="#4F46E5" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0B0F19' }}>Solution Brief</span>
            </div>
            <div style={{ padding: '18px 20px' }}>
              {shouldRedact ? (
                <div style={{ position: 'relative' }}>
                  <div style={{ filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none', lineHeight: 1.7, fontSize: 14, color: '#475569' }}>
                    {application.solution_brief}
                  </div>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.75)', borderRadius: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                      <Lock size={20} color="#94A3B8" />
                    </div>
                    <div style={{ fontSize: 13, color: '#64748B', textAlign: 'center' }}>
                      Full solution detail unlocks once shortlisted
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {application.solution_brief}
                </p>
              )}
            </div>
          </div>

          {/* Proof of disclosure */}
          <ProofOfDisclosure application={application} />

          {/* Novelty check — dept/evaluator/admin only */}
          {['department','evaluator','admin'].includes(user.role) && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ height: 3, background: 'linear-gradient(90deg,#7C3AED,#4F46E5)' }} />
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={14} color="#7C3AED" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0B0F19' }}>AI Novelty Check</span>
              </div>
              <div style={{ padding: '16px 20px' }}>
                {!noveltyCheck ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <motion.button onClick={handleRunNoveltyCheck} disabled={noveltyLoading}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: 'none', cursor: noveltyLoading ? 'wait' : 'pointer', background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', color: '#fff', fontWeight: 600, fontSize: 14, width: 'fit-content' }}>
                      {noveltyLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} />}
                      {noveltyLoading ? 'Analysing…' : 'Run AI Novelty Check'}
                    </motion.button>
                    {noveltyError && <p style={{ fontSize: 13, color: '#DC2626', margin: 0 }}>{noveltyError}</p>}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                      background: VERDICT_COLORS[noveltyCheck.verdict]?.bg ?? '#F3F4F6',
                      color: VERDICT_COLORS[noveltyCheck.verdict]?.text ?? '#6B7280' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                      {VERDICT_COLORS[noveltyCheck.verdict]?.label ?? 'Not Assessed'}
                    </span>
                    {noveltyCheck.similar_products?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {noveltyCheck.similar_products.map((p, i) => (
                          <span key={i} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 100, background: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A', fontWeight: 500 }}>{p}</span>
                        ))}
                      </div>
                    )}
                    {noveltyCheck.explanation && <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>{noveltyCheck.explanation}</p>}
                    <p style={{ fontSize: 11, color: '#CBD5E1', margin: 0 }}>Based on AI training data, not live web search — verify manually for high-stakes decisions.</p>
                    <button onClick={() => { setNoveltyCheck(null); setNoveltyError(''); }}
                      style={{ fontSize: 12, color: '#94A3B8', background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', width: 'fit-content' }}>
                      Re-run
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Prototype phase */}
          {user.role === 'department' && application.status === 'shortlisted' && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              {!application.prototype_start_date ? (
                <motion.button onClick={handleStartPrototype} disabled={protoStarting}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: '1.5px solid #0D9488', background: 'rgba(13,148,136,0.06)', color: '#0D9488', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  <Clock size={16} />
                  {protoStarting ? 'Starting…' : 'Start Prototype Phase (30 Days)'}
                </motion.button>
              ) : (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0B0F19', marginBottom: 4 }}>Prototype Deadline</div>
                  {(() => {
                    const d = getDaysLeft(application.prototype_deadline);
                    return d !== null && d > 0 ? (
                      <div style={{ fontSize: 26, fontWeight: 800, color: d <= 7 ? '#D97706' : '#0B0F19', fontFamily: "'Space Grotesk',sans-serif" }}>
                        {d} days remaining
                      </div>
                    ) : (
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#DC2626' }}>Prototype deadline passed</div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Generate contract */}
          {user.role === 'department' && application.status === 'shortlisted' && (
            <motion.button onClick={() => navigate(`/applications/${id}/contract`)}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(13,148,136,0.35)' }} whileTap={{ scale: 0.97 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#0D9488,#0891B2)', color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(13,148,136,0.3)', width: 'fit-content' }}>
              <ShieldCheck size={18} /> Generate Contract
            </motion.button>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Details card */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: IndianRupee, label: 'Budget Quote', value: fmt(application.budget_quote) },
                { icon: Clock,       label: 'Timeline',    value: application.proposed_timeline ? `${application.proposed_timeline} weeks` : 'N/A' },
                { icon: FileText,    label: 'Submitted',   value: new Date(application.created_at || application.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
              ].map(d => (
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <d.icon size={14} color="#64748B" />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{d.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0B0F19' }}>{d.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Score card */}
          {application.average_score != null && (
            <div style={{ background: 'linear-gradient(135deg,#0D9488,#0891B2)', borderRadius: 14, padding: '18px 20px', color: '#fff' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 8 }}>Evaluation Score</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 42, fontWeight: 800, lineHeight: 1 }}>
                {application.average_score}<span style={{ fontSize: 20, opacity: 0.6 }}>/50</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
