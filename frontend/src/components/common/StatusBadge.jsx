import React from 'react';

/**
 * StatusBadge component.
 * Renders a color-coded status badge for complaints.
 * @param {Object} props
 * @param {string} props.status - The status value ("Pending", "In Progress", "Resolved", "Rejected").
 */
export const StatusBadge = ({ status }) => {
  let styles = '';
  
  switch (status) {
    case 'Pending':
      styles = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40';
      break;
    case 'In Progress':
      styles = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40';
      break;
    case 'Resolved':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40';
      break;
    case 'Rejected':
      styles = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40';
      break;
    default:
      styles = 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75"></span>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
