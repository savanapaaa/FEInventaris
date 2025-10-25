/**
 * Available Products Page
 * Halaman untuk melihat semua produk yang tersedia
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
  const categories = ['all', 'Elektronik', 'Furniture', 'Alat Tulis'];

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/api/produk');
        
        if (Array.isArray(response.data)) {
          setProducts(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setProducts(response.data.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        
        // Mock data untuk development
        const mockProducts = [
          {
            id: 1,
            nama: "Proyektor",
            nama_kategori: "Elektronik",
            jumlah_stok: 2,
            stok_minimum: 1,
            status_peminjaman: "tersedia",
            status_display: "Tersedia",
            deskripsi: "Proyektor untuk presentasi dengan resolusi tinggi"
          },
          {
            id: 2,
            nama: "Laptop Dell XPS 13",
            nama_kategori: "Elektronik",
            jumlah_stok: 5,
            stok_minimum: 2,
            status_peminjaman: "tersedia",
            status_display: "Tersedia",
            deskripsi: "Laptop untuk keperluan kantor dan presentasi"
          },
          {
            id: 3,
            nama: "Meja Meeting",
            nama_kategori: "Furniture",
            jumlah_stok: 3,
            stok_minimum: 1,
            status_peminjaman: "tersedia",
            status_display: "Tersedia",
            deskripsi: "Meja meeting untuk 8 orang"
          },
          {
            id: 4,
            nama: "Whiteboard",
            nama_kategori: "Alat Tulis",
            jumlah_stok: 0,
            stok_minimum: 1,
            status_peminjaman: "tidak_tersedia",
            status_display: "Stok Habis",
            deskripsi: "Whiteboard ukuran besar untuk presentasi"
          }
        ];
        
        setProducts(mockProducts);
        setError('Backend tidak tersedia. Menampilkan data contoh.');
      } finally {
        setLoading(false);
      }
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

  // Handle confirm borrow
  const handleConfirmBorrow = async (productId, formData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Anda harus login terlebih dahulu');
        return;
      }

      console.log('📤 Sending borrow request:', {
        produk_id: productId,
        jumlah_dipinjam: formData.jumlah_dipinjam,
        tanggal_kembali_rencana: formData.tanggal_kembali_rencana,
        keperluan: formData.keperluan,
        kondisi_pinjam: formData.kondisi_pinjam
      });

      await api.post('/api/peminjaman', {
        produk_id: productId,
        jumlah_dipinjam: formData.jumlah_dipinjam,
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
      
      // Update local state to reduce stock immediately
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { 
                ...product, 
                jumlah_stok: product.jumlah_stok - formData.jumlah_dipinjam,
                status_peminjaman: (product.jumlah_stok - formData.jumlah_dipinjam) <= 0 ? 'tidak_tersedia' : 'tersedia',
                status_display: (product.jumlah_stok - formData.jumlah_dipinjam) <= 0 ? 'Stok Habis' : 'Tersedia'
              }
            : product
        )
      );
      
      alert(`Peminjaman berhasil! ${formData.jumlah_dipinjam} unit ${selectedProduct?.nama} telah dipinjam.`);
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
        <h1 className="text-3xl font-bold text-gray-900">Produk Tersedia</h1>
        <p className="text-gray-600 mt-2">
          Jelajahi semua produk inventaris yang tersedia untuk dipinjam
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
              {/* Product Image Placeholder */}
              <div className="w-full h-48 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
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

export default AvailableProducts;