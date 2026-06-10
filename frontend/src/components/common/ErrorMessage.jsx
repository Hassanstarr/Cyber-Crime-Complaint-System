import React from 'react';

/**
 * ErrorMessage component.
 * Displays clean error information across different UI scopes.
 * @param {Object} props
 * @param {string} props.message - The error details.
 * @param {'inline'|'block'|'page'} [props.type='inline'] - Scope of the error visualization.
 * @param {Function} [props.onRetry] - Function to trigger on page-retry actions.
 */
export const ErrorMessage = ({ message, type = 'inline', onRetry }) => {
  if (!message) return null;

  if (type === 'page') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl max-w-md mx-auto my-12 shadow-sm">
        <svg className="w-12 h-12 text-rose-600 dark:text-rose-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-bold text-rose-800 dark:text-rose-400 mb-2">Connection Failure</h3>
        <p className="text-sm text-rose-700 dark:text-rose-350 mb-6 leading-relaxed">
          {message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors duration-150"
          >
            Retry Connection
          </button>
        )}
      </div>
    );
  }

  if (type === 'block') {
    return (
      <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/30 rounded-lg text-rose-850 dark:text-rose-400 my-4">
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="text-sm font-medium leading-relaxed">{message}</div>
      </div>
    );
  }

  // Default: inline validation text
  return (
    <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-rose-600 dark:text-rose-450">
      <svg className="w-3.5 h-3.5 flex-shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
