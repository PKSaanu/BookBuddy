'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconNotes, IconChevronRight, IconTrash, IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import TranslationPanel from './translation-panel';
import CurationList from './curation-list';
import BookNotes from './book-notes';
import { DeleteBookButton } from './delete-book-button';
import { getBookNotes } from '@/actions/books';

interface BookContentProps {
  book: {
    id: string;
    title: string;
    author: string | null;
    notes?: string | null;
    totalPages: number | null;
  };
  session: any;
  vocab: any[];
  progressPercent: number;
}

export default function BookContent({ book, session, vocab, progressPercent }: BookContentProps) {
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [fetchedNotes, setFetchedNotes] = useState<string | null>(null);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  const toggleNotes = async () => {
    const nextState = !isNotesOpen;
    setIsNotesOpen(nextState);

    if (nextState && fetchedNotes === null) {
      setIsLoadingNotes(true);
      const result = await getBookNotes(book.id);
      if (result.success) {
        setFetchedNotes(result.notes || '');
      }
      setIsLoadingNotes(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] md:h-screen w-full overflow-hidden relative">
      {/* Main Content Area */}
      <motion.div 
        layout
        className="flex-1 h-full overflow-y-auto px-5 py-8 md:px-12 md:py-10 xl:px-16 xl:py-12"
      >
        <div className="max-w-[900px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between w-full mb-6">
              <Link href="/library" className="inline-flex items-center text-[10px] md:text-[12px] font-bold text-[#10175b] hover:text-[#1a2066] transition-colors group uppercase tracking-[0.1em]">
                <IconArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
                Back to Library
              </Link>
              
              <div className="flex items-center gap-3 md:gap-4">
                <button 
                   onClick={toggleNotes}
                   className={`inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all duration-300 border-2 ${isNotesOpen ? 'bg-[#10175b] text-white border-[#10175b]' : 'bg-white text-[#10175b] border-slate-200 hover:border-[#10175b] shadow-sm'}`}
                >
                  <IconNotes className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={isNotesOpen ? 3 : 2} />
                  <span className="hidden xs:inline">{isNotesOpen ? 'Hide Notes' : 'Notes'}</span>
                </button>
                
                <DeleteBookButton bookId={book.id} bookTitle={book.title} />
                
                <div className="bg-[#0f766e] text-white text-[9px] md:text-[11px] font-bold tracking-[0.1em] uppercase px-3 md:px-4 py-1.5 rounded-full shadow-sm">
                  {progressPercent}%
                </div>
              </div>
            </div>
            
            <div className="flex flex-col border-b border-slate-200/50 pb-8">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-[#171717] font-bold tracking-tight leading-[1.1] mb-4">{book.title}</h1>
              {book.author && <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <p className="text-base md:text-lg text-slate-600 font-serif italic tracking-wide">
                  {book.author}
                </p>
                <span className="hidden sm:inline text-slate-300 font-sans font-normal">•</span>
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#10175b]">
                  {book.totalPages ? `${book.totalPages} Total Pages` : 'Page tracking enabled'}
                </p>
              </div>}
            </div>
          </div>

          {/* Translation Interactive Panel */}
          <div className="mb-12">
            <TranslationPanel bookId={book.id} preferredLanguage={session.preferredLanguage as string} />
          </div>

          {/* Content Display / Saved Curation */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[10px] md:text-sm font-black uppercase tracking-[0.4em] text-[#10175b]">Your Saved Curation</h2>
              <div className="h-[1px] flex-1 bg-[#10175b]/10 ml-4 md:ml-8" />
            </div>
            <CurationList vocab={vocab as any} bookId={book.id} />
          </div>
        </div>
      </motion.div>

      {/* Side Notes Panel */}
      <AnimatePresence>
        {isNotesOpen && (
          <>
            {/* Backdrop for the sidebar popup */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotesOpen(false)}
              className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 w-[92%] md:w-[60%] lg:w-[50%] xl:w-[45%] h-full z-[101]"
            >
              <BookNotes 
                bookId={book.id} 
                initialNotes={fetchedNotes} 
                isLoading={isLoadingNotes}
                onClose={() => setIsNotesOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Mobile Swipe-up Notes Panel (optional - currently just using hidden/block for desktop fokus) */}
    </div>
  );
}
