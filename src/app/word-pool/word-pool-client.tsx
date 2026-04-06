'use client';

import { useState, useMemo } from 'react';
import { IconSearch, IconX, IconArrowRight, IconExternalLink } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Translation {
  id: string;
  originalText: string;
  translatedText: string;
  bookId: string;
  language: string;
  createdAt: any;
}

export default function WordPoolClient({ initialWords }: { initialWords: Translation[] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWords = useMemo(() => {
    if (!searchQuery.trim()) return initialWords;
    return initialWords.filter(w =>
      w.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.translatedText.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [initialWords, searchQuery]);

  const wordCloudData = useMemo(() => {
    // For the word cloud, we'll randomize sizes and colors
    // But we use a hash to keep them consistent for the same word
    const colors = [
      'text-indigo-600', 'text-teal-600', 'text-[#10175b]',
      'text-slate-600', 'text-indigo-500', 'text-teal-500',
      'text-indigo-700', 'text-blue-600'
    ];

    const getHash = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash);
    };

    return filteredWords.map(w => ({
      ...w,
      size: (getHash(w.originalText) % 3) + 1, // 1, 2, or 3
      color: colors[getHash(w.originalText) % colors.length],
      rotation: (getHash(w.originalText) % 20) - 10, // -10 to 10 deg
    }));
  }, [filteredWords]);

  return (
    <div className="space-y-12">
      {/* Search Section */}
      <div className="relative max-w-2xl">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <IconSearch className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search your deciphered library..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-full pl-12 pr-12 py-3 text-base font-serif text-[#10175b] focus:outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm transition-all placeholder:text-slate-300"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-6 flex items-center text-slate-400 hover:text-[#10175b] transition-colors"
          >
            <IconX className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Result Count */}
      <div className="flex items-center gap-3">
        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[11px] font-black uppercase tracking-widest rounded-full">
          {filteredWords.length} Words Found
        </span>
      </div>

      {/* Word Cloud Surface */}
      <div className="min-h-[400px] w-full bg-white/50 backdrop-blur-sm rounded-[42px] border border-slate-200/60 p-8 md:p-12 relative overflow-hidden flex flex-wrap items-center justify-center gap-x-8 md:gap-x-12 gap-y-6 md:gap-y-10">
        <AnimatePresence mode="popLayout">
          {wordCloudData.length > 0 ? (
            wordCloudData.map((word) => (
              <motion.div
                key={word.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1, zIndex: 10 }}
                className="relative group cursor-pointer"
              >
                <Link href={`/books/${word.bookId}`} className="block text-center no-underline outline-none">
                  <span className={`block font-serif font-bold transition-colors ${word.color} 
                    ${word.size === 1 ? 'text-xl md:text-2xl opacity-70' :
                      word.size === 2 ? 'text-2xl md:text-3xl lg:text-4xl' :
                        'text-3xl md:text-5xl lg:text-6xl'} 
                    group-hover:opacity-100`}
                    style={{ transform: `rotate(${word.rotation}deg)` }}
                  >
                    {word.originalText}
                  </span>
                  <span className="block text-[10px] md:text-[12px] font-medium text-slate-400 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {word.translatedText}
                  </span>

                  {/* Floating Link Icon */}
                  <div className="absolute -top-4 -right-4 bg-white shadow-lg p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 border border-slate-100 transform translate-y-2 group-hover:translate-y-0 text-[#10175b]">
                    <IconArrowRight size={14} />
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center text-center py-20"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <IconSearch className="text-slate-300 w-8 h-8" />
              </div>
              <p className="text-slate-500 font-serif italic text-xl">No words matched your search...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative background dots */}
        <div className="absolute top-10 left-10 w-2 h-2 rounded-full bg-indigo-200/50" />
        <div className="absolute bottom-20 right-10 w-3 h-3 rounded-full bg-teal-200/50" />
        <div className="absolute top-1/2 right-1/4 w-1 h-1 rounded-full bg-slate-200" />
      </div>

      {/* Footer Info */}
      <p className="text-slate-400 text-xs md:text-sm font-medium tracking-wide flex items-center gap-2 px-4">
        Tip: Hover over a word to see its translation and click to jump back to the book.
      </p>
    </div>
  );
}
