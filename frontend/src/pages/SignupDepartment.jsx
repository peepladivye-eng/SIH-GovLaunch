import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Building2 } from 'lucide-react';
import { api } from '../lib/api';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/toast';

export default function SignupDepartment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    ministry: '',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.signup({
        username: formData.username,
        password: formData.password,
        name: formData.name,
        role: 'department',
        ministry: formData.ministry
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
      {/* Left - Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <h2 className="text-2xl font-space-grotesk font-bold text-[--text-primary] mb-6">
            Register your department
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Department Name */}
            <div>
              <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                Department Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Ministry of Health & Family Welfare"
                required
              />
            </div>

            {/* Ministry */}
            <div>
              <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                Ministry
              </label>
              <Input
                value={formData.ministry}
                onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                placeholder="e.g., Ministry of Health & Family Welfare"
                required
              />
            </div>

            {/* Username */}
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

            {/* Password */}
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
              className="w-full bg-[--gov-accent] hover:bg-[--gov-accent-light] text-white"
            >
              {loading ? 'Creating Account...' : 'Create Department Account'}
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[--text-secondary]">
            Already registered?{' '}
            <Link to="/login" className="text-[--gov-accent] hover:underline font-medium">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right - Dark with quote */}
      <div className="hidden lg:flex lg:w-1/2 bg-[--bg] flex-col items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md text-center"
        >
          <div className="w-16 h-16 rounded-xl bg-[--gov-accent]/20 flex items-center justify-center mx-auto mb-6">
            <Building2 className="text-[--gov-accent]" size={32} />
          </div>
          <blockquote className="text-2xl font-space-grotesk font-medium text-white mb-6">
            "Post the outcome you need. Let merit find you the solution."
          </blockquote>
          <p className="text-gray-400 text-sm">
            Join India's leading platform for government-startup collaboration.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
