'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/actions/auth';
import { IconLayoutDashboard, IconBook2, IconSettings, IconLogout, IconX, IconCircles } from '@tabler/icons-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] md:hidden" 
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <div className={`w-56 fixed inset-y-0 left-0 bg-[#F4F5F6] border-r border-slate-200/60 px-6 py-10 flex flex-col justify-between z-[100] transition-transform duration-500 ease-in-out
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} md:translate-x-0 md:flex`}>
        
        <div>
          <div className="flex items-center justify-between mb-10">
            <Link href="/dashboard" className="block focus:outline-none" onClick={onClose}>
              <div className="flex items-center gap-3">
                <Image 
                  src="/logo.png" 
                  alt="BookBuddy" 
                  width={120} 
                  height={30} 
                  priority 
                  style={{ height: 'auto' }}
                  className="object-contain"
                />
              </div>
            </Link>
          </div>
          
          <nav className="space-y-3">
            <Link 
              href="/dashboard" 
              onClick={onClose}
              className={`flex items-center gap-4 py-3 font-semibold text-[15px] transition-colors relative outline-none ${(pathname === '/dashboard' || pathname === '/') ? 'text-[#10175b]' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {(pathname === '/dashboard' || pathname === '/') && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute left-[-24px] w-1.5 h-6 bg-[#10175b] rounded-r-md"
                />
              )}
              <IconLayoutDashboard size={20} className={(pathname === '/dashboard' || pathname === '/') ? 'text-[#10175b]' : 'text-slate-400'} />
              Dashboard
            </Link>
            
            <Link 
              href="/library" 
              onClick={onClose}
              className={`flex items-center gap-4 py-3 font-semibold text-[15px] transition-colors relative outline-none ${(pathname === '/library' || pathname.startsWith('/books/')) ? 'text-[#10175b]' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {(pathname === '/library' || pathname.startsWith('/books/')) && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute left-[-24px] w-1.5 h-6 bg-[#10175b] rounded-r-md"
                />
              )}
              <IconBook2 size={20} className={(pathname === '/library' || pathname.startsWith('/books/')) ? 'text-[#10175b]' : 'text-slate-400'} />
              My Library
            </Link>

            <Link 
              href="/word-pool" 
              onClick={onClose}
              className={`flex items-center gap-4 py-3 font-semibold text-[15px] transition-colors relative outline-none ${pathname === '/word-pool' ? 'text-[#10175b]' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {pathname === '/word-pool' && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute left-[-24px] w-1.5 h-6 bg-[#10175b] rounded-r-md"
                />
              )}
              <IconCircles size={20} className={pathname === '/word-pool' ? 'text-[#10175b]' : 'text-slate-400'} />
              Word Pool
            </Link>

            <Link 
              href="/settings" 
              onClick={onClose}
              className={`flex items-center gap-4 py-3 font-semibold text-[15px] transition-colors relative outline-none ${pathname === '/settings' ? 'text-[#10175b]' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {pathname === '/settings' && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute left-[-24px] w-1.5 h-6 bg-[#10175b] rounded-r-md"
                />
              )}
              <IconSettings size={20} className={pathname === '/settings' ? 'text-[#10175b]' : 'text-slate-400'} />
              Settings
            </Link>
          </nav>
        </div>

        <div className="space-y-6 pt-8 border-t border-slate-200">
          <form action={logout}>
            <button className="flex items-center gap-3 text-slate-500 hover:text-[#10175b] transition-colors font-semibold px-2 focus:outline-none">
              <IconLogout size={20} className="text-slate-400" /> Logout
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
