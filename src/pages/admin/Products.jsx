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
    foto: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('🔍 Fetching products...');
      const response = await axios.get('/api/produk');
      console.log('✅ Products response:', response.data);
      console.log('📸 Sample product image fields:', response.data.data?.[0] || response.data[0]);
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
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('nama', formData.nama);
      submitData.append('deskripsi', formData.deskripsi);
      submitData.append('kategori_id', parseInt(formData.kategori_id));
      submitData.append('jumlah_stok', parseInt(formData.jumlah_stok));
      submitData.append('stok_minimum', parseInt(formData.stok_minimum));
      
      // Add photo with correct field name for backend
      if (formData.foto) {
        submitData.append('productImage', formData.foto);
      }
      
      if (selectedProduct) {
        // Update product with new endpoint
        console.log('🔄 Attempting to update product:', selectedProduct.id);
        
        try {
          await axios.put(`/api/produk/${selectedProduct.id}/with-upload`, submitData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          alert('Produk berhasil diperbarui!');
        } catch (putError) {
          console.error('PUT method failed:', putError);
          alert('Maaf, fitur update produk belum tersedia di backend.\\n\\nUntuk mengubah produk:\\n1. Hapus produk yang lama\\n2. Tambah produk baru dengan data yang diinginkan');
          return;
        }
      } else {
        // Create new product with new endpoint
        console.log('➕ Creating new product with photo using /api/produk/with-upload');
        
        await axios.post('/api/produk/with-upload', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Produk berhasil ditambahkan!');
      }
      fetchProducts();
      closeModal();
    } catch (error) {
      console.error('❌ Error submitting product:', error);
      if (error.response?.status === 400) {
        alert('Data yang dikirim tidak valid. Silakan periksa kembali.');
      } else if (error.response?.status === 401) {
        alert('Anda tidak memiliki akses untuk melakukan operasi ini.');
      } else {
        alert('Terjadi kesalahan saat menyimpan produk.');
      }
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        console.log('🗑️ Deleting product:', productId);
        await axios.delete(`/api/produk/${productId}`);
        alert('Produk berhasil dihapus!');
        fetchProducts();
      } catch (error) {
        console.error('❌ Error deleting product:', error);
        if (error.response?.status === 404) {
          alert('Produk tidak ditemukan.');
        } else if (error.response?.status === 400) {
          alert('Produk sedang dipinjam, tidak dapat dihapus.');
        } else {
          alert('Terjadi kesalahan saat menghapus produk.');
        }
      }
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      nama: product.nama,
      deskripsi: product.deskripsi,
      kategori_id: product.kategori_id || '',
      jumlah_stok: product.jumlah_stok,
      stok_minimum: product.stok_minimum || 1,
      foto: null
    });
    setImagePreview(null);
    setShowModal(true);
  };

  const openModal = () => {
    setSelectedProduct(null);
    setFormData({
      nama: '',
      deskripsi: '',
      kategori_id: '',
      jumlah_stok: '',
      stok_minimum: 1,
      foto: null
    });
    setImagePreview(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setFormData({
      nama: '',
      deskripsi: '',
      kategori_id: '',
      jumlah_stok: '',
      stok_minimum: 1,
      foto: null
    });
    setImagePreview(null);
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar!');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB!');
        return;
      }
      
      setFormData(prev => ({ ...prev, foto: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusColor = (stok) => {
    if (stok === 0) return 'bg-red-100 text-red-800';
    if (stok <= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (stok) => {
    if (stok === 0) return 'Habis';
    if (stok <= 5) return 'Sedikit';
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Produk</h1>
            <p className="text-gray-600">Kelola inventaris produk dengan upload foto</p>
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
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Product Image */}
              {(product.foto || product.image || product.productImage || product.gambar) ? (
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={(() => {
                      const imageField = product.foto || product.image || product.productImage || product.gambar;
                      console.log('🖼️ Image field for', product.nama, ':', imageField);
                      if (imageField.startsWith('http')) {
                        return imageField;
                      }
                      return `http://localhost:5000${imageField.startsWith('/') ? imageField : `/${imageField}`}`;
                    })()}
                    alt={product.nama}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('❌ Image load error for:', product.nama, e.target.src);
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                    onLoad={(e) => {
                      console.log('✅ Image loaded successfully for:', product.nama, e.target.src);
                    }}
                  />
                  <div className="h-48 bg-gray-200 flex items-center justify-center" style={{display: 'none'}}>
                    <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              
              {/* Product Info */}
              <div className="p-6">
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

                {/* Upload Gambar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Foto Produk</label>
                  <div className="space-y-4">
                    {/* File Input */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500">
                      Format: JPG, PNG, GIF. Maksimal 5MB.
                    </p>
                    
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                        <div className="relative inline-block">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, foto: null }));
                              setImagePreview(null);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
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