'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/actions/auth';
import { LayoutDashboard, BookOpen, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <div className="w-64 fixed inset-y-0 left-0 bg-[#F4F5F6] border-r border-slate-200/60 px-8 py-10 flex flex-col justify-between hidden md:flex cursor-pointer">
        
        <div>
          <Link href="/dashboard"><h1 className="text-3xl font-serif font-bold text-[#10175b] mb-1">The Scholar</h1></Link>
          <p className="text-[13px] text-slate-500 mb-12 font-medium tracking-wide">Tamil / Sinhala</p>
          
          <nav className="space-y-3">
            <Link 
              href="/dashboard" 
              className={`flex items-center gap-4 py-3 font-semibold text-[15px] transition-colors relative ${(pathname === '/dashboard' || pathname === '/') ? 'text-[#10175b]' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {(pathname === '/dashboard' || pathname === '/') && (
                <div className="absolute left-[-32px] w-1.5 h-6 bg-[#10175b] rounded-r-md"></div>
              )}
              <LayoutDashboard size={20} className={(pathname === '/dashboard' || pathname === '/') ? 'text-[#10175b]' : 'text-slate-400'} />
              Dashboard
            </Link>
            
            <Link 
              href="/library" 
              className={`flex items-center gap-4 py-3 font-semibold text-[15px] transition-colors relative ${pathname === '/library' ? 'text-[#10175b]' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {pathname === '/library' && (
                <div className="absolute left-[-32px] w-1.5 h-6 bg-[#10175b] rounded-r-md"></div>
              )}
              <BookOpen size={20} className={pathname === '/library' ? 'text-[#10175b]' : 'text-slate-400'} />
              My Library
            </Link>

            <Link 
              href="#" 
              className="flex items-center gap-4 py-3 font-semibold text-[15px] text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Settings size={20} className="text-slate-400" />
              Settings
            </Link>
          </nav>
        </div>

        <div className="space-y-6 pt-8 border-t border-slate-200">
          <form action={logout}>
            <button className="flex items-center gap-3 text-slate-500 hover:text-[#10175b] transition-colors font-semibold px-2">
              <LogOut size={20} className="text-slate-400" /> Logout
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
