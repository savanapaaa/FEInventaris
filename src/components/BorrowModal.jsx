/**
 * BorrowModal Component
 * Modal untuk konfirmasi peminjaman dengan form input yang lebih detail
 */

import React, { useState } from 'react';

const BorrowModal = ({ isOpen, onClose, onConfirm, product }) => {
  const [formData, setFormData] = useState({
    jumlah_dipinjam: 1,
    tanggal_kembali_rencana: '',
    keperluan: 'Keperluan penggunaan barang kantor',
    kondisi_pinjam: 'Baik'
  });

  // Set default return date (7 days from now)
  React.useEffect(() => {
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 7);
    const formattedDate = returnDate.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, tanggal_kembali_rencana: formattedDate }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate quantity tidak melebihi stok
    const availableStock = product?.jumlah_stok || product?.stok || 0;
    if (formData.jumlah_dipinjam > availableStock) {
      alert(`Jumlah yang dipinjam tidak boleh melebihi stok tersedia (${availableStock} unit)`);
      return;
    }
    
    if (formData.jumlah_dipinjam < 1) {
      alert('Jumlah yang dipinjam minimal 1 unit');
      return;
    }
    
    // SMART SOLUTION: Kirim DATE format, backend yang convert ke TIMESTAMP
    // Ini sesuai dengan yang dijelaskan: "frontend bisa kirim tanggal saja dan backend auto-add time"
    const formDataWithDate = {
      ...formData,
      tanggal_kembali_rencana: formData.tanggal_kembali_rencana // Backend auto-convert ke TIMESTAMP
    };
    
    console.log('✅ BorrowModal - Sending DATE format (backend will convert to TIMESTAMP):', formDataWithDate);
    
    onConfirm(product.id, formDataWithDate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Konfirmasi Peminjaman
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Product Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">{product?.nama}</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Kategori: {product?.nama_kategori || product?.kategori_nama || '-'}</p>
              <p>Stok Tersedia: {product?.jumlah_stok || product?.stok} unit</p>
              <p className="text-green-600 font-medium">Status: {product?.status_display || product?.status_peminjaman}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah yang Dipinjam
              </label>
              <input
                type="number"
                value={formData.jumlah_dipinjam}
                onChange={(e) => setFormData(prev => ({ ...prev, jumlah_dipinjam: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                min="1"
                max={product?.jumlah_stok || product?.stok || 1}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Maksimal {product?.jumlah_stok || product?.stok} unit tersedia
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Rencana Kembali
              </label>
              <input
                type="date"
                value={formData.tanggal_kembali_rencana}
                onChange={(e) => setFormData(prev => ({ ...prev, tanggal_kembali_rencana: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keperluan
              </label>
              <textarea
                value={formData.keperluan}
                onChange={(e) => setFormData(prev => ({ ...prev, keperluan: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows="3"
                placeholder="Jelaskan keperluan penggunaan barang..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kondisi Saat Pinjam
              </label>
              <select
                value={formData.kondisi_pinjam}
                onChange={(e) => setFormData(prev => ({ ...prev, kondisi_pinjam: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="Baik">Baik</option>
                <option value="Cukup">Cukup</option>
                <option value="Kurang">Kurang</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Konfirmasi Pinjam
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BorrowModal;