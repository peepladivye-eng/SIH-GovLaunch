import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { Card, CardContent } from '../components/ui/card';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';

export default function EvaluatorReview() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const apps = await api.getApplications();
        setApplications(apps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const pendingApps = applications.filter(a => a.status === 'under_evaluation');
  const evaluatedApps = applications.filter(a => a.status === 'shortlisted' || a.status === 'rejected');

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-space-grotesk font-bold text-[--text-primary]">
          Welcome, Evaluator
        </h1>
        <p className="text-sm text-[--text-secondary]">
          Review and score startup applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={Clock}
          value={pendingApps.length}
          label="Pending Review"
          color="amber"
          countUp={true}
        />
        <StatCard
          icon={CheckCircle}
          value={evaluatedApps.filter(a => a.status === 'shortlisted').length}
          label="Shortlisted"
          color="green"
          countUp={true}
        />
        <StatCard
          icon={AlertCircle}
          value={evaluatedApps.filter(a => a.status === 'rejected').length}
          label="Rejected"
          color="red"
          countUp={true}
        />
      </div>

      {/* Applications List */}
      <Card className="rounded-xl border-[--border] shadow-sm">
        <div className="p-5 border-b border-[--border]">
          <h2 className="font-semibold text-[--text-primary]">Applications for Review</h2>
        </div>
        <div className="divide-y divide-[--border]">
            {pendingApps.map((app) => (
              <div
                key={app.id}
                className="p-5 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                onClick={() => navigate(`/evaluate/${app.id}`)}
              >
                <div>
                  <div className="font-medium text-[--text-primary]">
                    {app.challenge_title || `Application #${app.id}`}
                  </div>
                  <div className="text-sm text-[--text-secondary] mt-1">
                    {app.startup_name || `Startup #${app.startup}`}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={app.status} />
                  <div className="text-[--text-secondary] text-sm">
                    Submitted {new Date(app.created_at || app.submitted_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          {pendingApps.length === 0 && (
            <div className="p-8 text-center text-[--text-secondary]">
              No applications pending review.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
