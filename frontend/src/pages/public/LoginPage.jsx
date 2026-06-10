import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/common/Toast';

/**
 * LoginPage component.
 * Supports split page styling, tabbed login forms (Citizen vs Admin),
 * and sessionStorage vs localStorage token caching.
 */
export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { login, isAuthenticated, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('citizen'); // 'citizen' or 'admin'
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      const destination = location.state?.redirect || (isAdmin ? '/admin/dashboard' : '/dashboard');
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, location.state]);

  // Clean errors when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setEmail('');
    setUsername('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Field validation
    if (activeTab === 'citizen') {
      if (!email.trim() || !password) {
        setError('Please fill in all fields.');
        return;
      }
    } else {
      if (!username.trim() || !password) {
        setError('Please fill in all fields.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (activeTab === 'citizen') {
        const response = await api.post('/api/users/login', {
          Email: email,
          Password: password,
        });
        
        const userData = {
          ...response.data?.data,
          role: 'user', // Explicit citizen role tag
        };
        const token = response.data?.token;

        login(userData, token, rememberMe);
        showToast('Successfully logged in!', 'success');
        
        const dest = location.state?.redirect || '/dashboard';
        navigate(dest, { replace: true });
      } else {
        const response = await api.post('/api/admin/login', {
          Username: username,
          Password: password,
        });

        const userData = {
          ...response.data?.data,
          role: 'admin', // Explicit admin role tag
        };
        const token = response.data?.token;

        login(userData, token, rememberMe);
        showToast('Authorized Admin Access Granted.', 'success');
        
        const dest = location.state?.redirect || '/admin/dashboard';
        navigate(dest, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setError('Incorrect email/username or password.');
      } else {
        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to connect to authentication server. Please check connection.'
        );
      }
      showToast('Authentication failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors duration-200">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl bg-white dark:bg-neutral-800 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card overflow-hidden grid grid-cols-1 md:grid-cols-2">
          
          {/* Left panel (Shield & Tagline) — Hidden on Mobile */}
          <div className="hidden md:flex flex-col items-center justify-center p-8 bg-neutral-900 text-white text-center border-r border-slate-800 space-y-6">
            <svg
              className="w-32 h-32 text-primary-light"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              />
              <motion.path
                d="M9 12l2 2 4-4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.3 }}
              />
            </svg>
            <div className="space-y-2 max-w-xs">
              <h2 className="text-xl font-bold">Secure Access Portal</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Authentication protects system files, case logs, and investigator dashboards.
              </p>
            </div>
          </div>

          {/* Right panel (Tabs + Login Form) */}
          <div className="p-6 sm:p-10 flex flex-col justify-center">
            
            {/* Login Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 font-semibold">
              <button
                type="button"
                onClick={() => handleTabChange('citizen')}
                className={`flex-1 pb-3 text-center text-sm border-b-2 transition-colors ${
                  activeTab === 'citizen'
                    ? 'border-primary-light text-primary-light dark:text-white dark:border-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Citizen Login
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('admin')}
                className={`flex-1 pb-3 text-center text-sm border-b-2 transition-colors ${
                  activeTab === 'admin'
                    ? 'border-primary-light text-primary-light dark:text-white dark:border-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Admin Login
              </button>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              {activeTab === 'citizen' ? 'Citizen Sign In' : 'Operator Sign In'}
            </h2>

            {error && <ErrorMessage message={error} type="block" />}
            {location.search.includes('expired=true') && (
              <ErrorMessage message="Session expired. Please log in again." type="block" />
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Conditional Field: Email vs Username */}
              {activeTab === 'citizen' ? (
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-250 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="username" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="e.g. operator01"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-250 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                  />
                </div>
              )}

              {/* Password Field */}
              <div className="relative">
                <label htmlFor="password" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="••••••••"
                    className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-250 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:text-slate-500"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary-light"
                />
                <label htmlFor="rememberMe" className="ml-2 text-xs font-semibold text-slate-600 dark:text-slate-400 select-none">
                  Remember my session on this device
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary-light disabled:bg-primary/70 text-white font-bold rounded-lg shadow-sm text-sm transition-colors duration-150"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Verifying credentials...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </motion.button>
              </div>

            </form>

            {activeTab === 'citizen' && (
              <p className="mt-6 text-center text-xs text-slate-550 dark:text-slate-400 font-semibold">
                New to the platform?{' '}
                <Link to="/register" className="text-primary-light hover:underline font-bold">
                  Create an account
                </Link>
              </p>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;
