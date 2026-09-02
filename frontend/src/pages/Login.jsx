import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Target, TrendingUp, ChevronDown, Building2, Zap, Rocket } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/toast';
import { NumberTicker } from '../components/NumberTicker';
import { ShimmerButton } from '../components/ShimmerButton';

// ── demo account list ─────────────────────────────────────────────────────────
const DEMO = [
  { role: 'startup',    username: 'meditriage-ai' },
  { role: 'startup',    username: 'agrosense-labs' },
  { role: 'startup',    username: 'securegrid-systems' },
  { role: 'startup',    username: 'ruralpay-connect' },
  { role: 'startup',    username: 'cleanair-sensors' },
  { role: 'startup',    username: 'diagnoai' },
  { role: 'startup',    username: 'dronewatch-defence' },
  { role: 'startup',    username: 'watergrid-analytics' },
  { role: 'department', username: 'health.dept' },
  { role: 'department', username: 'defence.dept' },
  { role: 'department', username: 'niti.dept' },
  { role: 'evaluator',  username: 'evaluator1' },
  { role: 'evaluator',  username: 'evaluator2' },
  { role: 'admin',      username: 'admin' },
];

const ROLE_DOT = {
  startup:    'bg-[#4F46E5]',
  department: 'bg-[#0F766E]',
  evaluator:  'bg-amber-500',
  admin:      'bg-slate-500',
};

export default function Login() {
  const navigate   = useNavigate();
  const { toast }  = useToast();

  const [username,      setUsername]      = useState('');
  const [password,      setPassword]      = useState('');
  const [loading,       setLoading]       = useState(false);
  const [demoOpen,      setDemoOpen]      = useState(false);
  const [stats,         setStats]         = useState({ challenges: 0, startups: 0, pilots: 0 });

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getPublicStats();
        setStats({
          challenges: data.open_challenges ?? 0,
          startups:   data.startups        ?? 0,
          pilots:     data.pilots_scaled   ?? 0,
        });
      } catch (_) {}
    })();
  }, []);

  // ── login handler ──────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loginRes = await api.login(username, password);
      const meRes    = await api.me();
      const userData = {
        ...loginRes,
        name:                  meRes.name,
        sector_tags:           meRes.sector_tags,
        registration_status:   meRes.registration_status,
        ministry:              meRes.ministry,
      };
      localStorage.setItem('user', JSON.stringify(userData));
      const routes = { department: '/challenges', startup: '/dashboard', evaluator: '/evaluate', admin: '/audit' };
      navigate(routes[userData.role] ?? '/');
    } catch (err) {
      // Parse the error message — avoid showing raw JSON to user
      let msg = 'Invalid username or password';
      try {
        const parsed = JSON.parse(err.message);
        msg = parsed.detail || parsed.error || msg;
      } catch (_) {
        if (err.message && !err.message.startsWith('{')) msg = err.message;
      }
      toast({ title: 'Login failed', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // ── quick-fill from demo click ────────────────────────────────────────────
  const fillDemo = (u) => { setUsername(u); setPassword('demo1234'); };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* ═══════════════════════════════════════════════════════════════════
          LEFT COLUMN — dark navy, animated tricolor mesh
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative flex-1 flex flex-col justify-between overflow-hidden bg-[#0A0E17] px-10 py-12 min-h-[340px] md:min-h-screen">

        {/* Animated tricolor ambient mesh */}
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 18, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 20%, rgba(255,153,51,0.22) 0%, transparent 45%),
              radial-gradient(circle at 82% 75%, rgba(19,136,8,0.20) 0%, transparent 45%),
              radial-gradient(circle at 50% 50%, rgba(0,0,128,0.18) 0%, transparent 55%)
            `,
            backgroundSize: '200% 200%',
          }}
        />

        {/* Top — logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          {/* Tricolor gradient dot */}
          <div
            className="w-5 h-5 rounded-full shadow-lg"
            style={{
              background: 'conic-gradient(from 0deg, #FF9933 0deg, #FF9933 120deg, #ffffff 120deg, #ffffff 240deg, #138808 240deg, #138808 360deg)',
              boxShadow: '0 0 12px rgba(255,153,51,0.5)',
            }}
          />
          <span className="font-space-grotesk text-xl font-bold text-white tracking-tight">
            GovLaunch
          </span>
        </div>

        {/* Middle — headline */}
        <div className="relative z-10 mt-auto mb-auto py-10 max-w-md">
          <h1 className="font-space-grotesk text-4xl font-bold text-white leading-[1.15] mb-4">
            Merit gets you evaluated.{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #FF9933, #138808)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Registration gets you paid.
            </span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            One platform. Two sides. Every application timestamped,
            every view logged, every contract auto-drafted.
          </p>
        </div>

        {/* Bottom — live stat counters */}
        <div className="relative z-10 grid grid-cols-3 gap-4 mt-auto">
          <StatPill icon={Target}     value={stats.challenges} label="Open Challenges" color="#FF9933" />
          <StatPill icon={Rocket}     value={stats.startups}   label="Startups"        color="#138808" />
          <StatPill icon={TrendingUp} value={stats.pilots}     label="Pilots Scaled"   color="#4F46E5" />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          RIGHT COLUMN — soft off-white, login card
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] px-6 py-12">
        <div className="w-full max-w-sm space-y-4">

          {/* ── Login card ──────────────────────────────────────────────── */}
          <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-slate-200/80">
            {/* Tricolor top border accent */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
              style={{ background: 'linear-gradient(90deg, #FF9933 0%, #000080 50%, #138808 100%)' }}
            />

            {/* Card header */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-1">
                Welcome back
              </p>
              <h2 className="text-2xl font-bold text-slate-900">
                Log in to GovLaunch
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. meditriage-ai"
                  required
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-[#FF9933] transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-[#FF9933] transition"
                />
              </div>

              {/* Shimmer CTA — saffron-toned dark bg */}
              <ShimmerButton
                type="submit"
                disabled={loading}
                background="rgba(15,12,30,1)"
                shimmerColor="#FF9933"
                shimmerDuration="2.5s"
                borderRadius="10px"
                className="w-full h-11 text-sm font-semibold text-white mt-1"
              >
                {loading ? 'Logging in…' : 'Log In'}
              </ShimmerButton>
            </form>

            {/* Role badges */}
            <div className="flex items-center gap-2 mt-5 justify-center">
              <span className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                <Zap size={12} className="text-[#4F46E5]" />
                Startup
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                <Building2 size={12} className="text-[#0F766E]" />
                Government
              </span>
            </div>
          </div>

          {/* ── Demo accounts accordion ──────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setDemoOpen(o => !o)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <span>Demo Accounts</span>
              <motion.span
                animate={{ rotate: demoOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={16} className="text-slate-400" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {demoOpen && (
                <motion.div
                  key="demo"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 pt-1 max-h-64 overflow-y-auto space-y-0.5">
                    {['startup', 'department', 'evaluator', 'admin'].map(group => (
                      <div key={group} className="mb-3">
                        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1.5">
                          {group === 'department' ? 'Government' : group}
                        </div>
                        {DEMO.filter(d => d.role === group).map(d => (
                          <button
                            key={d.username}
                            type="button"
                            onClick={() => fillDemo(d.username)}
                            className="flex items-center gap-2.5 w-full py-1.5 px-2 rounded-lg hover:bg-slate-50 transition group text-left"
                          >
                            <span className={`w-2 h-2 rounded-full shrink-0 ${ROLE_DOT[d.role]}`} />
                            <span className="text-xs font-mono text-slate-800 group-hover:text-slate-900">
                              {d.username}
                            </span>
                            <span className="text-xs font-mono text-slate-400 ml-auto">
                              demo1234
                            </span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sign-up links */}
          <p className="text-center text-xs text-slate-500">
            New here?{' '}
            <Link to="/signup/startup" className="text-[#4F46E5] hover:underline font-medium">
              Register a startup
            </Link>
            {' '}or{' '}
            <Link to="/signup/department" className="text-[#0F766E] hover:underline font-medium">
              register a department
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Stat pill component ───────────────────────────────────────────────────────
function StatPill({ icon: Icon, value, label, color }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <Icon size={14} style={{ color }} />
        <span className="text-[11px] text-slate-400 uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-2xl font-space-grotesk font-bold text-white">
        <NumberTicker
          value={value}
          className="text-2xl font-space-grotesk font-bold text-white"
        />
      </div>
    </div>
  );
}
