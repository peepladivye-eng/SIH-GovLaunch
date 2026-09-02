import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Filter, IndianRupee, Clock, Building2, Target } from 'lucide-react';
import { api } from '../lib/api';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export default function DiscoverChallenges() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    sector: 'All',
    department: 'All',
    minBudget: '',
    maxBudget: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chals, depts] = await Promise.all([
          api.getChallenges(),
          api.getDepartments()
        ]);
        setChallenges(chals.filter(c => c.status === 'open' || c.status === 'published'));
        setDepartments(depts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const filteredChallenges = challenges.filter(c => {
    if (filters.search && !c.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    
    if (filters.sector !== 'All') {
      const tags = Array.isArray(c.sector_tags) ? c.sector_tags : String(c.sector_tags || '').split(',');
      if (!tags.some(t => t.trim().toLowerCase() === filters.sector.toLowerCase())) return false;
    }
    
    if (filters.department !== 'All' && String(c.department) !== String(filters.department) && c.department_name !== filters.department) {
      return false;
    }
    
    if (filters.minBudget && Number(c.budget_ceiling) < Number(filters.minBudget)) return false;
    if (filters.maxBudget && Number(c.budget_ceiling) > Number(filters.maxBudget)) return false;
    
    return true;
  });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[--text-secondary]">Loading challenges...</div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Filter Panel */}
      <div className="w-[280px] bg-white border-r border-[--border] p-5 overflow-y-auto shrink-0">
        <div className="flex items-center gap-2 mb-5">
          <Filter size={18} className="text-[--accent]" />
          <h2 className="font-semibold text-[--text-primary]">Filters</h2>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-medium text-[--text-secondary] mb-1.5 block">Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="Search challenges..." 
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[--text-secondary] mb-1.5 block">Sector</label>
            <select 
              className="flex h-10 w-full rounded-lg border border-[--border] bg-white px-3 py-2 text-sm"
              value={filters.sector} 
              onChange={e => setFilters({...filters, sector: e.target.value})}
            >
              <option value="All">All Sectors</option>
              <option value="healthtech">Healthtech</option>
              <option value="defense-tech">Defense-tech</option>
              <option value="agritech">Agritech</option>
              <option value="fintech">Fintech</option>
              <option value="cleantech">Cleantech</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[--text-secondary] mb-1.5 block">Department</label>
            <select 
              className="flex h-10 w-full rounded-lg border border-[--border] bg-white px-3 py-2 text-sm"
              value={filters.department} 
              onChange={e => setFilters({...filters, department: e.target.value})}
            >
              <option value="All">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium text-[--text-secondary] block">Budget Range (INR)</label>
            <Input 
              type="number" 
              placeholder="Min Budget" 
              value={filters.minBudget}
              onChange={e => setFilters({...filters, minBudget: e.target.value})}
            />
            <Input 
              type="number" 
              placeholder="Max Budget" 
              value={filters.maxBudget}
              onChange={e => setFilters({...filters, maxBudget: e.target.value})}
            />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[--border]">
          <div className="text-sm text-[--text-secondary]">
            Showing {filteredChallenges.length} challenges
          </div>
        </div>
      </div>

      {/* Grid Panel */}
      <div className="flex-1 p-6 overflow-y-auto bg-[--surface-alt]">
        <div className="mb-4">
          <h1 className="text-2xl font-space-grotesk font-bold text-[--text-primary] flex items-center gap-2">
            <Target size={24} className="text-[--accent]" />
            Discover Challenges
          </h1>
          <p className="text-sm text-[--text-secondary] mt-1">
            Browse and apply to government challenges that match your expertise
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredChallenges.map((chal, index) => (
            <motion.div
              key={chal.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card 
                className="rounded-xl border-[--border] shadow-sm card-hover cursor-pointer overflow-hidden"
                onClick={() => navigate(`/discover/${chal.id}`)}
              >
                {/* Sector color strip */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ 
                    backgroundColor: getSectorColor(
                      Array.isArray(chal.sector_tags) 
                        ? chal.sector_tags[0] 
                        : chal.sector_tags?.split(',')[0]
                    )
                  }}
                />
                <CardContent className="p-5 pl-6">
                  <div className="mb-3">
                    <h3 className="font-semibold text-[--text-primary] leading-tight">
                      {chal.title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-[--text-secondary] mt-1">
                      <Building2 size={14} />
                      <span>{chal.department_name || `Dept #${chal.department}`}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(Array.isArray(chal.sector_tags) ? chal.sector_tags : String(chal.sector_tags || '').split(',')).filter(Boolean).map((tag, i) => (
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
                  
                  <div className="flex items-center justify-between pt-3 border-t border-[--border]">
                    <div className="flex items-center gap-1 text-sm text-[--text-secondary]">
                      <IndianRupee size={16} />
                      <span>{formatCurrency(chal.budget_ceiling)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-[--text-secondary]">
                      <Clock size={16} />
                      <span>{chal.timeline_weeks} weeks</span>
                    </div>
                  </div>

                  <Button className="w-full mt-4 bg-[--accent] hover:bg-[--accent-dark] text-white">
                    View & Apply
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filteredChallenges.length === 0 && (
            <div className="col-span-2 text-center py-12 text-[--text-secondary]">
              No challenges match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}