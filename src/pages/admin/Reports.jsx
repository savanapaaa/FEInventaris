/**
 * Admin Reports Page
 * Halaman laporan lengkap dengan fitur download PDF
 * Menampilkan berbagai jenis laporan sistem peminjaman inventaris
 */

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import inventarisAPI from '../../api/inventaris';

const AdminReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportType, setReportType] = useState('summary');

  // Fetch report data
  const fetchReportData = async () => {
    if (!reportType || !dateRange.startDate || !dateRange.endDate) {
      return;
    }

    setLoading(true);
    try {
      // API call untuk mendapatkan data preview laporan
      const response = await inventarisAPI.getReportPreview(
        reportType, 
        dateRange.startDate, 
        dateRange.endDate
      );
      
      if (response.data && response.data.success) {
        setReportData(response.data.data);
      } else if (response.data) {
        // Handle direct data response (no success wrapper)
        setReportData(response.data);
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      
      // Set dummy data for preview if API not available yet
      setReportData({
        total_borrowings: 45,
        active_products: 120,
        overdue_count: 3,
        total_users: 25
      });
    } finally {
      setLoading(false);
    }
  };

  // Download PDF report
  const downloadPDF = async () => {
    if (!reportType || !dateRange.startDate || !dateRange.endDate) {
      alert('Harap pilih jenis laporan dan periode tanggal terlebih dahulu.');
      return;
    }

    try {
      setLoading(true);
      
      // Debug: Log request details
      console.log('📥 PDF Download Request:', {
        type: reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        url: `/api/laporan/download?type=${reportType}&start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`
      });
      
      // API call untuk download PDF dengan filter yang dipilih
      const response = await inventarisAPI.downloadReportPDF(
        reportType,
        dateRange.startDate,
        dateRange.endDate
      );

      // Create blob dan download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Dynamic filename based on filter
      const reportTypeName = reportType === 'lengkap' ? 'Lengkap' : 
                           reportType === 'ringkasan' ? 'Ringkasan' :
                           reportType === 'peminjaman' ? 'Peminjaman' : 'Inventaris';
      
      link.download = `Laporan-${reportTypeName}-${dateRange.startDate}-${dateRange.endDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ PDF downloaded successfully');
      
    } catch (error) {
      console.error('❌ Error downloading PDF:', error);
      
      // Enhanced error logging for debugging
      console.log('🔍 Detailed Error Info:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        requestURL: error.config?.url,
        requestMethod: error.config?.method,
        requestParams: error.config?.params
      });
      
      // User-friendly error handling
      if (error.response?.status === 401) {
        alert('Sesi login telah berakhir. Silakan login kembali.');
      } else if (error.response?.status === 404) {
        alert('Endpoint laporan belum tersedia di backend.');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.message || 'Request tidak valid';
        alert(`❌ Request tidak valid: ${errorMsg}\n\nParameter yang dikirim:\n• Type: ${reportType}\n• Start Date: ${dateRange.startDate}\n• End Date: ${dateRange.endDate}`);
      } else if (error.response?.status >= 500) {
        alert('Server error. Silakan coba lagi nanti.');
      } else if (error.code === 'ERR_NETWORK') {
        alert('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
      } else {
        alert('Gagal mendownload laporan PDF. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportType && dateRange.startDate && dateRange.endDate) {
      fetchReportData();
    }
  }, [reportType, dateRange]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Laporan</h1>
            <p className="text-gray-600 mt-1">Laporan lengkap sistem peminjaman inventaris</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Filter Laporan</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Laporan
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="lengkap">Laporan Lengkap</option>
                <option value="ringkasan">Ringkasan Saja</option>
                <option value="peminjaman">Focus Peminjaman</option>
                <option value="inventaris">Focus Inventaris</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Selesai
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Download Button */}
            <div className="flex items-end">
              <button
                onClick={() => downloadPDF()}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Report Preview Info */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview Laporan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Report Info */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Jenis Laporan</p>
                  <p className="text-lg font-bold text-blue-900 capitalize">{reportType}</p>
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-500 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">Periode</p>
                  <p className="text-sm font-bold text-green-900">
                    {new Date(dateRange.startDate).toLocaleDateString('id-ID')} - {new Date(dateRange.endDate).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Days */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-800">Total Hari</p>
                  <p className="text-lg font-bold text-purple-900">
                    {Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24)) + 1} hari
                  </p>
                </div>
              </div>
            </div>

            {/* File Info */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center">
                <div className="p-2 bg-orange-500 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-800">Format File</p>
                  <p className="text-lg font-bold text-orange-900">PDF</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What's Included */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Yang Termasuk dalam Laporan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column */}
            <div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">📊 Statistik Dashboard Lengkap</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">📋 Detail Peminjaman per Periode</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">📦 Inventaris Produk Terkini</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">👥 Data Pengguna Aktif</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">⚠️ Alert Keterlambatan</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">📈 Grafik & Chart Visual</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">🏆 Top Produk Dipinjam</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">💡 Rekomendasi & Insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;