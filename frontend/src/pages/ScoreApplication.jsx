import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertTriangle, Lock } from 'lucide-react';
import TierBadge from '../components/TierBadge';
import ProofOfDisclosure from '../components/ProofOfDisclosure';

// R1 score criteria — labels swap by round
const getCriteria = (round) => [
  { key: 'score_problem_solution_fit', label: 'Problem–Solution Fit' },
  { key: 'score_innovation',            label: 'Innovation & Uniqueness' },
  {
    key: 'score_feasibility',
    label: round === 'round2_prototype'
      ? 'Execution Quality'
      : 'Feasibility & Technical Readiness',
  },
  { key: 'score_impact_sustainability', label: 'Impact & Sustainability' },
  {
    key: 'score_presentation',
    label: round === 'round2_prototype'
      ? 'Demo & Results'
      : 'Presentation & Supporting Evidence',
  },
];

function ScoreSlider({ label, value, onChange, disabled }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[--text-secondary]">{label}</span>
        <span className="font-medium text-[--text-primary]">{value}/10</span>
      </div>
      <input
        type="range"
        min={0} max={10} step={1}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full h-2 rounded-full appearance-none bg-gray-200 accent-[--gov-accent] cursor-pointer"
      />
      <div className="text-[10px] text-gray-400 mt-0.5">0–3 Weak · 4–7 Adequate · 8–10 Strong</div>
    </div>
  );
}

export default function ScoreApplication() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [coi, setCoi] = useState(false);
  const [round, setRound] = useState('round1_application');
  const [scores, setScores] = useState({
    score_problem_solution_fit:  0,
    score_innovation:             0,
    score_feasibility:            0,
    score_impact_sustainability:  0,
    score_presentation:           0,
  });
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getApplication(id).then(app => {
      setApplication(app);
      if (app.round) setRound(app.round);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const criteria = getCriteria(round);
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const handleSubmit = async () => {
    try {
      await api.createEvaluation({
        application: id,
        round,
        ...scores,
        comments,
        conflict_of_interest: coi,
      });
      navigate('/evaluate');
    } catch (err) {
      console.error(err);
    }
  };

  const shouldRedact = application && !['shortlisted', 'contracted'].includes(application.status);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!application) return <div className="p-6">Application not found.</div>;

  return (
    <div className="flex gap-8">
      {/* Left — 60% */}
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-space-grotesk font-bold text-[--text-primary]">
            {application.challenge_title || 'Challenge Application'}
          </h1>
          <p className="text-[--text-secondary] mt-1">
            {application.department_name || `Dept #${application.challenge}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-medium text-[--text-primary]">
            {application.startup_name || `Startup #${application.startup}`}
          </span>
          {application.startup_registration_status && (
            <TierBadge registrationStatus={application.startup_registration_status} />
          )}
        </div>
        <Card className="rounded-xl border-[--border] shadow-sm">
          <CardHeader><CardTitle className="text-base">Solution Brief</CardTitle></CardHeader>
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
              <p className="whitespace-pre-wrap text-[--text-secondary]">{application.solution_brief}</p>
            )}
          </CardContent>
        </Card>
        <ProofOfDisclosure application={application} />
      </div>

      {/* Right — 40%, sticky */}
      <div className="w-[400px] flex-shrink-0">
        <div className="sticky top-8 space-y-4">
          {/* Total score spring pop */}
          <Card className="rounded-xl border-[--border] shadow-sm bg-[--accent] text-white">
            <CardContent className="pt-5">
              <div className="text-sm opacity-80 mb-1">Total Score</div>
              <motion.div
                key={totalScore}
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="text-4xl font-space-grotesk font-bold"
              >
                {totalScore} / 50
              </motion.div>
            </CardContent>
          </Card>

          {/* Round selector */}
          <Card className="rounded-xl border-[--border] shadow-sm">
            <CardContent className="pt-5">
              <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">Round</label>
              <select
                value={round}
                onChange={e => setRound(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-[--border] bg-white px-3 text-sm"
              >
                <option value="round1_application">Round 1: Application</option>
                <option value="round2_prototype">Round 2: Prototype</option>
              </select>
            </CardContent>
          </Card>

          {/* COI */}
          <Card className="rounded-xl border-[--border] shadow-sm">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className={coi ? 'text-amber-500' : 'text-gray-400'} />
                  <span className="font-medium text-[--text-primary]">Conflict of Interest</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCoi(v => !v)}
                  className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${coi ? 'bg-amber-500' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${coi ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
              {coi && <p className="text-sm text-amber-600 mt-2">Score will not be counted.</p>}
            </CardContent>
          </Card>

          {/* Sliders */}
          <Card className={`rounded-xl border-[--border] shadow-sm ${coi ? 'opacity-50' : ''}`}>
            <CardHeader><CardTitle className="text-base">Evaluation Criteria</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {criteria.map(c => (
                <ScoreSlider
                  key={c.key}
                  label={c.label}
                  value={scores[c.key]}
                  onChange={v => setScores(prev => ({ ...prev, [c.key]: v }))}
                  disabled={coi}
                />
              ))}
              <div>
                <label className="block text-sm font-medium text-[--text-primary] mb-1.5">Comments</label>
                <Textarea
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  rows={3}
                  disabled={coi}
                  placeholder="Evaluation notes…"
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={coi}
                className="w-full bg-[--gov-accent] hover:bg-[--gov-accent-light] text-white"
              >
                Submit Evaluation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
