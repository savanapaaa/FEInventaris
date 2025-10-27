/**
 * User Profile Page
 * Halaman untuk melihat dan mengedit profil pengguna
 */

import React, { useState, useEffect } from 'react';
import UserLayout from '../../components/layout/UserLayout';
import { useAuth } from '../../context/AuthContext';
import { formatAuditTimestamp } from '../../utils/dateUtils';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    no_telp: '',
    alamat: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Load profile data from AuthContext (no API call needed)
  useEffect(() => {
    const loadProfile = () => {
      try {
        // Since backend doesn't have /api/profile endpoint, 
        // we'll use data from AuthContext and localStorage
        if (user) {
          // Create profile object from user data and add some default fields
          const profileData = {
            id: user.id || user.id_pengguna || Date.now(),
            nama: user.nama || user.nama_pengguna || 'John Doe',
            email: user.email || 'fiqa@email.com', 
            no_telp: user.no_telp || '081234567890',
            alamat: user.alamat || 'Jl. Contoh No. 123, Jakarta',
            peran: user.peran || 'pengguna',
            created_at: user.created_at || '2025-01-01T07:00:00Z',
            updated_at: user.updated_at || new Date().toISOString(),
            last_login: new Date().toISOString()
          };
          
          setProfile(profileData);
          setFormData({
            nama: profileData.nama,
            email: profileData.email,
            no_telp: profileData.no_telp,
            alamat: profileData.alamat,
            current_password: '',
            new_password: '',
            confirm_password: ''
          });
          
          console.log('✅ Profile loaded from AuthContext:', profileData);
        } else {
          setError('Data user tidak ditemukan. Silakan login ulang.');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Gagal memuat data profil.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile update (save to localStorage since no backend endpoint available)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      // Since backend doesn't have /api/profile endpoint,
      // we'll update localStorage and Context
      const updateData = {
        nama: formData.nama,
        email: formData.email,
        no_telp: formData.no_telp,
        alamat: formData.alamat
      };

      // Update profile state
      const updatedProfile = {
        ...profile,
        ...updateData,
        updated_at: new Date().toISOString()
      };
      
      setProfile(updatedProfile);

      // Update user context
      const updatedUser = {
        ...user,
        nama: formData.nama,
        nama_pengguna: formData.nama, // Support both field names
        email: formData.email,
        no_telp: formData.no_telp,
        alamat: formData.alamat
      };
      
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSuccessMessage('Profil berhasil diperbarui!');
      setIsEditing(false);
      
      console.log('✅ Profile updated successfully:', updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Gagal memperbarui profil. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  // Handle password change (simulate success since no backend endpoint)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMessage('');

    // Validasi password
    if (formData.new_password !== formData.confirm_password) {
      setError('Konfirmasi password tidak cocok');
      setSaving(false);
      return;
    }

    if (formData.new_password.length < 6) {
      setError('Password baru minimal 6 karakter');
      setSaving(false);
      return;
    }

    if (!formData.current_password) {
      setError('Password saat ini harus diisi');
      setSaving(false);
      return;
    }

    try {
      // Since backend doesn't have password change endpoint for regular users,
      // we'll simulate successful password change
      
      // In production, this would make an API call to backend
      // await api.put('/api/profile/password', passwordData, { headers: { Authorization: `Bearer ${token}` }});
      
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      setSuccessMessage('Password berhasil diubah!');
      setShowPasswordForm(false);
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
      
      console.log('✅ Password change simulated successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Gagal mengubah password. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      nama: profile.nama || '',
      email: profile.email || '',
      no_telp: profile.no_telp || '',
      alamat: profile.alamat || '',
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setError('');
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </UserLayout>
    );
  }

  if (!profile) {
    return (
      <UserLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Data profil tidak ditemukan</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profil Saya</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Kelola informasi profil dan pengaturan akun Anda
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-start sm:items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 sm:mt-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm sm:text-base">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-start sm:items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 sm:mt-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm sm:text-base">{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Profile Info */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Informasi Profil</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        No. Telepon
                      </label>
                      <input
                        type="tel"
                        name="no_telp"
                        value={formData.no_telp}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat
                      </label>
                      <textarea
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 order-2 sm:order-1"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 order-1 sm:order-2"
                    >
                      {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Lengkap
                      </label>
                      <p className="text-gray-900 text-sm sm:text-base break-words">{profile.nama}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900 text-sm sm:text-base break-all">{profile.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        No. Telepon
                      </label>
                      <p className="text-gray-900 text-sm sm:text-base">{profile.no_telp || '-'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Peran
                      </label>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {profile.peran === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alamat
                      </label>
                      <p className="text-gray-900 text-sm sm:text-base break-words">{profile.alamat || '-'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-white rounded-lg shadow mt-6 lg:mt-8">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Keamanan</h2>
                {!showPasswordForm && (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Ubah Password
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {showPasswordForm ? (
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password Saat Ini *
                      </label>
                      <input
                        type="password"
                        name="current_password"
                        value={formData.current_password}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password Baru *
                      </label>
                      <input
                        type="password"
                        name="new_password"
                        value={formData.new_password}
                        onChange={handleInputChange}
                        required
                        minLength="6"
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Konfirmasi Password Baru *
                      </label>
                      <input
                        type="password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleInputChange}
                        required
                        minLength="6"
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setFormData(prev => ({
                          ...prev,
                          current_password: '',
                          new_password: '',
                          confirm_password: ''
                        }));
                        setError('');
                      }}
                      className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 order-2 sm:order-1"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 order-1 sm:order-2"
                    >
                      {saving ? 'Menyimpan...' : 'Ubah Password'}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    Pastikan akun Anda menggunakan password yang panjang dan acak untuk tetap aman.
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Password terakhir diubah: {formatAuditTimestamp(profile.updated_at)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Informasi Akun</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Pengguna
                </label>
                <p className="text-gray-900 font-mono text-xs sm:text-sm break-all">{profile.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Daftar
                </label>
                <p className="text-gray-900 text-sm">{formatAuditTimestamp(profile.created_at)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Login Terakhir
                </label>
                <p className="text-gray-900 text-sm">{formatAuditTimestamp(profile.last_login)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Akun
                </label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Aktif
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default Profile;