import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, IndianRupee, Clock, FileText, Lock, Sparkles, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import StatusBadge from '../components/StatusBadge';
import TierBadge from '../components/TierBadge';
import ProofOfDisclosure from '../components/ProofOfDisclosure';
import StartupTrustProfile from '../components/StartupTrustProfile';

// Novelty verdict badge
function NoveltyBadge({ verdict }) {
  const config = {
    likely_novel:   { label: 'Likely Novel',            bg: '#D1FAE5', text: '#059669' },
    similar_exists: { label: 'Similar Solutions Exist', bg: '#FEF3C7', text: '#D97706' },
    not_assessed:   { label: 'Not Assessed',            bg: '#F3F4F6', text: '#6B7280' },
  };
  const c = config[verdict] ?? config.not_assessed;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.text }} />
      {c.label}
    </span>
  );
}

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
        // Log view for department/evaluator — fire and forget, don't block
        if (['department', 'evaluator', 'admin'].includes(user.role)) {
          api.logApplicationView(id).catch(() => {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [id, user.role]);

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const handleRunNoveltyCheck = async () => {
    setNoveltyLoading(true);
    setNoveltyError('');
    try {
      const result = await api.runNoveltyCheck(id);
      setNoveltyCheck(result);
    } catch (err) {
      let msg = 'Something went wrong. Please try again.';
      try { const p = JSON.parse(err.message); msg = p.error || p.detail || msg; } catch (_) { msg = err.message || msg; }
      setNoveltyError(msg);
    } finally {
      setNoveltyLoading(false);
    }
  };

  const handleStartPrototype = async () => {
    setProtoStarting(true);
    try {
      const updated = await api.startPrototypePhase(id);
      setApplication(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setProtoStarting(false);
    }
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    return Math.ceil((new Date(deadline) - new Date()) / 86400000);
  };

  // isOwnApplication: startup viewing their own — compare startup entity id to logged-in startup_id
  const isOwnApplication = user.role === 'startup' && (
    String(application?.startup) === String(user.startup_id) ||
    application?.startup_name === user.name
  );
  const shouldRedact = application && !isOwnApplication && !['shortlisted', 'contracted'].includes(application.status);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!application) return <div className="p-6">Application not found.</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[--text-secondary] hover:text-[--text-primary] mb-6"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-space-grotesk font-bold text-[--text-primary]">
            {application.challenge_title || 'Application'}
          </h1>
          <p className="text-[--text-secondary]">
            {application.department_name || `Dept #${application.challenge_department}`}
          </p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* R8 — Startup Trust Profile (dept/evaluator only) */}
          {['department', 'evaluator', 'admin'].includes(user.role) && application.startup && (
            <StartupTrustProfile
              startupId={application.startup}
              startupName={application.startup_name}
              rating={application.startup_rating ?? 1000}
            />
          )}

          {/* Startup Info */}
          <Card className="rounded-xl border-[--border] shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[--text-primary] text-lg">
                    {application.startup_name || `Startup #${application.startup}`}
                  </div>
                  {application.startup_registration_status && (
                    <div className="mt-2">
                      <TierBadge registrationStatus={application.startup_registration_status} />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Solution Brief - with redaction */}
          <Card className="rounded-xl border-[--border] shadow-sm">
            <CardHeader>
              <CardTitle>Solution Brief</CardTitle>
            </CardHeader>
            <CardContent>
              {shouldRedact ? (
                <div className="relative">
                  <div className="blur-sm select-none pointer-events-none">
                    <p className="whitespace-pre-wrap">{application.solution_brief}</p>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70">
                    <Lock size={24} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Full solution detail unlocks once shortlisted</p>
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-[--text-secondary]">
                  {application.solution_brief}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Proof of Disclosure */}
          <ProofOfDisclosure application={application} />

          {/* Novelty Check — department / evaluator / admin only */}
          {['department', 'evaluator', 'admin'].includes(user.role) && (
            <Card className="rounded-xl border-[--border] shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles size={16} className="text-[--gov-accent]" />
                  Novelty Check
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!noveltyCheck ? (
                  <>
                    <Button
                      onClick={handleRunNoveltyCheck}
                      disabled={noveltyLoading}
                      className="bg-[--gov-accent] hover:bg-[--gov-accent-light] text-white"
                    >
                      {noveltyLoading ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          Running…
                        </>
                      ) : (
                        'Run AI Novelty Check'
                      )}
                    </Button>
                    {noveltyError && (
                      <p className="text-sm text-red-600">{noveltyError}</p>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <NoveltyBadge verdict={noveltyCheck.verdict} />

                    {noveltyCheck.similar_products?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {noveltyCheck.similar_products.map((p, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-medium"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    )}

                    {noveltyCheck.explanation && (
                      <p className="text-sm text-[--text-secondary] leading-relaxed">
                        {noveltyCheck.explanation}
                      </p>
                    )}

                    <p className="text-xs text-gray-400">
                      Based on the AI model's training data, not live web search — verify manually for high-stakes decisions.
                    </p>

                    {/* Allow re-running */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setNoveltyCheck(null); setNoveltyError(''); }}
                    >
                      Re-run Check
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* R7 — Generate Contract */}
          {user.role === 'department' && application.status === 'shortlisted' && (
            <div className="space-y-3">
              {/* Prototype phase button / countdown */}
              {!application.prototype_start_date ? (
                <Button
                  onClick={handleStartPrototype}
                  disabled={protoStarting}
                  variant="outline"
                  className="border-[--gov-accent] text-[--gov-accent] hover:bg-[--gov-accent]/10"
                >
                  <Clock size={16} className="mr-2" />
                  {protoStarting ? 'Starting…' : 'Start Prototype Phase (30 Days)'}
                </Button>
              ) : (
                <Card className="rounded-xl border-[--border] shadow-sm">
                  <CardContent className="pt-4">
                    <div className="font-semibold text-[--text-primary] mb-1">Prototype Deadline</div>
                    {(() => {
                      const days = getDaysRemaining(application.prototype_deadline);
                      return days !== null && days > 0 ? (
                        <div className={`text-2xl font-bold ${days <= 7 ? 'text-amber-600' : 'text-[--text-primary]'}`}>
                          {days} days remaining
                        </div>
                      ) : (
                        <div className="text-red-600 font-semibold">Prototype deadline passed</div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
              <Button
                onClick={() => navigate(`/applications/${id}/contract`)}
                className="bg-[--gov-accent] hover:bg-[--gov-accent-light] text-white"
              >
                Generate Contract
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-4">
          <Card className="rounded-xl border-[--border] shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <IndianRupee size={16} className="text-gray-400" />
                <span className="text-[--text-secondary]">Budget Quote:</span>
                <span className="font-medium text-[--text-primary]">
                  {formatCurrency(application.budget_quote)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-gray-400" />
                <span className="text-[--text-secondary]">Timeline:</span>
                <span className="font-medium text-[--text-primary]">
                  {application.proposed_timeline} weeks
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText size={16} className="text-gray-400" />
                <span className="text-[--text-secondary]">Submitted:</span>
                <span className="font-medium text-[--text-primary]">
                  {new Date(application.created_at || application.submitted_at).toLocaleDateString('en-IN')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Score if available */}
          {application.average_score && (
            <Card className="rounded-xl border-[--border] shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Evaluation Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-space-grotesk font-bold text-[--gov-accent]">
                  {application.average_score}/100
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
