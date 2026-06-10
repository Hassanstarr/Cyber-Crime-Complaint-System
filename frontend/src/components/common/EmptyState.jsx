import React from 'react';
import { Link } from 'react-router-dom';

/**
 * EmptyState component.
 * Renders an empty placeholder illustration with a message and call to action.
 * @param {Object} props
 * @param {string} [props.title="No Data Found"] - Headline.
 * @param {string} [props.description="There is nothing to display here."] - Descriptive note.
 * @param {string} [props.actionText] - Action button text.
 * @param {string} [props.actionLink] - Action button router path.
 * @param {'shield'|'folder'} [props.icon='shield'] - SVG illustration choice.
 */
export const EmptyState = ({
  title = "No Data Found",
  description = "There is nothing to display here.",
  actionText,
  actionLink,
  icon = 'shield'
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-neutral-50 dark:bg-neutral-800 rounded-xl shadow-card border border-slate-200/50 dark:border-slate-700/50 max-w-md mx-auto my-6">
      <div className="w-16 h-16 mb-4 text-slate-400 dark:text-slate-500">
        {icon === 'shield' ? (
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        ) : (
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6m-6 4h6" />
          </svg>
        )}
      </div>
      
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{description}</p>
      
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-light text-white text-sm font-semibold rounded-lg shadow-sm transition-colors duration-150"
        >
          {actionText} <span className="ml-1.5 font-bold">→</span>
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
