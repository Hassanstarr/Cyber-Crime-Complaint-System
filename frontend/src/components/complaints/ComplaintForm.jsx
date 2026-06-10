import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { getCategoriesList } from '../../utils/categories';

/**
 * ComplaintForm component.
 * Allows citizen users to file complaints. Handles validations and character counters.
 */
export const ComplaintForm = () => {
  const navigate = useNavigate();
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [errors, setErrors] = useState({});
  const [submittedData, setSubmittedData] = useState(null);

  const categories = getCategoriesList();

  const validate = () => {
    const tempErrors = {};
    
    if (!categoryId) {
      tempErrors.categoryId = 'Category is required. Please select one.';
    }
    
    if (!title.trim()) {
      tempErrors.title = 'Complaint title is required.';
    } else if (title.trim().length < 10) {
      tempErrors.title = 'Title must be at least 10 characters long.';
    } else if (title.length > 200) {
      tempErrors.title = 'Title must not exceed 200 characters.';
    }

    if (!description.trim()) {
      tempErrors.description = 'Description is required.';
    } else if (description.trim().length < 30) {
      tempErrors.description = 'Description must be at least 30 characters to explain the incident.';
    } else if (description.length > 2000) {
      tempErrors.description = 'Description must not exceed 2000 characters.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await api.post('/api/complaints', {
        CategoryID: Number(categoryId),
        Title: title,
        Description: description,
      });

      // Response success
      setSubmittedData({
        id: response.data?.data?.ComplaintID || response.data?.ComplaintID || response.data?.data?.id || 'N/A',
        status: response.data?.data?.Status || response.data?.Status || 'Pending'
      });
      
      // Reset form
      setCategoryId('');
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('Submit complaint error:', err);
      setApiError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'An error occurred while submitting your complaint. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="p-6 md:p-8 bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-center max-w-lg mx-auto shadow-md"
      >
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/60 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-450 mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-400 mb-2">
          Complaint Filed Successfully
        </h3>
        
        <p className="text-sm text-emerald-800 dark:text-emerald-300 mb-6 leading-relaxed">
          Your complaint <span className="font-mono font-bold bg-white/65 dark:bg-neutral-850 px-2 py-0.5 rounded text-neutral-900 dark:text-white">#{submittedData.id}</span> has been submitted. 
          <br />
          Current Status: <span className="font-semibold text-emerald-700 dark:text-emerald-450">{submittedData.status}</span>.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => setSubmittedData(null)}
            className="px-4 py-2.5 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20 text-sm font-semibold rounded-lg transition-colors"
          >
            File Another Complaint
          </button>
          
          <button
            onClick={() => navigate('/my-complaints')}
            className="px-4 py-2.5 bg-primary hover:bg-primary-light text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            View My Complaints
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-neutral-800 p-6 md:p-8 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* API error block */}
        {apiError && <ErrorMessage message={apiError} type="block" />}

        {/* Category Selector */}
        <div>
          <label htmlFor="category" className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
            Incident Category <span className="text-accent">*</span>
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: '' }));
            }}
            disabled={isSubmitting}
            className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border ${
              errors.categoryId 
                ? 'border-rose-450 focus:ring-rose-500' 
                : 'border-slate-250 dark:border-slate-700 focus:border-primary-light'
            } rounded-lg text-sm text-slate-850 dark:text-slate-100 focus:ring-2 focus:ring-opacity-20 transition-all`}
          >
            <option value="" disabled>Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.categoryId && <ErrorMessage message={errors.categoryId} />}
        </div>

        {/* Complaint Title */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="title" className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Complaint Title <span className="text-accent">*</span>
            </label>
            <span className={`text-xs font-semibold ${
              title.length > 200 ? 'text-accent' : 'text-slate-400 dark:text-slate-500'
            }`}>
              {title.length} / 200
            </span>
          </div>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value.slice(0, 200));
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            disabled={isSubmitting}
            placeholder="Brief title summarizing the incident"
            className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border ${
              errors.title 
                ? 'border-rose-450 focus:ring-rose-500' 
                : 'border-slate-250 dark:border-slate-700 focus:border-primary-light'
            } rounded-lg text-sm text-slate-850 dark:text-slate-100 transition-all`}
          />
          {errors.title && <ErrorMessage message={errors.title} />}
        </div>

        {/* Complaint Description */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="description" className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Detailed Description <span className="text-accent">*</span>
            </label>
            <span className={`text-xs font-semibold ${
              description.length > 2000 ? 'text-accent' : 'text-slate-400 dark:text-slate-500'
            }`}>
              {description.length} / 2000
            </span>
          </div>
          <textarea
            id="description"
            rows={6}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value.slice(0, 2000));
              if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
            }}
            disabled={isSubmitting}
            placeholder="Provide a detailed chronological explanation of the incident, including website domains, email addresses, transaction dates, or other relevant digital details (minimum 30 characters)."
            className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border ${
              errors.description 
                ? 'border-rose-450 focus:ring-rose-500' 
                : 'border-slate-250 dark:border-slate-700 focus:border-primary-light'
            } rounded-lg text-sm text-slate-850 dark:text-slate-100 transition-all resize-y`}
          />
          {errors.description && <ErrorMessage message={errors.description} />}
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-light disabled:bg-primary/70 text-white font-bold rounded-lg shadow-sm transition-colors duration-150"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Submitting report...</span>
              </>
            ) : (
              <span>Submit Complaint</span>
            )}
          </motion.button>
        </div>

      </form>
    </div>
  );
};

export default ComplaintForm;
