import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, IndianRupee, Clock, FileText } from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../components/ui/toast';

export default function ApplyToChallenge() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    solution_brief: '',
    proposed_timeline: '',
    budget_quote: ''
  });

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const chal = await api.getChallenge(id);
        setChallenge(chal);
      } catch (err) {
        console.error('Failed to fetch challenge:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.createApplication({
        challenge: parseInt(id, 10),
        solution_brief: formData.solution_brief,
        proposed_timeline: formData.proposed_timeline ? parseInt(formData.proposed_timeline, 10) : null,
        budget_quote: formData.budget_quote ? parseInt(formData.budget_quote, 10) : null,
      });

      toast({ title: 'Application submitted!', description: 'Your application has been sent.' });
      navigate('/my-applications');
    } catch (err) {
      let msg = 'Failed to submit application';
      try {
        const parsed = JSON.parse(err.message);
        msg = Object.entries(parsed)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
      } catch (_) {
        if (err.message && !err.message.startsWith('{')) msg = err.message;
      }
      toast({ title: 'Submission failed', description: msg, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!challenge) return <div className="p-6">Challenge not found.</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/discover')}
        className="flex items-center gap-2 text-[--text-secondary] hover:text-[--text-primary] mb-6"
      >
        <ArrowLeft size={18} />
        Back to Challenges
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Challenge Info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-space-grotesk font-bold text-[--text-primary] mb-2">
              {challenge.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[--text-secondary]">
              <div className="flex items-center gap-1">
                <Building2 size={16} />
                <span>{challenge.department_name || `Dept #${challenge.department}`}</span>
              </div>
              <div className="flex items-center gap-1">
                <IndianRupee size={16} />
                <span>{formatCurrency(challenge.budget_ceiling)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{challenge.timeline_weeks} weeks</span>
              </div>
            </div>
          </div>

          <Card className="rounded-xl border-[--border] shadow-sm">
            <CardHeader>
              <CardTitle>Background</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[--text-secondary] whitespace-pre-wrap">{challenge.background}</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-[--border] shadow-sm">
            <CardHeader>
              <CardTitle>Outcome Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[--text-secondary] whitespace-pre-wrap">{challenge.outcome_metrics}</p>
            </CardContent>
          </Card>

          {challenge.constraints && (
            <Card className="rounded-xl border-[--border] shadow-sm">
              <CardHeader>
                <CardTitle>Constraints</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[--text-secondary] whitespace-pre-wrap">{challenge.constraints}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Application Form */}
        <div>
          <Card className="rounded-xl border-[--border] shadow-sm sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={18} />
                Apply Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                    Solution Brief
                  </label>
                  <Textarea
                    value={formData.solution_brief}
                    onChange={(e) => setFormData({ ...formData, solution_brief: e.target.value })}
                    placeholder="Describe your solution..."
                    rows={6}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                    Proposed Timeline (weeks)
                  </label>
                  <Input
                    type="number"
                    value={formData.proposed_timeline}
                    onChange={(e) => setFormData({ ...formData, proposed_timeline: e.target.value })}
                    placeholder="e.g., 8"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                    Budget Quote (INR)
                  </label>
                  <Input
                    type="number"
                    value={formData.budget_quote}
                    onChange={(e) => setFormData({ ...formData, budget_quote: e.target.value })}
                    placeholder="Your proposed budget"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                >
                  {submitting ? 'Submitting…' : 'Submit Application'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}