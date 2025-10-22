# Mapping Field Backend ke Frontend

## Masalah yang Diselesaikan

Backend Express mengembalikan data user dengan field `peran`, namun frontend React menggunakan `user.role` untuk mengecek hak akses. Hal ini menyebabkan `user.role` menjadi `undefined` dan sistem authorization tidak berfungsi.

## Solusi

Menambahkan fungsi `normalizeUserData()` di `AuthContext.jsx` yang secara otomatis memetakan field `peran` dari backend ke `user.role` di frontend.

## Perubahan yang Dibuat

### 1. AuthContext.jsx - Fungsi Normalisasi Data

```javascript
// Helper function untuk mapping field dari backend ke frontend
const normalizeUserData = (userData) => {
  if (!userData) return null;
  
  // Mapping field 'peran' dari backend ke 'role' untuk frontend
  const normalizedUser = {
    ...userData,
    role: userData.peran || userData.role // Gunakan 'peran' jika ada, fallback ke 'role'
  };
  
  // Normalize role to lowercase untuk konsistensi
  if (normalizedUser.role) {
    normalizedUser.role = normalizedUser.role.toLowerCase();
  }
  
  return normalizedUser;
};
```

### 2. Implementasi pada Login

Fungsi `login()` sekarang menggunakan `normalizeUserData()`:

```javascript
const login = async (email, kata_sandi) => {
  try {
    const response = await api.post('/api/login', {
      email,
      kata_sandi,
    });

    const { token, user } = response.data;
    
    // Normalize user data (mapping peran -> role)
    const normalizedUser = normalizeUserData(user);
    
    // Save to localStorage dan update state
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
    
    return { success: true, user: normalizedUser };
  } catch (error) {
    // error handling
  }
};
```

### 3. Implementasi pada useEffect (Stored User)

Data user yang tersimpan di localStorage juga dinormalisasi:

```javascript
useEffect(() => {
  const storedUser = localStorage.getItem('user');
  
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      
      // Normalize stored user data juga
      const normalizedUser = normalizeUserData(parsedUser);
      setUser(normalizedUser);
      
      // Update localStorage dengan data yang sudah dinormalisasi
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    } catch (error) {
      // error handling
    }
  }
}, []);
```

## Mapping Field

| Backend Field | Frontend Field | Keterangan |
|---------------|----------------|------------|
| `peran`       | `role`         | Primary mapping |
| `role`        | `role`         | Fallback jika `peran` tidak ada |

## Contoh Data

### Data dari Backend:
```json
{
  "id": 1,
  "nama": "Admin User",
  "email": "admin@inventaris.com",
  "peran": "Admin"
}
```

### Data Setelah Normalisasi:
```json
{
  "id": 1,
  "nama": "Admin User", 
  "email": "admin@inventaris.com",
  "peran": "Admin",
  "role": "admin"  // ← Field baru yang ditambahkan
}
```

## Debug Logs

Sistem akan menampilkan debug logs untuk memudahkan troubleshooting:

```
🔍 User Data Mapping:
  - Original backend data: { id: 1, nama: "Admin", peran: "Admin" }
  - Field "peran": Admin
  - Field "role": undefined
  - Final mapped role: admin
  - Normalized user: { id: 1, nama: "Admin", peran: "Admin", role: "admin" }
```

## Testing

1. **Login dengan user admin**:
   - Backend mengirim `peran: "Admin"`
   - Frontend otomatis mapping ke `role: "admin"`
   - ProtectedRoute dengan `requiredRole="admin"` berfungsi

2. **Login dengan user biasa**:
   - Backend mengirim `peran: "Pengguna"`
   - Frontend otomatis mapping ke `role: "pengguna"`
   - ProtectedRoute dengan `requiredRole="pengguna"` berfungsi

## Keuntungan

1. **Backward Compatible**: Tetap support field `role` jika backend berubah
2. **No Backend Changes**: Tidak perlu mengubah struktur backend
3. **Automatic**: Mapping berjalan otomatis di semua scenario (login, reload page)
4. **Consistent**: Role selalu dalam lowercase untuk konsistensi
5. **Debug Friendly**: Logs memudahkan troubleshooting

## Cara Kerja di App.jsx

```javascript
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  
  // user.role sekarang sudah tersedia dan tidak undefined
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect logic
  }
  
  return children;
};
```

## Kesimpulan

Dengan perubahan ini, field `peran` dari backend otomatis dipetakan ke `user.role` di frontend tanpa perlu mengubah struktur backend. Sistem authorization sekarang berfungsi dengan benar.