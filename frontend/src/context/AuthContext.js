import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_URL = process.env.REACT_APP_BACKEND_URL;

// Axios instance for user APIs with cookie-based auth
export const userAxios = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await userAxios.get('/auth/me');
      setUser(res.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    await userAxios.post('/auth/signup', userData);
    // After signup, fetch profile (user may or may not be auto-logged in depending on backend)
    await fetchUserProfile();
  };

  const login = async (credentials) => {
    await userAxios.post('/auth/login', credentials);
    await fetchUserProfile();
  };

  const logout = async () => {
    try {
      await userAxios.post('/auth/logout');
    } catch (error) {
      // ignore logout errors
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        signup,
        login,
        logout,
        isAuthenticated: !!user,
        userAxios,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);