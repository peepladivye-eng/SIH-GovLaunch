import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LayoutDashboard, Search, FileText, LogOut, Database } from 'lucide-react';
import { api } from '../lib/api';

const ACCENT   = '#4F46E5';  // indigo
const BG       = '#0B0F19';  // dark navy
const BORDER   = 'rgba(255,255,255,0.08)';
const ACTIVE_BG = 'rgba(79,70,229,0.12)';

const navItems = [
  { path: '/dashboard',       label: 'Dashboard',           icon: LayoutDashboard },
  { path: '/discover',        label: 'Discover Challenges', icon: Search },
  { path: '/my-applications', label: 'My Applications',     icon: FileText },
  { path: '/catalog',         label: 'Scale-Up Catalog',    icon: Database },
];

export default function StartupSidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

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
            background: `linear-gradient(135deg, ${ACCENT}, #818CF8)`,
          }} />
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 18, fontWeight: 700, color: '#fff',
          }}>GovLaunch</span>
        </div>
        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4, letterSpacing: '0.05em' }}>
          STARTUP PORTAL
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={{ textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                position: 'relative', cursor: 'pointer',
                backgroundColor: isActive ? ACTIVE_BG : 'transparent',
                color: isActive ? '#fff' : '#9CA3AF',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9CA3AF'; } }}
              >
                {/* M3.8 active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="startupNavIndicator"
                    style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: 3, backgroundColor: ACCENT, borderRadius: '0 2px 2px 0',
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
            background: `linear-gradient(135deg, ${ACCENT}, #818CF8)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
              {(user.name || 'S').charAt(0).toUpperCase()}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name || 'Startup'}
            </div>
            <div style={{ fontSize: 11, color: ACCENT, fontWeight: 500 }}>Startup</div>
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
