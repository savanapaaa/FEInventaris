/**
 * AvailableProducts Component
 * Komponen untuk menampilkan daftar produk yang tersedia
 * Menggunakan ProductCard component yang reusable
 */

import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';

const AvailableProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch products from backend
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
        setError('Gagal memuat data produk');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle borrow product
  const handleBorrow = async (productId) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Anda harus login terlebih dahulu');
        return;
      }

      // Calculate return date (7 days from now as default)
      const returnDate = new Date();
      returnDate.setDate(returnDate.getDate() + 7);
      const formattedReturnDate = returnDate.toISOString().split('T')[0]; // Format YYYY-MM-DD

      // Send request with proper structure
      const response = await api.post('/api/peminjaman', {
        produk_id: productId,
        tanggal_kembali_rencana: formattedReturnDate,
        keperluan: "Keperluan penggunaan barang kantor",
        kondisi_pinjam: "Baik"
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      alert('Peminjaman berhasil dikirim!');
      // Refresh product list to get updated stock
      window.location.reload();
    } catch (error) {
      console.error('Error requesting product:', error);
      const errorMessage = error.response?.data?.message || 'Gagal mengirim permintaan peminjaman';
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Barang</h2> 
      
      {products.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-4h-2M6 9h2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada produk</h3>
          <p className="mt-1 text-sm text-gray-500">
            Saat ini tidak ada produk yang tersedia untuk dipinjam.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onBorrow={handleBorrow}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableProducts;