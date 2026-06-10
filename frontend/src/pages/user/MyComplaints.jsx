import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import StatusBadge from '../../components/common/StatusBadge';
import { getCategoryName } from '../../utils/categories';
import { formatDate } from '../../utils/formatDate';
import { sanitize } from '../../utils/sanitize';

/**
 * Shimmer skeleton placeholder for loading cards.
 */
const SkeletonCard = () => (
  <div className="p-5 bg-white dark:bg-neutral-800 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card h-44 flex flex-col justify-between overflow-hidden">
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="h-4.5 w-16 rounded bg-slate-200 dark:bg-slate-700 shimmer" />
        <div className="h-4.5 w-20 rounded bg-slate-200 dark:bg-slate-700 shimmer" />
      </div>
      <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-700 mb-3 shimmer" />
      <div className="space-y-1.5">
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700 shimmer" />
        <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700 shimmer" />
      </div>
    </div>
    <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-750/50 pt-3">
      <div className="h-5 w-24 rounded-full bg-slate-200 dark:bg-slate-700 shimmer" />
      <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700 shimmer" />
    </div>
  </div>
);

/**
 * MyComplaints component.
 * Lists citizen's filed cases with tabs, skeleton shimmers, and dynamic paging.
 */
export const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters and Pagination
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Pending' | 'In Progress' | 'Resolved' | 'Rejected'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal Detail state
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const tabs = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];

  const fetchComplaints = async () => {
    setIsLoading(true);
    setError('');
    try {
      const statusParam = activeTab === 'All' ? '' : activeTab;
      const response = await api.get('/api/complaints/my', {
        params: {
          status: statusParam || undefined,
          page: currentPage,
          limit: 10
        }
      });

      setComplaints(response.data?.data || []);
      const pagination = response.data?.pagination || {};
      setTotalPages(pagination.totalPages || 1);
      setTotalCount(pagination.total || 0);
    } catch (err) {
      console.error('Fetch complaints error:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Unable to connect to server. Please check your connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger fetch when tab or page changes
  useEffect(() => {
    fetchComplaints();
  }, [activeTab, currentPage]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset page to 1
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors duration-200">
      <Navbar />

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary dark:text-white">
              My Incident Reports
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
              Track the progress and status of your filed cases.
            </p>
          </div>
          {!isLoading && !error && (
            <span className="self-start sm:self-auto inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-200/50 dark:bg-neutral-800 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-300/30 dark:border-slate-700/50">
              Total Filed: {totalCount}
            </span>
          )}
        </div>

        {/* Filters bar */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex space-x-6 min-w-max pb-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabClick(tab)}
                  className={`relative pb-3 text-sm font-semibold transition-colors duration-150 ${
                    isActive
                      ? 'text-primary-light dark:text-white'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {tab}
                  {isActive && (
                    <motion.div
                      layoutId="activeUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-light dark:bg-white"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Area */}
        {error && (
          <ErrorMessage
            message={error}
            type="page"
            onRetry={fetchComplaints}
          />
        )}

        {!error && isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!error && !isLoading && (
          <>
            {complaints.length === 0 ? (
              <EmptyState
                title={`No ${activeTab !== 'All' ? activeTab : ''} Complaints`}
                description={
                  activeTab === 'All'
                    ? "You haven't filed any cyber crime complaints yet."
                    : `You don't have any complaints with the status "${activeTab}".`
                }
                actionText={activeTab === 'All' ? "File your first complaint" : undefined}
                actionLink={activeTab === 'All' ? "/file-complaint" : undefined}
                icon="folder"
              />
            ) : (
              <>
                {/* Responsive grid */}
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: { staggerChildren: 0.05 }
                    }
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                  {complaints.map((comp) => (
                    <motion.div
                      key={comp.ComplaintID || comp.id}
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        show: { opacity: 1, y: 0 }
                      }}
                    >
                      <ComplaintCard
                        complaint={comp}
                        onClick={() => setSelectedComplaint(comp)}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => setCurrentPage(p)}
                />
              </>
            )}
          </>
        )}
      </main>

      <Footer />

      {/* Read-Only Complaint Details Overlay Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedComplaint(null)}
              className="fixed inset-0 bg-neutral-900/60 dark:bg-neutral-950/80 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-elevated border border-slate-200/60 dark:border-slate-700/60 max-w-2xl w-full p-6 z-10 max-h-[85vh] flex flex-col justify-between overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-neutral-900 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
                    #{selectedComplaint.ComplaintID || selectedComplaint.id}
                  </span>
                  <StatusBadge status={selectedComplaint.Status || selectedComplaint.status || 'Pending'} />
                </div>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-500 dark:text-slate-400 transition-colors"
                  aria-label="Close details"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable details */}
              <div className="flex-grow overflow-y-auto pr-1 space-y-4">
                <div>
                  <div className="text-xs font-semibold text-primary-light dark:text-indigo-400 mb-1">
                    {getCategoryName(selectedComplaint.CategoryID || selectedComplaint.categoryId)}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {sanitize(selectedComplaint.Title || selectedComplaint.title)}
                  </h3>
                  <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-1">
                    Filed on: {formatDate(selectedComplaint.CreatedAt || selectedComplaint.createdAt)}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-750/30 pt-4">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-350 uppercase tracking-wider mb-2">
                    Case Description
                  </h4>
                  <p className="text-sm text-slate-650 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {sanitize(selectedComplaint.Description || selectedComplaint.description)}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-100 dark:border-slate-700/50 pt-4 mt-4 flex justify-end">
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-lg transition-colors"
                >
                  Close Case Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyComplaints;
