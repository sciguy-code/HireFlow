import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { setupInterceptors } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleRefresh = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
      const { accessToken: newAccessToken } = res.data.data;
      setAccessToken(newAccessToken);
      
      const meRes = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${newAccessToken}` }
      });
      setUser(meRes.data.data.user);
      return newAccessToken;
    } catch (err) {
      setAccessToken(null);
      setUser(null);
      return null;
    }
  };

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password }, { withCredentials: true });
    const { accessToken: newAccessToken, user: loggedUser } = res.data.data;
    setAccessToken(newAccessToken);
    setUser(loggedUser);
    return res.data;
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout error:', err.message);
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  // Wire up Axios Private Interceptors
  useEffect(() => {
    const cleanup = setupInterceptors(accessToken, handleRefresh, logout);
    return () => cleanup();
  }, [accessToken]);

  // Initial Auth Check
  useEffect(() => {
    const initializeAuth = async () => {
      await handleRefresh();
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const value = {
    user,
    accessToken,
    loading,
    login,
    logout,
    updateUser,
    setAccessToken,
    handleRefresh
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
