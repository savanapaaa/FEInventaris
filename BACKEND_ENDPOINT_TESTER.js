/**
 * QUICK BACKEND TEST - Copy ke browser console atau run di terminal
 */

// 🧪 TEST BACKEND ENDPOINTS
async function testBackendEndpoints() {
  const baseURL = 'http://localhost:5000';
  const token = localStorage.getItem('token');
  
  console.log('🚀 Testing Backend Endpoints...\n');
  
  // Test 1: Check if backend is running
  try {
    const response = await fetch(`${baseURL}/api/stats`);
    console.log('✅ Backend is running:', response.status);
  } catch (error) {
    console.log('❌ Backend not running or not accessible');
    return;
  }
  
  // Test 2: Check auth
  if (!token) {
    console.log('❌ No token found. Please login first.');
    return;
  }
  console.log('✅ Token found');
  
  // Test 3: Check laporan endpoints
  const endpoints = [
    '/api/laporan/preview',
    '/api/laporan/download'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseURL}${endpoint}?type=lengkap`, {
        method: 'HEAD',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`${response.ok ? '✅' : '❌'} ${endpoint}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${endpoint}: Error -`, error.message);
    }
  }
  
  // Test 4: Actual API call
  try {
    const response = await fetch(`${baseURL}/api/laporan/preview?type=lengkap&start_date=2025-01-01&end_date=2025-01-31`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Preview API working! Data:', data);
    } else {
      const error = await response.text();
      console.log('❌ Preview API failed:', response.status, error);
    }
  } catch (error) {
    console.log('❌ Preview API error:', error);
  }
}

// Quick functions for console use
window.testBackend = testBackendEndpoints;

console.log(`
🔧 BACKEND TEST TOOLS

Run in console:
• testBackend() - Test all endpoints

Manual endpoints to check:
• GET http://localhost:5000/api/laporan/preview?type=lengkap
• GET http://localhost:5000/api/laporan/download?type=lengkap

Required headers:
• Authorization: Bearer YOUR_TOKEN
• Content-Type: application/json
`);