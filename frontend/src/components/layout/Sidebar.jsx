import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion'; // for animation
import { useTheme } from '../../hooks/useTheme'; // or wherever your theme hook is

/**
 * Sidebar component.
 * Renders static side nav for admin pages on desktop, and transitions into a collapsible drawer on mobile.
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether mobile sidebar is showing.
 * @param {Function} props.onClose - Close mobile drawer callback.
 */
export const Sidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const links = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      name: 'All Complaints',
      path: '/admin/complaints',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-neutral-900 border-r border-slate-800 text-white w-64">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-850">
        <svg className="w-6.5 h-6.5 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span className="font-bold text-lg tracking-tight">Admin Console</span>
      </div>

      {/* Operator Metadata */}
      <div className="p-5 border-b border-slate-850 flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center font-bold text-primary-light border border-slate-800 uppercase font-mono">
          {user?.Username ? user.Username.charAt(0) : 'A'}
        </div>
        <div className="truncate">
          <div className="text-sm font-bold truncate text-slate-100">{user?.Username || 'Administrator'}</div>
          <div className="text-xs text-slate-450 mt-0.5">System Operator</div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-grow p-4 space-y-1.5" aria-label="Sidebar Navigation">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-primary-light text-white shadow-sm'
                  : 'text-slate-400 hover:bg-neutral-800 hover:text-slate-100'
              }`
            }
          >
            {link.icon}
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>
      

      {/* Action Footer (Sign Out) */}
      <div className="p-4 border-t border-slate-850 space-y-3">

        {/* Light/Dark Toggle */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="flex items-center justify-center w-full p-2 
             text-slate-300 hover:text-white
             bg-neutral-800 hover:bg-neutral-700
             rounded-lg transition-colors duration-150"
          aria-label="Toggle Theme"
        >
          <motion.div
            key={isDark ? 'dark' : 'light'}
            initial={{ rotate: -45, scale: 0.8, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? (
              // Sun Icon
              <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464-5.536a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-5.464 2.828a1 1 0 111.414 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707zm-6.586-.707A1 1 0 003.535 12l-.707.707a1 1 0 011.414 1.414l.707-.707zm0-5.656a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              // Moon Icon
              <svg className="w-5 h-5 text-indigo-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </motion.div>
        </motion.button>

        {/* Sign Out */}
        <button
          type="button"
          onClick={() => {
            if (onClose) onClose();
            logout();
          }}
          className="flex items-center gap-3.5 w-full px-4 py-3 rounded-lg text-sm font-semibold text-slate-450 hover:bg-rose-950/20 hover:text-accent transition-all duration-150"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (lg Screen+) */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-20 w-64 bg-neutral-900 border-r border-slate-850 h-full">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar (<lg Screen) */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
        <div
          className={`absolute inset-y-0 left-0 w-64 transition-transform duration-300 transform bg-neutral-900 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
