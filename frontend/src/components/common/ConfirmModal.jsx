import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ConfirmModal component.
 * Displays a modal window prompting the user to confirm an action.
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {Function} props.onClose - Action when cancelling.
 * @param {Function} props.onConfirm - Action when confirming.
 * @param {string} props.title - Modal title.
 * @param {string} props.message - Descriptive text.
 * @param {string} [props.confirmText="Confirm"] - Confirm button label.
 * @param {string} [props.cancelText="Cancel"] - Cancel button label.
 * @param {boolean} [props.isDanger=false] - If true, style confirm button with accent/red.
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-900/60 dark:bg-neutral-950/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-elevated border border-slate-200/60 dark:border-slate-700/60 max-w-md w-full p-6 z-10 overflow-hidden"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-sm text-slate-550 dark:text-slate-400 mb-6 leading-relaxed">
              {message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm font-semibold rounded-lg transition-colors duration-150"
              >
                {cancelText}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-4 py-2 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors duration-150 ${
                  isDanger
                    ? 'bg-accent hover:bg-red-600'
                    : 'bg-primary hover:bg-primary-light'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
