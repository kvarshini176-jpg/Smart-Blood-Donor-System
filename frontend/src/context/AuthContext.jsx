import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('blood_donor_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify session on page load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('blood_donor_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.error('Session verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, role = null) => {
    const res = await api.post('/auth/login', { email, password, role });
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('blood_donor_token', newToken);
      localStorage.setItem('blood_donor_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message || 'Login failed.');
  };

  const registerDonor = async (formData) => {
    const res = await api.post('/auth/register-donor', formData);
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('blood_donor_token', newToken);
      localStorage.setItem('blood_donor_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message || 'Donor registration failed.');
  };

  const registerHospital = async (formData) => {
    const res = await api.post('/auth/register-hospital', formData);
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('blood_donor_token', newToken);
      localStorage.setItem('blood_donor_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message || 'Hospital registration failed.');
  };

  const logout = () => {
    localStorage.removeItem('blood_donor_token');
    localStorage.removeItem('blood_donor_user');
    setToken(null);
    setUser(null);
  };

  const refreshMe = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Refresh me error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        registerDonor,
        registerHospital,
        logout,
        refreshMe,
        isAuthenticated: Boolean(user && token),
        isDonor: user?.role === 'DONOR',
        isHospital: user?.role === 'HOSPITAL',
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
