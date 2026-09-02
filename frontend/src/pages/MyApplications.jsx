import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Building2, IndianRupee, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { Card } from '../components/ui/card';
import TierBadge from '../components/TierBadge';

const stages = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'screening', label: 'Screening' },
  { key: 'eligible', label: 'Eligible' },
  { key: 'under_evaluation', label: 'Under Evaluation' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'contracted', label: 'Contracted' },
];

export default function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const apps = await api.getMyApplications();
        // Handle DRF pagination response wrapper cleanly
        const applicationList = Array.isArray(apps) ? apps : (apps?.results || []);
        console.log(applicationList);
        setApplications(applicationList);
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const getStageIndex = (status) => {
    if (!status) return 0;
    // Case-insensitive lookup to handle 'SUBMITTED', 'Submitted', or 'submitted'
    const normalized = String(status).toLowerCase().replace(/\s+/g, '_');
    const index = stages.findIndex(s => s.key === normalized);
    return index >= 0 ? index : 0;
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || amount === '') return 'N/A';
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) return 'N/A';
    
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      maximumFractionDigits: 0 
    }).format(numericAmount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[--text-secondary]">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-space-grotesk font-bold text-[--text-primary]">
        My Applications
      </h1>

      {applications.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-[--text-secondary]">No applications yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Browse challenges and apply to get started.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app, index) => (
            <motion.div
              key={app.id || index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ApplicationCard 
                application={app} 
                onClick={() => navigate(`/applications/${app.id}`)}
                getStageIndex={getStageIndex}
                formatCurrency={formatCurrency}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationCard({ application, onClick, getStageIndex, formatCurrency }) {
  const currentIndex = getStageIndex(application.status);
  const normalizedStatus = String(application.status || '').toLowerCase();
  const isRejected = normalizedStatus === 'rejected' || normalizedStatus === 'ineligible';

  const title = application.challenge_title || 'Challenge Application';
  const department = application.department_name || `Dept #${application.challenge}`;

  // Use the exact field names the model now has
  const displayBudget = application.budget_quote;
  const displayTimeline = application.proposed_timeline;

  // Truncate solution brief for preview
  const briefPreview = application.solution_brief
    ? application.solution_brief.length > 100
      ? application.solution_brief.slice(0, 100) + '…'
      : application.solution_brief
    : null;

  return (
    <Card 
      className="p-5 rounded-xl border-[--border] shadow-sm card-hover cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="font-semibold text-[--text-primary]">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-[--text-secondary] mt-1">
            <Building2 size={14} />
            <span>{department}</span>
          </div>
          {/* Solution brief preview — what the user actually submitted */}
          {briefPreview && (
            <p className="text-xs text-[--text-secondary] mt-2 italic leading-relaxed">
              "{briefPreview}"
            </p>
          )}
        </div>
        {application.startup_registration_status && (
          <TierBadge registrationStatus={application.startup_registration_status} />
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className={`absolute top-0 left-0 h-full rounded-full ${
              isRejected ? 'bg-red-500' : 'bg-[--accent]'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / stages.length) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {stages.map((stage, idx) => {
            const isActive = idx === currentIndex;
            const isPast = idx < currentIndex;
            return (
              <span 
                key={stage.key}
                className={`text-xs ${
                  isActive
                    ? 'text-[--accent] font-medium'
                    : isPast
                      ? 'text-[--text-secondary]'
                      : 'text-gray-400'
                }`}
              >
                {stage.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Rejected message */}
      {isRejected && (
        <div className="flex items-center gap-2 text-sm text-red-600 mt-3">
          <AlertCircle size={16} />
          <span>Not selected for this round</span>
        </div>
      )}

      {/* Stats Row */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[--border]">
        <div className="flex items-center gap-2 text-sm text-[--text-secondary]">
          <IndianRupee size={16} />
          <span>
            {displayBudget != null ? formatCurrency(displayBudget) : 'No quote'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[--text-secondary]">
          <Clock size={16} />
          <span>
            {displayTimeline != null ? `${displayTimeline} weeks` : 'No timeline'}
          </span>
        </div>
      </div>
    </Card>
  );
}