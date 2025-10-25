/**
 * My Borrowings Page
 * Halaman untuk melihat daftar peminjaman user
 */

import React, { useState, useEffect } from 'react';
import UserLayout from '../../components/layout/UserLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const MyBorrowings = () => {
  const { user } = useAuth();
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Status options
  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'pending', label: 'Menunggu Persetujuan' },
    { value: 'approved', label: 'Disetujui' },
    { value: 'borrowed', label: 'Sedang Dipinjam' },
    { value: 'returned', label: 'Sudah Dikembalikan' },
    { value: 'rejected', label: 'Ditolak' }
  ];

  // Fetch borrowings
  useEffect(() => {
    const fetchBorrowings = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Anda harus login terlebih dahulu');
          setLoading(false);
          return;
        }

        console.log('🔍 Fetching user borrowings for:', user?.nama_pengguna);

        // Try multiple endpoints for user borrowings
        let response;
        try {
          // Primary endpoint: /api/peminjaman/user
          response = await api.get('/api/peminjaman/user', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } catch (primaryError) {
          console.log('Primary endpoint failed, trying /api/peminjaman with user filter...');
          // Fallback: /api/peminjaman (then filter by user on frontend)
          response = await api.get('/api/peminjaman', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
        
        let borrowingsData = [];
        if (Array.isArray(response.data)) {
          borrowingsData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          borrowingsData = response.data.data;
        }

        // Filter by current user if we got all borrowings
        const userBorrowings = borrowingsData.filter(borrowing => 
          borrowing.id_pengguna === user?.id_pengguna || 
          borrowing.user_id === user?.id_pengguna ||
          borrowing.peminjam_id === user?.id_pengguna
        );

        console.log('✅ User borrowings:', userBorrowings);
        setBorrowings(userBorrowings);

      } catch (error) {
        console.error('❌ Error fetching borrowings:', error);
        
        // User-specific mock data based on logged in user
        const getUserMockData = () => {
          const currentUser = user?.nama_pengguna || 'unknown';
          
          if (currentUser === 'fiqa') {
            return [
              {
                id: 101,
                produk_nama: "Laptop Dell XPS 13",
                kategori: "Elektronik",
                tanggal_pinjam: "2025-10-20",
                tanggal_kembali_rencana: "2025-10-27", 
                tanggal_kembali_aktual: null,
                status: "borrowed",
                status_display: "Sedang Dipinjam",
                keperluan: "Meeting dengan vendor",
                kondisi_pinjam: "Baik",
                kondisi_kembali: null,
                catatan_admin: "Disetujui untuk meeting",
                created_at: "2025-10-20T09:00:00Z"
              },
              {
                id: 102,
                produk_nama: "Projektor",
                kategori: "Elektronik", 
                tanggal_pinjam: "2025-10-15",
                tanggal_kembali_rencana: "2025-10-22",
                tanggal_kembali_aktual: "2025-10-21",
                status: "returned",
                status_display: "Sudah Dikembalikan",
                keperluan: "Presentasi client",
                kondisi_pinjam: "Baik",
                kondisi_kembali: "Baik", 
                catatan_admin: "Dikembalikan tepat waktu",
                created_at: "2025-10-15T08:00:00Z"
              }
            ];
          } else if (currentUser === 'john') {
            return [
              {
                id: 201,
                produk_nama: "Whiteboard Portable",
                kategori: "Alat Tulis",
                tanggal_pinjam: null,
                tanggal_kembali_rencana: "2025-10-30",
                tanggal_kembali_aktual: null,
                status: "pending", 
                status_display: "Menunggu Persetujuan",
                keperluan: "Workshop tim",
                kondisi_pinjam: "Baik",
                kondisi_kembali: null,
                catatan_admin: null,
                created_at: "2025-10-24T14:00:00Z"
              }
            ];
          } else {
            return []; // User lain tidak punya peminjaman
          }
        };
        
        const mockBorrowings = getUserMockData();
        setBorrowings(mockBorrowings);
        setError(`Backend tidak tersedia. Menampilkan data contoh untuk user: ${user?.nama_pengguna || 'unknown'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowings();
  }, [user]); // Add user dependency

  // Filter borrowings
  const filteredBorrowings = borrowings.filter(borrowing => {
    return filterStatus === 'all' || borrowing.status === filterStatus;
  });

  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'borrowed':
        return 'bg-green-100 text-green-800';
      case 'returned':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  // Calculate days remaining
  const getDaysRemaining = (returnDate) => {
    if (!returnDate) return null;
    const today = new Date();
    const returnDateObj = new Date(returnDate);
    const diffTime = returnDateObj - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  return (
    <UserLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Peminjaman Saya</h1>
        <p className="text-gray-600 mt-2">
          Kelola dan pantau status peminjaman produk Anda
        </p>
      </div>

      {/* Warning jika backend tidak tersedia */}
      {error && error.includes('Backend tidak tersedia') && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <strong>Mode Development:</strong> Backend tidak terhubung. Menampilkan data contoh.
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">
            Filter Status:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Borrowings List */}
      {filteredBorrowings.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada peminjaman</h3>
          <p className="mt-1 text-sm text-gray-500">
            Anda belum memiliki riwayat peminjaman produk.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBorrowings.map((borrowing) => (
            <div key={borrowing.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {borrowing.produk_nama || borrowing.nama}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(borrowing.status)}`}>
                      {borrowing.status_display}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Kategori:</span>
                      <p className="font-medium">{borrowing.kategori}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tanggal Pinjam:</span>
                      <p className="font-medium">{formatDate(borrowing.tanggal_pinjam)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tanggal Kembali Rencana:</span>
                      <p className="font-medium">{formatDate(borrowing.tanggal_kembali_rencana)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Keperluan:</span>
                      <p className="font-medium">{borrowing.keperluan}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Kondisi Pinjam:</span>
                      <p className="font-medium">{borrowing.kondisi_pinjam}</p>
                    </div>
                    {borrowing.tanggal_kembali_aktual && (
                      <div>
                        <span className="text-gray-500">Tanggal Kembali Aktual:</span>
                        <p className="font-medium">{formatDate(borrowing.tanggal_kembali_aktual)}</p>
                      </div>
                    )}
                  </div>

                  {borrowing.catatan_admin && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-500 text-sm">Catatan Admin:</span>
                      <p className="text-sm mt-1">{borrowing.catatan_admin}</p>
                    </div>
                  )}
                </div>

                {/* Days remaining indicator */}
                {borrowing.status === 'borrowed' && (
                  <div className="ml-4 text-center">
                    {(() => {
                      const daysRemaining = getDaysRemaining(borrowing.tanggal_kembali_rencana);
                      if (daysRemaining > 0) {
                        return (
                          <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg">
                            <div className="text-lg font-bold">{daysRemaining}</div>
                            <div className="text-xs">hari lagi</div>
                          </div>
                        );
                      } else if (daysRemaining === 0) {
                        return (
                          <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg">
                            <div className="text-lg font-bold">Hari ini</div>
                            <div className="text-xs">jatuh tempo</div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="bg-red-100 text-red-800 px-3 py-2 rounded-lg">
                            <div className="text-lg font-bold">{Math.abs(daysRemaining)}</div>
                            <div className="text-xs">hari terlambat</div>
                          </div>
                        );
                      }
                    })()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </UserLayout>
  );
};

export default MyBorrowings;