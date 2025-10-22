/**
 * Konfigurasi Axios untuk komunikasi dengan backend
 * Base URL: http://localhost:5000
 * Includes interceptor untuk menambahkan token Authorization pada setiap request
 */

import axios from 'axios';

// Konfigurasi base URL untuk backend Express.js
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token Authorization pada setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk handle response dan error
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Jika token expired atau unauthorized, redirect ke login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;