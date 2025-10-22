/**
 * Login Page
 * Halaman login dengan design modern menggunakan Tailwind CSS
 * Background gradient biru ke ungu dengan card login di tengah
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    kata_sandi: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Clear any existing data first
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    try {
      const result = await login(formData.email, formData.kata_sandi);
      
      if (result.success) {
        // Redirect based on user peran (case insensitive)
        const userPeran = result.user.peran?.toLowerCase();
        
        if (userPeran === 'admin') {
          navigate('/admin/dashboard');
        } else if (userPeran === 'pengguna' || userPeran === 'user') {
          navigate('/user/dashboard');
        } else {
          setError(`Peran "${result.user.peran}" tidak dikenali. Peran harus "admin" atau "pengguna".`);
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-2">
            Selamat Datang
          </h2>
          <p className="text-blue-100">
            Sistem Peminjaman Inventaris
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              Masuk ke Akun Anda
            </h3>
            <p className="text-gray-600">
              Silakan masukkan email dan kata sandi
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Masukkan email Anda"
              />
            </div>

            <div>
              <label htmlFor="kata_sandi" className="block text-sm font-semibold text-gray-700 mb-2">
                Kata Sandi
              </label>
              <input
                id="kata_sandi"
                name="kata_sandi"
                type="password"
                required
                value={formData.kata_sandi}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Masukkan kata sandi Anda"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Memproses...
                </div>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            Belum punya akun? Hubungi administrator
          </div>
          
          {/* Debug: Clear localStorage button */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              🔧 Clear Data & Reload (Debug)
            </button>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white text-sm">
          <p className="font-semibold mb-2">Demo Credentials:</p>
          <p>Admin: admin@inventaris.com / admin</p>
          <p>User: john@email.com / john123</p>
          <p>User: savana@email.com / savana</p>
        </div>
      </div>
    </div>
  );
};

export default Login;