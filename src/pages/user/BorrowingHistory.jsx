/**
 * Borrowing History Page (Fixed Version)
 * Halaman untuk melihat riwayat lengkap peminjaman user
 */

import React, { useState, useEffect } from 'react';
import UserLayout from '../../components/layout/UserLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const BorrowingHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Status options
  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'returned', label: 'Dikembalikan' },
    { value: 'borrowed', label: 'Sedang Dipinjam' },
    { value: 'rejected', label: 'Ditolak' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'oldest', label: 'Terlama' },
    { value: 'product', label: 'Nama Produk' }
  ];

  // Fetch history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        console.log('🔍 [BorrowingHistory] Fetching history for user:', user?.nama_pengguna);
        
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Anda harus login terlebih dahulu');
          setLoading(false);
          return;
        }

        let historyData = [];

        // Try multiple endpoints to get borrowing history
        try {
          console.log('🚀 [BorrowingHistory] Trying /api/riwayat/user...');
          const userResponse = await api.get('/api/riwayat/user', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (Array.isArray(userResponse.data)) {
            historyData = userResponse.data;
          } else if (userResponse.data && Array.isArray(userResponse.data.data)) {
            historyData = userResponse.data.data;
          }
          
          console.log('✅ [BorrowingHistory] User-specific endpoint success:', historyData);
          
        } catch (userError) {
          console.log('⚠️ [BorrowingHistory] User endpoint failed, trying /api/riwayat...');
          
          try {
            const response = await api.get('/api/riwayat', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            let allHistory = [];
            if (Array.isArray(response.data)) {
              allHistory = response.data;
            } else if (response.data && Array.isArray(response.data.data)) {
              allHistory = response.data.data;
            }
            
            console.log('📋 [BorrowingHistory] All history received:', allHistory);
            
            // Filter for current user
            historyData = allHistory.filter(item => {
              const currentUserId = user?.id_pengguna || user?.id || user?.user_id;
              const itemUserId = item.id_pengguna || item.user_id || item.peminjam_id || item.id_user;
              
              console.log(`🔍 Filtering - Current User ID: ${currentUserId}, Item User ID: ${itemUserId}`);
              
              return itemUserId === currentUserId;
            });
            
            console.log('✅ [BorrowingHistory] Filtered history for user:', historyData);
            
          } catch (fallbackError) {
            console.log('❌ [BorrowingHistory] All endpoints failed, using mock data');
            throw fallbackError;
          }
        }

        // Try to get data from /api/peminjaman as well (for complete history)
        try {
          console.log('🔄 [BorrowingHistory] Also checking /api/peminjaman for complete history...');
          const borrowingsResponse = await api.get('/api/peminjaman', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          let allBorrowings = [];
          if (Array.isArray(borrowingsResponse.data)) {
            allBorrowings = borrowingsResponse.data;
          } else if (borrowingsResponse.data && Array.isArray(borrowingsResponse.data.data)) {
            allBorrowings = borrowingsResponse.data.data;
          }
          
          // Filter for current user
          const userBorrowings = allBorrowings.filter(item => {
            const currentUserId = user?.id_pengguna || user?.id || user?.user_id;
            const itemUserId = item.id_pengguna || item.user_id || item.peminjam_id || item.id_user;
            return itemUserId === currentUserId;
          });
          
          console.log('📋 [BorrowingHistory] User borrowings from /api/peminjaman:', userBorrowings);
          
          // Merge with existing history data (avoid duplicates)
          const mergedHistory = [...historyData];
          userBorrowings.forEach(borrowing => {
            const exists = historyData.find(h => h.id === borrowing.id || h.id_peminjaman === borrowing.id_peminjaman);
            if (!exists) {
              mergedHistory.push(borrowing);
            }
          });
          
          historyData = mergedHistory;
          console.log('🔄 [BorrowingHistory] Merged history data:', historyData);
          
        } catch (borrowingsError) {
          console.log('⚠️ [BorrowingHistory] Could not fetch additional borrowings data');
        }

        setHistory(historyData);
        console.log('✅ [BorrowingHistory] Final history set:', historyData.length, 'items');
        
      } catch (error) {
        console.error('💥 [BorrowingHistory] Error fetching history:', error);
        
        // Mock data untuk development - User specific
        const getUserHistoryData = () => {
          const currentUser = user?.nama_pengguna || 'unknown';
          console.log('🎭 [BorrowingHistory] Generating mock data for user:', currentUser);
          
          if (currentUser === 'fiqa') {
            return [
              {
                id: 101,
                id_peminjaman: 101,
                produk_nama: "Laptop Dell XPS 13",
                nama_produk: "Laptop Dell XPS 13",
                nama: "Laptop Dell XPS 13",
                kategori: "Elektronik",
                nama_kategori: "Elektronik",
                tanggal_pinjam: "2025-10-20",
                tanggal_kembali_rencana: "2025-10-27", 
                tanggal_kembali_aktual: null,
                status: "borrowed",
                status_display: "Sedang Dipinjam",
                keperluan: "Meeting dengan vendor",
                kondisi_pinjam: "Baik",
                kondisi_kembali: null,
                catatan_admin: "Disetujui untuk meeting",
                jumlah_dipinjam: 1,
                durasi_pinjam: 7,
                id_pengguna: user?.id_pengguna,
                user_id: user?.id_pengguna,
                peminjam_id: user?.id_pengguna
              },
              {
                id: 102,
                id_peminjaman: 102,
                produk_nama: "Proyektor Epson",
                nama_produk: "Proyektor Epson",
                nama: "Proyektor Epson",
                kategori: "Elektronik",
                nama_kategori: "Elektronik",
                tanggal_pinjam: "2025-10-18",
                tanggal_kembali_rencana: "2025-10-25",
                tanggal_kembali_aktual: "2025-10-24",
                status: "returned",
                status_display: "Dikembalikan",
                keperluan: "Presentasi klien",
                kondisi_pinjam: "Baik",
                kondisi_kembali: "Baik",
                catatan_admin: "Dikembalikan tepat waktu",
                jumlah_dipinjam: 1,
                durasi_pinjam: 6,
                id_pengguna: user?.id_pengguna,
                user_id: user?.id_pengguna,
                peminjam_id: user?.id_pengguna
              }
            ];
          } else if (currentUser === 'john') {
            return [
              {
                id: 201,
                id_peminjaman: 201,
                produk_nama: "Kamera DSLR Canon",
                nama_produk: "Kamera DSLR Canon",
                nama: "Kamera DSLR Canon",
                kategori: "Elektronik",
                nama_kategori: "Elektronik",
                tanggal_pinjam: "2025-10-22",
                tanggal_kembali_rencana: "2025-10-29",
                tanggal_kembali_aktual: null,
                status: "borrowed",
                status_display: "Sedang Dipinjam",
                keperluan: "Dokumentasi event",
                kondisi_pinjam: "Baik",
                kondisi_kembali: null,
                catatan_admin: "Disetujui untuk event",
                jumlah_dipinjam: 1,
                durasi_pinjam: 7,
                id_pengguna: user?.id_pengguna,
                user_id: user?.id_pengguna,
                peminjam_id: user?.id_pengguna
              }
            ];
          } else {
            return [
              {
                id: 301,
                id_peminjaman: 301,
                produk_nama: "Item Generic",
                nama_produk: "Item Generic",
                nama: "Item Generic",
                kategori: "Umum",
                nama_kategori: "Umum",
                tanggal_pinjam: "2025-10-23",
                tanggal_kembali_rencana: "2025-10-30",
                tanggal_kembali_aktual: null,
                status: "pending",
                status_display: "Menunggu Persetujuan",
                keperluan: "Keperluan umum",
                kondisi_pinjam: "Baik",
                kondisi_kembali: null,
                catatan_admin: null,
                jumlah_dipinjam: 1,
                durasi_pinjam: 7,
                id_pengguna: user?.id_pengguna,
                user_id: user?.id_pengguna,
                peminjam_id: user?.id_pengguna
              }
            ];
          }
        };

        const mockData = getUserHistoryData();
        console.log('🎭 [BorrowingHistory] Using mock data:', mockData);
        setHistory(mockData);
        setError('Menggunakan data simulasi - koneksi backend bermasalah');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchHistory();
    }
  }, [user]);

  // Calculate duration helper
  const calculateDuration = (item) => {
    console.log('⚡ Calculate Duration Debug:', {
      item: item,
      tanggal_pinjam: item.tanggal_pinjam,
      tanggal_kembali_aktual: item.tanggal_kembali_aktual,
      status: item.status,
      durasi_pinjam: item.durasi_pinjam
    });

    // Cek apakah tanggal_pinjam valid
    if (!item.tanggal_pinjam) {
      console.log('❌ No tanggal_pinjam, returning "Tanggal tidak valid"');
      return 'Tanggal tidak valid';
    }

    const startDate = new Date(item.tanggal_pinjam);
    console.log('📅 Start Date:', startDate, 'Valid:', !isNaN(startDate.getTime()));
    
    // Cek apakah startDate valid
    if (isNaN(startDate.getTime())) {
      console.log('❌ Invalid startDate, returning "Format tanggal salah"');
      return 'Format tanggal salah';
    }
    
    if (item.status === 'returned' && item.tanggal_kembali_aktual) {
      // Sudah dikembalikan - hitung dari tanggal pinjam ke tanggal kembali aktual
      const endDate = new Date(item.tanggal_kembali_aktual);
      console.log('📅 End Date (returned):', endDate, 'Valid:', !isNaN(endDate.getTime()));
      
      if (isNaN(endDate.getTime())) {
        console.log('❌ Invalid endDate, using today');
        const today = new Date();
        const diffTime = Math.abs(today - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} hari (estimasi)`;
      }
      
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      console.log('✅ Returned calculation:', diffDays, 'days');
      return `${diffDays} hari`;
      
    } else if (item.status === 'borrowed' || item.status === 'dipinjam') {
      // Sedang dipinjam - hitung dari tanggal pinjam ke hari ini
      const today = new Date();
      const diffTime = Math.abs(today - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      console.log('✅ Borrowed calculation:', diffDays, 'days (ongoing)');
      return `${diffDays} hari (berlangsung)`;
      
    } else if (item.durasi_pinjam && !isNaN(item.durasi_pinjam)) {
      // Gunakan durasi yang sudah ada dari backend
      console.log('✅ Using existing durasi_pinjam:', item.durasi_pinjam);
      return `${item.durasi_pinjam} hari`;
      
    } else {
      // Hitung durasi default dari tanggal pinjam ke hari ini untuk semua status
      const today = new Date();
      const diffTime = Math.abs(today - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      console.log('✅ Default calculation:', diffDays, 'days');
      return `${diffDays} hari`;
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'borrowed':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'returned':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const getStatistics = () => {
    const total = history.length;
    const borrowed = history.filter(item => item.status === 'borrowed').length;
    const returned = history.filter(item => item.status === 'returned').length;
    const rejected = history.filter(item => item.status === 'rejected').length;

    return { total, borrowed, returned, rejected };
  };

  // Filter and sort history
  const filteredAndSortedHistory = history
    .filter(item => {
      const matchesSearch = 
        (item.produk_nama || item.nama_produk || item.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.keperluan || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.tanggal_pinjam || b.created_at || 0) - new Date(a.tanggal_pinjam || a.created_at || 0);
        case 'oldest':
          return new Date(a.tanggal_pinjam || a.created_at || 0) - new Date(b.tanggal_pinjam || b.created_at || 0);
        case 'product':
          return (a.produk_nama || a.nama_produk || a.nama || '').localeCompare(b.produk_nama || b.nama_produk || b.nama || '');
        default:
          return 0;
      }
    });

  // Debug logging untuk filtered results
  console.log('🔍 [BorrowingHistory] Filter Debug:', {
    totalHistory: history.length,
    searchTerm,
    filterStatus,
    sortBy,
    filteredCount: filteredAndSortedHistory.length,
    filteredData: filteredAndSortedHistory
  });

  const stats = getStatistics();

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Peminjaman</h1>
          <p className="text-gray-600 mt-2">Lihat semua riwayat peminjaman produk inventaris Anda</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Peminjaman</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dikembalikan</p>
                <p className="text-2xl font-bold text-gray-900">{stats.returned}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sedang Dipinjam</p>
                <p className="text-2xl font-bold text-gray-900">{stats.borrowed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ditolak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari Produk</label>
              <input
                type="text"
                placeholder="Masukkan nama produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Urutkan</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Riwayat Peminjaman ({filteredAndSortedHistory.length})
            </h3>
          </div>
          
          {filteredAndSortedHistory.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada riwayat peminjaman</h3>
              <p className="mt-1 text-sm text-gray-500">Mulai meminjam produk untuk melihat riwayat di sini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Keperluan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedHistory.map((item) => {
                    // Debug logging untuk setiap item
                    console.log('🎯 [BorrowingHistory] Rendering item:', item);
                    console.log('📝 Product names:', {
                      produk_nama: item.produk_nama,
                      nama_produk: item.nama_produk,
                      nama: item.nama,
                      kategori: item.kategori,
                      nama_kategori: item.nama_kategori
                    });
                    console.log('📅 Dates:', {
                      tanggal_pinjam: item.tanggal_pinjam,
                      tanggal_kembali_rencana: item.tanggal_kembali_rencana,
                      tanggal_kembali_aktual: item.tanggal_kembali_aktual
                    });
                    console.log('⏱️ Duration & Status:', {
                      durasi_pinjam: item.durasi_pinjam,
                      calculated_duration: calculateDuration(item),
                      status: item.status,
                      status_display: item.status_display,
                      keperluan: item.keperluan
                    });
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.produk_nama || item.nama_produk || item.nama || 'Nama Produk Tidak Tersedia'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.kategori || item.nama_kategori || 'Kategori Tidak Tersedia'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div>Pinjam: {formatDate(item.tanggal_pinjam)}</div>
                            <div>Rencana: {formatDate(item.tanggal_kembali_rencana)}</div>
                            {item.tanggal_kembali_aktual && (
                              <div>Aktual: {formatDate(item.tanggal_kembali_aktual)}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {calculateDuration(item)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                            {item.status_display || item.status || 'Status Tidak Tersedia'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {item.keperluan || 'Tidak ada keterangan'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default BorrowingHistory;