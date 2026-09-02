import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  LayoutDashboard, Search, FileText, Database,
  Target, Plus, ShieldCheck, Eye, Shield, LogOut
} from 'lucide-react';
import { api } from '../lib/api';

// ── Per-role config ──────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  startup: {
    accent:      '#4F46E5',
    activeBg:    'rgba(79,70,229,0.14)',
    portalLabel: 'STARTUP PORTAL',
    roleLabel:   'Startup',
    nav: [
      { path: '/dashboard',       label: 'Dashboard',           icon: LayoutDashboard },
      { path: '/discover',        label: 'Discover Challenges', icon: Search },
      { path: '/my-applications', label: 'My Applications',     icon: FileText },
      { path: '/catalog',         label: 'Scale-Up Catalog',    icon: Database },
    ],
  },
  department: {
    accent:      '#0F766E',
    activeBg:    'rgba(15,118,110,0.14)',
    portalLabel: 'GOVERNMENT PORTAL',
    roleLabel:   'Department',
    nav: [
      { path: '/challenges',     label: 'My Challenges',    icon: Target },
      { path: '/challenges/new', label: 'Post Challenge',   icon: Plus },
      { path: '/catalog',        label: 'Scale-Up Catalog', icon: Database },
      { path: '/supervision',    label: 'Supervision',      icon: ShieldCheck },
    ],
  },
  evaluator: {
    accent:      '#F59E0B',
    activeBg:    'rgba(245,158,11,0.14)',
    portalLabel: 'EVALUATOR PORTAL',
    roleLabel:   'Evaluator',
    nav: [
      { path: '/evaluate', label: 'My Reviews',      icon: Eye },
      { path: '/catalog',  label: 'Scale-Up Catalog', icon: Database },
    ],
  },
  admin: {
    accent:      '#EF4444',
    activeBg:    'rgba(239,68,68,0.14)',
    portalLabel: 'ADMIN PORTAL',
    roleLabel:   'Admin',
    nav: [
      { path: '/audit',   label: 'Audit Trail',      icon: Shield },
      { path: '/catalog', label: 'Scale-Up Catalog', icon: Database },
    ],
  },
};

const FALLBACK = ROLE_CONFIG.startup;

// ── Component ────────────────────────────────────────────────────────────────
export default function AppSidebar() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user') || '{}');
  const cfg      = ROLE_CONFIG[user.role] ?? FALLBACK;

  const handleLogout = () => {
    api.logout();
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: 260, height: '100vh',
      backgroundColor: '#0B0F19',
      display: 'flex', flexDirection: 'column',
      zIndex: 40,
      fontFamily: "'Inter', -apple-system, sans-serif",
      borderRight: '1px solid rgba(255,255,255,0.07)',
    }}>

      {/* ── Logo ── */}
      <div style={{ padding: '22px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Tricolor dot */}
          <div style={{
            width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
            background: 'conic-gradient(from 0deg, #FF9933 0deg 120deg, #ffffff 120deg 240deg, #138808 240deg 360deg)',
            boxShadow: `0 0 10px ${cfg.accent}66`,
          }} />
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 17, fontWeight: 700, color: '#fff',
            letterSpacing: '-0.01em',
          }}>
            GovLaunch
          </span>
        </div>
        <div style={{ fontSize: 10, color: '#4B5563', marginTop: 5, letterSpacing: '0.1em', fontWeight: 600 }}>
          {cfg.portalLabel}
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {cfg.nav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={{ textDecoration: 'none', display: 'block' }}
          >
            {({ isActive }) => (
              <NavItem
                item={item}
                isActive={isActive}
                accent={cfg.accent}
                activeBg={cfg.activeBg}
              />
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User footer ── */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {/* User row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            backgroundColor: cfg.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>
              {(user.name || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: '#fff',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user.name || cfg.roleLabel}
            </div>
            <div style={{ fontSize: 11, color: cfg.accent, fontWeight: 500, marginTop: 1 }}>
              {cfg.roleLabel}
            </div>
          </div>
        </div>

        {/* Logout */}
        <HoverButton onClick={handleLogout}>
          <LogOut size={15} />
          <span>Log Out</span>
        </HoverButton>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function NavItem({ item, isActive, accent, activeBg }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 11,
        padding: '9px 12px', borderRadius: 8, marginBottom: 2,
        position: 'relative', cursor: 'pointer',
        backgroundColor: isActive ? activeBg : hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
        color: isActive ? '#fff' : hovered ? '#e5e7eb' : '#9CA3AF',
        transition: 'background-color 0.12s, color 0.12s',
      }}
    >
      {/* Gliding active bar — M3.8 */}
      {isActive && (
        <motion.div
          layoutId="sidebarActiveBar"
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: 3, backgroundColor: accent, borderRadius: '0 3px 3px 0',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        />
      )}

      <item.icon size={17} strokeWidth={isActive ? 2.5 : 2} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 13.5, fontWeight: isActive ? 600 : 400, lineHeight: 1 }}>
        {item.label}
      </span>
    </div>
  );
}

function HoverButton({ onClick, children }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 9, width: '100%',
        padding: '8px 12px', borderRadius: 8,
        background: hovered ? 'rgba(255,255,255,0.05)' : 'none',
        border: 'none', color: hovered ? '#fff' : '#6B7280',
        fontSize: 13, cursor: 'pointer', marginTop: 2,
        transition: 'all 0.12s',
      }}
    >
      {children}
    </button>
  );
}
