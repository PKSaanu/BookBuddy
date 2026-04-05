'use client';

import Link from 'next/link';
import { IconMenu2 } from '@tabler/icons-react';
import Image from 'next/image';

interface MobileNavProps {
  onOpenMenu: () => void;
}

export default function MobileNav({ onOpenMenu }: MobileNavProps) {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 h-20 bg-[#F4F5F6] border-b border-slate-200/60 px-6 flex items-center justify-between z-[80]">
      <Link href="/dashboard" className="block">
        <Image 
          src="/logo.png" 
          alt="BookBuddy" 
          width={80} 
          height={12} 
          priority 
          style={{ height: 'auto' }}
          className="object-contain"
        />
      </Link>
      
      <button 
        onClick={onOpenMenu}
        className="p-2 text-slate-500 hover:text-[#10175b] transition-colors"
        aria-label="Open menu"
      >
        <IconMenu2 size={24} />
      </button>
    </div>
  );
}
