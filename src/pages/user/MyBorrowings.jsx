/**
 * My Borrowings Page
 * Halaman untuk melihat daftar peminjaman user
 */

import React, { useState, useEffect } from 'react';
import UserLayout from '../../components/layout/UserLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { formatDateTime, formatAuditTimestamp, isOverdue, getDaysRemaining } from '../../utils/dateUtils';

const MyBorrowings = () => {
  const { user } = useAuth();
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [returningId, setReturningId] = useState(null); // Track which item is being returned
  const [toast, setToast] = useState(null); // For toast notifications
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState(null);
  const [returnPhoto, setReturnPhoto] = useState(null);
  const [returnCondition, setReturnCondition] = useState('Baik');
  const [returnNotes, setReturnNotes] = useState('');

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Status options
  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'pending', label: 'Menunggu Persetujuan' },
    { value: 'approved', label: 'Disetujui' },
    { value: 'dipinjam', label: 'Dipinjam' },
    { value: 'pending_return', label: 'Menunggu Konfirmasi Pengembalian' },
    { value: 'dikembalikan', label: 'Dikembalikan' },
    { value: 'ditolak', label: 'Ditolak' }
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
                tanggal_pinjam: "2025-10-20 08:30:00",
                tanggal_kembali_rencana: "2025-10-27 17:00:00", 
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
                tanggal_pinjam: "2025-10-15 09:15:00",
                tanggal_kembali_rencana: "2025-10-22 17:00:00",
                tanggal_kembali_aktual: "2025-10-21 16:30:00",
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
          } else if (currentUser === 'savana') {
            return [
              {
                id: 301,
                produk_nama: "Printer Canon",
                kategori: "Elektronik",
                tanggal_pinjam: "2025-10-26",
                tanggal_kembali_rencana: "2025-11-02", 
                tanggal_kembali_aktual: null,
                status: "dipinjam", // Konsisten dengan admin
                status_display: "Dipinjam",
                keperluan: "Keperluan penggunaan barang kantor",
                kondisi_pinjam: "Baik",
                kondisi_kembali: null,
                catatan_admin: "Disetujui untuk kebutuhan kantor",
                created_at: "2025-10-26T09:00:00Z"
              },
              {
                id: 302,
                produk_nama: "Webcam Logitech",
                kategori: "Elektronik", 
                tanggal_pinjam: "2025-10-21",
                tanggal_kembali_rencana: "2025-10-28",
                tanggal_kembali_aktual: "2025-10-28",
                status: "dikembalikan", // Konsisten dengan admin
                status_display: "Dikembalikan",
                keperluan: "Keperluan penggunaan barang kantor",
                kondisi_pinjam: "Baik",
                kondisi_kembali: "Baik", 
                catatan_admin: "Dikembalikan tepat waktu",
                catatan_pengembalian: "Barang dalam kondisi baik",
                foto_bukti_pengembalian: "https://via.placeholder.com/300x200/4ade80/ffffff?text=Webcam+Returned", // Mock foto
                created_at: "2025-10-21T08:00:00Z"
              },
              {
                id: 303,
                produk_nama: "Mouse Wireless",
                kategori: "Elektronik",
                tanggal_pinjam: "2025-10-24",
                tanggal_kembali_rencana: "2025-10-30",
                tanggal_kembali_aktual: null,
                status: "pending_return", // Status baru untuk testing
                status_display: "Menunggu Konfirmasi Pengembalian",
                keperluan: "Keperluan penggunaan barang kantor",
                kondisi_pinjam: "Baik",
                kondisi_kembali: "Baik",
                catatan_pengembalian: "Mouse dikembalikan dalam kondisi baik",
                foto_bukti_pengembalian: "https://via.placeholder.com/300x200/f97316/ffffff?text=Mouse+Pending", // Mock foto pending
                submitted_return_date: "2025-10-25",
                catatan_admin: null,
                created_at: "2025-10-24T14:00:00Z"
              },
              {
                id: 304,
                produk_nama: "Keyboard Gaming",
                kategori: "Elektronik",
                tanggal_pinjam: "2025-10-22",
                tanggal_kembali_rencana: "2025-10-29",
                tanggal_kembali_aktual: null,
                status: "dipinjam", // Masih dipinjam
                status_display: "Dipinjam",
                keperluan: "Gaming tournament",
                kondisi_pinjam: "Baik",
                kondisi_kembali: null,
                catatan_admin: null,
                created_at: "2025-10-22T10:00:00Z"
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

  // Status badge color - selaraskan dengan backend status
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'dipinjam':
      case 'borrowed':
        return 'bg-green-100 text-green-800';
      case 'pending_return':
        return 'bg-orange-100 text-orange-800';
      case 'dikembalikan':
      case 'returned':
        return 'bg-gray-100 text-gray-800';
      case 'ditolak':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'overdue':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle return item - open modal instead of direct return
  const handleReturnItem = (borrowing) => {
    setSelectedBorrowing(borrowing);
    setShowReturnModal(true);
    setReturnPhoto(null);
    setReturnCondition('Baik');
    setReturnNotes('');
  };

  // Handle photo upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        showToast('File harus berupa gambar (JPG, PNG, GIF)!', 'error');
        e.target.value = ''; // Clear input
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        showToast(`Ukuran file ${fileSizeMB}MB terlalu besar! Maksimal 5MB.`, 'error');
        e.target.value = ''; // Clear input
        return;
      }
      
      console.log(`✅ File valid: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      setReturnPhoto(file);
    }
  };

  // Submit return with photo - PRODUCTION READY
  const submitReturn = async () => {
    if (!returnPhoto) {
      showToast('Foto bukti pengembalian wajib diupload!', 'error');
      return;
    }

    setReturningId(selectedBorrowing.id);

    try {
      const token = localStorage.getItem('token');
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('kondisi_kembali', returnCondition);
      formData.append('catatan', returnNotes || 'Barang dikembalikan oleh user');
      formData.append('foto_bukti', returnPhoto);
      
      console.log('📤 Submitting return with photo to backend...');
      console.log('📋 Request details:', {
        endpoint: `/api/peminjaman/${selectedBorrowing.id}/submit-return`,
        fileSize: `${(returnPhoto.size / 1024 / 1024).toFixed(2)}MB`,
        fileName: returnPhoto.name,
        fileType: returnPhoto.type,
        kondisi: returnCondition,
        catatan: returnNotes || 'Barang dikembalikan oleh user'
      });
      
      // Call NEW backend API endpoint - Submit return for admin approval (two-step process)
      const response = await api.post(`/api/peminjaman/${selectedBorrowing.id}/submit-return`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const apiResponse = response.data;
      console.log('✅ Return submitted for admin verification:', apiResponse);

      // Update borrowings state - Backend sudah set status ke "pending_return"
      setBorrowings(prevBorrowings => 
        prevBorrowings.map(borrowing => 
          borrowing.id === selectedBorrowing.id 
            ? { 
                ...borrowing, 
                // Backend response sudah proper dengan status pending_return
                status: 'pending_return',
                status_display: 'Menunggu Konfirmasi Admin',
                kondisi_kembali: returnCondition,
                catatan_pengembalian: returnNotes || 'Barang dikembalikan oleh user',
                foto_bukti_pengembalian: apiResponse.data?.foto_bukti_pengembalian || apiResponse.foto_url,
                tanggal_submit_return: apiResponse.data?.tanggal_submit_return || new Date().toISOString().split('T')[0]
              }
            : borrowing
        )
      );

      showToast('Pengembalian berhasil diajukan! Menunggu konfirmasi admin.', 'success');
      setShowReturnModal(false);
      
    } catch (error) {
      console.error('❌ Return error:', error);
      
      // Enhanced error handling with specific messages
      let errorMessage = 'Terjadi kesalahan saat mengembalikan item';
      
      if (error.response) {
        // Backend returned an error response
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 400:
            errorMessage = data?.message || data?.errors?.foto_bukti || 'Data tidak valid';
            break;
          case 413:
            errorMessage = 'File terlalu besar. Maksimal 5MB.';
            break;
          case 415:
            errorMessage = 'Format file tidak didukung. Gunakan JPG, PNG, atau GIF.';
            break;
          case 500:
            errorMessage = 'Server error. Coba lagi atau hubungi admin.';
            break;
          default:
            errorMessage = data?.message || `Error ${status}: ${data?.error || 'Unknown error'}`;
        }
        
        console.error(`HTTP ${status}:`, data);
      } else if (error.request) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet.';
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setReturningId(null);
    }
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
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="text-white/80 hover:text-white text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Peminjaman Saya</h1>
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
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <label className="text-sm font-medium text-gray-700">
            Filter Status:
          </label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setFilterStatus(option.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
                {option.value !== 'all' && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                    {filteredBorrowings.filter(b => 
                      option.value === 'approved' 
                        ? ['approved', 'borrowed'].includes(b.status)
                        : option.value === 'returned'
                        ? ['returned', 'dikembalikan'].includes(b.status)
                        : b.status === option.value
                    ).length}
                  </span>
                )}
              </button>
            ))}
          </div>
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
            <div key={borrowing.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {borrowing.produk_nama || borrowing.nama}
                    </h3>
                    {/* Show status based on backend status */}
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(borrowing.status)}`}>
                      {borrowing.status_display}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Kategori:</span>
                      <p className="font-medium">{borrowing.kategori}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tanggal Pinjam:</span>
                      <p className="font-medium">{formatDateTime(borrowing.tanggal_pinjam)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tanggal Kembali Rencana:</span>
                      <p className="font-medium">{formatDateTime(borrowing.tanggal_kembali_rencana)}</p>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1">
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
                        <p className="font-medium">{formatDateTime(borrowing.tanggal_kembali_aktual)}</p>
                      </div>
                    )}
                  </div>

                  {borrowing.catatan_admin && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-500 text-sm">Catatan Admin:</span>
                      <p className="text-sm mt-1">{borrowing.catatan_admin}</p>
                    </div>
                  )}

                  {/* Foto Bukti Pengembalian */}
                  {(() => {
                    const fotoUrl = borrowing.foto_bukti_pengembalian || 
                                   borrowing.foto_bukti || 
                                   borrowing.photo_evidence || 
                                   borrowing.bukti_foto ||
                                   borrowing.evidence_photo;
                    
                    const isReturned = borrowing.status === 'dikembalikan' || 
                                     borrowing.status === 'returned' ||
                                     borrowing.status === 'completed';
                    
                    const isPendingReturn = borrowing.status === 'pending_return';
                    
                    if ((isReturned || isPendingReturn) && fotoUrl) {
                      // Build complete URL with backend domain
                      const fullPhotoUrl = fotoUrl.startsWith('http') 
                        ? fotoUrl 
                        : `http://localhost:5000${fotoUrl.startsWith('/') ? '' : '/'}${fotoUrl}`;
                      
                      return (
                        <div className={`mt-4 p-3 rounded-lg ${isPendingReturn ? 'bg-orange-50' : 'bg-green-50'}`}>
                          <span className={`text-sm font-medium mb-2 block ${isPendingReturn ? 'text-orange-700' : 'text-green-700'}`}>
                            📸 Foto Bukti Pengembalian:
                            {isPendingReturn && <span className="ml-2 text-xs">(Menunggu Konfirmasi Admin)</span>}
                          </span>
                          <div className="flex items-start space-x-3">
                            <img
                              src={fullPhotoUrl}
                              alt="Bukti Pengembalian"
                              className={`w-24 h-24 object-cover rounded-lg border-2 cursor-pointer transition-colors ${
                                isPendingReturn 
                                  ? 'border-orange-200 hover:border-orange-400' 
                                  : 'border-green-200 hover:border-green-400'
                              }`}
                              onClick={() => window.open(fullPhotoUrl, '_blank')}
                              onError={(e) => {
                                console.error('❌ Photo load error for user view:', fullPhotoUrl);
                                console.error('Original fotoUrl:', fotoUrl);
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.innerHTML = '<span class="text-red-500 text-sm">❌ Error memuat foto</span>';
                              }}
                            />
                            <div className="flex-1">
                              <p className={`text-sm ${isPendingReturn ? 'text-orange-700' : 'text-green-700'}`}>
                                <span className="font-medium">Kondisi:</span> {borrowing.kondisi_kembali || 'Baik'}
                              </p>
                              {borrowing.catatan_pengembalian && (
                                <p className={`text-sm mt-1 ${isPendingReturn ? 'text-orange-700' : 'text-green-700'}`}>
                                  <span className="font-medium">Catatan:</span> {borrowing.catatan_pengembalian}
                                </p>
                              )}
                              {isPendingReturn && borrowing.tanggal_submit_return && (
                                <p className="text-sm text-orange-700 mt-1">
                                  <span className="font-medium">Diajukan:</span> {formatAuditTimestamp(borrowing.tanggal_submit_return)}
                                </p>
                              )}
                              <p className={`text-xs mt-2 ${isPendingReturn ? 'text-orange-600' : 'text-green-600'}`}>
                                Klik foto untuk memperbesar
                              </p>
                            </div>
                          </div>
                          {isPendingReturn && (
                            <div className="mt-3 p-2 bg-orange-100 rounded border-l-4 border-orange-400">
                              <p className="text-orange-800 text-sm">
                                ⏳ <strong>Status:</strong> Menunggu admin memverifikasi pengembalian Anda
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    } else if (isReturned || isPendingReturn) {
                      return (
                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                          <span className="text-yellow-700 text-sm">📷 Foto bukti pengembalian tidak tersedia</span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                  {/* Days remaining indicator and Return Button */}
                  <div className="flex sm:flex-col items-center sm:items-end space-x-3 sm:space-x-0 sm:space-y-3">
                    {(borrowing.status === 'dipinjam' || borrowing.status === 'borrowed') && (
                      <div className="text-center">
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

                    {/* Return Button - hanya muncul jika status dipinjam/borrowed */}
                    {(borrowing.status === 'dipinjam' || borrowing.status === 'borrowed') && (
                      <button
                        onClick={() => handleReturnItem(borrowing)}
                        disabled={returningId === borrowing.id}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {returningId === borrowing.id ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="hidden sm:inline">Memproses...</span>
                            <span className="sm:hidden">...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="hidden sm:inline">Ajukan Pengembalian</span>
                            <span className="sm:hidden">Return</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Status Pending Return - Informasi untuk user */}
                    {borrowing.status === 'pending_return' && (
                      <div className="bg-orange-100 border border-orange-300 text-orange-800 px-3 py-2 rounded-lg text-center">
                        <div className="text-sm font-medium">⏳ Menunggu Konfirmasi</div>
                        <div className="text-xs">Admin sedang memverifikasi</div>
                      </div>
                    )}
                  </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && selectedBorrowing && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg bg-white rounded-lg shadow-lg">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Ajukan Pengembalian Item
                </h3>
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Product Info */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">
                  {selectedBorrowing.produk_nama || selectedBorrowing.nama}
                </h4>
                <p className="text-sm text-gray-600">
                  Kategori: {selectedBorrowing.kategori}
                </p>
                <p className="text-sm text-gray-600">
                  Dipinjam: {formatDateTime(selectedBorrowing.tanggal_pinjam)}
                </p>
              </div>

              {/* Return Form */}
              <div className="mt-4 space-y-4">
                {/* Condition Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kondisi Barang Saat Dikembalikan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Baik">Baik</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                    <option value="Hilang">Hilang</option>
                  </select>
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto Bukti Pengembalian <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                    <div className="space-y-1 text-center">
                      {returnPhoto ? (
                        <div className="space-y-2">
                          <img
                            src={URL.createObjectURL(returnPhoto)}
                            alt="Preview"
                            className="mx-auto h-32 w-32 object-cover rounded-lg"
                          />
                          <div>
                            <p className="text-sm text-gray-900">{returnPhoto.name}</p>
                            <p className="text-xs text-gray-500">
                              {(returnPhoto.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setReturnPhoto(null)}
                            className="text-red-600 text-sm hover:text-red-700"
                          >
                            Hapus Foto
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="text-sm text-gray-600">
                            <label htmlFor="photo-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                              <span>Upload foto</span>
                              <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">atau drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 5MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan Tambahan
                  </label>
                  <textarea
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Catatan tambahan mengenai kondisi barang (opsional)"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={submitReturn}
                  disabled={!returnPhoto || returningId === selectedBorrowing.id}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {returningId === selectedBorrowing.id ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memproses...
                    </div>
                  ) : (
                    'Ajukan Pengembalian'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default MyBorrowings;