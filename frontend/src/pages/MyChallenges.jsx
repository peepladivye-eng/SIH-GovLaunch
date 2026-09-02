import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Target, Users, Clock, FileCheck } from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';

export default function MyChallenges() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [challenges, setChallenges] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // The viewset already scopes challenges to this department — no client filter needed
        const [chals, apps] = await Promise.all([
          api.getChallenges(),
          api.getApplications(),
        ]);

        const chalList = Array.isArray(chals) ? chals
          : Array.isArray(chals?.results) ? chals.results : [];
        const appList = Array.isArray(apps) ? apps
          : Array.isArray(apps?.results) ? apps.results : [];

        setChallenges(chalList);
        setApplications(appList);
      } catch (err) {
        console.error('MyChallenges fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(amount);
  };

  // Stats derived from loaded data
  const openCount        = challenges.filter(c => c.status === 'open').length;
  const totalApplicants  = challenges.reduce((acc, c) => acc + (c.application_count || 0), 0);
  const pendingEval      = applications.filter(a => a.status === 'under_evaluation').length;
  const contractedCount  = applications.filter(a => a.status === 'contracted').length;

  if (loading) return <div className="p-6 text-[--text-secondary]">Loading…</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-space-grotesk font-bold text-[--text-primary]">
            Welcome, {user.name}
          </h1>
          <p className="text-sm text-[--text-secondary]">{user.ministry}</p>
        </div>
        <Button
          onClick={() => navigate('/challenges/new')}
          className="bg-[--gov-accent] hover:bg-[--gov-accent-light] text-white"
        >
          <Plus size={18} className="mr-2" />
          Post Challenge
        </Button>
      </div>

      {/* Stats — all computed from actual fetched data */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Target}   value={openCount}       label="Open Challenges"    color="teal"   />
        <StatCard icon={Users}    value={totalApplicants} label="Total Applicants"   color="indigo" />
        <StatCard icon={Clock}    value={pendingEval}     label="Pending Evaluation" color="amber"  />
        <StatCard icon={FileCheck} value={contractedCount} label="Contracts Signed"  color="green"  />
      </div>

      {/* Challenges Table */}
      <Card className="rounded-xl border-[--border] shadow-sm">
        <div className="p-5 border-b border-[--border]">
          <h2 className="font-semibold text-[--text-primary]">Your Challenges</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[--surface-alt]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[--text-secondary]">Challenge</th>
                <th className="text-left p-4 text-sm font-medium text-[--text-secondary]">Status</th>
                <th className="text-left p-4 text-sm font-medium text-[--text-secondary]">Budget</th>
                <th className="text-left p-4 text-sm font-medium text-[--text-secondary]">Applicants</th>
                <th className="text-left p-4 text-sm font-medium text-[--text-secondary]">Timeline</th>
              </tr>
            </thead>
            <tbody>
              {challenges.map((chal) => (
                <tr
                  key={chal.id}
                  className="border-t border-[--border] cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/challenges/${chal.id}`)}
                >
                  <td className="p-4">
                    <div className="font-medium text-[--text-primary]">{chal.title}</div>
                  </td>
                  <td className="p-4"><StatusBadge status={chal.status} /></td>
                  <td className="p-4 text-[--text-secondary]">{formatCurrency(chal.budget_ceiling)}</td>
                  <td className="p-4 text-[--text-secondary]">{chal.application_count ?? 0}</td>
                  <td className="p-4 text-[--text-secondary]">{chal.timeline_weeks} weeks</td>
                </tr>
              ))}
              {challenges.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[--text-secondary]">
                    No challenges yet. Click "Post Challenge" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
