/**
 * Borrowing History Page
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
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Anda harus login terlebih dahulu');
          setLoading(false);
          return;
        }

        const response = await api.get('/api/riwayat', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (Array.isArray(response.data)) {
          setHistory(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setHistory(response.data.data);
        } else {
          setHistory([]);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
        
        // Mock data untuk development
        const mockHistory = [
          {
            id: 1,
            produk_nama: "Proyektor",
            kategori: "Elektronik",
            tanggal_pinjam: "2025-10-05",
            tanggal_kembali_rencana: "2025-10-12",
            tanggal_kembali_aktual: null,
            status: "borrowed",
            status_display: "Sedang Dipinjam",
            keperluan: "Presentasi client",
            kondisi_pinjam: "Baik",
            kondisi_kembali: null,
            catatan_admin: "Disetujui untuk presentasi",
            created_at: "2025-10-05T08:00:00Z",
            durasi_pinjam: null
          },
          {
            id: 2,
            produk_nama: "Laptop Dell XPS 13",
            kategori: "Elektronik",
            tanggal_pinjam: "2025-10-01",
            tanggal_kembali_rencana: "2025-10-08",
            tanggal_kembali_aktual: "2025-10-07",
            status: "returned",
            status_display: "Sudah Dikembalikan",
            keperluan: "Meeting dengan vendor",
            kondisi_pinjam: "Baik",
            kondisi_kembali: "Baik",
            catatan_admin: "Dikembalikan tepat waktu",
            created_at: "2025-10-01T09:00:00Z",
            durasi_pinjam: 6
          },
          {
            id: 3,
            produk_nama: "Meja Meeting",
            kategori: "Furniture",
            tanggal_pinjam: "2025-09-20",
            tanggal_kembali_rencana: "2025-09-25",
            tanggal_kembali_aktual: "2025-09-25",
            status: "returned",
            status_display: "Sudah Dikembalikan",
            keperluan: "Rapat besar dengan klien",
            kondisi_pinjam: "Baik",
            kondisi_kembali: "Baik",
            catatan_admin: "Dikembalikan sesuai jadwal",
            created_at: "2025-09-20T10:00:00Z",
            durasi_pinjam: 5
          },
          {
            id: 4,
            produk_nama: "Whiteboard",
            kategori: "Alat Tulis",
            tanggal_pinjam: null,
            tanggal_kembali_rencana: "2025-09-15",
            tanggal_kembali_aktual: null,
            status: "rejected",
            status_display: "Ditolak",
            keperluan: "Workshop tim",
            kondisi_pinjam: "Baik",
            kondisi_kembali: null,
            catatan_admin: "Stok tidak tersedia pada tanggal yang diminta",
            created_at: "2025-09-10T14:00:00Z",
            durasi_pinjam: null
          }
        ];
        
        setHistory(mockHistory);
        setError('Backend tidak tersedia. Menampilkan data contoh.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Filter and sort history
  const filteredAndSortedHistory = history
    .filter(item => {
      const matchesSearch = item.produk_nama.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'product':
          return a.produk_nama.localeCompare(b.produk_nama);
        default:
          return 0;
      }
    });

  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
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

  // Calculate statistics
  const stats = {
    total: history.length,
    returned: history.filter(item => item.status === 'returned').length,
    borrowed: history.filter(item => item.status === 'borrowed').length,
    rejected: history.filter(item => item.status === 'rejected').length
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
        <h1 className="text-3xl font-bold text-gray-900">Riwayat Peminjaman</h1>
        <p className="text-gray-600 mt-2">
          Lihat semua riwayat peminjaman produk inventaris Anda
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-gray-600">Total Peminjaman</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.returned}</p>
              <p className="text-gray-600">Dikembalikan</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.borrowed}</p>
              <p className="text-gray-600">Sedang Dipinjam</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-gray-600">Ditolak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Produk
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Masukkan nama produk..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Filter Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urutkan
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      {filteredAndSortedHistory.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada riwayat ditemukan</h3>
          <p className="mt-1 text-sm text-gray-500">
            Coba ubah kata kunci pencarian atau filter status.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                {filteredAndSortedHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.produk_nama}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.kategori}
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
                      {item.durasi_pinjam ? `${item.durasi_pinjam} hari` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status_display}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {item.keperluan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default BorrowingHistory;