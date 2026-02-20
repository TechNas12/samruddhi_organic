import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminContext = createContext();

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Configure axios defaults for admin requests to include credentials
const adminAxios = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // 🔥 CRITICAL for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      // Use admin/me endpoint to verify admin auth and get admin info
      const res = await adminAxios.get('/admin/me');
      setAdmin(res.data.admin);
    } catch (error) {
      // Not authenticated or session expired
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const res = await adminAxios.post('/admin/login', credentials);
      // After login, verify and get admin info
      const meRes = await adminAxios.get('/admin/me');
      setAdmin(meRes.data.admin);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await adminAxios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAdmin(null);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
        checkAdminAuth,
        adminAxios, // Export configured axios instance
        isAuthenticated: !!admin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

// Export adminAxios for direct use in components
export { adminAxios };
