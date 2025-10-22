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
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch products data from backend
  useEffect(() => {
    const fetchProduk = async () => {
      try {
        // Fetch semua produk dari endpoint /api/produk
        const response = await api.get('/api/produk');
        
        // Pastikan response.data adalah array
        if (Array.isArray(response.data)) {
          setProduk(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          // Jika response wrapped dalam object dengan property 'data'
          setProduk(response.data.data);
        } else {
          setProduk([]); // Set empty array jika format tidak sesuai
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        
        // Fallback ke mock data jika backend tidak tersedia
        const mockProduk = [
          {
            id: 1,
            nama: "Proyektor",
            nama_kategori: "Elektronik",
            jumlah_stok: 2,
            stok_minimum: 1,
            status_peminjaman: "tersedia",
            status_display: "Tersedia"
          },
          {
            id: 2,
            nama: "Laptop Dell XPS 13",
            nama_kategori: "Elektronik",
            jumlah_stok: 5,
            stok_minimum: 2,
            status_peminjaman: "tersedia",
            status_display: "Tersedia"
          },
          {
            id: 3,
            nama: "Proyektor Epson",
            nama_kategori: "Elektronik",
            jumlah_stok: 0,
            stok_minimum: 1,
            status_peminjaman: "tidak_tersedia",
            status_display: "Stok Habis"
          }
        ];
        
        setProduk(mockProduk);
        setError('Backend tidak tersedia. Menampilkan data mock untuk development.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduk();
  }, []);

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
      
      if (!token) {
        alert('Anda harus login terlebih dahulu');
        return;
      }

      // Send request with proper structure
      const response = await api.post('/api/peminjaman', {
        produk_id: productId,
        tanggal_kembali_rencana: formData.tanggal_kembali_rencana,
        keperluan: formData.keperluan,
        kondisi_pinjam: formData.kondisi_pinjam
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setShowModal(false);
      setSelectedProduct(null);
      alert('Peminjaman berhasil dikirim!');
      // Refresh product list to get updated stock
      window.location.reload();
    } catch (error) {
      console.error('Error requesting product:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message.includes('ECONNREFUSED')) {
        setShowModal(false);
        setSelectedProduct(null);
        alert('Backend tidak tersedia. Dalam mode development, fitur peminjaman tidak dapat dilakukan.');
      } else {
        const errorMessage = error.response?.data?.message || 'Gagal mengirim permintaan peminjaman';
        alert(errorMessage);
      }
    }
  };

  // Loading state
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard User</h1>
        <p className="text-gray-600 mt-2">
          Daftar produk inventaris yang tersedia untuk dipinjam
        </p>
      </div>

      {/* Backend Connection Warning */}
      {error && error.includes('Backend tidak tersedia') && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <strong>Mode Development:</strong> Backend tidak terhubung. Menampilkan data contoh.
              <br />
              <small>Jalankan backend di localhost:5000 untuk data real.</small>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Selamat Datang!</h2>
            <p className="text-blue-100">
              {Array.isArray(produk) ? produk.length : 0} produk tersedia untuk dipinjam
            </p>
          </div>
          <div className="hidden md:block">
            <svg className="w-16 h-16 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {!Array.isArray(produk) || produk.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-4h-2M6 9h2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada produk</h3>
          <p className="mt-1 text-sm text-gray-500">
            {error ? error : 'Saat ini tidak ada produk yang tersedia untuk dipinjam.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {produk.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              {/* Product Image Placeholder */}
              <div className="w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {product.nama}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Kategori:</span>
                    <span className="font-medium text-gray-700">
                      {product.nama_kategori || '-'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Stok:</span>
                    <span className={`font-medium ${product.jumlah_stok > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.jumlah_stok} unit
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.status_peminjaman === 'tersedia' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.status_display}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                {product.jumlah_stok > 0 && product.status_peminjaman === 'tersedia' ? (
                  <button
                    onClick={() => handleBorrow(product)}
                    className="w-full mt-4 py-3 px-4 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Pinjam
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full mt-4 py-3 px-4 rounded-lg font-semibold bg-gray-300 text-gray-600 cursor-not-allowed"
                  >
                    {product.jumlah_stok === 0 ? 'Stok Habis' : 'Tidak Tersedia'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Borrow Modal */}
      <BorrowModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleConfirmBorrow}
        product={selectedProduct}
      />
    </UserLayout>
  );
};

export default UserDashboard;