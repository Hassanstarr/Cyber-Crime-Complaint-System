import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Route Guards
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Citizen Pages
import UserDashboard from './pages/user/UserDashboard';
import FileComplaint from './pages/user/FileComplaint';
import MyComplaints from './pages/user/MyComplaints';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminComplaints from './pages/admin/AdminComplaints';
import ComplaintDetail from './pages/admin/ComplaintDetail';

/**
 * PageTransition wrapper component.
 * Applies a fade-in and slight slide-up animation. Respects system reduced-motion flags.
 */
const PageTransition = ({ children }) => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    return <div className="min-h-screen flex flex-col">{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-screen flex flex-col"
    >
      {children}
    </motion.div>
  );
};

/**
 * 404 Page Not Found Component.
 * Displays navy SVG shield with error state indicators.
 */
const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col items-center justify-center p-6 text-center transition-colors duration-200">
      <div className="w-24 h-24 mb-6 text-primary dark:text-primary-light">
        <svg
          className="w-full h-full animate-pulse"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2"
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M12 9v2m0 4h.01"
          />
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
        Page Not Found
      </h1>
      
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm leading-relaxed">
        The clearance level requested is invalid or this sector does not exist. Please check the URL coordinates.
      </p>
      
      <Link
        to="/"
        className="px-5 py-2.5 bg-primary hover:bg-primary-light text-white text-sm font-bold rounded-lg shadow-sm transition-colors duration-150"
      >
        Return Home
      </Link>
    </div>
  );
};

/**
 * Main Application Router configuration.
 */
export const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PageTransition>
              <LandingPage />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <PageTransition>
              <LoginPage />
            </PageTransition>
          }
        />
        <Route
          path="/register"
          element={
            <PageTransition>
              <RegisterPage />
            </PageTransition>
          }
        />

        {/* Protected Citizen Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <PageTransition>
                <UserDashboard />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/file-complaint"
          element={
            <PrivateRoute>
              <PageTransition>
                <FileComplaint />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/my-complaints"
          element={
            <PrivateRoute>
              <PageTransition>
                <MyComplaints />
              </PageTransition>
            </PrivateRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <PageTransition>
                <AdminDashboard />
              </PageTransition>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/complaints"
          element={
            <AdminRoute>
              <PageTransition>
                <AdminComplaints />
              </PageTransition>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/complaints/:id"
          element={
            <AdminRoute>
              <PageTransition>
                <ComplaintDetail />
              </PageTransition>
            </AdminRoute>
          }
        />

        {/* 404 Sector Not Found */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </AnimatePresence>
  );
};

export default App;
