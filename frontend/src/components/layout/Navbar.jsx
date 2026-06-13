import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

/**
 * Navbar component.
 * Features sticky backdrop-blur background, light/dark toggling, role-specific navigations,
 * and a slide-out drawer menu for mobile screens.
 */
export const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
  };

  const navLinks = isAuthenticated
    ? isAdmin
      ? [
          { name: 'Dashboard', path: '/admin/dashboard' },
          { name: 'Complaints', path: '/admin/complaints' },
        ]
      : [
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'File a Complaint', path: '/file-complaint' },
          { name: 'My Complaints', path: '/my-complaints' },
        ]
    : [
        { name: 'Home', path: '/' },
      ];

  const handleLinkClick = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/50 bg-white/80 dark:border-slate-800/50 dark:bg-neutral-900/80 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <svg
            className="w-8 h-8 text-primary dark:text-primary-light transition-transform duration-300 group-hover:scale-105"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span className="text-xl font-bold tracking-tight text-primary dark:text-white">
            Cyber<span className="text-primary-light">Report</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold transition-colors duration-150 ${
                  isActive
                    ? 'text-primary-light dark:text-white border-b-2 border-primary-light pb-1 mt-1'
                    : 'text-slate-600 dark:text-slate-350 hover:text-primary-light dark:hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {/* Light/Dark Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2 text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-150"
            aria-label="Toggle Theme"
          >
            <motion.div
              key={isDark ? 'dark' : 'light'}
              initial={{ rotate: -45, scale: 0.8, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {isDark ? (                
                // Moon Icon
                <svg className="w-5 h-5 text-indigo-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                // Sun Icon
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464-5.536a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-5.464 2.828a1 1 0 111.414 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707zm-6.586-.707A1 1 0 003.535 12l-.707.707a1 1 0 011.414 1.414l.707-.707zm0-5.656a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1z" clipRule="evenodd" />
                </svg>
              )}
            </motion.div>
          </motion.button>

          {/* Auth Controls */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-white text-xs font-bold font-mono">
                  {user?.FullName ? user.FullName.charAt(0).toUpperCase() : user?.Username ? user.Username.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 max-w-[120px] truncate">
                  {user?.FullName || user?.Username}
                </span>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleLogout}
                className="px-3.5 py-1.5 border border-slate-200 hover:border-accent text-slate-700 hover:text-accent dark:border-slate-700 dark:text-slate-300 dark:hover:text-accent text-xs font-bold rounded-lg transition-colors duration-150"
              >
                Logout
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-white transition-colors"
              >
                Login
              </Link>
              <motion.div whileTap={{ scale: 0.97 }}>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-sm font-semibold rounded-lg shadow-sm block text-center transition-colors"
                >
                  Register
                </Link>
              </motion.div>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Theme Switcher (Mobile) */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-neutral-800 rounded-lg"
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464-5.536a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-5.464 2.828a1 1 0 111.414 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707zm-6.586-.707A1 1 0 003.535 12l-.707.707a1 1 0 011.414 1.414l.707-.707zm0-5.656a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-indigo-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg"
            aria-label="Open Navigation Drawer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Framer Motion) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0.1, duration: 0.3 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white p-6 shadow-xl dark:bg-neutral-900 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-lg font-bold text-primary dark:text-white">CyberReport</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-200"
                    aria-label="Close Navigation Drawer"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <button
                        key={link.path}
                        onClick={() => handleLinkClick(link.path)}
                        className={`text-left py-2.5 px-4 rounded-lg font-semibold transition-colors duration-150 ${
                          isActive
                            ? 'bg-slate-100 text-primary-light dark:bg-neutral-800 dark:text-white'
                            : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-neutral-800/50'
                        }`}
                      >
                        {link.name}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-white text-sm font-bold font-mono">
                        {user?.FullName ? user.FullName.charAt(0).toUpperCase() : user?.Username ? user.Username.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {user?.FullName || user?.Username}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                          {user?.Email || (isAdmin ? 'System Admin' : '')}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 text-center bg-rose-50 text-accent dark:bg-rose-950/20 dark:text-rose-450 hover:bg-rose-100 hover:text-red-700 rounded-lg text-sm font-bold transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full py-2.5 text-center border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 rounded-lg text-sm font-bold block"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full py-2.5 text-center bg-primary hover:bg-primary-light text-white rounded-lg text-sm font-bold block shadow-sm"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
