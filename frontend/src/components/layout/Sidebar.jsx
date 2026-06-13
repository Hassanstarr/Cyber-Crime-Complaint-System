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
      {/* Brand Header Removed - Now in Navbar */}

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
      <div className="p-4 border-t border-slate-850">
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
      <aside className="hidden lg:block fixed top-16 bottom-0 left-0 z-20 w-64 bg-neutral-900 border-r border-slate-850">
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
