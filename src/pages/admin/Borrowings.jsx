import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import axios from '../../api/axios';

const Borrowings = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const fetchBorrowings = async () => {
    try {
      const response = await axios.get('/api/peminjaman');
      const data = response.data.data || response.data;
      
      // Debug: Log struktur data untuk melihat field yang tersedia
      if (data && data.length > 0) {
        console.log('🔍 Struktur data peminjaman:', data[0]);
        console.log('📋 Field yang tersedia:', Object.keys(data[0]));
      }
      
      setBorrowings(data);
    } catch (error) {
      console.error('Error fetching borrowings:', error);
      setBorrowings([]); // Set empty array jika error
    } finally {
      setLoading(false);
    }
  };

  const updateBorrowingStatus = async (borrowingId, newStatus) => {
    try {
      if (newStatus === 'returned') {
        // Gunakan endpoint kembalikan khusus
        await axios.put(`/api/peminjaman/${borrowingId}/kembalikan`, {
          kondisi: 'baik',
          catatan: 'Dikembalikan oleh admin'
        });
      } else {
        // Update status biasa
        await axios.put(`/api/peminjaman/${borrowingId}/status`, { status: newStatus });
      }
      fetchBorrowings();
    } catch (error) {
      console.error('Error updating borrowing status:', error);
      alert('Terjadi kesalahan saat mengupdate status peminjaman');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'dipinjam':
      case 'borrowed':
        return 'bg-green-100 text-green-800';
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

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Persetujuan';
      case 'approved':
        return 'Disetujui';
      case 'dipinjam':
      case 'borrowed':
        return 'Dipinjam';
      case 'dikembalikan':
      case 'returned':
        return 'Dikembalikan';
      case 'ditolak':
      case 'rejected':
        return 'Ditolak';
      case 'overdue':
        return 'Terlambat';
      default:
        return status;
    }
  };

  const isOverdue = (tanggal_kembali_rencana, status) => {
    if (status === 'dikembalikan' || status === 'returned') return false;
    if (!tanggal_kembali_rencana) return false;
    return new Date(tanggal_kembali_rencana) < new Date();
  };

  const filteredBorrowings = borrowings.filter(borrowing => {
    if (selectedStatus === 'all') return true;
    if (selectedStatus === 'overdue') {
      return isOverdue(borrowing.tanggal_kembali_rencana, borrowing.status) && 
             borrowing.status !== 'dikembalikan' && 
             borrowing.status !== 'returned';
    }
    return borrowing.status === selectedStatus;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Peminjaman</h1>
            <p className="text-gray-600">Kelola semua peminjaman inventaris</p>
          </div>
          
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu Persetujuan</option>
            <option value="approved">Disetujui</option>
            <option value="borrowed">Dipinjam</option>
            <option value="returned">Dikembalikan</option>
            <option value="rejected">Ditolak</option>
            <option value="overdue">Terlambat</option>
          </select>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-yellow-50 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-md">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-600">Menunggu Persetujuan</p>
                <p className="text-2xl font-semibold text-yellow-900">
                  {borrowings.filter(b => b.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-md">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Aktif Dipinjam</p>
                <p className="text-2xl font-semibold text-green-900">
                  {borrowings.filter(b => b.status === 'borrowed').length}
                </p>
              </div>
            </div>
          </div>

                <div className="bg-red-50 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-md">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-red-600">Terlambat</p>
                <p className="text-2xl font-semibold text-red-900">
                  {borrowings.filter(b => isOverdue(b.tanggal_kembali_rencana, b.status) && b.status !== 'returned').length}
                </p>
              </div>
            </div>
          </div>          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-md">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Total Peminjaman</p>
                <p className="text-2xl font-semibold text-blue-900">{borrowings.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Borrowings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Peminjam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Pinjam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Kembali
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBorrowings.map((borrowing) => (
                <tr key={borrowing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {borrowing.peminjam_nama || borrowing.user_nama || borrowing.nama_pengguna || `ID: ${borrowing.peminjam_id}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {borrowing.peminjam_email || borrowing.user_email || borrowing.email || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {borrowing.produk_nama || borrowing.nama || `Produk ID: ${borrowing.produk_id}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {borrowing.keperluan ? `Keperluan: ${borrowing.keperluan}` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {borrowing.tanggal_pinjam ? new Date(borrowing.tanggal_pinjam).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className={isOverdue(borrowing.tanggal_kembali_rencana, borrowing.status) && borrowing.status !== 'returned' ? 'text-red-600 font-medium' : ''}>
                      {borrowing.tanggal_kembali_rencana ? new Date(borrowing.tanggal_kembali_rencana).toLocaleDateString('id-ID') : '-'}
                      {isOverdue(borrowing.tanggal_kembali_rencana, borrowing.status) && borrowing.status !== 'returned' && (
                        <div className="text-xs text-red-500">Terlambat</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      isOverdue(borrowing.tanggal_kembali_rencana, borrowing.status) && borrowing.status !== 'returned'
                        ? getStatusColor('overdue')
                        : getStatusColor(borrowing.status)
                    }`}>
                      {isOverdue(borrowing.tanggal_kembali_rencana, borrowing.status) && borrowing.status !== 'returned'
                        ? getStatusText('overdue')
                        : getStatusText(borrowing.status)
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {borrowing.status === 'pending' && (
                      <div className="space-x-2">
                        <button
                          onClick={() => updateBorrowingStatus(borrowing.id, 'approved')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => updateBorrowingStatus(borrowing.id, 'rejected')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                    {borrowing.status === 'approved' && (
                      <button
                        onClick={() => updateBorrowingStatus(borrowing.id, 'borrowed')}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Tandai Dipinjam
                      </button>
                    )}
                    {borrowing.status === 'borrowed' && (
                      <button
                        onClick={() => updateBorrowingStatus(borrowing.id, 'returned')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Tandai Dikembalikan
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredBorrowings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">
              {selectedStatus === 'all' ? 'Belum ada peminjaman' : `Tidak ada peminjaman dengan status ${getStatusText(selectedStatus)}`}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Borrowings;