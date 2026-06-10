import React from 'react';
import { motion } from 'framer-motion';
import StatusBadge from '../common/StatusBadge';
import { getCategoryName } from '../../utils/categories';
import { formatDate } from '../../utils/formatDate';
import { sanitize } from '../../utils/sanitize';

/**
 * ComplaintCard component.
 * Displays brief details of a filed complaint with premium hover scale and shadow transitions.
 * @param {Object} props
 * @param {Object} props.complaint - The complaint object from database.
 * @param {Function} [props.onClick] - Click handler.
 */
export const ComplaintCard = ({ complaint, onClick }) => {
  const sanitizedTitle = sanitize(complaint?.Title || complaint?.title);
  const sanitizedDescription = sanitize(complaint?.Description || complaint?.description);
  const complaintId = complaint?.ComplaintID || complaint?.id;
  const createdAt = complaint?.CreatedAt || complaint?.createdAt || complaint?.createdAtDate;
  const status = complaint?.Status || complaint?.status || 'Pending';
  const categoryId = complaint?.CategoryID || complaint?.categoryId;

  return (
    <motion.div
      whileHover={{ 
        y: -3, 
        boxShadow: '0 8px 24px rgba(27,58,107,0.08), 0 2px 4px rgba(0,0,0,0.04)'
      }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="flex flex-col justify-between p-5 bg-white dark:bg-neutral-800 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card cursor-pointer hover:border-slate-350 dark:hover:border-slate-600 transition-colors duration-150"
    >
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3.5">
          <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-450 bg-slate-100 dark:bg-neutral-900/60 px-2 py-0.5 rounded">
            #{complaintId}
          </span>
          <span className="text-xs font-semibold text-primary-light dark:text-slate-300">
            {getCategoryName(categoryId)}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">
          {sanitizedTitle}
        </h4>

        {/* Description (Truncated) */}
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 line-clamp-2 leading-relaxed">
          {sanitizedDescription}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-750/50 pt-3 mt-auto">
        <StatusBadge status={status} />
        <span className="text-xs font-medium text-slate-500 dark:text-slate-450">
          {formatDate(createdAt)}
        </span>
      </div>
    </motion.div>
  );
};

export default ComplaintCard;
