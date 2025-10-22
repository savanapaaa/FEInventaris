/**
 * Test File untuk memverifikasi mapping field peran
 * Simulasi data backend dan test konsistency
 */

// Simulasi data dari backend
const mockBackendUserData = {
  "id": 1,
  "nama_pengguna": "Admin",
  "email": "admin@inventaris.com",
  "peran": "admin"
};

// Simulasi normalizeUserData function
const normalizeUserData = (userData) => {
  if (!userData) return null;
  
  // Tidak perlu mapping, simpan user data sesuai struktur backend
  const normalizedUser = {
    ...userData
  };
  
  // Normalize peran to lowercase untuk konsistensi
  if (normalizedUser.peran) {
    normalizedUser.peran = normalizedUser.peran.toLowerCase();
  }
  
  console.log('🔍 User Data Mapping:');
  console.log('  - Original backend data:', userData);
  console.log('  - Stored user data:', normalizedUser);
  console.log('  - Stored user role:', normalizedUser.peran);
  
  return normalizedUser;
};

// Test functions
const isAdmin = (user) => {
  return user?.peran?.toLowerCase() === 'admin';
};

const isUser = (user) => {
  const peran = user?.peran?.toLowerCase();
  return peran === 'pengguna' || peran === 'user';
};

// Test execution
console.log('=== TESTING FIELD MAPPING ===');
const processedUser = normalizeUserData(mockBackendUserData);
console.log('');
console.log('=== TESTING ROLE CHECKS ===');
console.log('isAdmin(user):', isAdmin(processedUser));
console.log('isUser(user):', isUser(processedUser));
console.log('');
console.log('=== EXPECTED CONSOLE OUTPUT ===');
console.log('Stored user data: {id: 1, nama_pengguna: "Admin", email: "admin@inventaris.com", peran: "admin"}');
console.log('Stored user role: admin');

export { normalizeUserData, isAdmin, isUser };