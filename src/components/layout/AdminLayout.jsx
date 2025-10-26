/**
 * AdminLayout - Layout untuk halaman admin
 * Menggabungkan Navbar, Sidebar, dan Content
 */

import React, { useState } from 'react';
import Navbar from '../Navbar';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <div className="flex-1 lg:ml-0 w-full min-w-0">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="p-4 sm:p-6 lg:p-8 max-w-full overflow-x-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;