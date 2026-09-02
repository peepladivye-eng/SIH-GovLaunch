import React, { useState, useEffect } from 'react';
import { Shield, Clock, User, Activity } from 'lucide-react';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import StatCard from '../components/StatCard';

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api.getAuditLogs();
        setLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

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

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  // Get unique actions for stats
  const actionTypes = [...new Set(logs.map(l => l.action))];
  const recentLogs = logs.slice(0, 50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-space-grotesk font-bold text-[--text-primary] flex items-center gap-2">
          <Shield size={24} className="text-[--gov-accent]" />
          Audit Trail
        </h1>
        <p className="text-sm text-[--text-secondary] mt-1">
          System activity log and compliance tracking
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          value={logs.length}
          label="Total Events"
          color="teal"
          countUp={true}
        />
        <StatCard
          icon={User}
          value={[...new Set(logs.map(l => l.actor))].length}
          label="Active Users"
          color="indigo"
          countUp={true}
        />
        <StatCard
          icon={Clock}
          value={logs.filter(l => getRelativeTime(l.timestamp).includes('m') || getRelativeTime(l.timestamp).includes('h')).length}
          label="Last 24h Events"
          color="amber"
          countUp={true}
        />
        <StatCard
          icon={Shield}
          value={actionTypes.length}
          label="Action Types"
          color="green"
          countUp={true}
        />
      </div>

      {/* Logs Table */}
      <Card className="rounded-xl border-[--border] shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentLogs.map((log, index) => (
              <div 
                key={log.id || index}
                className="flex items-center justify-between py-3 border-b border-[--border] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <User size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <div className="font-medium text-[--text-primary] text-sm">
                      {log.actor}
                    </div>
                    <div className="text-xs text-[--text-secondary]">
                      {log.action}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {log.timestamp && getRelativeTime(log.timestamp)}
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-center py-8 text-[--text-secondary]">
                No audit logs yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}