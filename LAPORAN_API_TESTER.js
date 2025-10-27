/**
 * TEST LAPORAN API - Copy paste ke Browser Console untuk testing
 * Pastikan sudah login sebagai admin dan token tersimpan di localStorage
 */

// 🧪 TEST 1: Check if token exists
function checkToken() {
  const token = localStorage.getItem('token');
  console.log('🔑 Token:', token ? 'EXISTS' : 'NOT FOUND');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('👤 User:', payload.nama_lengkap, '| Role:', payload.peran);
      console.log('⏰ Expires:', new Date(payload.exp * 1000));
    } catch (e) {
      console.log('❌ Invalid token format');
    }
  }
  return !!token;
}

// 🧪 TEST 2: Test preview endpoint
async function testPreview(type = 'lengkap') {
  const token = localStorage.getItem('token');
  if (!token) return console.log('❌ No token found');
  
  try {
    console.log(`🔍 Testing preview with type: ${type}`);
    
    const response = await fetch(`/api/laporan/preview?type=${type}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Preview data:', data);
    } else {
      const error = await response.text();
      console.log('❌ Error response:', error);
    }
  } catch (error) {
    console.log('❌ Fetch error:', error);
  }
}

// 🧪 TEST 3: Test download endpoint (check if responds)
async function testDownloadCheck(type = 'lengkap') {
  const token = localStorage.getItem('token');
  if (!token) return console.log('❌ No token found');
  
  try {
    console.log(`📄 Testing download availability with type: ${type}`);
    
    const response = await fetch(`/api/laporan/download?type=${type}`, {
      method: 'HEAD', // Only check if endpoint exists
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📄 Download endpoint status:', response.status);
    console.log('📄 Content-Type:', response.headers.get('content-type'));
    
    if (response.ok) {
      console.log('✅ Download endpoint is available!');
    } else {
      console.log('❌ Download endpoint not available');
    }
  } catch (error) {
    console.log('❌ Download test error:', error);
  }
}

// 🧪 TEST 4: Full download test (small file)
async function testDownload(type = 'ringkasan') {
  const token = localStorage.getItem('token');
  if (!token) return console.log('❌ No token found');
  
  try {
    console.log(`📥 Testing actual download with type: ${type}`);
    
    const response = await fetch(`/api/laporan/download?type=${type}`, {
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      console.log('✅ PDF downloaded! Size:', blob.size, 'bytes');
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-laporan-${type}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('💾 File downloaded to browser!');
    } else {
      const error = await response.text();
      console.log('❌ Download failed:', error);
    }
  } catch (error) {
    console.log('❌ Download error:', error);
  }
}

// 🚀 RUN ALL TESTS
async function runAllTests() {
  console.log('🚀 Starting Laporan API Tests...\n');
  
  console.log('--- TEST 1: Check Token ---');
  if (!checkToken()) return;
  
  console.log('\n--- TEST 2: Preview Endpoint ---');
  await testPreview('lengkap');
  
  console.log('\n--- TEST 3: Download Check ---');
  await testDownloadCheck('ringkasan');
  
  console.log('\n--- TEST 4: Actual Download ---');
  await testDownload('ringkasan');
  
  console.log('\n🎉 All tests completed!');
}

// 📋 USAGE INSTRUCTIONS:
console.log(`
🧪 LAPORAN API TESTING TOOLS

Copy paste these commands in browser console:

1. checkToken()           - Check if admin token exists
2. testPreview('lengkap') - Test preview endpoint
3. testDownloadCheck()    - Check download endpoint availability
4. testDownload()         - Download actual PDF
5. runAllTests()          - Run all tests sequentially

Example:
> runAllTests()
`);

// Auto-export for console use
window.laporanTest = {
  checkToken,
  testPreview,
  testDownloadCheck,
  testDownload,
  runAllTests
};