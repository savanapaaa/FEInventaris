/**
 * Navbar Component
 * Navbar untuk dashboard dengan nama pengguna dan tombol logout
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Menu button and Logo */}
          <div className="flex items-center space-x-4">
            {/* Hamburger menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-800">
                Sistem Peminjaman Inventaris
              </h1>
            </div>
            <div className="hidden md:block">
              <span className="text-sm text-gray-500">
                {isAdmin() ? 'Dashboard Admin' : 'Dashboard User'}
              </span>
            </div>
          </div>

          {/* User Info dan Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">
                {user?.nama_pengguna || 'User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.peran || 'user'}
              </p>
            </div>
            
            {/* Avatar */}
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {user?.nama_pengguna?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;