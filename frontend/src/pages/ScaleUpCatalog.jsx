import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Building2, Users, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../components/ui/toast';

export default function ScaleUpCatalog() {
  const { toast } = useToast();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  // M3.7 — track which entry ids were just adopted this session
  const [justAdopted, setJustAdopted] = useState({});

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const data = await api.getScaleUpEntries();
      setEntries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdopt = async (entryId) => {
    try {
      await api.updateScaleUpEntry(entryId, { adopted: true });
      toast({ title: 'Adopted!', description: 'You have adopted this pilot.' });
      // flag this entry so we can animate the new chip (M3.7)
      setJustAdopted(prev => ({ ...prev, [entryId]: true }));
      const data = await api.getScaleUpEntries();
      setEntries(data);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to adopt pilot', variant: 'destructive' });
    }
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-space-grotesk font-bold text-[--text-primary] flex items-center gap-2">
          <TrendingUp size={24} className="text-[--gov-accent]" />
          Scale-Up Catalog
        </h1>
        <p className="text-sm text-[--text-secondary] mt-1">
          Proven pilots ready for wider adoption across government
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="rounded-xl border-[--border] shadow-sm transition-shadow duration-150 hover:shadow-md relative overflow-hidden">
              {/* Proven ribbon */}
              {(entry.adopted_count > 0 || entry.has_adopted) && (
                <div className="absolute top-0 right-0 bg-[--gov-accent] text-white text-xs font-medium px-2 py-1 rounded-bl-lg z-10">
                  PROVEN PILOT
                </div>
              )}

              <CardHeader className="pb-3">
                <CardTitle className="text-base pr-20">{entry.pilot_name || entry.name}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Startup */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {(entry.startup_name || 'S').charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm text-[--text-secondary]">
                    {entry.startup_name || `Startup #${entry.startup}`}
                  </span>
                </div>

                {/* Outcome */}
                <div className="flex items-start gap-2">
                  <TrendingUp size={16} className="text-[--gov-accent] mt-0.5 shrink-0" />
                  <p className="text-sm text-[--text-secondary]">
                    {entry.outcome_summary || 'Successful pilot with measurable outcomes.'}
                  </p>
                </div>

                {/* Avatar stack of adopting departments */}
                {entry.adopting_departments && entry.adopting_departments.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {entry.adopting_departments.slice(0, 3).map((dept, idx) => {
                        const isNew = idx === entry.adopting_departments.length - 1 && justAdopted[entry.id];
                        const chip = (
                          <div
                            key={idx}
                            className="w-7 h-7 rounded-full bg-[--gov-accent] border-2 border-white flex items-center justify-center"
                            title={dept.name || dept}
                          >
                            <span className="text-white text-xs font-medium">
                              {(dept.name || dept).charAt(0)}
                            </span>
                          </div>
                        );
                        // M3.7 — spring pop on the newly-added department chip
                        return isNew ? (
                          <motion.div
                            key={idx}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                          >
                            {chip}
                          </motion.div>
                        ) : chip;
                      })}
                      {entry.adopting_departments.length > 3 && (
                        <div className="w-7 h-7 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center">
                          <span className="text-white text-xs">+{entry.adopting_departments.length - 3}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-[--text-secondary]">
                      {entry.adopting_departments.length} dept{entry.adopting_departments.length > 1 ? 's' : ''} adopted
                    </span>
                  </div>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-4 pt-2 border-t border-[--border]">
                  <div className="flex items-center gap-1 text-sm text-[--text-secondary]">
                    <Users size={14} />
                    <span>{entry.adopted_count || 0} adoptions</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-[--text-secondary]">
                    <Building2 size={14} />
                    <span>{entry.deployment_count || 0} deployments</span>
                  </div>
                </div>

                {/* Adopt button — departments only */}
                {user.role === 'department' && (
                  <Button
                    onClick={() => handleAdopt(entry.id)}
                    variant={entry.has_adopted ? 'outline' : 'default'}
                    className={`w-full ${entry.has_adopted ? '' : 'bg-[--gov-accent] hover:bg-[--gov-accent-light] text-white'}`}
                    disabled={entry.has_adopted}
                  >
                    {entry.has_adopted ? (
                      <><CheckCircle size={16} className="mr-2" />Adopted</>
                    ) : 'Adopt This Pilot'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {entries.length === 0 && (
          <div className="col-span-full text-center py-12 text-[--text-secondary]">
            No scale-up entries yet.
          </div>
        )}
      </div>
    </div>
  );
}
