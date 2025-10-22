/**
 * UserLayout - Layout untuk halaman user
 * Menggabungkan Navbar, Sidebar, dan Content
 */

import React, { useState } from 'react';
import Navbar from '../Navbar';
import UserSidebar from './UserSidebar';

const UserLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <UserSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <div className="flex-1 lg:ml-0">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserLayout;