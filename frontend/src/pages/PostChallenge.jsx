import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { api } from '../lib/api';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../components/ui/toast';
import { ShimmerButton } from '../components/ShimmerButton';

const sectors = [
  { id: 'healthtech', label: 'Healthtech' },
  { id: 'defense-tech', label: 'Defense-tech' },
  { id: 'agritech', label: 'Agritech' },
  { id: 'fintech', label: 'Fintech' },
  { id: 'cleantech', label: 'Cleantech' },
];

export default function PostChallenge() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    background: '',
    outcome_metrics: '',
    constraints: '',
    budget_ceiling: '',
    timeline_weeks: '',
    sector_tags: [],
    require_dpiit_recognition: false,
    require_minimum_turnover: false,
    require_no_prior_blacklist: true,
  });

  const handleSectorToggle = (sectorId) => {
    setFormData(prev => ({
      ...prev,
      sector_tags: prev.sector_tags.includes(sectorId)
        ? prev.sector_tags.filter(s => s !== sectorId)
        : [...prev.sector_tags, sectorId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createChallenge(formData);
      toast({ title: 'Challenge posted!', description: 'Your challenge is now live.' });
      navigate('/challenges');
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.detail || 'Failed to create challenge',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button 
        onClick={() => navigate('/challenges')}
        className="flex items-center gap-2 text-[--text-secondary] hover:text-[--text-primary] mb-6"
      >
        <ArrowLeft size={18} />
        Back to Challenges
      </button>

      <h1 className="text-2xl font-space-grotesk font-bold text-[--text-primary] mb-6">
        Post a New Challenge
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="rounded-xl border-[--border] shadow-sm">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                Challenge Title
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter a clear, concise title for your challenge"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                Sector
              </label>
              <div className="flex flex-wrap gap-2">
                {sectors.map((sector) => (
                  <button
                    key={sector.id}
                    type="button"
                    onClick={() => handleSectorToggle(sector.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      formData.sector_tags.includes(sector.id)
                        ? 'bg-[--gov-accent] text-white'
                        : 'bg-gray-100 text-[--text-secondary] hover:bg-gray-200'
                    }`}
                  >
                    {sector.label}
                    {formData.sector_tags.includes(sector.id) && <X size={14} className="inline ml-1" />}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-[--border] shadow-sm">
          <CardHeader>
            <CardTitle>Challenge Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                Background & Problem Statement
              </label>
              <Textarea
                value={formData.background}
                onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                placeholder="Describe the problem you want to solve..."
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                Outcome Metrics
              </label>
              <Textarea
                value={formData.outcome_metrics}
                onChange={(e) => setFormData({ ...formData, outcome_metrics: e.target.value })}
                placeholder="Define what success looks like..."
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                Constraints
              </label>
              <Textarea
                value={formData.constraints}
                onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                placeholder="Any technical, regulatory, or operational constraints..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-[--border] shadow-sm">
          <CardHeader>
            <CardTitle>Budget & Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                  Budget Ceiling (INR)
                </label>
                <Input
                  type="number"
                  value={formData.budget_ceiling}
                  onChange={(e) => setFormData({ ...formData, budget_ceiling: e.target.value })}
                  placeholder="e.g., 5000000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                  Timeline (weeks)
                </label>
                <Input
                  type="number"
                  value={formData.timeline_weeks}
                  onChange={(e) => setFormData({ ...formData, timeline_weeks: e.target.value })}
                  placeholder="e.g., 12"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-[--border] shadow-sm">
          <CardHeader>
            <CardTitle>Eligibility Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.require_dpiit_recognition}
                onChange={(e) => setFormData({ ...formData, require_dpiit_recognition: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-[--text-primary]">Require DPIIT Recognition</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.require_minimum_turnover}
                onChange={(e) => setFormData({ ...formData, require_minimum_turnover: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-[--text-primary]">Require Minimum Turnover</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.require_no_prior_blacklist}
                onChange={(e) => setFormData({ ...formData, require_no_prior_blacklist: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-[--text-primary]">No Prior Blacklist</span>
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/challenges')}>
            Cancel
          </Button>
          <ShimmerButton
            type="submit"
            disabled={loading}
            background="rgba(15,118,110,1)"
            shimmerDuration="2.5s"
          >
            {loading ? 'Publishing…' : 'Publish Challenge'}
          </ShimmerButton>
        </div>
      </form>
    </div>
  );
}