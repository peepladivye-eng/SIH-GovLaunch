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

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── Department Hero Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        style={{
          position: 'relative', overflow: 'hidden', borderRadius: 20, marginBottom: 24, padding: '28px 32px',
          background: 'linear-gradient(135deg, #0D1117 0%, #0A0E1A 55%, #0C1020 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
        }}
      >
        {/* Ambient orbs */}
        <motion.div animate={{ x: [0,18,0], y: [0,-14,0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -50, left: -50, width: 260, height: 260, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(13,148,136,0.2) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <motion.div animate={{ x: [0,-14,0], y: [0,18,0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          style={{ position: 'absolute', bottom: -40, right: -40, width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(8,145,178,0.15) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#2DD4BF', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
              Government Portal
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
              Welcome, {user.name}
            </h1>
            <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{user.ministry}</p>
          </div>

          <motion.button
            onClick={() => navigate('/challenges/new')}
            whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(13,148,136,0.4)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 22px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #0D9488, #0891B2)',
              color: '#fff', fontWeight: 700, fontSize: 14,
              boxShadow: '0 4px 16px rgba(13,148,136,0.3)',
            }}
          >
            <Plus size={18} />
            Post Challenge
          </motion.button>
        </div>
      </motion.div>

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
