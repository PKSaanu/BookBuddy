'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { IconBooks, IconFlask } from '@tabler/icons-react';
import { BookCover } from '@/components/book-cover';
import { AddBookHeaderButton } from '../dashboard/add-book-header-button';

interface LibraryItem {
  id: string;
  title: string;
  author: string | null;
  coverImage?: string | null;
  totalPages?: number | null;
  year?: number | null;
  type: 'book' | 'paper';
  translationCount: number;
  maxPage: number;
}

interface LibraryClientProps {
  isResearcher: boolean;
  books: LibraryItem[];
  papers: LibraryItem[];
  combinedItems: LibraryItem[];
}

export function LibraryClient({ isResearcher, books, papers, combinedItems }: LibraryClientProps) {
  const [activeTab, setActiveTab] = useState<'book' | 'paper'>('book');

  const showTabs = isResearcher && papers.length > 0 && books.length > 0;
  const itemsToDisplay = showTabs 
    ? (activeTab === 'book' ? books : papers) 
    : combinedItems;


  return (
    <>
      {showTabs && (
        <div className="flex items-center gap-8 border-b border-[#10175b]/10 mb-10 overflow-x-auto whitespace-nowrap">
          <button
            type="button"
            onClick={() => setActiveTab('book')}
            className={`relative pb-3 text-[11px] font-bold uppercase tracking-widest transition-all ${
              activeTab === 'book' ? 'text-[#10175b]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Bookshelf Collection
            {activeTab === 'book' && (
              <motion.div layoutId="libraryActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10175b]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paper')}
            className={`relative pb-3 text-[11px] font-bold uppercase tracking-widest transition-all ${
              activeTab === 'paper' ? 'text-[#10175b]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Academic Research
            {activeTab === 'paper' && (
              <motion.div layoutId="libraryActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10175b]" />
            )}
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 md:gap-x-10 gap-y-12 md:gap-y-16 min-h-[400px]">
        {itemsToDisplay.map((item, index) => {
          const href = item.type === 'book' ? `/books/${item.id}` : `/papers/${item.id}`;
          
          return (
            <Link 
              key={item.id} 
              href={href}
              className="group flex flex-col"
            >
              {/* Cover Container */}
              <div className="relative aspect-[2/3] mb-6 rounded-2xl overflow-hidden isolate transform-gpu backface-hidden shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.03] will-change-transform bg-white">
                
                {/* Paper Texture Overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none mix-blend-overlay z-10 rounded-2xl" />
                
                {/* Binding Shadow */}
                <div className="absolute inset-y-0 left-0 w-4 bg-black/20 blur-[1px] z-20 rounded-l-2xl" />
                
                <BookCover 
                  src={item.coverImage} 
                  title={item.title} 
                  type={item.type} 
                  index={index} 
                  className="rounded-2xl transition-transform duration-500 group-hover:scale-110 will-change-transform"
                />

                {/* Subtle Glint/Shine */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out z-20" />

                {/* Hover Overlay */}
                <div className="absolute inset-x-0 bottom-0 py-5 bg-white/20 backdrop-blur-md border-t border-white/30 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 flex items-center justify-center z-30">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white drop-shadow-sm">Open {item.type === 'book' ? 'Volume' : 'Paper'}</span>
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-[#10175b]">
                      {item.type === 'book' ? <IconBooks size={12} strokeWidth={2.5} /> : <IconFlask size={12} strokeWidth={2.5} />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Metadata */}
              <div className="flex flex-col space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`h-[1px] w-4 ${item.type === 'book' ? 'bg-slate-300' : 'bg-rose-300'} transition-all duration-300 group-hover:w-8 ${item.type === 'book' ? 'group-hover:bg-[#10175b]' : 'group-hover:bg-rose-700'}`} />
                  <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${item.type === 'book' ? 'text-[#10175b]/40' : 'text-rose-700/60'} whitespace-nowrap`}>
                    {item.totalPages ? `PAGE ${item.maxPage} / ${item.totalPages}` : item.year ? `YEAR ${item.year}` : 'NEW ARCHIVE'}
                  </p>
                </div>
                <h3 className={`text-base md:text-lg font-serif font-bold text-slate-800 leading-tight ${item.type === 'book' ? 'group-hover:text-[#10175b]' : 'group-hover:text-rose-700'} transition-colors line-clamp-2`}>
                  {item.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400">{item.translationCount} WORDS</span>
                  <div className="w-1 h-1 bg-slate-200 rounded-full" />
                  <p className="text-[11px] text-slate-500 font-serif italic truncate flex-1">
                    {item.author || 'Anonymous'}
                  </p>
                  {item.type === 'paper' && <span className="bg-rose-50 text-rose-600 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-rose-100 shrink-0">Research</span>}
                </div>
              </div>
            </Link>
          );
        })}

        {itemsToDisplay.length === 0 && (
          <div className="col-span-full py-40 text-center bg-[#EBECEF] rounded-[40px] border-2 border-dashed border-slate-300 shadow-inner group">
            <div className="max-w-sm mx-auto flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 mb-8 shadow-sm group-hover:scale-110 transition-transform">
                <IconBooks size={40} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#10175b] mb-4">Archive Empty</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-10 italic">"The greatest library begins with a single selection. Start your curation today."</p>
              <AddBookHeaderButton isResearcher={isResearcher} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
