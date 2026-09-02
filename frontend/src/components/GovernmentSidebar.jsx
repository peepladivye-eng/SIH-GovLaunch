import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Target, Plus, FileText, LogOut, Database, Shield, ShieldCheck, Eye } from 'lucide-react';
import { api } from '../lib/api';

const BG       = '#0B0F19';
const BORDER   = 'rgba(255,255,255,0.08)';

// accent colors per role
const ROLE_META = {
  department: {
    accent:    '#0F766E',   // teal
    activeBg:  'rgba(15,118,110,0.12)',
    label:     'Department',
    portalLabel: 'GOVERNMENT PORTAL',
    navItems: [
      { path: '/challenges',     label: 'My Challenges',    icon: Target },
      { path: '/challenges/new', label: 'Post Challenge',   icon: Plus },
      { path: '/catalog',        label: 'Scale-Up Catalog', icon: Database },
      { path: '/supervision',    label: 'Supervision',      icon: ShieldCheck },
    ],
  },
  evaluator: {
    accent:    '#F59E0B',   // amber
    activeBg:  'rgba(245,158,11,0.12)',
    label:     'Evaluator',
    portalLabel: 'EVALUATION PORTAL',
    navItems: [
      { path: '/evaluate', label: 'My Reviews',      icon: Eye },
      { path: '/catalog',  label: 'Scale-Up Catalog', icon: Database },
    ],
  },
  admin: {
    accent:    '#EF4444',   // red
    activeBg:  'rgba(239,68,68,0.12)',
    label:     'Admin',
    portalLabel: 'ADMIN PORTAL',
    navItems: [
      { path: '/audit',   label: 'Audit Trail',     icon: Shield },
      { path: '/catalog', label: 'Scale-Up Catalog', icon: Database },
    ],
  },
};

export default function GovernmentSidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const meta = ROLE_META[user.role] ?? ROLE_META.department;

  const handleLogout = () => {
    api.logout();
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: 260, height: '100vh',
      backgroundColor: BG, display: 'flex', flexDirection: 'column',
      zIndex: 40, fontFamily: "'Inter', sans-serif",
    }}>
      {/* Logo */}
      <div style={{ padding: '24px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}99)`,
            boxShadow: `0 0 10px ${meta.accent}55`,
          }} />
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 18, fontWeight: 700, color: '#fff',
          }}>GovLaunch</span>
        </div>
        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4, letterSpacing: '0.05em' }}>
          {meta.portalLabel}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {meta.navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={{ textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                  position: 'relative', cursor: 'pointer',
                  backgroundColor: isActive ? meta.activeBg : 'transparent',
                  color: isActive ? '#fff' : '#9CA3AF',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9CA3AF'; } }}
              >
                {/* M3.8 — gliding active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="govNavIndicator"
                    style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: 3, backgroundColor: meta.accent,
                      borderRadius: '0 2px 2px 0',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 400 }}>
                  {item.label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8, flexShrink: 0,
            background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}99)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
              {(user.name || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: '#fff',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user.name || meta.label}
            </div>
            <div style={{ fontSize: 11, color: meta.accent, fontWeight: 500 }}>
              {meta.label}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            padding: '8px 12px', borderRadius: 8, background: 'none', border: 'none',
            color: '#6B7280', fontSize: 13, cursor: 'pointer', marginTop: 4,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </div>
  );
}
