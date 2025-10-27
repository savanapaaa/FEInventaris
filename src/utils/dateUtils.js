/**
 * Date Formatting Utilities
 * Utility functions untuk format tanggal Indonesia yang konsisten
 */

/**
 * Format tanggal Indonesia dengan deteksi otomatis
 * @param {string} dateString - Date string dari backend
 * @returns {string} - Formatted date
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    // Backend sekarang kirim TIMESTAMP format: "YYYY-MM-DD HH:MM:SS"
    let date = new Date(dateString);
    
    // Check if the date seems to be in wrong timezone (UTC vs WIB)
    const now = new Date();
    const hourDiff = Math.abs(date.getHours() - now.getHours());
    
    // If more than 6 hours different, likely timezone issue
    if (hourDiff > 6 && hourDiff < 18) {
      console.warn('⚠️ Possible timezone mismatch detected:', {
        original: dateString,
        parsed: date.toISOString(),
        localTime: now.toISOString()
      });
    }
    
    // Selalu tampilkan dengan jam karena backend sudah TIMESTAMP
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta' // Force ke WIB
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format tanggal bisnis (tanggal pinjam, kembali) - tanpa jam
 * @param {string} dateString - Date string format YYYY-MM-DD
 * @returns {string} - "27 Oktober 2025"
 */
export const formatBusinessDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    // Untuk format YYYY-MM-DD, buat date object dengan hati-hati
    let date;
    if (dateString.includes('T')) {
      // Jika sudah ada timestamp
      date = new Date(dateString);
    } else {
      // Jika hanya tanggal YYYY-MM-DD, parse manual untuk menghindari timezone issue
      const [year, month, day] = dateString.split('-');
      date = new Date(year, month - 1, day); // month - 1 karena JS month dimulai dari 0
    }
    
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting business date:', error);
    return dateString;
  }
};

/**
 * Format audit timestamp (created_at, updated_at) - dengan jam
 * @param {string} dateString - Timestamp string format YYYY-MM-DD HH:MM:SS
 * @returns {string} - "27 Oktober 2025, 14:30"
 */
export const formatAuditTimestamp = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    });
  } catch (error) {
    console.error('Error formatting audit timestamp:', error);
    return dateString;
  }
};

/**
 * Format tanggal saja (tanpa jam)
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date "27 Oktober 2025"
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Jakarta'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format jam saja
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted time "14:30"
 */
export const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return dateString;
  }
};

/**
 * Format relative time (waktu relatif)
 * @param {string} dateString - ISO date string
 * @returns {string} - Relative time "3 jam yang lalu", "2 hari lagi"
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Baru saja';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} menit yang lalu`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} jam yang lalu`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} hari yang lalu`;
    } else {
      // Jika lebih dari seminggu, tampilkan tanggal lengkap
      return formatDateTime(dateString);
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return dateString;
  }
};

/**
 * Format tanggal dengan pemisah visual untuk table
 * @param {string} dateString - ISO date string
 * @returns {JSX.Element} - Formatted JSX with date and time separated
 */
export const formatDateTimeTable = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Jakarta'
    });
    const timeStr = date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    });
    
    return `${dateStr} ${timeStr}`;
  } catch (error) {
    console.error('Error formatting date for table:', error);
    return dateString;
  }
};

/**
 * Check if date is overdue
 * @param {string} dateString - ISO date string
 * @returns {boolean} - True if date is in the past
 */
export const isOverdue = (dateString) => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    return date < now;
  } catch (error) {
    console.error('Error checking overdue:', error);
    return false;
  }
};

/**
 * Calculate days remaining until date
 * @param {string} dateString - ISO date string
 * @returns {number} - Number of days (negative if overdue)
 */
export const getDaysRemaining = (dateString) => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    console.error('Error calculating days remaining:', error);
    return null;
  }
};