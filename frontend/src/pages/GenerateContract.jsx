import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Scale, ShieldCheck, Lock, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../components/ui/toast';
import TierBadge from '../components/TierBadge';
import { ShimmerButton } from '../components/ShimmerButton';

export default function GenerateContract() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [milestones, setMilestones] = useState([
    { description: '', due_weeks: '', payment_percent: 25 },
    { description: '', due_weeks: '', payment_percent: 25 },
    { description: '', due_weeks: '', payment_percent: 25 },
  ]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const app = await api.getApplication(id);
        setApplication(app);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [id]);

  const totalPercent = milestones.reduce((sum, m) => sum + (parseInt(m.payment_percent) || 0), 0);
  const canSubmit = totalPercent === 100 && milestones.every(m => m.description && m.due_weeks);
  
  // Check DPIIT requirement
  const requiresDpiit = application?.require_dpiit_recognition;
  const isDpiitRecognized = application?.startup_registration_status === 'dpiit_recognized';
  const canGenerateContract = !requiresDpiit || isDpiitRecognized;

  const handleMilestoneChange = (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createContract({
        application: id,
        milestones
      });
      setShowSuccess(true);
      // M3.6: hold 400 ms so the spring icon animation plays before redirect
      setTimeout(() => navigate('/challenges'), 400);
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.detail || 'Failed to generate contract',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!application) return <div className="p-6">Application not found.</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-space-grotesk font-bold text-[--text-primary]">
          Generate Pilot Agreement
        </h1>
        <p className="text-[--text-secondary]">
          Create a contract for {application.startup_name}
        </p>
      </div>

      {/* Startup Info */}
      <Card className="rounded-xl border-[--border] shadow-sm mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-[--text-primary] text-lg">
                {application.startup_name}
              </div>
              {application.startup_registration_status && (
                <TierBadge registrationStatus={application.startup_registration_status} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Clauses */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* IP Clause */}
        <Card className="rounded-xl border-[--border] shadow-sm overflow-hidden">
          <div className="h-1 bg-[--gov-accent]"></div>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Scale size={18} className="text-[--gov-accent]" />
              IP Clause
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[--text-secondary] leading-relaxed font-serif">
              All intellectual property developed during this pilot project shall be jointly owned by 
              the Department and the Startup. The Department shall have exclusive rights to use the 
              solution for government purposes, while the Startup retains commercial rights for private sector deployment.
            </p>
          </CardContent>
        </Card>

        {/* Data Clause */}
        <Card className="rounded-xl border-[--border] shadow-sm overflow-hidden">
          <div className="h-1 bg-[--gov-accent]"></div>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[--gov-accent]" />
              Data Clause
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[--text-secondary] leading-relaxed font-serif">
              All data collected during the pilot shall remain the property of the Government of India. 
              The Startup shall not use, share, or disclose any government data without explicit written 
              consent. Data anonymization protocols must be followed for any published research or case studies.
            </p>
          </CardContent>
        </Card>

        {/* Cybersecurity Clause */}
        <Card className="rounded-xl border-[--border] shadow-sm overflow-hidden">
          <div className="h-1 bg-[--gov-accent]"></div>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Lock size={18} className="text-[--gov-accent]" />
              Cybersecurity Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[--text-secondary] leading-relaxed font-serif">
              The Startup must comply with all government cybersecurity standards, including data encryption 
              at rest and in transit, multi-factor authentication, regular security audits, and incident 
              reporting within 24 hours of any security breach.
            </p>
          </CardContent>
        </Card>

        {/* Milestones */}
        <div>
          <h3 className="font-semibold text-[--text-primary] mb-4">Milestone Schedule</h3>
          <div className="grid grid-cols-3 gap-4">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20, delay: index * 0.1 }}
              >
                <Card className="rounded-xl border-[--border] shadow-sm relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-6xl text-gray-100 font-bold opacity-50">
                    {index + 1}
                  </div>
                  <CardContent className="pt-6">
                    <div className="text-sm font-medium text-[--gov-accent] mb-3">Milestone {index + 1}</div>
                    <div className="space-y-3">
                      <Input
                        placeholder="Description"
                        value={milestone.description}
                        onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                        className="relative z-10"
                      />
                      <Input
                        type="number"
                        placeholder="Due (weeks)"
                        value={milestone.due_weeks}
                        onChange={(e) => handleMilestoneChange(index, 'due_weeks', e.target.value)}
                        className="relative z-10"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="%"
                          value={milestone.payment_percent}
                          onChange={(e) => handleMilestoneChange(index, 'payment_percent', e.target.value)}
                          className="relative z-10"
                        />
                        <span className="text-sm text-[--text-secondary]">%</span>
                        {/* Progress Ring */}
                        <div className="w-8 h-8 relative">
                          <svg className="w-8 h-8 -rotate-90">
                            <circle cx="16" cy="16" r="14" stroke="#E5E7EB" strokeWidth="2" fill="none" />
                            <circle 
                              cx="16" cy="16" r="14" 
                              stroke="#0F766E" 
                              strokeWidth="2" 
                              fill="none"
                              strokeDasharray={`${(milestone.payment_percent / 100) * 88} 88`}
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Validation Message */}
        {totalPercent !== 100 && (
          <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            Milestone percentages must add up to 100%. Current total: {totalPercent}%
          </div>
        )}

        {/* DPIIT Check */}
        {!canGenerateContract && (
          <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            DPIIT recognition required before contracting — this startup can still compete and be evaluated.
          </div>
        )}

        {/* M2c ShimmerButton + M3.6 success icon spring */}
        <ShimmerButton
          type="submit"
          disabled={!canSubmit || submitting || !canGenerateContract}
          background="rgba(15,118,110,1)"
          shimmerDuration="2.5s"
          className="w-full"
        >
          {showSuccess ? (
            // M3.6: CheckCircle spring pops in, holds 400 ms, then redirect fires
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              className="flex items-center gap-2"
            >
              <CheckCircle size={20} />
              Contract Generated!
            </motion.span>
          ) : submitting ? 'Generating…' : 'Finalize & Generate PDF'}
        </ShimmerButton>
      </form>
    </div>
  );
}