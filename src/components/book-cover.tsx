'use client';

import { useState } from 'react';
import { coverBackgrounds } from '@/lib/constants';

interface BookCoverProps {
  src?: string | null;
  title: string;
  type: 'book' | 'paper';
  index: number;
  className?: string;
}

export function BookCover({ src, title, type, index, className = "" }: BookCoverProps) {
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(src ? 'loading' : 'error');

  const placeholderBg = (status === 'error' || !src)
    ? (type === 'book' ? coverBackgrounds[index % coverBackgrounds.length] : 'from-rose-900 to-rose-700')
    : 'from-slate-100 to-slate-200'; // Neutral background while loading to match earlier behavior

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Background Placeholder (Always present as fallback and during load) */}
      <div className={`absolute inset-0 bg-gradient-to-br ${placeholderBg} flex flex-col items-center justify-center p-6 text-center shadow-inner z-0`}>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-10 pointer-events-none mix-blend-overlay" />
          
          {(status === 'error' || !src) && (
            <div className="flex flex-col items-center animate-in fade-in duration-500">
              <div className="w-12 h-0.5 bg-white/30 mb-4 rounded-full" />
              <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-2 drop-shadow-sm">
                {type === 'book' ? 'Scholar Edition' : 'Research Edition'}
              </p>
              <h3 className="text-white text-lg md:text-xl font-serif font-bold italic leading-tight drop-shadow-md line-clamp-4">
                {title}
              </h3>
            </div>
          )}
      </div>

      {/* Actual Image */}
      {src && (
        <img
          src={src}
          alt={title}
          onLoad={() => setStatus('success')}
          onError={() => setStatus('error')}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-10 ${
            status === 'success' ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
}
