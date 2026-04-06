import Link from 'next/link';
import { logout } from '@/actions/auth';
import { IconBook2, IconLogout } from '@tabler/icons-react';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-10 p-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <IconBook2 className="w-8 h-8 text-indigo-600" />
              <span className="font-bold text-xl text-gray-900 tracking-tight">BookBuddy</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-[12px] font-bold font-sans uppercase tracking-widest text-slate-400 hover:text-[#10175b] transition-colors">
              About
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-600 bg-gray-50 hover:bg-gray-100 focus:outline-none transition-colors"
              >
                <IconLogout className="w-4 h-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}
