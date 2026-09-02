import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

// Icon components for navigation
const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const TargetIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 1.657-2.657 1.657-2.657l4.196 4.196a2 2 0 01-1.196 3.461H10a2 2 0 01-2-2V9.464a2 2 0 013.464-1.196L15.657 12l3 3z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    api.logout();
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getNavLinks = () => {
    const links = [];
    const role = user.role;

    if (role === 'department') {
      links.push(
        { path: '/challenges', label: 'Mission Control', icon: <TargetIcon /> },
        { path: '/challenges/new', label: 'Deploy Challenge', icon: <PlusIcon /> },
        { path: '/catalog', label: 'Arsenal', icon: <DatabaseIcon /> }
      );
    } else if (role === 'startup') {
      links.push(
        { path: '/discover', label: 'Intel Board', icon: <SearchIcon /> },
        { path: '/my-applications', label: 'Operations', icon: <DocumentIcon /> },
        { path: '/catalog', label: 'Arsenal', icon: <DatabaseIcon /> }
      );
    } else if (role === 'evaluator') {
      links.push(
        { path: '/evaluate', label: 'Assessment Hub', icon: <EyeIcon /> },
        { path: '/catalog', label: 'Arsenal', icon: <DatabaseIcon /> }
      );
    } else if (role === 'admin') {
      links.push(
        { path: '/audit', label: 'Command Center', icon: <ShieldIcon /> },
        { path: '/catalog', label: 'Arsenal', icon: <DatabaseIcon /> }
      );
    }

    return links;
  };

  const getRoleDisplayName = () => {
    const roleMap = {
      'department': 'COMMAND',
      'startup': 'OPERATIVE',
      'evaluator': 'ANALYST', 
      'admin': 'DIRECTOR'
    };
    return roleMap[user.role] || 'AGENT';
  };

  return (
    <div className="fixed top-0 left-0 w-[280px] h-screen bg-[var(--color-bg-card)] border-r border-[var(--color-border)] flex flex-col relative geometric-border">
      {/* Header with Government Branding */}
      <div className="relative p-6 border-b border-[var(--color-border)]">
        <div className="geometric-corner"></div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 tricolor-accent rounded-lg flex items-center justify-center relative geometric-corner animate-saffron-glow">
            <div className="absolute inset-1 bg-[var(--color-bg-card)] rounded-sm flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-[var(--color-chakra-blue)] rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-[var(--color-chakra-blue)] rounded-full"></div>
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)] font-mono tracking-wider">
              भारत<span className="text-[var(--color-saffron)]">LAUNCH</span>
            </h1>
            <div className="text-xs text-[var(--color-text-muted)] font-mono tracking-widest">
              DIGITAL INDIA PLATFORM
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-mono text-[var(--color-text-faded)] tracking-widest mb-4 px-3">
          // NAVIGATION
        </div>
        {getNavLinks().map((link, index) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 relative ${
                isActive
                  ? 'bg-[var(--color-primary-bg)] text-[var(--color-primary)] font-medium border border-[var(--color-primary)]/20'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]'
              }`
            }
          >
            <span className={`transition-colors ${
              ({ isActive }) => isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-accent-steel)]'
            }`}>
              {link.icon}
            </span>
            <span className="font-mono tracking-wide">{link.label}</span>
            <ChevronRightIcon className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Active indicator */}
            <NavLink to={link.path} className={({ isActive }) => 
              isActive ? "absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-primary)] rounded-r" : "hidden"
            } />
          </NavLink>
        ))}
      </nav>

      {/* User Info & Controls */}
      <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 tricolor-accent rounded-lg flex items-center justify-center">
            <span className="text-[var(--color-bg)] font-mono font-bold text-sm">
              {(user.name || 'User').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-[var(--color-text-primary)] font-mono">
              {user.name || 'Agent'}
            </div>
            <div className="text-xs text-[var(--color-saffron)] font-mono tracking-wider">
              {getRoleDisplayName()}
            </div>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full mt-3 px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)] rounded-lg transition-all duration-200 font-mono tracking-wide border border-transparent hover:border-[var(--color-danger)]/20"
        >
          → TERMINATE SESSION
        </button>
      </div>
    </div>
  );
}
