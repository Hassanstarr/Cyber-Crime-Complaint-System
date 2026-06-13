import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import Sidebar from '../../components/layout/Sidebar';
import Navbar from '../../components/layout/Navbar';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { getCategoryName } from '../../utils/categories';
import { formatDate } from '../../utils/formatDate';
import { sanitize } from '../../utils/sanitize';

/**
 * requestAnimationFrame-based CountUp component.
 */
const CountUp = ({ to, duration = 0.8 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const end = parseInt(to, 10);
    if (isNaN(end) || end === 0) {
      setCount(0);
      return;
    }
    
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(end);
      return;
    }

    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [to, duration]);

  return <span>{count}</span>;
};

/**
 * AdminDashboard page.
 * Operator center showing global counts, visual bars, and recent files table.
 */
export const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Computations
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    progress: 0,
    resolved: 0,
    rejected: 0
  });

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Fetch up to 1000 items to calculate accurate system ratios on the dashboard
      const response = await api.get('/api/admin/complaints?limit=1000');
      const dataList = response.data?.data || response.data || [];
      setComplaints(dataList);

      const computed = dataList.reduce(
        (acc, item) => {
          acc.total += 1;
          const status = item.Status || item.status || 'Pending';
          if (status === 'Pending') acc.pending += 1;
          if (status === 'In Progress') acc.progress += 1;
          if (status === 'Resolved') acc.resolved += 1;
          if (status === 'Rejected') acc.rejected += 1;
          return acc;
        },
        { total: 0, pending: 0, progress: 0, resolved: 0, rejected: 0 }
      );

      setStats(computed);
    } catch (err) {
      console.error('Fetch admin dashboard error:', err);
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
    fetchDashboardData();
  }, []);

  const getPercentage = (count) => {
    if (stats.total === 0) return 0;
    return Math.round((count / stats.total) * 100);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 transition-colors duration-200">
      <Navbar />
      
      <div className="flex flex-1 relative">
        {/* Collapsible Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Admin Area */}
        <div className="flex-1 lg:pl-64 flex flex-col">
        
        {/* Mobile Header Bar */}
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
            <span className="font-bold text-sm tracking-tight">Admin Portal</span>
          </div>
          
          <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
            Operator
          </span>
        </header>

        {/* Inner Content */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 space-y-8">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">System Overview</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                Global statistics and recent incident listings.
              </p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="p-2.5 bg-white border border-slate-200 dark:bg-neutral-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-neutral-700/50 rounded-lg shadow-xs transition-colors duration-150"
              aria-label="Reload dashboard data"
            >
              <svg className="w-4.5 h-4.5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18v3" />
              </svg>
            </button>
          </div>

          {error && (
            <ErrorMessage
              message={error}
              type="page"
              onRetry={fetchDashboardData}
            />
          )}

          {!error && isLoading && (
            <div className="flex justify-center items-center py-24">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {!error && !isLoading && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-8"
            >
              
              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Total */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-neutral-800 p-5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card"
                >
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total
                  </span>
                  <div className="text-2xl font-bold text-primary dark:text-white mt-1.5 font-mono">
                    <CountUp to={stats.total} />
                  </div>
                </motion.div>

                {/* Pending */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-neutral-800 p-5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card"
                >
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Pending
                  </span>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1.5 font-mono">
                    <CountUp to={stats.pending} />
                  </div>
                </motion.div>

                {/* In Progress */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-neutral-800 p-5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card"
                >
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    In Progress
                  </span>
                  <div className="text-2xl font-bold text-primary-light dark:text-indigo-400 mt-1.5 font-mono">
                    <CountUp to={stats.progress} />
                  </div>
                </motion.div>

                {/* Resolved */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-neutral-800 p-5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card"
                >
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Resolved
                  </span>
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1.5 font-mono">
                    <CountUp to={stats.resolved} />
                  </div>
                </motion.div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* CSS Bar Breakdown Chart */}
                <motion.div
                  variants={itemVariants}
                  className="lg:col-span-1 bg-white dark:bg-neutral-800 p-6 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card"
                >
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">
                    Status Ratios
                  </h3>
                  
                  {stats.total === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-400">
                      No status data to render.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Pending ratio */}
                      <div>
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          <span>Pending</span>
                          <span className="font-mono">{stats.pending} ({getPercentage(stats.pending)}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-neutral-900 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: `${getPercentage(stats.pending)}%` }} />
                        </div>
                      </div>

                      {/* Progress ratio */}
                      <div>
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          <span>In Progress</span>
                          <span className="font-mono">{stats.progress} ({getPercentage(stats.progress)}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-neutral-900 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${getPercentage(stats.progress)}%` }} />
                        </div>
                      </div>

                      {/* Resolved ratio */}
                      <div>
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          <span>Resolved</span>
                          <span className="font-mono">{stats.resolved} ({getPercentage(stats.resolved)}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-neutral-900 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${getPercentage(stats.resolved)}%` }} />
                        </div>
                      </div>

                      {/* Rejected ratio */}
                      <div>
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          <span>Rejected</span>
                          <span className="font-mono">{stats.rejected} ({getPercentage(stats.rejected)}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-neutral-900 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-rose-500 h-full rounded-full" style={{ width: `${getPercentage(stats.rejected)}%` }} />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Recent 10 Table */}
                <motion.div
                  variants={itemVariants}
                  className="lg:col-span-2 bg-white dark:bg-neutral-800 p-6 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Recent Complaints
                    </h3>
                    <Link
                      to="/admin/complaints"
                      className="text-xs font-bold text-primary-light dark:text-indigo-400 hover:underline"
                    >
                      View All
                    </Link>
                  </div>

                  {complaints.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-400">
                      No complaints registered in system.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-400 uppercase text-[11px] font-bold tracking-wider">
                            <th className="pb-3 pr-2">Case ID</th>
                            <th className="pb-3 pr-2">User</th>
                            <th className="pb-3 pr-2">Category</th>
                            <th className="pb-3 pr-2">Status</th>
                            <th className="pb-3 pr-2">Date</th>
                            <th className="pb-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {complaints.slice(0, 10).map((comp) => {
                            const cId = comp.ComplaintID || comp.id;
                            const cUser = comp.UserFullName || 'Anonymous';
                            const cCategory = comp.CategoryName || 'Other';
                            const cStatus = comp.Status || comp.status || 'Pending';
                            const cDate = comp.CreatedAt || comp.createdAt;

                            return (
                              <tr
                                key={cId}
                                className="border-b border-slate-100/50 dark:border-slate-700/30 last:border-0 hover:bg-slate-50/50 dark:hover:bg-neutral-800/30 transition-all duration-150"
                              >
                                <td className="py-3.5 pr-2 font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                                  #{cId}
                                </td>
                                <td className="py-3.5 pr-2 font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                                  {cUser}
                                </td>
                                <td className="py-3.5 pr-2 text-slate-600 dark:text-slate-300">
                                  {cCategory}
                                </td>
                                <td className="py-3.5 pr-2">
                                  <StatusBadge status={cStatus} />
                                </td>
                                <td className="py-3.5 pr-2 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                  {formatDate(cDate)}
                                </td>
                                <td className="py-3.5 text-right">
                                  <Link
                                    to={`/admin/complaints/${cId}`}
                                    className="inline-flex items-center px-2.5 py-1 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-primary-light hover:text-primary-light dark:text-slate-300 dark:hover:text-white rounded transition-colors duration-150"
                                  >
                                    View
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>

              </div>

            </motion.div>
          )}

        </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
