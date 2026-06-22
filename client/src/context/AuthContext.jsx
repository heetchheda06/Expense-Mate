import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const checkUserSession = async () => {
      const token = localStorage.getItem('expensemate_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error('Session validation failed:', err.message);
        localStorage.removeItem('expensemate_token');
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('expensemate_token', res.data.token);
        setUser(res.data.user);
        showToast(`Welcome back, ${res.data.user.name}!`, 'success');
        return true;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed, check credentials.';
      showToast(errorMsg, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.data.success) {
        localStorage.setItem('expensemate_token', res.data.token);
        setUser(res.data.user);
        showToast(`Account created! Welcome ${res.data.user.name}.`, 'success');
        return true;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Signup failed, please retry.';
      showToast(errorMsg, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('expensemate_token');
    localStorage.removeItem('expensemate_active_profile_id');
    setUser(null);
    showToast('Logged out successfully.', 'info');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login: loginUser, register: registerUser, logout: logoutUser }}>
      {children}
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
