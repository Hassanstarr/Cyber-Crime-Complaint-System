import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ComplaintForm from '../../components/complaints/ComplaintForm';

/**
 * FileComplaint page container.
 * Wraps the complaint creation form.
 */
export const FileComplaint = () => {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors duration-200">
      <Navbar />

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-primary dark:text-white">
            Submit Incident Report
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-1.5 font-semibold leading-relaxed">
            Please fill out the form below. Once filed, your case will be registered and queued for active screening.
          </p>
        </div>

        <ComplaintForm />
      </main>

      <Footer />
    </div>
  );
};

export default FileComplaint;
