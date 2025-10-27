/**
 * Available Products Page
 * Halaman untuk melihat semua produk yang tersedia dengan real-time inventory
 */

import React, { useState, useEffect } from 'react';
import UserLayout from '../../components/layout/UserLayout';
import BorrowModal from '../../components/BorrowModal';
import api from '../../api/axios';

const AvailableProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock categories untuk filter
  const categories = ['all', 'Elektronik', 'Furniture', 'Alat Tulis', 'Alat Olahraga'];

  // Fetch products with real-time availability calculation
  const fetchProductsRealTime = async () => {
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
          active_borrowings: activeBorrowings.length,
          deskripsi: product.deskripsi || `${product.nama} - ${product.nama_kategori || 'Inventaris'}`
        };
      });

      console.log('🔄 Real-time product availability calculated for AvailableProducts:', produkWithAvailability);
      setProducts(produkWithAvailability);
      
    } catch (error) {
      console.error('Error fetching products with real-time data:', error);
      
      // Mock data untuk development dengan real-time calculation applied
      const mockProducts = [
        {
          id: 1,
          nama: "anu",
          nama_kategori: "Alat Olahraga",
          jumlah_stok: 4,
          total_stok: 4,
          sedang_dipinjam: 0,
          stok_minimum: 1,
          status_peminjaman: "tersedia",
          status_display: "Tersedia",
          active_borrowings: 0,
          deskripsi: "p"
        },
        {
          id: 2,
          nama: "coba",
          nama_kategori: "Alat Olahraga",
          jumlah_stok: 2,
          total_stok: 2,
          sedang_dipinjam: 0,
          stok_minimum: 1,
          status_peminjaman: "tersedia",
          status_display: "Tersedia",
          active_borrowings: 0,
          deskripsi: "baa"
        },
        {
          id: 3,
          nama: "proyektor",
          nama_kategori: "Elektronik",
          jumlah_stok: 0,
          total_stok: 2,
          sedang_dipinjam: 2,
          stok_minimum: 1,
          status_peminjaman: "tidak_tersedia",
          status_display: "Sedang Dipinjam",
          active_borrowings: 1,
          deskripsi: "proyektor"
        },
        {
          id: 4,
          nama: "d",
          nama_kategori: "Elektronik",
          jumlah_stok: 0,
          total_stok: 2,
          sedang_dipinjam: 2,
          stok_minimum: 1,
          status_peminjaman: "tidak_tersedia",
          status_display: "Sedang Dipinjam",
          active_borrowings: 1,
          deskripsi: "d"
        }
      ];
      
      setProducts(mockProducts);
      setError('Backend tidak tersedia. Menampilkan data contoh dengan real-time calculation.');
    }
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      await fetchProductsRealTime();
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || 
                        (product.nama_kategori || product.kategori_nama) === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle borrow
  const handleBorrow = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  // Handle confirm borrow with real-time refresh
  const handleConfirmBorrow = async (productId, formData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Anda harus login terlebih dahulu');
        return;
      }

      console.log('📤 Sending borrow request (BEFORE processing):', formData);
      console.log('📤 Final payload to backend:', {
        produk_id: productId,
        jumlah_dipinjam: formData.jumlah_dipinjam,
        tanggal_kembali_rencana: formData.tanggal_kembali_rencana,
        keperluan: formData.keperluan,
        kondisi_pinjam: formData.kondisi_pinjam
      });

      const response = await api.post('/api/peminjaman', {
        produk_id: productId,
        jumlah_dipinjam: formData.jumlah_dipinjam,
        tanggal_kembali_rencana: formData.tanggal_kembali_rencana,
        keperluan: formData.keperluan,
        kondisi_pinjam: formData.kondisi_pinjam
      });

      console.log('✅ SUCCESS Response:', response.data);

      setShowModal(false);
      setSelectedProduct(null);
      
      // Refresh real-time data after borrowing
      await fetchProductsRealTime();
      
      alert(`Peminjaman berhasil! ${formData.jumlah_dipinjam} unit ${selectedProduct?.nama} telah dipinjam.`);
    } catch (error) {
      console.error('❌ Error requesting product:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
      
      if (error.code === 'ERR_NETWORK' || error.message.includes('ECONNREFUSED')) {
        setShowModal(false);
        setSelectedProduct(null);
        alert('Backend tidak tersedia. Dalam mode development, fitur peminjaman tidak dapat dilakukan.');
      } else {
        const errorMessage = error.response?.data?.message || 'Gagal mengirim permintaan peminjaman';
        setShowModal(false);
        setSelectedProduct(null);
        alert(`Error: ${errorMessage} (Status: ${error.response?.status})`);
      }
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">barang</h1>
        <p className="text-gray-600 mt-2">
          Jelajahi semua produk inventaris yang tersedia untuk dipinjam (Real-time)
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
              <strong>Mode Development:</strong> Backend tidak terhubung. Menampilkan data contoh dengan real-time calculation.
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Filter Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter Kategori
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Semua Kategori' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada produk ditemukan</h3>
          <p className="mt-1 text-sm text-gray-500">
            Coba ubah kata kunci pencarian atau filter kategori.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              {/* Product Image */}
              <div className="w-full h-48 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg mb-4 overflow-hidden">
                {(product.foto || product.image || product.productImage || product.gambar) ? (
                  <>
                    <img
                      src={(() => {
                        const imageField = product.foto || product.image || product.productImage || product.gambar;
                        console.log('🖼️ AvailableProducts image field for', product.nama, ':', imageField);
                        if (imageField.startsWith('http')) {
                          return imageField;
                        }
                        return `http://localhost:5000${imageField.startsWith('/') ? imageField : `/${imageField}`}`;
                      })()}
                      alt={product.nama}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('❌ AvailableProducts image error for:', product.nama, e.target.src);
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                      onLoad={(e) => {
                        console.log('✅ AvailableProducts image loaded for:', product.nama, e.target.src);
                      }}
                    />
                    <div className="w-full h-full flex items-center justify-center" style={{display: 'none'}}>
                      <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {product.nama}
                </h3>
                
                <p className="text-gray-600 text-sm">
                  {product.deskripsi || 'Tidak ada deskripsi'}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Kategori:</span>
                    <span className="font-medium text-gray-700">
                      {product.nama_kategori || product.kategori_nama || '-'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Stok Tersedia:</span>
                    <span className={`font-medium ${product.jumlah_stok > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.jumlah_stok} unit
                    </span>
                  </div>

                  {product.total_stok && (
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Total Stok:</span>
                      <span>{product.total_stok} unit</span>
                    </div>
                  )}
                  
                  {product.sedang_dipinjam > 0 && (
                    <div className="flex justify-between items-center text-xs text-orange-600">
                      <span>Sedang Dipinjam:</span>
                      <span>{product.sedang_dipinjam} unit</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.status_peminjaman === 'tersedia' 
                        ? 'bg-green-100 text-green-800'
                        : product.status_peminjaman === 'stok_terbatas'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.status_display}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                {product.status_peminjaman === 'tidak_tersedia' ? (
                  <button
                    disabled
                    className="w-full mt-4 py-3 px-4 rounded-lg font-semibold bg-gray-100 text-gray-400 cursor-not-allowed"
                  >
                    Tidak Tersedia
                  </button>
                ) : product.status_peminjaman === 'stok_terbatas' ? (
                  <button
                    onClick={() => handleBorrow(product)}
                    className="w-full mt-4 py-3 px-4 rounded-lg font-semibold bg-yellow-500 hover:bg-yellow-600 text-white transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                  >
                    Pinjam Sekarang (Terbatas)
                  </button>
                ) : (
                  <button
                    onClick={() => handleBorrow(product)}
                    className="w-full mt-4 py-3 px-4 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Pinjam Sekarang
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

export default AvailableProducts;