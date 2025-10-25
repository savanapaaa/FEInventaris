/**
 * ProductCard Component
 * Komponen kartu produk yang reusable dengan logika tombol yang benar
 * Sesuai dengan struktur data backend API /api/produk
 * Mendukung request peminjaman dengan Authorization header
 */

import React from 'react';

const ProductCard = ({ product, onBorrow }) => {
  // Logika untuk menampilkan tombol berdasarkan stok dan status
  const isAvailable = product.jumlah_stok > 0 && product.status_peminjaman === 'tersedia';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
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

        {/* Action Button dengan logika yang benar */}
        {isAvailable ? (
          <button
            onClick={() => onBorrow(product.id)}
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
  );
};

export default ProductCard;