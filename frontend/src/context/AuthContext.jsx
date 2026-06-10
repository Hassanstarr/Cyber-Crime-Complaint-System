import React, { createContext, useState } from 'react';

export const AuthContext = createContext(null);

/**
 * Authentication state provider.
 * Manages JWT validation, user profiles, and session storage configuration.
 */
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('cc_token') || sessionStorage.getItem('cc_token') || null;
  });

  const [user, setUser] = useState(() => {
    const cachedUser = localStorage.getItem('cc_user') || sessionStorage.getItem('cc_user');
    try {
      return cachedUser ? JSON.parse(cachedUser) : null;
    } catch (e) {
      console.error("Failed to parse cached user:", e);
      return null;
    }
  });

  /**
   * Caches authentication details and sets active session.
   * @param {Object} userData - User profiles details.
   * @param {string} tokenValue - JWT token string.
   * @param {boolean} rememberMe - Persist details in localStorage if true, else sessionStorage.
   */
  const login = (userData, tokenValue, rememberMe) => {
    setToken(tokenValue);
    setUser(userData);

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('cc_token', tokenValue);
    storage.setItem('cc_user', JSON.stringify(userData));
  };

  /**
   * Clears session storage and redirects to the login screen.
   */
  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    sessionStorage.removeItem('cc_token');
    sessionStorage.removeItem('cc_user');
    
    // Hard redirect to clear out memory/states
    window.location.href = '/login';
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
