import React from 'react';

/**
 * LoadingSpinner component.
 * Displays a rotating loading circle.
 * @param {Object} props
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Spinner dimensions.
 * @param {boolean} [props.fullPage=false] - If true, renders centered full-screen overlay.
 */
export const LoadingSpinner = ({ size = 'md', fullPage = false }) => {
  const dimensions = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  const spinner = (
    <div
      className={`animate-spin rounded-full border-slate-300 dark:border-slate-700 border-t-primary-light dark:border-t-primary-light ${dimensions[size] || dimensions.md}`}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-100/80 dark:bg-neutral-900/80 backdrop-blur-sm transition-opacity duration-200">
        <div className="flex flex-col items-center gap-3 bg-neutral-50 dark:bg-neutral-800 p-6 rounded-xl shadow-elevated border border-slate-200/50 dark:border-slate-700/50">
          {spinner}
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Securely retrieving data...
          </p>
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
