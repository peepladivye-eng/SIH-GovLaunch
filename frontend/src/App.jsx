import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

// Layouts
import AppSidebar from './components/AppSidebar';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignupStartup from './pages/SignupStartup';
import SignupDepartment from './pages/SignupDepartment';

// Protected pages
import PostChallenge from './pages/PostChallenge';
import MyChallenges from './pages/MyChallenges';
import ChallengeDetail from './pages/ChallengeDetail';
import DiscoverChallenges from './pages/DiscoverChallenges';
import ApplyToChallenge from './pages/ApplyToChallenge';
import MyApplications from './pages/MyApplications';
import StartupDashboard from './pages/StartupDashboard';
import ApplicationDetail from './pages/ApplicationDetail';
import GenerateContract from './pages/GenerateContract';
import EvaluatorReview from './pages/EvaluatorReview';
import ScoreApplication from './pages/ScoreApplication';
import ScaleUpCatalog from './pages/ScaleUpCatalog';
import AuditTrail from './pages/AuditTrail';
import Supervision from './pages/Supervision';

// ── Auth guard ────────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const defaults = { department: '/challenges', startup: '/dashboard', evaluator: '/evaluate', admin: '/audit' };
    return <Navigate to={defaults[user.role] ?? '/login'} replace />;
  }
  return children;
};

// ── M3.1 — Page-level route transition wrapper ────────────────────────────────
// exact spec: initial opacity 0 y 8, animate opacity 1 y 0, exit opacity 0 y -8
// duration 0.2, ease easeOut
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

// ── Layout shells ─────────────────────────────────────────────────────────────
const AppLayout = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F4F6FB' }}>
    <AppSidebar />
    <main style={{ flex: 1, marginLeft: 260, padding: 32, minWidth: 0 }}>
      <PageWrapper>{children}</PageWrapper>
    </main>
  </div>
);

const PublicLayout = ({ children }) => (
  <PageWrapper>{children}</PageWrapper>
);

// ── Inner component that can call useLocation ─────────────────────────────────
function AppRoutes() {
  const location = useLocation();
  return (
    // AnimatePresence mode="wait" + key on pathname drives per-route exit/enter
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/"                  element={<PublicLayout><Landing /></PublicLayout>} />
        <Route path="/login"             element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/signup/startup"    element={<PublicLayout><SignupStartup /></PublicLayout>} />
        <Route path="/signup/department" element={<PublicLayout><SignupDepartment /></PublicLayout>} />

        {/* Startup */}
        <Route path="/dashboard"         element={<ProtectedRoute allowedRoles={['startup']}><AppLayout><StartupDashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/discover"          element={<ProtectedRoute allowedRoles={['startup']}><AppLayout><DiscoverChallenges /></AppLayout></ProtectedRoute>} />
        <Route path="/discover/:id"      element={<ProtectedRoute allowedRoles={['startup']}><AppLayout><ApplyToChallenge /></AppLayout></ProtectedRoute>} />
        <Route path="/my-applications"   element={<ProtectedRoute allowedRoles={['startup']}><AppLayout><MyApplications /></AppLayout></ProtectedRoute>} />

        {/* Department */}
        <Route path="/challenges"        element={<ProtectedRoute allowedRoles={['department']}><AppLayout><MyChallenges /></AppLayout></ProtectedRoute>} />
        <Route path="/challenges/new"    element={<ProtectedRoute allowedRoles={['department']}><AppLayout><PostChallenge /></AppLayout></ProtectedRoute>} />
        <Route path="/challenges/:id"    element={<ProtectedRoute allowedRoles={['department']}><AppLayout><ChallengeDetail /></AppLayout></ProtectedRoute>} />

        {/* Shared */}
        <Route path="/applications/:id"           element={<ProtectedRoute allowedRoles={['department','evaluator','admin']}><AppLayout><ApplicationDetail /></AppLayout></ProtectedRoute>} />
        <Route path="/applications/:id/contract"  element={<ProtectedRoute allowedRoles={['department']}><AppLayout><GenerateContract /></AppLayout></ProtectedRoute>} />

        {/* Evaluator */}
        <Route path="/evaluate"          element={<ProtectedRoute allowedRoles={['evaluator']}><AppLayout><EvaluatorReview /></AppLayout></ProtectedRoute>} />
        <Route path="/evaluate/:id"      element={<ProtectedRoute allowedRoles={['evaluator']}><AppLayout><ScoreApplication /></AppLayout></ProtectedRoute>} />

        {/* All roles */}
        <Route path="/catalog"           element={<ProtectedRoute><AppLayout><ScaleUpCatalog /></AppLayout></ProtectedRoute>} />

        {/* Department supervision */}
        <Route path="/supervision"       element={<ProtectedRoute allowedRoles={['department']}><AppLayout><Supervision /></AppLayout></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/audit"             element={<ProtectedRoute allowedRoles={['admin']}><AppLayout><AuditTrail /></AppLayout></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
