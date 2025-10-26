# 📸 Spesifikasi Backend untuk Upload Foto Bukti Pengembalian

## 🎯 Overview
Fitur upload foto bukti pengembalian memerlukan backend yang dapat menerima file upload dan menyimpannya ke database beserta metadata pengembalian.

## 📋 Database Schema Changes

### Table: `peminjaman`
```sql
-- Tambahkan kolom berikut ke table peminjaman
ALTER TABLE peminjaman ADD COLUMN foto_bukti_pengembalian VARCHAR(255);
ALTER TABLE peminjaman ADD COLUMN kondisi_kembali ENUM('Baik', 'Rusuk Ringan', 'Rusak Berat', 'Hilang') DEFAULT 'Baik';
ALTER TABLE peminjaman ADD COLUMN catatan_pengembalian TEXT;
```

## 🔌 API Endpoint Required

### `PUT /api/peminjaman/:id/kembalikan`

**Request:**
- **Method**: PUT
- **Content-Type**: `multipart/form-data`
- **Headers**: `Authorization: Bearer <token>`

**Form Data Parameters:**
```javascript
{
  kondisi_kembali: "Baik" | "Rusak Ringan" | "Rusak Berat" | "Hilang",
  catatan: "String optional - catatan user",
  foto_bukti: File // File object dari frontend
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Item berhasil dikembalikan",
  "data": {
    "id": 123,
    "status": "dikembalikan",
    "tanggal_kembali_aktual": "2025-10-26",
    "foto_url": "/uploads/bukti-pengembalian/1729932000-123456789.jpg"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Foto bukti wajib diupload",
  "errors": {
    "foto_bukti": "File foto tidak ditemukan"
  }
}
```

## 💻 Backend Implementation Example (Node.js + Express)

### 1. Package Dependencies
```bash
npm install multer path fs
```

### 2. File Upload Configuration
```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'uploads/bukti-pengembalian';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diizinkan (JPEG, JPG, PNG, GIF)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});
```

### 3. API Route Implementation
```javascript
app.put('/api/peminjaman/:id/kembalikan', 
  authenticateToken, // Middleware auth
  upload.single('foto_bukti'), // Multer middleware
  async (req, res) => {
    try {
      const { id } = req.params;
      const { kondisi_kembali, catatan } = req.body;
      const userId = req.user.id; // Dari JWT token

      // Validate required file
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Foto bukti pengembalian wajib diupload',
          errors: { foto_bukti: 'File foto tidak ditemukan' }
        });
      }

      // Validate kondisi_kembali
      const validKondisi = ['Baik', 'Rusak Ringan', 'Rusak Berat', 'Hilang'];
      if (!validKondisi.includes(kondisi_kembali)) {
        return res.status(400).json({
          success: false,
          message: 'Kondisi kembali tidak valid',
          errors: { kondisi_kembali: 'Pilih kondisi yang valid' }
        });
      }

      // Check if peminjaman exists and belongs to user
      const peminjaman = await db.query(
        'SELECT * FROM peminjaman WHERE id = ? AND id_pengguna = ?',
        [id, userId]
      );

      if (!peminjaman || peminjaman.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Peminjaman tidak ditemukan'
        });
      }

      // Check if already returned
      if (peminjaman[0].status === 'dikembalikan') {
        return res.status(400).json({
          success: false,
          message: 'Item sudah dikembalikan sebelumnya'
        });
      }

      // Build photo URL
      const fotoUrl = `/uploads/bukti-pengembalian/${req.file.filename}`;

      // Update peminjaman
      await db.query(
        `UPDATE peminjaman 
         SET status = 'dikembalikan', 
             tanggal_kembali_aktual = NOW(),
             kondisi_kembali = ?,
             catatan_pengembalian = ?,
             foto_bukti_pengembalian = ?
         WHERE id = ?`,
        [kondisi_kembali, catatan, fotoUrl, id]
      );

      // Update product stock (kembalikan stok)
      await db.query(
        'UPDATE produk SET jumlah_stok = jumlah_stok + ? WHERE id = ?',
        [peminjaman[0].jumlah_dipinjam, peminjaman[0].produk_id]
      );

      // Response
      res.json({
        success: true,
        message: 'Item berhasil dikembalikan',
        data: {
          id: parseInt(id),
          status: 'dikembalikan',
          tanggal_kembali_aktual: new Date().toISOString().split('T')[0],
          foto_url: fotoUrl
        }
      });

    } catch (error) {
      console.error('Error returning item:', error);
      
      // Delete uploaded file if database error
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }

      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        error: error.message
      });
    }
  }
);
```

### 4. Static File Serving
```javascript
// Serve uploaded files
app.use('/uploads', express.static('uploads'));
```

## 🔒 Security Considerations

1. **File Type Validation**: Hanya terima file gambar
2. **File Size Limit**: Maksimal 5MB
3. **Authentication**: Pastikan user yang return adalah pemilik peminjaman
4. **File Name Sanitization**: Generate unique filename
5. **Directory Traversal**: Validasi path upload

## 📊 Database Migration Script
```sql
-- Migration untuk menambah kolom foto bukti
ALTER TABLE peminjaman 
ADD COLUMN foto_bukti_pengembalian VARCHAR(255) AFTER tanggal_kembali_aktual,
ADD COLUMN kondisi_kembali ENUM('Baik', 'Rusak Ringan', 'Rusak Berat', 'Hilang') DEFAULT 'Baik' AFTER foto_bukti_pengembalian,
ADD COLUMN catatan_pengembalian TEXT AFTER kondisi_kembali;

-- Index untuk performa
CREATE INDEX idx_peminjaman_foto ON peminjaman(foto_bukti_pengembalian);
```

## 🎯 Frontend Integration Points

Frontend sudah siap dengan:
- ✅ FormData upload
- ✅ File validation (type & size)
- ✅ Error handling  
- ✅ Success response handling
- ✅ Fallback untuk development mode

Setelah backend diimplementasi, foto akan otomatis tersimpan ke database dan dapat diakses oleh admin panel untuk verifikasi kondisi barang.