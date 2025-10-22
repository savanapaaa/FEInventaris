/**
 * User Dashboard
 * Dashboard untuk user dengan daftar produk dari endpoint GET /api/produk
 * Menampilkan produk yang tersedia dalam grid view
 */

import React, { useState, useEffect } from 'react';
import UserLayout from '../../components/layout/UserLayout';
import api from '../../api/axios';

const UserDashboard = () => {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch products data from backend
  useEffect(() => {
    const fetchProduk = async () => {
      try {
        // Fetch semua produk atau produk yang tersedia
        const response = await api.get('/api/produk/status/tersedia');
        
        // Pastikan response.data adalah array
        if (Array.isArray(response.data)) {
          setProduk(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          // Jika response wrapped dalam object dengan property 'data'
          setProduk(response.data.data);
        } else {
          console.log('Response data:', response.data);
          setProduk([]); // Set empty array jika format tidak sesuai
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Gagal memuat data produk');
        setProduk([]); // Set empty array pada error
      } finally {
        setLoading(false);
      }
    };

    fetchProduk();
  }, []);

  // Handle request product
  const handleRequestProduct = async (productId) => {
    try {
      await api.post('/api/peminjaman', {
        produk_id: productId
      });
      alert('Permintaan peminjaman berhasil dikirim!');
      // Refresh product list
      window.location.reload();
    } catch (error) {
      console.error('Error requesting product:', error);
      alert('Gagal mengirim permintaan peminjaman');
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

  // Error state
  if (error) {
    return (
      <UserLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
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
            {produk.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                {/* Product Image Placeholder */}
                <div className="w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {item.nama_produk}
                  </h3>
                  
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {item.deskripsi || 'Tidak ada deskripsi'}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Kategori:</span>
                      <span className="font-medium text-gray-700">
                        {item.kategori || '-'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Stok:</span>
                      <span className={`font-medium ${item.stok > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.stok} unit
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Status:</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {item.status || 'Tersedia'}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleRequestProduct(item.id)}
                    disabled={item.stok === 0}
                    className={`w-full mt-4 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                      item.stok > 0
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {item.stok > 0 ? 'Ajukan Peminjaman' : 'Stok Habis'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;