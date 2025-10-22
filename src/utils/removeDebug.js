/**
 * Remove Debug Components Script
 * Script untuk menghapus semua debug component yang mungkin tersisa
 */

// Jika ada debug component yang di-inject via JavaScript
if (typeof window !== 'undefined') {
  // Remove any debug divs or components
  const debugElements = document.querySelectorAll('[data-debug], .debug, [class*="debug"]');
  debugElements.forEach(element => {
    element.remove();
  });
  
  // Remove console debug functions
  const originalConsole = console;
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
  }
}

// Export empty object to make this a module
export default {};