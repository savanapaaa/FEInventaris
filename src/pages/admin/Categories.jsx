import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import axios from '../../api/axios';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('🔍 Fetching categories...');
      const response = await axios.get('/api/kategori');
      console.log('✅ Categories response:', response.data);
      setCategories(response.data.data || response.data);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        alert('Koneksi ke server bermasalah. Pastikan backend berjalan di localhost:5000');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📤 Category data yang akan dikirim:', formData);
    
    try {
      if (selectedCategory) {
        // Update category
        console.log('🔄 Updating category:', selectedCategory.id);
        await axios.put(`/api/kategori/${selectedCategory.id}`, formData);
        alert('Kategori berhasil diperbarui!');
      } else {
        // Create new category
        console.log('➕ Creating new category');
        await axios.post('/api/kategori', formData);
        alert('Kategori berhasil ditambahkan!');
      }
      fetchCategories();
      closeModal();
    } catch (error) {
      console.error('📋 Category error details:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      let errorMessage = 'Terjadi kesalahan saat menyimpan data kategori';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors.map(err => `- ${err.msg}`).join('\n');
        errorMessage = `Validasi gagal:\n${validationErrors}`;
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        errorMessage = 'Koneksi ke server bermasalah. Pastikan backend berjalan di localhost:5000';
      }
      
      alert(errorMessage);
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      nama: category.nama,
      deskripsi: category.deskripsi
    });
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini? Produk yang menggunakan kategori ini akan terpengaruh.')) {
      try {
        console.log('🗑️ Deleting category:', categoryId);
        await axios.delete(`/api/kategori/${categoryId}`);
        alert('Kategori berhasil dihapus!');
        fetchCategories();
      } catch (error) {
        console.error('📋 Delete error details:', {
          status: error.response?.status,
          data: error.response?.data,
          config: error.config
        });
        
        let errorMessage = 'Terjadi kesalahan saat menghapus kategori';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.status === 409) {
          errorMessage = 'Kategori tidak dapat dihapus karena masih digunakan oleh produk lain';
        } else if (error.response?.status === 404) {
          errorMessage = 'Kategori tidak ditemukan';
        } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
          errorMessage = 'Koneksi ke server bermasalah. Pastikan backend berjalan di localhost:5000';
        }
        
        alert(errorMessage);
      }
    }
  };

  const openModal = () => {
    setSelectedCategory(null);
    setFormData({
      nama: '',
      deskripsi: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
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
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Kategori</h1>
            <p className="text-gray-600">Kelola kategori produk</p>
          </div>
          <button
            onClick={openModal}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
          >
            Tambah Kategori
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{category.nama}</h3>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {category.produk_count || 0} produk
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{category.deskripsi || 'Tidak ada deskripsi'}</p>
              
              <div className="text-xs text-gray-500 mb-4">
                Dibuat: {new Date(category.dibuat_pada || category.created_at).toLocaleDateString('id-ID')}
              </div>
              
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  onClick={() => handleEdit(category)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {categories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">Belum ada kategori</div>
            <button
              onClick={openModal}
              className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
            >
              Tambah Kategori Pertama
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {selectedCategory ? 'Edit Kategori' : 'Tambah Kategori'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Kategori</label>
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
                    placeholder="Deskripsi kategori (opsional)"
                  />
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
                    {selectedCategory ? 'Update' : 'Simpan'}
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

export default Categories;