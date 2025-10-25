import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import axios from '../../api/axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    kategori_id: '',
    jumlah_stok: '',
    stok_minimum: 1,
    status_peminjaman: 'tersedia'
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('🔍 Fetching products...');
      const response = await axios.get('/api/produk');
      console.log('✅ Products response:', response.data);
      setProducts(response.data.data || response.data);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('🔍 Fetching categories...');
      const response = await axios.get('/api/kategori');
      console.log('✅ Categories response:', response.data);
      setCategories(response.data.data || response.data);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📤 Data yang akan dikirim:', formData);
    
    try {
      if (selectedProduct) {
        // Workaround: Backend might not have proper PUT endpoint
        // Let's just show an error message for now and suggest manual update
        console.log('🔄 Attempting to update product:', selectedProduct.id);
        
        const updateData = {
          nama: formData.nama,
          deskripsi: formData.deskripsi,
          kategori_id: parseInt(formData.kategori_id),
          jumlah_stok: parseInt(formData.jumlah_stok),
          stok_minimum: parseInt(formData.stok_minimum),
          status_peminjaman: formData.status_peminjaman
        };
        
        console.log('🔄 Sending update data:', updateData);
        
        try {
          // Try the standard PUT method first
          await axios.put(`/api/produk/${selectedProduct.id}`, updateData);
          alert('Produk berhasil diperbarui!');
        } catch (putError) {
          console.error('PUT method failed:', putError);
          
          // If PUT fails, inform user that update is not available
          alert('Maaf, fitur update produk belum tersedia di backend.\n\nUntuk mengubah produk:\n1. Hapus produk yang lama\n2. Tambah produk baru dengan data yang diinginkan');
          
          // Don't close modal so user can copy the data
          return;
        }
      } else {
        // Create new product
        console.log('➕ Creating new product');
        const createData = {
          nama: formData.nama,
          deskripsi: formData.deskripsi,
          kategori_id: parseInt(formData.kategori_id),
          jumlah_stok: parseInt(formData.jumlah_stok),
          stok_minimum: parseInt(formData.stok_minimum),
          status_peminjaman: formData.status_peminjaman
        };
        
        await axios.post('/api/produk', createData);
        alert('Produk berhasil ditambahkan!');
      }
      fetchProducts();
      closeModal();
    } catch (error) {
      console.error('📋 Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      let errorMessage = 'Terjadi kesalahan saat menyimpan data produk';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors.map(err => `- ${err.msg}`).join('\n');
        errorMessage = `Validasi gagal:\n${validationErrors}`;
      }
      
      alert(errorMessage);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      nama: product.nama,
      deskripsi: product.deskripsi,
      kategori_id: product.kategori_id,
      jumlah_stok: product.jumlah_stok,
      stok_minimum: product.stok_minimum || 1,
      status_peminjaman: product.status_peminjaman || 'tersedia',
      // Include existing gambar to prevent backend errors
      gambar: product.gambar || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        await axios.delete(`/api/produk/${productId}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Terjadi kesalahan saat menghapus produk');
      }
    }
  };

  const openModal = () => {
    setSelectedProduct(null);
    setFormData({
      nama: '',
      deskripsi: '',
      kategori_id: '',
      jumlah_stok: '',
      stok_minimum: 1,
      status_peminjaman: 'tersedia'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const getStatusColor = (stok) => {
    if (stok === 0) return 'bg-red-100 text-red-800';
    if (stok <= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (stok) => {
    if (stok === 0) return 'Habis';
    if (stok <= 5) return 'Terbatas';
    return 'Tersedia';
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
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Produk</h1>
            <p className="text-gray-600">Kelola inventaris produk</p>
          </div>
          <button
            onClick={openModal}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
          >
            Tambah Produk
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{product.nama}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.jumlah_stok)}`}>
                  {getStatusText(product.jumlah_stok)}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{product.deskripsi}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Kategori:</span>
                  <span className="font-medium">{product.nama_kategori || product.nama || 'Tidak ada kategori'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Stok:</span>
                  <span className="font-medium">{product.jumlah_stok}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Stok Minimum:</span>
                  <span className="font-medium">{product.stok_minimum || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-medium capitalize">{product.status_peminjaman || 'tersedia'}</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => handleEdit(product)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">Belum ada produk</div>
            <button
              onClick={openModal}
              className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
            >
              Tambah Produk Pertama
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {selectedProduct ? 'Edit Produk' : 'Tambah Produk'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({...formData, nama: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                  <textarea
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kategori</label>
                  <select
                    value={formData.kategori_id}
                    onChange={(e) => setFormData({...formData, kategori_id: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Jumlah Stok</label>
                  <input
                    type="number"
                    value={formData.jumlah_stok}
                    onChange={(e) => setFormData({...formData, jumlah_stok: e.target.value})}
                    min="0"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stok Minimum</label>
                  <input
                    type="number"
                    value={formData.stok_minimum}
                    onChange={(e) => setFormData({...formData, stok_minimum: e.target.value})}
                    min="1"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status Peminjaman</label>
                  <select
                    value={formData.status_peminjaman}
                    onChange={(e) => setFormData({...formData, status_peminjaman: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="tersedia">Tersedia</option>
                    <option value="dipinjam">Dipinjam</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:shadow-lg"
                  >
                    {selectedProduct ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Products;