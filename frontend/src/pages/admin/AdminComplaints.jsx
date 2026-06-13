import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import Pagination from '../../components/common/Pagination';
import { useToast } from '../../components/common/Toast';
import { getCategoryName } from '../../utils/categories';
import { formatDate } from '../../utils/formatDate';
import { sanitize } from '../../utils/sanitize';

/**
 * Shimmer loader for table rows.
 */
const SkeletonRow = () => (
  <tr className="border-b border-slate-100 dark:border-slate-800/40">
    <td className="py-4 pr-2"><div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-700 shimmer" /></td>
    <td className="py-4 pr-2"><div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700 shimmer" /></td>
    <td className="py-4 pr-2"><div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-700 shimmer" /></td>
    <td className="py-4 pr-2"><div className="h-4 w-44 rounded bg-slate-200 dark:bg-slate-700 shimmer" /></td>
    <td className="py-4 pr-2"><div className="h-5 w-24 rounded-full bg-slate-200 dark:bg-slate-700 shimmer" /></td>
    <td className="py-4 pr-2"><div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700 shimmer" /></td>
    <td className="py-4 text-right"><div className="h-6 w-16 rounded bg-slate-200 dark:bg-slate-700 shimmer inline-block" /></td>
  </tr>
);

/**
 * AdminComplaints page.
 * Allows table-based list search, status filter toggling, and inline status modification.
 */
export const AdminComplaints = () => {
  const { showToast } = useToast();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Pending' | 'In Progress' | 'Resolved' | 'Rejected'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limitPerPage = 15;

  // Inline Status updates animations states
  const [updatingRows, setUpdatingRows] = useState({}); // { [complaintId]: true }
  const [flashingRows, setFlashingRows] = useState({});  // { [complaintId]: true }

  const tabs = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];
  const statuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

  const fetchComplaints = async () => {
    setIsLoading(true);
    setError('');
    try {
      const statusParam = activeTab === 'All' ? '' : activeTab;
      // Fetch data. If search query is present, we fetch everything matching the status 
      // and perform client-side filtering as specified. To prevent pagination cuts 
      // when filtering client-side, we can adjust limit or paginate filtered list.
      // We will fetch up to 250 items to support accurate client search over status lists.
      const response = await api.get('/api/admin/complaints', {
        params: {
          status: statusParam || undefined,
          limit: 250 // Grab a larger page size to allow search
        }
      });
      
      const list = response.data?.data || response.data || [];
      setComplaints(list);
    } catch (err) {
      console.error('Fetch admin complaints error:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Unable to connect to server. Please check your connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    setCurrentPage(1); // Reset page on tab change
  }, [activeTab]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingRows((prev) => ({ ...prev, [id]: true }));
    try {
      await api.put(`/api/admin/update-status/${id}`, {
        Status: newStatus
      });

      // Update in-place
      setComplaints((prev) =>
        prev.map((c) => {
          const cId = c.ComplaintID || c.id;
          if (cId === id) {
            return { ...c, Status: newStatus };
          }
          return c;
        })
      );

      showToast(`Complaint #${id} updated to ${newStatus}.`, 'success');

      // Trigger success flash
      setFlashingRows((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setFlashingRows((prev) => ({ ...prev, [id]: false }));
      }, 800);

    } catch (err) {
      console.error('Status update error:', err);
      showToast('Failed to update complaint status.', 'error');
    } finally {
      setUpdatingRows((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Client-side search filtering by title
  const filteredComplaints = complaints.filter((comp) => {
    const titleText = comp.Title || comp.title || '';
    return titleText.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Client-side Pagination calculations
  const indexOfLastItem = currentPage * limitPerPage;
  const indexOfFirstItem = indexOfLastItem - limitPerPage;
  const currentItems = filteredComplaints.slice(indexOfFirstItem, indexOfLastItem);
  const totalItemsCount = filteredComplaints.length;
  const calculatedTotalPages = Math.max(Math.ceil(totalItemsCount / limitPerPage), 1);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 transition-colors duration-200">
      <Navbar />
      
      <div className="flex flex-1 relative">
        {/* Operator Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Admin Area */}
        <div className="flex-1 lg:pl-64 flex flex-col">
        
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-neutral-900 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg"
              aria-label="Toggle Navigation Sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="font-bold text-sm">Admin Portal</span>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
            Operator
          </span>
        </header>

        {/* Inner page */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 space-y-6">
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Incident Database</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
              Operator triage center for all registered complaints.
            </p>
          </div>

          {/* Search and Filters panel */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-neutral-800 p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card">
            
            {/* Search inputs */}
            <div className="relative flex-grow max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset page on filter change
                }}
                placeholder="Search database by title..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
              />
            </div>

            {/* Total Indicators */}
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 self-end md:self-auto">
              Total Filtered: {totalItemsCount}
            </div>
          </div>

          {/* Filters tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar scroll-smooth">
            <div className="flex space-x-6 min-w-max pb-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`relative pb-3 text-sm font-semibold transition-colors duration-150 ${
                      isActive
                        ? 'text-primary-light dark:text-white'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab}
                    {isActive && (
                      <motion.div
                        layoutId="adminActiveUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-light dark:bg-white"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table Container */}
          {error && (
            <ErrorMessage
              message={error}
              type="page"
              onRetry={fetchComplaints}
            />
          )}

          {!error && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider bg-slate-50/50 dark:bg-neutral-800/20">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Reporter</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Triage Status</th>
                      <th className="py-3 px-4">Date Filed</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <SkeletonRow key={i} />
                      ))
                    ) : currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-12 text-center text-slate-400 font-semibold">
                          No matching complaints found.
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((comp) => {
                        const cId = comp.ComplaintID || comp.id;
                        const cUser = comp.UserFullName || 'Anonymous';
                        const cCategory = comp.CategoryName || 'Other';
                        const cTitle = sanitize(comp.Title || comp.title);
                        const cStatus = comp.Status || comp.status || 'Pending';
                        const cDate = comp.CreatedAt || comp.createdAt;

                        const isUpdating = !!updatingRows[cId];
                        const isFlashing = !!flashingRows[cId];

                        return (
                          <tr
                            key={cId}
                            className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-neutral-800/20 transition-colors duration-150"
                          >
                            {/* Case ID */}
                            <td className="py-4 px-4 font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                              #{cId}
                            </td>

                            {/* User name */}
                            <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                              {cUser}
                            </td>

                            {/* Category */}
                            <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                              {cCategory}
                            </td>

                            {/* Title */}
                            <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={cTitle}>
                              {cTitle}
                            </td>

                            {/* Triaging Status Badge/Dropdown */}
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className={`p-0.5 rounded ${isFlashing ? 'flash-success' : ''}`}>
                                  {isUpdating ? (
                                    <div className="w-[84px] flex items-center justify-center">
                                      <LoadingSpinner size="sm" />
                                    </div>
                                  ) : (
                                    <select
                                      value={cStatus}
                                      onChange={(e) => handleStatusChange(cId, e.target.value)}
                                      disabled={isUpdating}
                                      className="bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-slate-200 dark:border-slate-700 py-1 pl-2 pr-6 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-primary-light transition-all outline-none cursor-pointer"
                                    >
                                      {statuses.map((st) => (
                                        <option key={st} value={st}>{st}</option>
                                      ))}
                                    </select>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Date */}
                            <td className="py-4 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {formatDate(cDate)}
                            </td>

                            {/* Action */}
                            <td className="py-4 px-4 text-right">
                              <Link
                                to={`/admin/complaints/${cId}`}
                                className="inline-flex items-center px-3 py-1.5 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-lg shadow-xs transition-colors duration-150"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table pagination */}
              {!isLoading && totalItemsCount > limitPerPage && (
                <div className="border-t border-slate-100 dark:border-slate-800 p-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={calculatedTotalPages}
                    onPageChange={(p) => setCurrentPage(p)}
                  />
                </div>
              )}
            </div>
          )}

        </main>
        </div>
      </div>
    </div>
  );
};

export default AdminComplaints;
