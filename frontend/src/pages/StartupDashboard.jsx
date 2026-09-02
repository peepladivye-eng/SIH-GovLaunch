import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { FileText, Star, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import StatCard from '../components/StatCard';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import TierBadge from '../components/TierBadge';

// Simple date diff for relative timestamps
const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export default function StartupDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState({
    activeApplications: 0,
    shortlisted: 0,
    contracted: 0
  });
  const [challenges, setChallenges] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [myApplications, setMyApplications] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRaw, challengesRaw, meData] = await Promise.all([
          api.getApplications(),
          api.getChallenges(),
          api.me(),
        ]);

        // Handle paginated or plain array
        const apps = Array.isArray(appsRaw) ? appsRaw
          : Array.isArray(appsRaw?.results) ? appsRaw.results : [];
        const allChallenges = Array.isArray(challengesRaw) ? challengesRaw
          : Array.isArray(challengesRaw?.results) ? challengesRaw.results : [];

        const activeStatuses = ['submitted', 'screening', 'eligible', 'under_evaluation'];
        setStats({
          activeApplications: apps.filter(a => activeStatuses.includes(a.status)).length,
          shortlisted:        apps.filter(a => a.status === 'shortlisted').length,
          contracted:         apps.filter(a => a.status === 'contracted').length,
        });

        setMyApplications(apps);

        // Recommended challenges — sector match
        const mySectors = meData.sector_tags || [];
        const open = allChallenges.filter(c => ['open', 'published'].includes(c.status));
        const recommended = mySectors.length > 0
          ? open.filter(c => {
              const tags = Array.isArray(c.sector_tags)
                ? c.sector_tags
                : String(c.sector_tags || '').split(',').map(s => s.trim());
              return tags.some(t => mySectors.includes(t));
            })
          : open;
        setChallenges(recommended.slice(0, 4));

      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
    };
    fetchData();
  }, []);

  const getSectorColor = (sector) => {
    const colors = {
      'healthtech': 'indigo',
      'defense-tech': 'slate',
      'agritech': 'green',
      'fintech': 'amber',
      'cleantech': 'teal',
    };
    return colors[sector?.toLowerCase()] || 'indigo';
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      maximumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-space-grotesk font-bold text-[--text-primary]">
          Welcome back, {user.name || 'Startup'}
        </h1>
        {user.registration_status && (
          <TierBadge registrationStatus={user.registration_status} />
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={FileText}
          value={stats.activeApplications}
          label="Active Applications"
          color="indigo"
          countUp={true}
        />
        <StatCard
          icon={Star}
          value={stats.shortlisted}
          label="Shortlisted"
          color="amber"
          countUp={true}
        />
        <StatCard
          icon={CheckCircle}
          value={stats.contracted}
          label="Contracts"
          color="green"
          countUp={true}
        />
      </div>

      {/* Recommended Challenges */}
      {challenges.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[--text-primary] mb-4">
            Recommended Challenges
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {challenges.map((challenge) => (
              <Card
                key={challenge.id}
                className="p-5 rounded-xl border-[--border] shadow-sm card-hover cursor-pointer"
                onClick={() => navigate(`/discover/${challenge.id}`)}
                >
                  {/* Sector color strip */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                    style={{ 
                      backgroundColor: getSectorColor(
                        Array.isArray(challenge.sector_tags) 
                          ? challenge.sector_tags[0] 
                          : challenge.sector_tags?.split(',')[0]
                      ) === 'indigo' ? '#4F46E5' :
                      getSectorColor(
                        Array.isArray(challenge.sector_tags) 
                          ? challenge.sector_tags[0] 
                          : challenge.sector_tags?.split(',')[0]
                      ) === 'slate' ? '#475569' :
                      getSectorColor(
                        Array.isArray(challenge.sector_tags) 
                          ? challenge.sector_tags[0] 
                          : challenge.sector_tags?.split(',')[0]
                      ) === 'green' ? '#10B981' :
                      getSectorColor(
                        Array.isArray(challenge.sector_tags) 
                          ? challenge.sector_tags[0] 
                          : challenge.sector_tags?.split(',')[0]
                      ) === 'amber' ? '#F59E0B' : '#0F766E'
                    }}
                  />
                  <div className="pl-3">
                    <h3 className="font-semibold text-[--text-primary] mb-1">
                      {challenge.title}
                    </h3>
                    <p className="text-sm text-[--text-secondary] mb-3">
                      {challenge.department_name || `Dept #${challenge.department}`}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(Array.isArray(challenge.sector_tags) 
                        ? challenge.sector_tags 
                        : String(challenge.sector_tags || '').split(',')
                      ).filter(Boolean).map((tag, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 bg-gray-100 text-[--text-secondary] rounded-full text-xs"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[--text-secondary]">
                        {formatCurrency(challenge.budget_ceiling)}
                      </span>
                      <span className="text-[--text-secondary]">
                        {challenge.timeline_weeks} weeks
                      </span>
                    </div>
                  </div>
                </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[--text-primary] mb-4">
            Recent Activity
          </h2>
          <Card className="p-4 rounded-xl border-[--border] shadow-sm">
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <Clock size={14} className="text-gray-400" />
                  <span className="text-[--text-secondary]">
                    {activity.action}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {getRelativeTime(activity.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
