import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import Sidebar from '../../components/layout/Sidebar';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useToast } from '../../components/common/Toast';
import { getCategoryName } from '../../utils/categories';
import { formatDate } from '../../utils/formatDate';
import { sanitize } from '../../utils/sanitize';

/**
 * ComplaintDetail page.
 * Displays full complaint logs, reporter profile, and status triaging panel.
 */
export const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Status panel states
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const statuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

  const fetchComplaintDetail = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get(`/api/admin/complaints/${id}`);
      const data = response.data?.data || response.data || null;
      if (!data) {
        throw new Error('Complaint record not found.');
      }
      setComplaint(data);
      setSelectedStatus(data.Status || data.status || 'Pending');
    } catch (err) {
      console.error('Fetch complaint detail error:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Unable to load complaint details. It may have been deleted or the server is unreachable.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetail();
  }, [id]);

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    setIsConfirming(false);
    try {
      await api.put(`/api/admin/update-status/${id}`, {
        Status: selectedStatus
      });

      // Update local state in place
      setComplaint((prev) => ({
        ...prev,
        Status: selectedStatus
      }));

      showToast(`Complaint status successfully updated to ${selectedStatus}.`, 'success');
    } catch (err) {
      console.error('Status update error:', err);
      showToast('Failed to update status. Please try again.', 'error');
      // Revert select input
      setSelectedStatus(complaint?.Status || 'Pending');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelUpdate = () => {
    setSelectedStatus(complaint?.Status || 'Pending');
    setIsConfirming(false);
  };

  const handleDropdownChange = (e) => {
    const nextVal = e.target.value;
    setSelectedStatus(nextVal);
    // If different from current status, prompt inline confirm
    if (nextVal !== complaint?.Status) {
      setIsConfirming(true);
    } else {
      setIsConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 flex transition-colors duration-200">
      
      {/* Sidebar navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-neutral-900 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg"
              aria-label="Toggle Sidebar Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="font-bold text-sm">Case View</span>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-neutral-850 px-2 py-0.5 rounded">
            Operator
          </span>
        </header>

        {/* Inner layout */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Back Trigger */}
          <div className="flex items-center">
            <Link
              to="/admin/complaints"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors duration-150"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Database</span>
            </Link>
          </div>

          {error && (
            <ErrorMessage
              message={error}
              type="page"
              onRetry={fetchComplaintDetail}
            />
          )}

          {!error && isLoading && (
            <div className="flex justify-center items-center py-32">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {!error && !isLoading && complaint && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Left Column: Complaint Details (2/3 width) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-neutral-800 p-6 md:p-8 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card">
                  
                  {/* Case Identifiers */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-750 pb-5 mb-5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-neutral-900 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
                        ID: #{complaint.ComplaintID || complaint.id}
                      </span>
                      <span className="text-xs font-semibold text-primary-light dark:text-indigo-400">
                        {getCategoryName(complaint.CategoryID || complaint.categoryId)}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                      Filed: {formatDate(complaint.CreatedAt || complaint.createdAt)}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-6 leading-snug">
                    {sanitize(complaint.Title || complaint.title)}
                  </h2>

                  {/* Description */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                      Incident Log / Description
                    </h3>
                    <p className="text-sm text-slate-650 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {sanitize(complaint.Description || complaint.description)}
                    </p>
                  </div>

                </div>
              </div>

              {/* Right Column: Profile & Status Update Panel (1/3 width) */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* User Info card */}
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-350 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-750 pb-2">
                    Reporter Profile
                  </h3>
                  
                  <div className="space-y-4">
                    {/* User Name */}
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Full Name</div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        {complaint.User?.FullName || complaint.user?.fullName || complaint.user?.FullName || 'N/A'}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Email Address</div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate" title={complaint.User?.Email || complaint.user?.email || 'N/A'}>
                        {complaint.User?.Email || complaint.user?.email || complaint.user?.Email || 'N/A'}
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Phone Number</div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        {complaint.User?.Phone || complaint.user?.phone || complaint.user?.Phone || 'Not Provided'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Triage Panel */}
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card space-y-5">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-350 uppercase tracking-wider border-b border-slate-100 dark:border-slate-750 pb-2">
                    Triage Controls
                  </h3>

                  {/* Current Status */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">
                      Current Case Status
                    </div>
                    {/* Animate status change wrap */}
                    <motion.div
                      layout
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <StatusBadge status={complaint.Status || complaint.status} />
                    </motion.div>
                  </div>

                  {/* Status Dropdown / Controls */}
                  <div className="space-y-4 pt-1 border-t border-slate-100 dark:border-slate-750/30">
                    
                    {!isConfirming && !isUpdating && (
                      <div className="space-y-3">
                        <label htmlFor="newStatus" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                          Modify Case Status
                        </label>
                        <select
                          id="newStatus"
                          value={selectedStatus}
                          onChange={handleDropdownChange}
                          className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-250 dark:border-slate-700 px-3 py-2 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:ring-1 focus:ring-primary-light"
                        >
                          {statuses.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Loading spinner */}
                    {isUpdating && (
                      <div className="flex items-center justify-center gap-2 py-2">
                        <LoadingSpinner size="sm" />
                        <span className="text-xs font-bold text-slate-550 dark:text-slate-400">Updating system logs...</span>
                      </div>
                    )}

                    {/* Inline Confirmation */}
                    <AnimatePresence>
                      {isConfirming && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="p-3 bg-slate-50 dark:bg-neutral-900 rounded-lg border border-slate-200 dark:border-slate-750 space-y-3"
                        >
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                            Change status to <span className="font-bold text-primary dark:text-indigo-400">{selectedStatus}</span>?
                          </p>
                          <div className="flex justify-end gap-2 text-xs">
                            <button
                              type="button"
                              onClick={handleCancelUpdate}
                              className="px-2.5 py-1 border border-slate-350 dark:border-slate-650 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleUpdateStatus}
                              className="px-2.5 py-1 bg-primary-light hover:bg-indigo-650 text-white font-bold rounded"
                            >
                              Confirm
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                </div>

              </div>

            </div>
          )}

        </main>
      </div>

    </div>
  );
};

export default ComplaintDetail;
