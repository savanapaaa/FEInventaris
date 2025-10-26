import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import axios from '../../api/axios';

const Borrowings = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedBorrowing, setSelectedBorrowing] = useState(null);

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const fetchBorrowings = async () => {
    try {
      const response = await axios.get('/api/peminjaman');
      const data = response.data.data || response.data;
      
      // Enhanced Debug: Log struktur data untuk melihat field yang tersedia
      if (data && data.length > 0) {
        console.log('🔍 BACKEND RESPONSE ANALYSIS:');
        console.log('📊 Total records:', data.length);
        console.log('📋 Sample record (first item):', data[0]);
        console.log('🔑 Available fields:', Object.keys(data[0]));
        
        // Check specific fields we need
        const sample = data[0];
        console.log('� Field Mapping Check:');
        console.log('- Product name fields:', {
          produk_nama: sample.produk_nama,
          nama_produk: sample.nama_produk,
          'produk.nama': sample.produk?.nama,
          'Produk.nama': sample.Produk?.nama,
          nama: sample.nama
        });
        console.log('- User name fields:', {
          nama_pengguna: sample.nama_pengguna,
          peminjam_nama: sample.peminjam_nama,
          'pengguna.nama': sample.pengguna?.nama,
          'Pengguna.nama': sample.Pengguna?.nama,
          nama_lengkap: sample.nama_lengkap
        });
        console.log('- Photo evidence fields:', {
          foto_bukti_pengembalian: sample.foto_bukti_pengembalian,
          foto_bukti: sample.foto_bukti,
          photo_evidence: sample.photo_evidence,
          bukti_foto: sample.bukti_foto
        });
      }
      
      setBorrowings(data);
    } catch (error) {
      console.error('❌ Error fetching borrowings from backend:', error);
      setBorrowings([]);
    } finally {
      setLoading(false);
    }
  };

  const updateBorrowingStatus = async (borrowingId, newStatus) => {
    try {
      if (newStatus === 'dikembalikan' || newStatus === 'returned') {
        // Gunakan endpoint kembalikan khusus
        await axios.put(`/api/peminjaman/${borrowingId}/kembalikan`, {
          kondisi_kembali: 'Baik',
          catatan: 'Dikembalikan oleh admin'
        });
      } else {
        // Update status biasa
        await axios.put(`/api/peminjaman/${borrowingId}`, {
          status: newStatus
        });
      }
      
      // Refresh data
      fetchBorrowings();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const openPhotoModal = (photoUrl, borrowing) => {
    setSelectedPhoto(photoUrl);
    setSelectedBorrowing(borrowing);
    setShowPhotoModal(true);
  };

  const filteredBorrowings = borrowings.filter(borrowing => {
    if (selectedStatus === 'all') return true;
    return borrowing.status === selectedStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'dipinjam':
      case 'borrowed':
        return 'bg-blue-100 text-blue-800';
      case 'dikembalikan':
      case 'returned':
        return 'bg-green-100 text-green-800';
      case 'ditolak':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'dipinjam':
      case 'borrowed':
        return 'Dipinjam';
      case 'dikembalikan':
      case 'returned':
        return 'Dikembalikan';
      case 'ditolak':
      case 'rejected':
        return 'Ditolak';
      default:
        return status;
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Kelola Peminjaman</h1>
            <p className="text-gray-600">Kelola dan monitor peminjaman inventaris</p>
          </div>
          
          <button
            onClick={fetchBorrowings}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
          >
            Refresh Data
          </button>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-600">
              Total: {filteredBorrowings.length} peminjaman
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm min-w-0 flex-1 sm:flex-none"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="dipinjam">Dipinjam</option>
                <option value="dikembalikan">Dikembalikan</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>
          </div>
        </div>

        {borrowings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-500 text-lg mb-2">Tidak ada data peminjaman</div>
            <div className="text-gray-400 text-sm">Data akan muncul setelah backend terhubung</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px]">
                      Produk
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Peminjam
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                      Tanggal Pinjam
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px]">
                      Tanggal Kembali
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Foto Bukti
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBorrowings.map((borrowing) => (
                    <tr key={borrowing.id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{borrowing.id}
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 max-w-[160px] truncate">
                          {borrowing.produk?.nama || 
                           borrowing.Produk?.nama || 
                           borrowing.produk_nama || 
                           borrowing.nama_produk || 
                           borrowing.nama || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 max-w-[160px] truncate">
                          {borrowing.keperluan || borrowing.keterangan || borrowing.deskripsi || 'Tidak ada keterangan'}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[120px] truncate">
                        {borrowing.pengguna?.nama || 
                         borrowing.Pengguna?.nama || 
                         borrowing.pengguna?.nama_lengkap ||
                         borrowing.nama_pengguna || 
                         borrowing.peminjam_nama || 
                         borrowing.nama_lengkap || 'N/A'}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {borrowing.tanggal_pinjam || 'N/A'}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                        <div className="whitespace-nowrap">Rencana: {borrowing.tanggal_kembali_rencana || 'N/A'}</div>
                        {borrowing.tanggal_kembali_aktual && (
                          <div className="text-green-600 whitespace-nowrap">Aktual: {borrowing.tanggal_kembali_aktual}</div>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(borrowing.status)}`}>
                          {getStatusText(borrowing.status)}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                        {/* Cek berbagai kemungkinan field foto bukti */}
                        {(() => {
                          const fotoUrl = borrowing.foto_bukti_pengembalian || 
                                         borrowing.foto_bukti || 
                                         borrowing.photo_evidence || 
                                         borrowing.bukti_foto ||
                                         borrowing.evidence_photo;
                          
                          const isReturned = borrowing.status === 'dikembalikan' || 
                                           borrowing.status === 'returned' ||
                                           borrowing.status === 'completed';
                          
                          if (isReturned && fotoUrl) {
                            // Ensure URL is complete with backend domain
                            const fullPhotoUrl = fotoUrl.startsWith('http') 
                              ? fotoUrl 
                              : `http://localhost:5000${fotoUrl.startsWith('/') ? '' : '/'}${fotoUrl}`;
                            
                            return (
                              <div className="flex items-center space-x-2">
                                <img
                                  src={fullPhotoUrl}
                                  alt="Bukti pengembalian"
                                  className="w-10 h-10 lg:w-12 lg:h-12 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => openPhotoModal(fullPhotoUrl, borrowing)}
                                  onError={(e) => {
                                    console.error('Photo load error:', fullPhotoUrl);
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.textContent = '❌ Foto Error';
                                  }}
                                />
                                <span className="text-green-600 text-xs hidden sm:inline">✓ Ada Foto</span>
                              </div>
                            );
                          } else if (isReturned) {
                            return <span className="text-red-400 text-xs">❌ Tidak Ada</span>;
                          } else {
                            return <span className="text-gray-400 text-xs">-</span>;
                          }
                        })()}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm font-medium">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                          {borrowing.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateBorrowingStatus(borrowing.id, 'dipinjam')}
                                className="inline-flex items-center justify-center px-2 lg:px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                Setujui
                              </button>
                              <button
                                onClick={() => updateBorrowingStatus(borrowing.id, 'ditolak')}
                                className="inline-flex items-center justify-center px-2 lg:px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                Tolak
                              </button>
                            </>
                          )}
                          {(borrowing.status === 'dipinjam' || borrowing.status === 'borrowed') && (
                            <button
                              onClick={() => updateBorrowingStatus(borrowing.id, 'dikembalikan')}
                              className="inline-flex items-center justify-center px-2 lg:px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Kembalikan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Photo Modal */}
        {showPhotoModal && selectedPhoto && selectedBorrowing && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-lg bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Foto Bukti Pengembalian</h3>
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Produk:</span>
                    <span className="ml-2 text-gray-900">
                      {selectedBorrowing.produk?.nama || selectedBorrowing.produk_nama || selectedBorrowing.nama_produk || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Peminjam:</span>
                    <span className="ml-2 text-gray-900">
                      {selectedBorrowing.pengguna?.nama || selectedBorrowing.nama_pengguna || selectedBorrowing.peminjam_nama || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tanggal Kembali:</span>
                    <span className="ml-2 text-gray-900">{selectedBorrowing.tanggal_kembali_aktual || 'N/A'}</span>
                  </div>
                  {selectedBorrowing.kondisi_kembali && (
                    <div>
                      <span className="font-medium text-gray-700">Kondisi Kembali:</span>
                      <span className="ml-2 text-gray-900">{selectedBorrowing.kondisi_kembali}</span>
                    </div>
                  )}
                </div>
                {selectedBorrowing.catatan_pengembalian && (
                  <div className="mt-3">
                    <span className="font-medium text-gray-700">Catatan:</span>
                    <p className="mt-1 text-gray-900">{selectedBorrowing.catatan_pengembalian}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center mb-4">
                <img
                  src={selectedPhoto}
                  alt="Foto bukti pengembalian"
                  className="max-w-full max-h-96 object-contain rounded-lg border"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Borrowings;