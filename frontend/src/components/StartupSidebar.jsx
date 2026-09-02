import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LayoutDashboard, Search, FileText, LogOut, Database } from 'lucide-react';
import { api } from '../lib/api';

const navItems = [
  { path: '/dashboard',        label: 'Dashboard',           icon: LayoutDashboard },
  { path: '/discover',         label: 'Discover Challenges', icon: Search },
  { path: '/my-applications',  label: 'My Applications',     icon: FileText },
  { path: '/catalog',          label: 'Scale-Up Catalog',    icon: Database },
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
    <div className="fixed top-0 left-0 w-[260px] h-screen bg-[--bg] flex flex-col text-gray-300 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[--accent] to-[--accent-glow]" />
          <h1 className="text-xl font-space-grotesk font-bold text-black">GovLaunch</h1>
        </div>
      </div>

      {/* Nav — M3.8: motion.div with layoutId="activeNavIndicator" glides between items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 relative ${
                isActive
                  ? 'text-white bg-[--accent]/10'
                  : 'text-black hover:text-white hover:bg-gray-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* M3.8 — shared layoutId so the bar glides, not snaps */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-[--accent] rounded-r"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon size={18} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[--accent] to-[--accent-glow] flex items-center justify-center">
            <span className="text-black font-medium text-sm">
              {(user.name || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-black truncate">{user.name || 'Startup'}</div>
            <div className="text-xs text-black">Startup</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg w-full mt-2 transition-colors"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </div>
  );
}
