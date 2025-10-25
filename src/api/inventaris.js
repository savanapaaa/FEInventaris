/**
 * API Service untuk Inventaris System
 * Berisi semua endpoint yang sesuai dengan backend API
 */

import axios from './axios';

class InventarisAPI {
  constructor() {
    this.baseURL = 'http://localhost:5000';
  }

  // ========== AUTHENTICATION ==========
  async login(email, kata_sandi) {
    return axios.post('/api/login', { email, kata_sandi });
  }

  async adminRegister(userData) {
    console.log('🚀 adminRegister called with:', userData);
    console.log('🔗 URL will be:', this.baseURL + '/api/auth/admin/register');
    
    try {
      const response = await axios.post('/api/auth/admin/register', userData);
      console.log('✅ adminRegister success:', response.data);
      return response;
    } catch (error) {
      console.error('❌ adminRegister error:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      throw error;
    }
  }

  async createUser(userData) {
    return axios.post('/api/pengguna', userData);
  }

  async registerUser(userData) {
    return axios.post('/api/register', userData);
  }

  // ========== DASHBOARD & STATISTICS ==========
  async getDashboardStats() {
    return axios.get('/api/stats');
  }

  async getQuickStats() {
    return axios.get('/api/stats/quick');
  }

  // ========== PRODUCTS ==========
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return axios.get(`/api/produk${queryString ? '?' + queryString : ''}`);
  }

  async getProduct(id) {
    return axios.get(`/api/produk/${id}`);
  }

  async getAvailableProducts() {
    return axios.get('/api/produk/status/tersedia');
  }

  async createProduct(data) {
    return axios.post('/api/produk', data);
  }

  async updateProduct(id, data) {
    return axios.put(`/api/produk/${id}`, data);
  }

  async deleteProduct(id) {
    return axios.delete(`/api/produk/${id}`);
  }

  async getLowStockProducts() {
    return axios.get('/api/produk/peringatan/stok-rendah');
  }

  // ========== CATEGORIES ==========
  async getCategories() {
    return axios.get('/api/kategori');
  }

  async getCategory(id) {
    return axios.get(`/api/kategori/${id}`);
  }

  async createCategory(data) {
    return axios.post('/api/kategori', data);
  }

  async updateCategory(id, data) {
    return axios.put(`/api/kategori/${id}`, data);
  }

  async deleteCategory(id) {
    return axios.delete(`/api/kategori/${id}`);
  }

  // ========== BORROWINGS ==========
  async getBorrowings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return axios.get(`/api/peminjaman${queryString ? '?' + queryString : ''}`);
  }

  async getBorrowing(id) {
    return axios.get(`/api/peminjaman/${id}`);
  }

  async createBorrowing(data) {
    return axios.post('/api/peminjaman', data);
  }

  async returnItem(id, data) {
    return axios.put(`/api/peminjaman/${id}/kembalikan`, data);
  }

  async extendBorrowing(id, data) {
    return axios.post(`/api/peminjaman/${id}/perpanjang`, data);
  }

  async getUserBorrowingHistory() {
    return axios.get('/api/peminjaman/user/riwayat');
  }

  async getOverdueBorrowings() {
    return axios.get('/api/peminjaman/admin/terlambat');
  }

  // ========== USERS ==========
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return axios.get(`/api/pengguna${queryString ? '?' + queryString : ''}`);
  }

  async getUserProfile() {
    return axios.get('/api/pengguna/profil');
  }

  async updateUser(id, data) {
    return axios.put(`/api/pengguna/${id}`, data);
  }

  async deleteUser(id) {
    return axios.delete(`/api/pengguna/${id}`);
  }

  // ========== ACTIVITY HISTORY ==========
  async getActivityHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return axios.get(`/api/riwayat${queryString ? '?' + queryString : ''}`);
  }

  async getMyActivityHistory() {
    return axios.get('/api/riwayat/saya');
  }

  async getRecordHistory(table, id) {
    return axios.get(`/api/riwayat/tabel/${table}/${id}`);
  }

  // ========== HELPER METHODS ==========
  
  /**
   * Handle API Response dengan struktur standar
   * @param {Promise} apiCall - Promise dari axios call
   * @returns {Object} - Normalized response
   */
  async handleResponse(apiCall) {
    try {
      const response = await apiCall;
      
      // Jika response memiliki struktur { success: true, data: ... }
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
          pagination: response.data.pagination
        };
      }
      
      // Jika response langsung berisi data
      return {
        success: true,
        data: response.data,
        message: 'Success'
      };
    } catch (error) {
      console.error('API Error:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Terjadi kesalahan',
        data: null
      };
    }
  }

  /**
   * Get formatted data untuk dashboard
   */
  async getFormattedDashboardStats() {
    try {
      const response = await this.getDashboardStats();
      
      if (response.data.success) {
        return response.data.data;
      }
      
      // Fallback jika format berbeda
      return {
        overview: {
          total_pengguna: response.data.total_pengguna || 0,
          total_produk: response.data.total_produk || 0,
          total_kategori: response.data.total_kategori || 0,
          total_peminjaman: response.data.total_peminjaman || 0,
          sedang_dipinjam: response.data.sedang_dipinjam || 0,
          terlambat: response.data.terlambat || 0
        },
        recent_activities: response.data.recent_activities || [],
        alerts: response.data.alerts || { overdue_count: 0, needs_attention: false }
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return {
        overview: {
          total_pengguna: 0,
          total_produk: 0,
          total_kategori: 0,
          total_peminjaman: 0,
          sedang_dipinjam: 0,
          terlambat: 0
        },
        recent_activities: [],
        alerts: { overdue_count: 0, needs_attention: false }
      };
    }
  }
}

// Export singleton instance
export default new InventarisAPI();