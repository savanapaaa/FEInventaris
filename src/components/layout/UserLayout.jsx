/**
 * UserLayout - Layout untuk halaman user
 * Menggabungkan Navbar, Sidebar, dan Content
 */

import React, { useState } from 'react';
import Navbar from '../Navbar';
import UserSidebar from './UserSidebar';
import WhatsAppCS from '../WhatsAppCS';

const UserLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        <UserSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* WhatsApp Customer Service Floating Button */}
      <WhatsAppCS />
    </div>
  );
};

export default UserLayout;