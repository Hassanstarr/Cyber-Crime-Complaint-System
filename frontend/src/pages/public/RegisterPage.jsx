import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/common/Toast';

/**
 * RegisterPage component.
 * Features split screen visual alignment and live validator hooks on-blur.
 */
export const RegisterPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    FullName: '',
    Email: '',
    Phone: '',
    Password: '',
    ConfirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateField = (name, value) => {
    let error = '';

    if (name === 'FullName') {
      if (!value.trim()) error = 'Full Name is required.';
    }

    if (name === 'Email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) {
        error = 'Email is required.';
      } else if (!emailRegex.test(value)) {
        error = 'Please enter a valid email address.';
      }
    }

    if (name === 'Phone') {
      if (value.trim()) {
        const phoneRegex = /^\d+$/;
        if (!phoneRegex.test(value.trim())) {
          error = 'Phone number must contain only digits.';
        }
      }
    }

    if (name === 'Password') {
      if (!value) {
        error = 'Password is required.';
      } else if (value.length < 6) {
        error = 'Password must be at least 6 characters.';
      }
    }

    if (name === 'ConfirmPassword') {
      if (!value) {
        error = 'Please confirm your password.';
      } else if (value !== formData.Password) {
        error = 'Passwords do not match.';
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    // Validate all fields
    let isValid = true;
    Object.keys(formData).forEach((key) => {
      const fieldValid = validateField(key, formData[key]);
      if (!fieldValid) isValid = false;
    });

    if (!isValid) {
      showToast('Please correct the errors in the form.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/api/users/register', {
        FullName: formData.FullName,
        Email: formData.Email,
        Password: formData.Password,
        Phone: formData.Phone || undefined,
      });

      showToast('Registration successful! Redirecting...', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.status === 409) {
        setErrors((prev) => ({
          ...prev,
          Email: 'An account with this email already exists.'
        }));
        showToast('Account already exists.', 'error');
      } else {
        setGeneralError(
          err.response?.data?.message || 
          err.response?.data?.error || 
          'Registration failed. Please verify connection and try again.'
        );
        showToast('Registration failed.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors duration-200">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl bg-white dark:bg-neutral-800 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-card overflow-hidden grid grid-cols-1 md:grid-cols-2">
          
          {/* Left panel (Shield & Tagline) — Hidden on Mobile */}
          <div className="hidden md:flex flex-col items-center justify-center p-8 bg-neutral-900 text-white text-center border-r border-slate-800 space-y-6">
            <svg
              className="w-32 h-32 text-primary-light"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              />
              <motion.path
                d="M9 12l2 2 4-4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.3 }}
              />
            </svg>
            <div className="space-y-2 max-w-xs">
              <h2 className="text-xl font-bold">Secure Registration</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Creating an account permits encrypted submission and live updates on your complaints.
              </p>
            </div>
          </div>

          {/* Right panel (Registration Form) */}
          <div className="p-6 sm:p-10 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              Create Citizen Account
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Please enter your valid details to file digital reports.
            </p>

            {generalError && <ErrorMessage message={generalError} type="block" />}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label htmlFor="FullName" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Full Name <span className="text-accent">*</span>
                </label>
                <input
                  id="FullName"
                  name="FullName"
                  type="text"
                  value={formData.FullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                  placeholder="e.g. John Doe"
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border ${
                    errors.FullName ? 'border-rose-450' : 'border-slate-250 dark:border-slate-700'
                  } rounded-lg text-sm dark:text-white`}
                />
                {errors.FullName && <ErrorMessage message={errors.FullName} />}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="Email" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Email Address <span className="text-accent">*</span>
                </label>
                <input
                  id="Email"
                  name="Email"
                  type="email"
                  value={formData.Email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                  placeholder="name@example.com"
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border ${
                    errors.Email ? 'border-rose-450' : 'border-slate-250 dark:border-slate-700'
                  } rounded-lg text-sm dark:text-white`}
                />
                {errors.Email && <ErrorMessage message={errors.Email} />}
              </div>

              {/* Phone (Optional) */}
              <div>
                <label htmlFor="Phone" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="Phone"
                  name="Phone"
                  type="tel"
                  value={formData.Phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                  placeholder="e.g. 03001234567"
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border ${
                    errors.Phone ? 'border-rose-450' : 'border-slate-250 dark:border-slate-700'
                  } rounded-lg text-sm dark:text-white`}
                />
                {errors.Phone && <ErrorMessage message={errors.Phone} />}
              </div>

              {/* Password */}
              <div className="relative">
                <label htmlFor="Password" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Password <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <input
                    id="Password"
                    name="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.Password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    placeholder="At least 6 characters"
                    className={`w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-neutral-900 border ${
                      errors.Password ? 'border-rose-450' : 'border-slate-250 dark:border-slate-700'
                    } rounded-lg text-sm dark:text-white`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:text-slate-500"
                  >
                    {showPassword ? (
                      // Eye Closed
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      // Eye Open
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.Password && <ErrorMessage message={errors.Password} />}
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label htmlFor="ConfirmPassword" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Confirm Password <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <input
                    id="ConfirmPassword"
                    name="ConfirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.ConfirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    placeholder="Repeat password"
                    className={`w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-neutral-900 border ${
                      errors.ConfirmPassword ? 'border-rose-450' : 'border-slate-250 dark:border-slate-700'
                    } rounded-lg text-sm dark:text-white`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:text-slate-500"
                  >
                    {showConfirmPassword ? (
                      // Eye Closed
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      // Eye Open
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.ConfirmPassword && <ErrorMessage message={errors.ConfirmPassword} />}
              </div>

              {/* Submit */}
              <div className="pt-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary-light disabled:bg-primary/70 text-white font-bold rounded-lg shadow-sm text-sm transition-colors duration-150"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Register Account</span>
                  )}
                </motion.button>
              </div>

            </form>

            <p className="mt-6 text-center text-xs text-slate-550 dark:text-slate-400 font-semibold">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-light hover:underline font-bold">
                Log in
              </Link>
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegisterPage;
