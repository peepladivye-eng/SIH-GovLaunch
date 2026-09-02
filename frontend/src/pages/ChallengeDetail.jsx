import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import { api } from '../lib/api';
import StatusBadge from '../components/StatusBadge';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import TierBadge from '../components/TierBadge';
import { RatingTierBadge } from '../components/BadgeIcon';
import { useToast } from '../components/ui/toast';

const columns = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'screening', label: 'Screening' },
  { key: 'eligible', label: 'Eligible' },
  { key: 'under_evaluation', label: 'Under Evaluation' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'contracted', label: 'Contracted' },
];

export default function ChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [showRejected, setShowRejected] = useState(false);
  const [rejectedApps, setRejectedApps] = useState([]);
  const [finalizeRound, setFinalizeRound] = useState('round1_application');
  const [finalizeResult, setFinalizeResult] = useState(null);
  const [finalizing, setFinalizing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const chal = await api.getChallenge(id);
        setChallenge(chal);
        
        let apps = [];
        try {
           apps = await api.getApplications(`?challenge=${id}`);
        } catch(e) {
           const allApps = await api.getApplications();
           apps = allApps.filter(a => String(a.challenge) === String(id));
        }
        
        // Separate rejected applications
        const rejected = apps.filter(a => a.status === 'rejected' || a.status === 'ineligible');
        const active = apps.filter(a => a.status !== 'rejected' && a.status !== 'ineligible');
        
        setApplications(active);
        setRejectedCount(rejected.length);
        setRejectedApps(rejected);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const getSectorColor = (sector) => {
    const colors = {
      'healthtech': '#4F46E5',
      'defense-tech': '#475569',
      'agritech': '#10B981',
      'fintech': '#F59E0B',
      'cleantech': '#0F766E',
    };
    return colors[sector?.toLowerCase()] || '#4F46E5';
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#10B981';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!challenge) return <div className="p-6">Challenge not found.</div>;

  const handleFinalizeRound = async () => {
    setFinalizing(true);
    try {
      const result = await api.finalizeRound(id, finalizeRound);
      setFinalizeResult(result);
      toast({ title: `Ratings updated for ${result.results.length} startups.` });
    } catch (err) {
      toast({ title: 'Failed to finalize round', description: err.message, variant: 'destructive' });
    } finally {
      setFinalizing(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-space-grotesk font-bold text-[--text-primary] mb-2">
          {challenge.title}
        </h1>
        <p className="text-sm text-[--text-secondary] mb-4">
          {challenge.department_name || `Department ID: ${challenge.department}`}
        </p>
        <div className="flex gap-4 items-center mb-6">
          <StatusBadge status={challenge.status} />
          {challenge.sector_tags && (
            <div className="flex gap-2">
              {(Array.isArray(challenge.sector_tags) ? challenge.sector_tags : String(challenge.sector_tags).split(',')).map((tag, i) => (
                <span 
                  key={i} 
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${getSectorColor(tag)}15`, 
                    color: getSectorColor(tag) 
                  }}
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <section>
            <h3 className="font-semibold text-lg mb-2 text-[--text-primary]">Background</h3>
            <p className="text-[--text-secondary] whitespace-pre-wrap">{challenge.background}</p>
          </section>
          <section>
            <h3 className="font-semibold text-lg mb-2 text-[--text-primary]">Outcome Metrics</h3>
            <p className="text-[--text-secondary] whitespace-pre-wrap">{challenge.outcome_metrics}</p>
          </section>
          <section>
            <h3 className="font-semibold text-lg mb-2 text-[--text-primary]">Constraints</h3>
            <p className="text-[--text-secondary] whitespace-pre-wrap">{challenge.constraints}</p>
          </section>
        </div>
        
        <div className="space-y-6">
          <Card className="rounded-xl border-[--border] shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-sm text-[--text-secondary]">Budget</p>
                <p className="font-semibold text-[--text-primary]">{formatCurrency(challenge.budget_ceiling)}</p>
              </div>
              <div>
                <p className="text-sm text-[--text-secondary]">Timeline</p>
                <p className="font-semibold text-[--text-primary]">{challenge.timeline_weeks} weeks</p>
              </div>
              <div className="pt-4 border-t border-[--border]">
                <p className="text-sm font-medium mb-2 text-[--text-primary]">Eligibility Rules</p>
                <ul className="text-sm space-y-1 text-[--text-secondary]">
                  <li>• DPIIT Recognition: {challenge.require_dpiit_recognition ? 'Yes' : 'No'}</li>
                  <li>• Min Turnover: {challenge.require_minimum_turnover ? 'Yes' : 'No'}</li>
                  <li>• No Prior Blacklist: {challenge.require_no_prior_blacklist ? 'Yes' : 'No'}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="applications" className="mt-8">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>
        <TabsContent value="applications" className="pt-4">
          {/* Rejected count link */}
          {rejectedCount > 0 && (
            <div className="mb-4">
              <button 
                onClick={() => setShowRejected(!showRejected)}
                className="text-sm text-red-600 hover:underline flex items-center gap-1"
              >
                {rejectedCount} rejected
                <span className={`transform transition-transform ${showRejected ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              
              {showRejected && (
                <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="space-y-2">
                    {rejectedApps.map(app => (
                      <div 
                        key={app.id}
                        className="flex items-center justify-between text-sm cursor-pointer hover:bg-red-100 p-2 rounded"
                        onClick={() => navigate(`/applications/${app.id}`)}
                      >
                        <span className="text-red-800">{app.startup_name || `Startup #${app.startup}`}</span>
                        <span className="text-red-600">{app.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Kanban Board */}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map((column) => {
              const columnApps = applications.filter(a => a.status === column.key);
              return (
                <div key={column.key} className="flex-shrink-0 w-[280px]">
                  <div className="bg-[--surface-alt] rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-[--text-primary]">
                        {column.label}
                      </span>
                      <span className="text-xs bg-white px-2 py-0.5 rounded-full text-[--text-secondary]">
                        {columnApps.length}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {columnApps.map((app, index) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.04 }}
                      >
                        <Card 
                          className="rounded-xl border-[--border] shadow-sm card-hover cursor-pointer p-4"
                          onClick={() => navigate(`/applications/${app.id}`)}
                        >
                          <div className="space-y-3">
                            <div>
                              <div className="font-medium text-[--text-primary]">
                                {app.startup_name || `Startup #${app.startup}`}
                              </div>
                              {app.startup_registration_status && (
                                <div className="mt-1">
                                  <TierBadge registrationStatus={app.startup_registration_status} />
                                </div>
                              )}
                            </div>
                            
                            {/* Sector tags */}
                            {app.sector_tags && (
                              <div className="flex flex-wrap gap-1">
                                {(Array.isArray(app.sector_tags) ? app.sector_tags : String(app.sector_tags).split(',')).slice(0, 2).map((tag, i) => (
                                  <span 
                                    key={i}
                                    className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                                  >
                                    {tag.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            {/* Score pill */}
                            {app.average_score && (
                              <div 
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                                style={{ backgroundColor: getScoreColor(app.average_score) }}
                              >
                                {app.average_score}/100
                              </div>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                    
                    {columnApps.length === 0 && (
                      <div className="text-center py-8 text-sm text-gray-400">
                        No applications
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}