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
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Menu button and Logo */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
            {/* Hamburger menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex-shrink-0 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                <span className="hidden sm:inline">Sistem Peminjaman Inventaris</span>
                <span className="sm:hidden">Inventaris</span>
              </h1>
            </div>
            <div className="hidden md:block flex-shrink-0">
              <span className="text-xs sm:text-sm text-gray-500">
                {isAdmin() ? 'Dashboard Admin' : 'Dashboard User'}
              </span>
            </div>
          </div>

          {/* User Info dan Logout */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 truncate max-w-32">
                {user?.nama_pengguna || 'User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.peran || 'user'}
              </p>
            </div>
            
            {/* Avatar */}
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">
                {user?.nama_pengguna?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 transition-colors duration-200 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium flex-shrink-0"
            >
              <span className="hidden sm:inline">Logout</span>
              <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;