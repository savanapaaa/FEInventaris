/**
 * App.jsx - Main Application Component
 * Routing utama menggunakan React Router DOM v6
 * Protected routes berdasarkan role (admin/user)
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Pages
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import UserDashboard from './pages/user/Dashboard';
import Users from './pages/admin/Users';
import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import Borrowings from './pages/admin/Borrowings';

// Import User Pages
import AvailableProducts from './pages/user/AvailableProducts';
import MyBorrowings from './pages/user/MyBorrowings';
import BorrowingHistory from './pages/user/BorrowingHistory';
import Profile from './pages/user/Profile';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user?.peran !== requiredRole) {
    // Redirect to appropriate dashboard based on user peran
    const userPeran = user?.peran?.toLowerCase();
    
    if (userPeran === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userPeran === 'pengguna' || userPeran === 'user') {
      return <Navigate to="/user/dashboard" replace />;
    }
  }

  return children;
};

// Public Route Component (for login page)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isAuthenticated()) {
    // Redirect to appropriate dashboard based on user peran
    const userPeran = user?.peran?.toLowerCase();
    
    if (userPeran === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userPeran === 'pengguna' || userPeran === 'user') {
      return <Navigate to="/user/dashboard" replace />;
    }
  }

  return children;
};

// App Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route - Login */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected Routes - Admin */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredRole="admin">
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute requiredRole="admin">
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute requiredRole="admin">
            <Categories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/borrowings"
        element={
          <ProtectedRoute requiredRole="admin">
            <Borrowings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/activity-logs"
        element={
          <ProtectedRoute requiredRole="admin">
            <div>Activity Logs - Coming Soon</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute requiredRole="admin">
            <div>Monthly Reports - Coming Soon</div>
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - User */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute requiredRole="pengguna">
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/products"
        element={
          <ProtectedRoute requiredRole="pengguna">
            <AvailableProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/borrowings"
        element={
          <ProtectedRoute requiredRole="pengguna">
            <MyBorrowings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/history"
        element={
          <ProtectedRoute requiredRole="pengguna">
            <BorrowingHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/profile"
        element={
          <ProtectedRoute requiredRole="pengguna">
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Catch all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;