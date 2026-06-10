import React from 'react';

/**
 * Footer component.
 * Minimalist, uncluttered institutional footer.
 */
export const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-200/40 bg-white/40 py-6 dark:border-slate-850 dark:bg-neutral-900/40 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="opacity-80">🛡️</span>
          <span>© {new Date().getFullYear()} CyberReport. Official Institutional Portal. All rights reserved.</span>
        </div>
        <nav className="flex gap-4" aria-label="Footer Navigation">
          <a href="#" className="hover:text-primary-light dark:hover:text-white transition-colors duration-150">Privacy Policy</a>
          <a href="#" className="hover:text-primary-light dark:hover:text-white transition-colors duration-150">Terms of Service</a>
          <a href="#" className="hover:text-primary-light dark:hover:text-white transition-colors duration-150">Operator Help</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
