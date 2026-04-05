'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './sidebar';
import MobileNav from './mobile-nav';
import { motion, AnimatePresence } from 'framer-motion';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const pathname = usePathname();

  // Handle hydration syncing
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Prevent scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen && hasMounted) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen, hasMounted]);

  // Handle flash-free hydration
  if (!hasMounted) {
    return (
      <div className="flex min-h-screen bg-[#F4F5F6] opacity-0">
        <div className="flex-1" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F4F5F6]">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <MobileNav onOpenMenu={() => setIsSidebarOpen(true)} />
        
        {/* overflow-y-scroll ensures the scrollbar gutter is always present, preventing horizontal shifting */}
        <main className="flex-1 md:ml-56 mt-16 md:mt-0 overflow-y-scroll overflow-x-hidden scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
