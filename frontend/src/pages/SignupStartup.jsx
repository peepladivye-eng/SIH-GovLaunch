import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lightbulb, FileText, BadgeCheck, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/toast';

const sectors = [
  { id: 'healthtech', label: 'Healthtech' },
  { id: 'defense-tech', label: 'Defense-tech' },
  { id: 'agritech', label: 'Agritech' },
  { id: 'fintech', label: 'Fintech' },
  { id: 'cleantech', label: 'Cleantech' },
];

const registrationStatuses = [
  { 
    id: 'unregistered', 
    label: 'Idea Stage', 
    sublabel: 'No incorporation yet',
    icon: Lightbulb 
  },
  { 
    id: 'incorporated', 
    label: 'Incorporated', 
    sublabel: 'DPIIT pending',
    icon: FileText 
  },
  { 
    id: 'dpiit_recognized', 
    label: 'DPIIT Recognized', 
    sublabel: 'Fully registered',
    icon: BadgeCheck 
  },
];

export default function SignupStartup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    sector_tags: [],
    team_size: '',
    founded_year: '',
    pitch_summary: '',
    registration_status: '',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSectorToggle = (sectorId) => {
    setFormData(prev => ({
      ...prev,
      sector_tags: prev.sector_tags.includes(sectorId)
        ? prev.sector_tags.filter(s => s !== sectorId)
        : [...prev.sector_tags, sectorId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.signup({
        username: formData.username,
        password: formData.password,
        name: formData.name,
        role: 'startup',
        sector_tags: formData.sector_tags,
        team_size: parseInt(formData.team_size) || 0,
        founded_year: parseInt(formData.founded_year) || null,
        pitch_summary: formData.pitch_summary,
        registration_status: formData.registration_status
      });
      toast({ title: 'Account created!', description: 'Please log in to continue.' });
      navigate('/login');
    } catch (err) {
      toast({
        title: 'Registration failed',
        description: err.response?.data?.detail || 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Dark with quote */}
      <div className="hidden lg:flex lg:w-1/2 bg-[--bg] flex-col items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md text-center"
        >
          <blockquote className="text-2xl font-space-grotesk font-medium text-white mb-6">
            "Registration is required to sign a contract. It's never required to compete."
          </blockquote>
          <p className="text-gray-400 text-sm">
            GovLaunch believes in equal opportunity for all startups, regardless of their registration stage.
          </p>
        </motion.div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <h2 className="text-2xl font-space-grotesk font-bold text-[--text-primary] mb-6">
            Register your startup
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Startup Name */}
            <div>
              <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                Startup Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your startup name"
                required
              />
            </div>

            {/* Sector - Multi-select chips */}
            <div>
              <label className="block text-sm font-medium text-[--text-secondary] mb-2">
                Sector
              </label>
              <div className="flex flex-wrap gap-2">
                {sectors.map((sector) => (
                  <button
                    key={sector.id}
                    type="button"
                    onClick={() => handleSectorToggle(sector.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      formData.sector_tags.includes(sector.id)
                        ? 'bg-[--accent] text-white'
                        : 'bg-gray-100 text-[--text-secondary] hover:bg-gray-200'
                    }`}
                  >
                    {sector.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Size & Founded Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                  Team Size
                </label>
                <Input
                  type="number"
                  value={formData.team_size}
                  onChange={(e) => setFormData({ ...formData, team_size: e.target.value })}
                  placeholder="e.g., 5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                  Founded Year
                </label>
                <Input
                  type="number"
                  value={formData.founded_year}
                  onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
                  placeholder="e.g., 2024"
                />
              </div>
            </div>

            {/* Pitch Summary */}
            <div>
              <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                Pitch Summary
              </label>
              <textarea
                value={formData.pitch_summary}
                onChange={(e) => setFormData({ ...formData, pitch_summary: e.target.value })}
                placeholder="Brief description of your startup..."
                rows={3}
                className="flex w-full rounded-lg border border-[--border] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent"
              />
            </div>

            {/* Registration Status - Card Selection */}
            <div>
              <label className="block text-sm font-medium text-[--text-secondary] mb-2">
                Registration Status
              </label>
              <div className="grid grid-cols-3 gap-3">
                {registrationStatuses.map((status) => (
                  <button
                    key={status.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, registration_status: status.id })}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      formData.registration_status === status.id
                        ? 'border-[--accent] bg-[--accent]/5'
                        : 'border-[--border] hover:border-gray-300'
                    }`}
                  >
                    <status.icon 
                      size={20} 
                      className={formData.registration_status === status.id ? 'text-[--accent]' : 'text-gray-400'} 
                    />
                    <div className="text-sm font-medium mt-1">{status.label}</div>
                    <div className="text-xs text-gray-500">{status.sublabel}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Username & Password */}
            <div>
              <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                Username
              </label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Choose a username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                Password
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a password"
                required
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[--accent] hover:bg-[--accent-dark] text-white"
            >
              {loading ? 'Creating Account...' : 'Create Startup Account'}
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[--text-secondary]">
            Already registered?{' '}
            <Link to="/login" className="text-[--accent] hover:underline font-medium">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
