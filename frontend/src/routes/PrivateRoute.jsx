import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * Route guard for authenticated users.
 * Redirects unauthorized users to '/login'.
 */
export const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // If credentials are still validating, we could display a loading spinner.
  // Here we immediately check if authenticated.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
