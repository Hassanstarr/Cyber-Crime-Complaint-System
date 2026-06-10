import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../hooks/useAuth';

/**
 * LandingPage component.
 * Public home page with hero animations and civic styling.
 */
export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleCTA = (path) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate('/login', { state: { redirect: path } });
    }
  };

  // Shield animation definition
  const shieldVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 1.4, ease: 'easeInOut' }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors duration-200">
      <Navbar />

      <main className="flex-grow flex flex-col justify-center">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          
          {/* Hero Content */}
          <div className="text-left space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary dark:text-white leading-[1.1]"
            >
              Report Cyber Crime. <br />
              <span className="text-primary-light">Seek Justice.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-350 leading-relaxed max-w-md"
            >
              A secure, confidential, and official portal for citizens to report online fraud, hacking, cyberbullying, phishing, ransomware, and digital crimes directly to authorities.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleCTA('/file-complaint')}
                className="px-6 py-3 bg-primary hover:bg-primary-light text-white font-bold rounded-lg shadow-sm transition-colors"
              >
                File a Complaint
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleCTA('/my-complaints')}
                className="px-6 py-3 border-2 border-primary text-primary hover:bg-primary/5 dark:border-primary-light dark:text-primary-light dark:hover:bg-primary-light/5 font-bold rounded-lg transition-colors"
              >
                Track My Complaints
              </motion.button>
            </motion.div>
          </div>

          {/* Animated SVG Shield */}
          <div className="flex items-center justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center bg-slate-200/40 dark:bg-neutral-800/40 rounded-full border border-slate-300/30 dark:border-slate-700/30 shadow-elevated">
              <svg
                className="w-40 h-40 md:w-48 md:h-48 text-primary dark:text-primary-light"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.path
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  variants={shieldPathVariants}
                  initial="hidden"
                  animate="visible"
                />
                <motion.path
                  d="M9 12l2 2 4-4"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                />
              </svg>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="bg-slate-50 dark:bg-neutral-800/40 border-t border-b border-slate-200/40 dark:border-slate-800/50 py-16 transition-colors duration-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-100px' }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {/* Feature 1 */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card space-y-3"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-primary-light dark:text-indigo-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Secure & Confidential</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Your identity and case details are fully encrypted and protected under strict state cybersecurity guidelines.
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card space-y-3"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-success dark:text-emerald-450">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Real-time Tracking</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Monitor the progressive lifecycle of your complaint. Receive system status changes at each phase.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card space-y-3"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-450">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fast Resolution</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Direct connection with authorized security experts ensures your case is investigated rapidly and efficiently.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

// SVG path drawing values
const shieldPathVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.2, ease: 'easeInOut' }
  }
};

export default LandingPage;
