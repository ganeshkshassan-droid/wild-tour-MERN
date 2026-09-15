import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('wildtour_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('wildtour_token'));
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('wildtour_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session expired, logging out');
          logout(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const setAuthSession = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('wildtour_token', newToken);
    localStorage.setItem('wildtour_user', JSON.stringify(newUser));
  };

  const login = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      if (res.success && res.token) {
        setAuthSession(res.token, res.user);
        showToast(res.message || 'Welcome back to Wild Tour!', 'success');
        return { success: true, user: res.user };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      if (error.data?.requiresVerification) {
        showToast(error.message || 'Please verify your email address to continue', 'warning');
        return {
          success: false,
          requiresVerification: true,
          email: error.data.email || email,
          purpose: 'signup',
        };
      }
      showToast(error.message || 'Login failed', 'error');
      return { success: false, message: error.message };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.register(formData);
      if (res.success) {
        showToast(res.message || 'Verification code dispatched to your email.', 'success');
        return {
          success: true,
          requiresVerification: true,
          email: res.email,
          purpose: 'signup',
        };
      }
      return { success: false, message: 'Registration failed' };
    } catch (error) {
      showToast(error.message || 'Registration failed', 'error');
      return { success: false, message: error.message };
    }
  };

  const loginWithGoogle = async (payload) => {
    try {
      const res = await api.googleAuth(payload);
      if (res.success && res.token) {
        setAuthSession(res.token, res.user);
        showToast(res.message || 'Authenticated with Google successfully!', 'success');
        return { success: true, user: res.user };
      }
      return { success: false, message: 'Google authentication failed' };
    } catch (error) {
      showToast(error.message || 'Google authentication failed', 'error');
      return { success: false, message: error.message };
    }
  };

  const verifyEmail = async (email, otp) => {
    try {
      const res = await api.verifyEmailOtp({ email, otp });
      if (res.success && res.token) {
        setAuthSession(res.token, res.user);
        showToast('Email verified successfully! Welcome to Wild Tour.', 'success');
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message };
    } catch (error) {
      showToast(error.message || 'Verification failed', 'error');
      return { success: false, message: error.message };
    }
  };

  const quickDemoLogin = async (role = 'admin') => {
    if (role === 'admin') {
      return await login('admin@wildtour.com', 'AdminMaster2026!');
    } else {
      return await login('ram@gmail.com', 'RamPassword123#');
    }
  };

  const logout = (showNotification = true) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('wildtour_token');
    localStorage.removeItem('wildtour_user');
    if (showNotification) {
      showToast('Logged out successfully. Safe travels!', 'info');
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('wildtour_user', JSON.stringify(updatedUser));
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await api.changePassword({ currentPassword, newPassword });
      if (res.success) {
        showToast(res.message || 'Password updated successfully', 'success');
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (error) {
      showToast(error.message || 'Failed to update password', 'error');
      return { success: false, message: error.message };
    }
  };

  // Strictly server-authoritative role evaluation
  const isAdmin = Boolean(user && user.role === 'admin');


  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        loginWithGoogle,
        verifyEmail,
        setAuthSession,
        quickDemoLogin,
        logout,
        updateUser,
        changePassword,
      }}
    >
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
