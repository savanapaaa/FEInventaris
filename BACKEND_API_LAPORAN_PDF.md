# 📊 BACKEND API REQUIREMENTS - LAPORAN PDF (SIMPLIFIED)

## 🎯 Overview
API backend yang diperlukan untuk fitur **Laporan Unified dengan Download PDF** - **Satu endpoint untuk semua jenis laporan**.

---

## 🔧 Required Backend Changes

### 1. **Install Dependencies** (Node.js/Express)
```bash
npm install pdfkit
# atau alternatif lain: puppeteer, jspdf, html-pdf
```

### 2. **API Endpoints Required (SIMPLIFIED)**

#### **GET /api/reports/preview**
Mendapatkan data preview untuk dashboard laporan
```javascript
// Request
GET /api/reports/preview?type=lengkap&start_date=2025-01-01&end_date=2025-01-31

// Response
{
  "success": true,
  "data": {
    "total_borrowings": 150,
    "active_products": 45,
    "overdue_count": 8,
    "total_users": 25,
    "period": "2025-01-01 to 2025-01-31"
  }
}
```

#### **GET /api/reports/download** ⭐ (MAIN ENDPOINT)
Download PDF report berdasarkan filter yang dipilih
```javascript
// Request
GET /api/reports/download?type=lengkap&start_date=2025-01-01&end_date=2025-01-31

// Response Headers
Content-Type: application/pdf
Content-Disposition: attachment; filename="Laporan-Lengkap-2025-01-01-2025-01-31.pdf"

// Response Body
[PDF Binary Data]
```

---

## 📋 Report Types & Dynamic Content

### **Parameter `type` Values:**
1. **`lengkap`** - Laporan komprehensif dengan semua data
2. **`ringkasan`** - Hanya statistik dan summary
3. **`peminjaman`** - Focus pada data peminjaman
4. **`inventaris`** - Focus pada data produk/inventaris

### **Dynamic PDF Content Based on Type:**

#### **`type=lengkap` (Recommended Default)**
```
📊 LAPORAN LENGKAP SISTEM PEMINJAMAN INVENTARIS
Periode: [start_date] - [end_date]
Generated: [current_date]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 RINGKASAN STATISTIK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Total Produk: [total_produk]
• Total Peminjaman: [total_peminjaman] 
• Sedang Dipinjam: [sedang_dipinjam]
• Total Pengguna: [total_pengguna]
• Peminjaman Terlambat: [terlambat] ⚠️

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DETAIL PEMINJAMAN PERIODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Table: ID | Peminjam | Produk | Tgl Pinjam | Tgl Kembali | Status]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 INVENTARIS PRODUK TERKINI  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Table: Nama Produk | Kategori | Stok | Tersedia | Dipinjam]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ ALERT & RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Peminjaman terlambat yang perlu follow-up
• Produk dengan stok rendah  
• Top produk yang sering dipinjam
• Rekomendasi untuk optimasi sistem

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 KONTAK & TINDAK LANJUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[List peminjam yang perlu dihubungi untuk pengembalian]
```

#### **`type=ringkasan`**
```
� LAPORAN RINGKASAN
[Hanya bagian statistik + chart visual]
```

#### **`type=peminjaman`** 
```
� LAPORAN FOKUS PEMINJAMAN
[Detail lengkap semua peminjaman + analysis]
```

#### **`type=inventaris`**
```
📦 LAPORAN FOKUS INVENTARIS  
[Detail lengkap produk/stok + usage analytics]
```

---

## 💻 Backend Implementation Example (Node.js/Express)

### **1. Main Route Handler**
```javascript
const PDFDocument = require('pdfkit');

app.get('/api/reports/download', async (req, res) => {
  try {
    const { type = 'lengkap', start_date, end_date } = req.query;
    
    // Validate dates
    if (!start_date || !end_date) {
      return res.status(400).json({ 
        success: false, 
        message: 'start_date dan end_date required' 
      });
    }
    
    // Generate PDF berdasarkan type
    const pdfBuffer = await generateUnifiedPDF(type, start_date, end_date);
    
    // Dynamic filename
    const typeNames = {
      'lengkap': 'Lengkap',
      'ringkasan': 'Ringkasan', 
      'peminjaman': 'Peminjaman',
      'inventaris': 'Inventaris'
    };
    
    const filename = `Laporan-${typeNames[type]}-${start_date}-${end_date}.pdf`;
    
    // Set headers untuk download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal generate PDF: ' + error.message 
    });
  }
});

app.get('/api/reports/preview', async (req, res) => {
  try {
    const { type, start_date, end_date } = req.query;
    
    // Get summary data untuk preview
    const data = await getReportSummary(start_date, end_date);
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

### **2. Unified PDF Generation Function**
```javascript
async function generateUnifiedPDF(type, startDate, endDate) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header Universal
      doc.fontSize(24)
         .fillColor('#2563eb')
         .text('SISTEM PEMINJAMAN INVENTARIS', { align: 'center' });
         
      doc.moveDown(0.5)
         .fontSize(16)
         .fillColor('#374151')
         .text(`Laporan ${type.charAt(0).toUpperCase() + type.slice(1)}`, { align: 'center' });
         
      doc.moveDown(0.3)
         .fontSize(12)
         .fillColor('#6b7280')
         .text(`Periode: ${startDate} - ${endDate}`, { align: 'center' });
         
      doc.moveDown(0.3)
         .text(`Generated: ${new Date().toLocaleString('id-ID')}`, { align: 'center' });

      doc.moveDown(2);

      // Content berdasarkan type
      switch(type) {
        case 'lengkap':
          await addLengkapContent(doc, startDate, endDate);
          break;
        case 'ringkasan':
          await addRingkasanContent(doc, startDate, endDate);
          break;
        case 'peminjaman':
          await addPeminjamanContent(doc, startDate, endDate);
          break;
        case 'inventaris':
          await addInventarisContent(doc, startDate, endDate);
          break;
        default:
          await addLengkapContent(doc, startDate, endDate);
      }
      
      // Footer
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(10)
           .fillColor('#9ca3af')
           .text(`Halaman ${i + 1} dari ${pages.count}`, 
                  50, 
                  doc.page.height - 50, 
                  { align: 'center' });
      }
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
```

### **3. Database Queries**
```javascript
async function getReportSummary(startDate, endDate) {
  // Query untuk mendapatkan summary data
  const stats = await db.query(`
    SELECT 
      COUNT(DISTINCT p.id) as total_products,
      COUNT(DISTINCT pm.id) as total_borrowings,
      COUNT(DISTINCT CASE WHEN pm.status = 'dipinjam' THEN pm.id END) as active_borrowings,
      COUNT(DISTINCT u.id) as total_users,
      COUNT(DISTINCT CASE WHEN pm.tanggal_kembali < NOW() AND pm.status = 'dipinjam' THEN pm.id END) as overdue_count
    FROM produk p
    LEFT JOIN peminjaman pm ON p.id = pm.produk_id 
      AND pm.tanggal_pinjam BETWEEN ? AND ?
    LEFT JOIN pengguna u ON pm.pengguna_id = u.id
  `, [startDate, endDate]);
  
  return stats[0];
}

async function getAllBorrowings(startDate, endDate) {
  return await db.query(`
    SELECT 
      pm.id,
      u.nama_lengkap as peminjam,
      p.nama as produk,
      pm.tanggal_pinjam,
      pm.tanggal_kembali,
      pm.status,
      CASE 
        WHEN pm.tanggal_kembali < NOW() AND pm.status = 'dipinjam' 
        THEN DATEDIFF(NOW(), pm.tanggal_kembali)
        ELSE 0 
      END as hari_terlambat
    FROM peminjaman pm
    JOIN pengguna u ON pm.pengguna_id = u.id
    JOIN produk p ON pm.produk_id = p.id  
    WHERE pm.tanggal_pinjam BETWEEN ? AND ?
    ORDER BY pm.tanggal_pinjam DESC
  `, [startDate, endDate]);
}
```

---

## � Quick Start Backend

**1. Install dependency:**
```bash
npm install pdfkit
```

**2. Add routes:**
```javascript
app.get('/api/reports/preview', getReportPreview);
app.get('/api/reports/download', downloadReportPDF);
```

**3. Test endpoint:**
```bash
# Preview data
GET http://localhost:5000/api/reports/preview?type=lengkap&start_date=2025-01-01&end_date=2025-01-31

# Download PDF  
GET http://localhost:5000/api/reports/download?type=lengkap&start_date=2025-01-01&end_date=2025-01-31
```

---

## 📱 Frontend Integration Status

✅ **FRONTEND READY** dengan fitur:
- Single filter form dengan 4 jenis laporan
- One big download button dengan loading state
- Preview cards menampilkan info periode & jenis laporan  
- Responsive design & user-friendly interface
- Error handling & file naming

⏳ **BACKEND NEEDED:**
- 2 endpoints: `/preview` dan `/download`
- PDF generation dengan PDFKit
- Dynamic content berdasarkan parameter `type`

**Much cleaner & simpler approach!** 🎉