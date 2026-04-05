'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import MobileNav from '@/components/mobile-nav';
import Link from 'next/link';
import { BookOpen, Book } from 'lucide-react';
import { AddBookHeaderButton } from './add-book-header-button';

// Expanded palette of premium academic gradients
const coverBackgrounds = [
  "from-[#10175b] via-[#1a2066] to-[#0a0d2e]",
  "from-[#0f766e] via-[#134e4a] to-[#062c2b]",
  "from-[#912d2d] via-[#6d1313] to-[#4c0d0d]",
  "from-[#7c3aed] via-[#5b21b6] to-[#4c1d95]",
  "from-[#1e40af] via-[#1e3a8a] to-[#172554]",
  "from-[#b45309] via-[#92400e] to-[#78350f]",
  "from-[#065f46] via-[#064e3b] to-[#022c22]",
  "from-[#334155] via-[#1e293b] to-[#0f172a]",
];

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
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <div className="min-h-screen bg-[#F4F5F6] opacity-0" />;
  }
  
  return (
    <div className="flex min-h-screen bg-[#F4F5F6]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <MobileNav onOpenMenu={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 md:ml-56 mt-16 md:mt-0 px-8 py-10 md:px-12 md:py-12 xl:px-24 xl:py-16 overflow-y-scroll overflow-x-hidden scroll-smooth">
          <div className="max-w-7xl mx-auto">
              {/* Header / Intro */}
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-12 gap-8">
                  <div className="max-w-2xl">
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
                                              Recently Opened
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

                          <div className="xl:col-span-1">
                              <div className="bg-[#10175b] text-white p-12 rounded-[2rem] h-[500px] shadow-xl flex flex-col items-start relative overflow-hidden isolate transform-gpu">
                                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                                  <div className="mb-12 mt-4 text-white">
                                      <Book size={48} strokeWidth={1.5} />
                                  </div>
                                  <h3 className="text-[32px] font-serif font-bold mb-6 tracking-tight">Daily Progress</h3>
                                  <p className="text-indigo-100/90 text-[17px] leading-[1.7] font-medium max-w-[90%]">
                                      You've mastered {userVocabCount} new vocabulary words today. Your reading streak is 4 days.
                                  </p>
                              </div>
                          </div>
                      </div>

                      {oldBooks.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 pb-12">
                              <h3 className="col-span-full font-bold text-slate-400 uppercase tracking-widest text-[11px] mb-2">Previous Books</h3>
                              {oldBooks.map((book) => (
                                  <Link href={`/books/${book.id}`} key={book.id} className="group">
                                      <div className="bg-white rounded-[24px] p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-[1.02] isolate transform-gpu overflow-hidden will-change-transform">
                                          <h4 className="text-2xl font-serif font-bold text-[#10175b] mb-2 group-hover:text-[#1a2066] transition-colors">{book.title}</h4>
                                          <p className="text-[15px] text-slate-500 font-medium">{book.author || 'Unknown Author'}</p>
                                      </div>
                                  </Link>
                              ))}
                          </div>
                      )}
                  </>
              ) : (
                  <div className="h-[400px] rounded-[2rem] border border-dashed border-slate-300 bg-white/50 flex flex-col items-center justify-center p-8 text-center">
                      <div className="bg-[#10175b]/5 p-5 rounded-2xl mb-6 shadow-sm border border-[#10175b]/10 text-[#10175b]">
                          <BookOpen size={40} />
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
