/**
 * User Dashboard
 * Dashboard untuk user dengan daftar produk dari endpoint GET /api/produk
 * Menampilkan produk yang tersedia dalam grid view dengan modal konfirmasi peminjaman
 */

import React, { useState, useEffect } from 'react';
import UserLayout from '../../components/layout/UserLayout';
import BorrowModal from '../../components/BorrowModal';
import api from '../../api/axios';

const UserDashboard = () => {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch products data from backend with real-time availability
  const fetchProdukRealTime = async () => {
    try {
      // First, get all products
      const produkResponse = await api.get('/api/produk');
      let produkData = [];
      
      if (Array.isArray(produkResponse.data)) {
        produkData = produkResponse.data;
      } else if (produkResponse.data && Array.isArray(produkResponse.data.data)) {
        produkData = produkResponse.data.data;
      }

      // Then, get current borrowings to calculate real availability
      const peminjAmanResponse = await api.get('/api/peminjaman');
      let peminjAmanData = [];
      
      if (Array.isArray(peminjAmanResponse.data)) {
        peminjAmanData = peminjAmanResponse.data;
      } else if (peminjAmanResponse.data && Array.isArray(peminjAmanResponse.data.data)) {
        peminjAmanData = peminjAmanResponse.data.data;
      }

      // Calculate real-time availability
      const produkWithAvailability = produkData.map(product => {
        // Count active borrowings for this product
        const activeBorrowings = peminjAmanData.filter(borrowing => {
          const productId = borrowing.produk_id || borrowing.id_produk;
          const status = borrowing.status;
          return productId === product.id && (status === 'dipinjam' || status === 'borrowed' || status === 'pending_return');
        });

        // Calculate total borrowed quantity
        const totalBorrowed = activeBorrowings.reduce((total, borrowing) => {
          return total + (borrowing.jumlah_dipinjam || 1);
        }, 0);

        // Calculate available stock
        const totalStock = product.jumlah_stok || product.stok || 0;
        const availableStock = Math.max(0, totalStock - totalBorrowed);

        // Determine status based on available stock
        let status_peminjaman = 'tersedia';
        let status_display = 'Tersedia';
        
        if (availableStock <= 0) {
          status_peminjaman = 'tidak_tersedia';
          status_display = 'Sedang Dipinjam';
        } else if (availableStock <= (product.stok_minimum || 1)) {
          status_peminjaman = 'stok_terbatas';
          status_display = 'Stok Terbatas';
        }

        return {
          ...product,
          jumlah_stok: availableStock,
          total_stok: totalStock,
          sedang_dipinjam: totalBorrowed,
          status_peminjaman,
          status_display,
          active_borrowings: activeBorrowings.length
        };
      });

      console.log('🔄 Real-time product availability calculated:', produkWithAvailability);
      setProduk(produkWithAvailability);
      
    } catch (error) {
      console.error('Error fetching products with real-time data:', error);
      
      // Fallback ke mock data jika backend tidak tersedia
      const mockProduk = [
        {
          id: 1,
          nama: "Proyektor",
          nama_kategori: "Elektronik",
          jumlah_stok: 2,
          total_stok: 2,
          sedang_dipinjam: 0,
          stok_minimum: 1,
          status_peminjaman: "tersedia",
          status_display: "Tersedia",
          active_borrowings: 0
        },
        {
          id: 2,
          nama: "Laptop Dell XPS 13",
          nama_kategori: "Elektronik",
          jumlah_stok: 5,
          total_stok: 5,
          sedang_dipinjam: 0,
          stok_minimum: 2,
          status_peminjaman: "tersedia",
          status_display: "Tersedia",
          active_borrowings: 0
        },
        {
          id: 3,
          nama: "Proyektor Epson",
          nama_kategori: "Elektronik",
          jumlah_stok: 0,
          total_stok: 3,
          sedang_dipinjam: 3,
          stok_minimum: 1,
          status_peminjaman: "tidak_tersedia",
          status_display: "Sedang Dipinjam",
          active_borrowings: 2
        }
      ];
      
      setProduk(mockProduk);
      setError('Backend tidak tersedia. Menampilkan data mock untuk development.');
    }
  };

  useEffect(() => {
    const fetchProduk = async () => {
      setLoading(true);
      await fetchProdukRealTime();
      setLoading(false);
    };

    fetchProduk();
  }, []);

  // Fungsi refresh untuk tombol refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProdukRealTime();
    setRefreshing(false);
  };

  // Handle borrow product - show modal first
  const handleBorrow = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  // Handle confirm borrow with form data
  const handleConfirmBorrow = async (productId, formData) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // SMART: Kirim DATE format, backend auto-convert ke TIMESTAMP
      const response = await api.post('/api/peminjaman', {
        produk_id: productId,
        jumlah_dipinjam: formData.quantity,
        tanggal_peminjaman: formData.startDate, // Backend handles timestamp conversion
        tanggal_kembali_rencana: formData.endDate, // Backend handles timestamp conversion
        keperluan: formData.purpose
      });

      console.log('📤 Borrowing request response:', response.data);

      setShowModal(false);
      setSelectedProduct(null);
      
      alert('Permintaan peminjaman berhasil diajukan! Menunggu persetujuan admin.');
      
      // Refresh real-time data after borrowing
      await fetchProdukRealTime();

    } catch (error) {
      console.error('❌ Error creating borrowing request:', error);
      
      let errorMessage = 'Gagal mengajukan peminjaman. ';
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage += 'Data yang dikirim tidak valid.';
      } else if (error.response?.status === 401) {
        errorMessage += 'Anda harus login terlebih dahulu.';
      } else if (error.response?.status === 404) {
        errorMessage += 'Produk tidak ditemukan.';
      } else {
        errorMessage += 'Silakan coba lagi.';
      }
      
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Memuat data...</span>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header dengan tombol refresh */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard User</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
          >
            {refreshing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Memuat...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </>
            )}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">{error}</p>
          </div>
        )}

        {/* Produk Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produk.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition-shadow"
            >
              {/* Product Image */}
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {item.foto ? (
                  <img
                    src={item.foto.startsWith('http') ? item.foto : `http://localhost:5000${item.foto}`}
                    alt={item.nama}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA2MEgxNDBWMTQwSDYwVjYwWiIgZmlsbD0iI0Q1RDVENSIvPgo8L3N2Zz4K';
                    }}
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm">No Image</p>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">{item.nama}</h3>
                <p className="text-gray-600 text-sm mb-2">{item.nama_kategori}</p>
                
                {/* Stock Information */}
                <div className="mb-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Stok Tersedia:</span>
                    <span className="font-semibold text-blue-600">
                      {item.jumlah_stok}
                    </span>
                  </div>
                  
                  {item.total_stok && (
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Total Stok:</span>
                      <span>{item.total_stok}</span>
                    </div>
                  )}
                  
                  {item.sedang_dipinjam > 0 && (
                    <div className="flex justify-between items-center text-xs text-orange-600">
                      <span>Sedang Dipinjam:</span>
                      <span>{item.sedang_dipinjam}</span>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="mb-3">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      item.status_peminjaman === 'tersedia'
                        ? 'bg-green-100 text-green-800'
                        : item.status_peminjaman === 'stok_terbatas'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.status_display}
                  </span>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleBorrow(item)}
                  disabled={item.status_peminjaman === 'tidak_tersedia'}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    item.status_peminjaman === 'tidak_tersedia'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : item.status_peminjaman === 'stok_terbatas'
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {item.status_peminjaman === 'tidak_tersedia'
                    ? 'Tidak Tersedia'
                    : item.status_peminjaman === 'stok_terbatas'
                    ? 'Pinjam Sekarang (Terbatas)'
                    : 'Pinjam Sekarang'
                  }
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No products message */}
        {produk.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada produk</h3>
            <p className="text-gray-600">Saat ini tidak ada produk yang tersedia untuk dipinjam.</p>
          </div>
        )}
      </div>

      {/* Borrow Modal */}
      {showModal && selectedProduct && (
        <BorrowModal
          product={selectedProduct}
          onClose={() => {
            setShowModal(false);
            setSelectedProduct(null);
          }}
          onConfirm={handleConfirmBorrow}
        />
      )}
    </UserLayout>
  );
};

export default UserDashboard;