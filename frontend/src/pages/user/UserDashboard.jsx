import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { getCategoryName } from '../../utils/categories';
import { formatDate } from '../../utils/formatDate';
import { sanitize } from '../../utils/sanitize';
import { useAuth } from '../../hooks/useAuth';

/**
 * requestAnimationFrame-based CountUp component for numbers.
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
 * UserDashboard component.
 * Displays greeting, counts of citizen's complaints, and a short table of recent cases.
 */
export const UserDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Computations
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
  });

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Fetch up to 100 entries to compute accurate dashboard totals on the client
        const response = await api.get('/api/complaints/my?limit=100');
        const dataList = response.data?.data || [];
        setComplaints(dataList);

        // Compute counts
        const computed = dataList.reduce(
          (acc, item) => {
            acc.total += 1;
            const status = item.Status || item.status || 'Pending';
            if (status === 'Pending') acc.pending += 1;
            if (status === 'Resolved') acc.resolved += 1;
            return acc;
          },
          { total: 0, pending: 0, resolved: 0 }
        );

        setStats(computed);
      } catch (err) {
        console.error('Fetch dashboard error:', err);
        setError(
          err.response?.data?.message || 
          err.response?.data?.error || 
          'Unable to connect to server. Please check your connection.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors duration-200">
      <Navbar />

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-8 bg-white dark:bg-neutral-800 p-6 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary dark:text-white leading-tight">
              Welcome back, {user?.FullName || 'Citizen'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
              Today is {today}
            </p>
          </div>
          <Link
            to="/file-complaint"
            className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-light text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
          >
            File a Complaint <span className="ml-1.5 font-bold">→</span>
          </Link>
        </div>

        {error && (
          <ErrorMessage 
            message={error} 
            type="page" 
            onRetry={() => window.location.reload()} 
          />
        )}

        {!error && isLoading && (
          <div className="flex justify-center items-center py-20">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Total Complaints */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-neutral-800 p-5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card"
              >
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Complaints
                </div>
                <div className="text-3xl font-bold text-primary dark:text-white mt-2 font-mono">
                  <CountUp to={stats.total} />
                </div>
              </motion.div>

              {/* Pending */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-neutral-800 p-5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card"
              >
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Pending Review
                </div>
                <div className="text-3xl font-bold text-amber-555 dark:text-amber-400 mt-2 font-mono">
                  <CountUp to={stats.pending} />
                </div>
              </motion.div>

              {/* Resolved */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-neutral-800 p-5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card"
              >
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Resolved Cases
                </div>
                <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-450 mt-2 font-mono">
                  <CountUp to={stats.resolved} />
                </div>
              </motion.div>
            </div>

            {/* Quick Action & Recent table Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Quick Action Card */}
              <motion.div
                variants={itemVariants}
                className="lg:col-span-1 bg-white dark:bg-neutral-800 p-6 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    Have something to report?
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                    Incident reports are direct-filed to cybersecurity units. Please provide as much detailed digital evidence as possible.
                  </p>
                </div>
                
                <Link
                  to="/file-complaint"
                  className="w-full text-center py-2.5 bg-primary hover:bg-primary-light text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
                >
                  File a Complaint &rarr;
                </Link>
              </motion.div>

              {/* Recent Complaints Table (last 5) */}
              <motion.div
                variants={itemVariants}
                className="lg:col-span-2 bg-white dark:bg-neutral-800 p-6 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Recent Complaints
                  </h3>
                  {complaints.length > 5 && (
                    <Link
                      to="/my-complaints"
                      className="text-xs font-bold text-primary-light dark:text-indigo-400 hover:underline"
                    >
                      View All
                    </Link>
                  )}
                </div>

                {complaints.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-450">
                    No complaints registered. Click 'File a Complaint' to submit your first case.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-450 uppercase text-[11px] font-bold tracking-wider">
                          <th className="pb-3 pr-2">Complaint ID</th>
                          <th className="pb-3 pr-2">Title</th>
                          <th className="pb-3 pr-2">Category</th>
                          <th className="pb-3 pr-2">Status</th>
                          <th className="pb-3">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {complaints.slice(0, 5).map((comp) => {
                          const cId = comp.ComplaintID || comp.id;
                          const cTitle = sanitize(comp.Title || comp.title);
                          const categoryId = comp.CategoryID || comp.categoryId;
                          const cStatus = comp.Status || comp.status || 'Pending';
                          const cDate = comp.CreatedAt || comp.createdAt;

                          return (
                            <tr
                              key={cId}
                              className="border-b border-slate-100/50 dark:border-slate-750/30 last:border-0 hover:bg-slate-50/50 dark:hover:bg-neutral-850/30 transition-colors"
                            >
                              <td className="py-3.5 pr-2 font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                                #{cId}
                              </td>
                              <td className="py-3.5 pr-2 font-semibold text-slate-850 dark:text-slate-200 line-clamp-1 max-w-[150px]">
                                {cTitle}
                              </td>
                              <td className="py-3.5 pr-2 text-slate-600 dark:text-slate-350">
                                {getCategoryName(categoryId)}
                              </td>
                              <td className="py-3.5 pr-2">
                                <StatusBadge status={cStatus} />
                              </td>
                              <td className="py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                {formatDate(cDate)}
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

      <Footer />
    </div>
  );
};

export default UserDashboard;
