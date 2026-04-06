'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import MobileNav from '@/components/mobile-nav';
import Link from 'next/link';
import { IconBook2, IconBook } from '@tabler/icons-react';
import { AddBookHeaderButton } from './add-book-header-button';
import { coverBackgrounds } from '@/lib/constants';



export default function DashboardPage({ 
  userBooks, 
  userVocabCount, 
  recentBook, 
  oldBooks, 
  progress 
}: { 
  userBooks: any[], 
  userVocabCount: number, 
  recentBook: any, 
  oldBooks: any[], 
  progress: number 
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-[#F4F5F6]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <MobileNav onOpenMenu={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 md:ml-56 mt-16 md:mt-0 px-8 py-10 md:px-12 md:py-12 xl:px-24 xl:py-16 overflow-y-scroll overflow-x-hidden scroll-smooth">
          <div className="max-w-7xl mx-auto">
              {/* Header / Intro */}
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-12 gap-8">
                  <div className="max-w-2xl w-full">
                       <p className="text-[12px] tracking-[0.2em] font-black text-slate-400 uppercase mb-4">Welcome back, Scholar</p>
                       <h2 className="text-5xl md:text-7xl font-serif text-[#10175b] leading-[1.1] tracking-tight">
                        Your library is an <span className="italic">unwritten</span> chapter.
                       </h2>
                  </div>
                  <div className="shrink-0 mb-2">
                      <AddBookHeaderButton />
                  </div>
              </div>

              {recentBook ? (
                  <>
                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                          {/* Huge Left Book Card - Bulletproof Curve and Stable Animation */}
                          <Link href={`/books/${recentBook.id}`} className="xl:col-span-2 group">
                              <div className="bg-slate-950 rounded-[2rem] h-[500px] relative overflow-hidden isolate transform-gpu backface-hidden shadow-xl border border-slate-200/20 group-hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.01] will-change-transform">
                                  
                                  {/* Scholar Backdrop Image */}
                                  <img 
                                      src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop" 
                                      alt="Library Backdrop"
                                      className="absolute inset-0 w-full h-full object-cover opacity-40 transition-transform duration-1000 group-hover:scale-105 will-change-transform rounded-[2rem]"
                                  />
                                  
                                  <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0d2e] via-transparent to-[#0a0d2e]/40 opacity-80 rounded-[2rem]" />
                                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0a0d2e] via-[#0a0d2e]/60 to-transparent z-10 rounded-[2rem]" />
                                  
                                  <div className="absolute bottom-0 left-0 p-12 w-full z-20">
                                       <div className="flex items-center gap-4 mb-6">
                                          <div className="bg-[#0f766e] text-white text-[11px] font-bold uppercase tracking-[0.1em] px-4 py-2 rounded-full shadow-sm">
                                              Recently Added
                                          </div>
                                          {recentBook.totalPages && (
                                              <div className="bg-white/10 backdrop-blur text-white text-[11px] font-bold uppercase tracking-[0.1em] px-4 py-2 rounded-full border border-white/20">
                                                  {progress}% Mastered
                                              </div>
                                          )}
                                       </div>
                                       <h3 className="text-5xl font-serif font-bold text-white leading-tight mb-3 drop-shadow-2xl">
                                          {recentBook.title}
                                       </h3>
                                       <p className="text-xl text-slate-300 font-medium drop-shadow-lg">{recentBook.author || 'Unknown Author'}</p>
                                  </div>
                              </div>
                          </Link>

                          <div className="xl:col-span-1 flex flex-col gap-6 h-[500px]">
                              {/* Daily Progress Card */}
                              <div className="flex-1 bg-[#10175b] text-white p-6 md:p-8 rounded-[2rem] shadow-xl flex flex-col items-start relative overflow-hidden isolate transform-gpu">
                                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                                  <div className="mb-4 text-white/80">
                                      <IconBook size={28} strokeWidth={1.5} />
                                  </div>
                                  <h3 className="text-xl md:text-2xl font-serif font-bold mb-3 tracking-tight">Daily Progress</h3>
                                  <p className="text-indigo-100/90 text-sm leading-[1.5] font-medium">
                                      You've mastered {userVocabCount} new words today. Your reading streak is 4 days.
                                  </p>
                              </div>

                              {/* Unique 'Library Archive' Reading Quote Card */}
                              <div className="flex-1 bg-[#FDFCF7] border-l-8 border-[#10175b] rounded-r-[2rem] rounded-l-md p-6 md:p-8 relative overflow-hidden shadow-xl group transition-all duration-500 hover:shadow-2xl hover:translate-x-1">
                                  {/* Subtle Paper Texture */}
                                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-[0.15] pointer-events-none" />
                                  
                                  <div className="relative z-10 h-full flex flex-col justify-between">
                                      <div className="flex justify-between items-start">
                                          <div className="flex flex-col">
                                              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#10175b]/40 mb-0.5">Archive No.</span>
                                              <span className="text-[11px] font-mono font-bold text-[#10175b]/60">88-2024-GRRM</span>
                                          </div>
                                          {/* Decorative Red 'Stamp' */}
                                          <div className="border-2 border-red-600/30 text-red-600/40 text-[8px] font-mono font-black uppercase px-2 py-0.5 rotate-12 rounded-sm select-none">
                                              Verified
                                          </div>
                                      </div>

                                      <div className="flex-1 flex items-center py-4">
                                          <p className="text-lg md:text-xl font-serif italic text-[#10175b] leading-snug tracking-tight group-hover:text-black transition-colors duration-500 line-clamp-4">
                                              "A reader lives a thousand lives before he dies. The man who never reads lives only one."
                                          </p>
                                      </div>
                                      
                                      <div className="flex items-center gap-3">
                                          <div className="h-[1px] w-8 bg-[#10175b]/20" />
                                          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#10175b]">
                                              G.R.R. Martin
                                          </p>
                                      </div>
                                  </div>

                                  {/* Corner Fold Effect */}
                                  <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-bl from-slate-200 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                              </div>
                          </div>
                      </div>

                      {oldBooks.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 pb-12">
                              <h3 className="col-span-full font-bold text-slate-400 uppercase tracking-widest text-[11px] mb-2">Previous Books</h3>
                              {oldBooks.map((book, index) => (
                                  <Link href={`/books/${book.id}`} key={book.id} className="group">
                                      <div className={`relative h-48 rounded-[24px] p-8 overflow-hidden isolate shadow-sm hover:shadow-xl transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-1 transform-gpu`}>
                                          {/* Dynamic Gradient Background */}
                                          <div className={`absolute inset-0 bg-gradient-to-br ${coverBackgrounds[index % coverBackgrounds.length]} transition-transform duration-700 group-hover:scale-110`} />
                                          
                                          {/* Texture Overlay */}
                                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-10 pointer-events-none mix-blend-overlay" />
                                          
                                          {/* Glassmorphism Effect for text content */}
                                          <div className="relative z-10 h-full flex flex-col justify-end">
                                              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl">
                                                <h4 className="text-xl font-serif font-bold text-white mb-1 line-clamp-1 drop-shadow-sm">{book.title}</h4>
                                                <p className="text-[13px] text-white/70 font-medium line-clamp-1 italic">{book.author || 'Anonymous Author'}</p>
                                              </div>
                                          </div>
                                      </div>
                                  </Link>
                              ))}
                          </div>
                      )}
                  </>
              ) : (
                  <div className="h-[400px] rounded-[2rem] border border-dashed border-slate-300 bg-white/50 flex flex-col items-center justify-center p-8 text-center">
                      <div className="bg-[#10175b]/5 p-5 rounded-2xl mb-6 shadow-sm border border-[#10175b]/10 text-[#10175b]">
                          <IconBook2 size={40} />
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-[#10175b]">No reading adventures yet</h3>
                      <p className="mt-3 text-slate-500 font-medium text-lg">Click "Add New Book" to start exploring.</p>
                  </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}
