/**
 * AuthContext - Context untuk manajemen authentication
 * Mengelola state user, token, login, dan logout
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function untuk menyimpan user data sesuai struktur backend
  const normalizeUserData = (userData) => {
    if (!userData) return null;
    
    // Tidak perlu mapping, simpan user data sesuai struktur backend
    const normalizedUser = {
      ...userData
    };
    
    // Normalize peran to lowercase untuk konsistensi
    if (normalizedUser.peran) {
      normalizedUser.peran = normalizedUser.peran.toLowerCase();
    }
    
    return normalizedUser;
  };

  // Check if user is already logged in on app start
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Normalize stored user data juga
        const normalizedUser = normalizeUserData(parsedUser);
        
        setToken(storedToken);
        setUser(normalizedUser);
        
        // Update localStorage dengan data yang sudah dinormalisasi
        localStorage.setItem('user', JSON.stringify(normalizedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, kata_sandi) => {
    try {
      const response = await api.post('/api/login', {
        email,
        kata_sandi,
      });

      const { token, user } = response.data;
      
      // Normalize user data (simpan sesuai struktur backend)
      const normalizedUser = normalizeUserData(user);
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
      // Update state
      setToken(token);
      setUser(normalizedUser);
      
      return { success: true, user: normalizedUser };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login gagal'
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.peran?.toLowerCase() === 'admin';
  };

  // Check if user is regular user
  const isUser = () => {
    const peran = user?.peran?.toLowerCase();
    return peran === 'pengguna' || peran === 'user';
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};