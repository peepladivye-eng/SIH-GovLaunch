import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Slider } from '../components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, AlertTriangle } from 'lucide-react';
import TierBadge from '../components/TierBadge';
import ProofOfDisclosure from '../components/ProofOfDisclosure';

// Max scores for each criterion
const maxScores = {
  technical: 25,
  novelty: 20,
  team: 20,
  pilot_readiness: 20,
  cost: 15
};

export default function ScoreApplication() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [coi, setCoi] = useState(false);
  const [scores, setScores] = useState({
    technical: 0,
    novelty: 0,
    team: 0,
    pilot_readiness: 0,
    cost: 0
  });
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const app = await api.getApplication(id);
        setApplication(app);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  const handleScoreChange = (field, value) => {
    setScores(prev => ({
      ...prev,
      [field]: value[0]
    }));
  };

  const totalScore = scores.technical + scores.novelty + scores.team + scores.pilot_readiness + scores.cost;

  const handleSubmit = async () => {
    const payload = {
      application: id,
      score_technical: scores.technical,
      score_novelty: scores.novelty,
      score_team: scores.team,
      score_pilot_readiness: scores.pilot_readiness,
      score_cost: scores.cost,
      comments,
      conflict_of_interest: coi
    };
    try {
      await api.createEvaluation(payload);
      navigate('/evaluate');
    } catch (err) {
      console.error(err);
    }
  };

  // Check if solution should be redacted
  const shouldRedact = application && 
    !['shortlisted', 'contracted'].includes(application.status);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!application) return <div className="p-6">Application not found.</div>;

  return (
    <div className="flex gap-8">
      {/* Left Column - 60% */}
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-space-grotesk font-bold text-[--text-primary]">
            {application.challenge_title || 'Challenge Application'}
          </h1>
          <p className="text-[--text-secondary] mt-1">
            {application.department_name || `Dept #${application.challenge_department}`}
          </p>
        </div>

        {/* Startup Info */}
        <div className="flex items-center gap-3">
          <div className="text-lg font-medium text-[--text-primary]">
            {application.startup_name || `Startup #${application.startup}`}
          </div>
          {application.startup_registration_status && (
            <TierBadge registrationStatus={application.startup_registration_status} />
          )}
        </div>

        {/* Solution Brief - with redaction if needed */}
        <Card className="rounded-xl border-[--border] shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Solution Brief</CardTitle>
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
      </div>

      {/* Right Column - 40% - Sticky */}
      <div className="w-[400px] flex-shrink-0">
        <div className="sticky top-8 space-y-6">
          {/* Total Score Card */}
          <Card className="rounded-xl border-[--border] shadow-sm bg-[--accent] text-white">
            <CardContent className="pt-6">
              <div className="text-sm opacity-80 mb-1">Total Score</div>
              <motion.div 
                key={totalScore}
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="text-4xl font-space-grotesk font-bold"
              >
                {totalScore} / 100
              </motion.div>
            </CardContent>
          </Card>

          {/* COI Toggle */}
          <Card className="rounded-xl border-[--border] shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className={coi ? 'text-amber-500' : 'text-gray-400'} />
                  <span className="font-medium text-[--text-primary]">Conflict of Interest</span>
                </div>
                <Switch checked={coi} onCheckedChange={setCoi} />
              </div>
              {coi && (
                <p className="text-sm text-amber-600 mt-2">
                  Your score will not be counted due to declared conflict of interest.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Scoring Sliders */}
          <Card className={`rounded-xl border-[--border] shadow-sm ${coi ? 'opacity-50' : ''}`}>
            <CardHeader>
              <CardTitle className="text-base">Evaluation Criteria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[--text-secondary]">Technical Feasibility</span>
                  <span className="font-medium text-[--text-primary]">{scores.technical}/{maxScores.technical}</span>
                </div>
                <Slider 
                  value={[scores.technical]} 
                  onValueChange={(v) => handleScoreChange('technical', v)}
                  max={maxScores.technical}
                  step={1}
                  disabled={coi}
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[--text-secondary]">Novelty</span>
                  <span className="font-medium text-[--text-primary]">{scores.novelty}/{maxScores.novelty}</span>
                </div>
                <Slider 
                  value={[scores.novelty]} 
                  onValueChange={(v) => handleScoreChange('novelty', v)}
                  max={maxScores.novelty}
                  step={1}
                  disabled={coi}
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[--text-secondary]">Team Capability</span>
                  <span className="font-medium text-[--text-primary]">{scores.team}/{maxScores.team}</span>
                </div>
                <Slider 
                  value={[scores.team]} 
                  onValueChange={(v) => handleScoreChange('team', v)}
                  max={maxScores.team}
                  step={1}
                  disabled={coi}
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[--text-secondary]">Pilot Readiness</span>
                  <span className="font-medium text-[--text-primary]">{scores.pilot_readiness}/{maxScores.pilot_readiness}</span>
                </div>
                <Slider 
                  value={[scores.pilot_readiness]} 
                  onValueChange={(v) => handleScoreChange('pilot_readiness', v)}
                  max={maxScores.pilot_readiness}
                  step={1}
                  disabled={coi}
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[--text-secondary]">Cost Efficiency</span>
                  <span className="font-medium text-[--text-primary]">{scores.cost}/{maxScores.cost}</span>
                </div>
                <Slider 
                  value={[scores.cost]} 
                  onValueChange={(v) => handleScoreChange('cost', v)}
                  max={maxScores.cost}
                  step={1}
                  disabled={coi}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[--text-primary] mb-2">
                  Comments
                </label>
                <Textarea 
                  value={comments} 
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  placeholder="Add your evaluation comments..."
                  disabled={coi}
                />
              </div>

              <Button 
                onClick={handleSubmit} 
                className="w-full bg-[--gov-accent] hover:bg-[--gov-accent-light] text-white"
                disabled={coi}
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