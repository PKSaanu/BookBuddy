'use client';

import { useState, useEffect } from 'react';
import { updatePaperDetails } from '@/actions/papers';
import { IconLoader, IconCheck, IconChevronRight } from '@tabler/icons-react';
import { motion } from 'framer-motion';

interface Paper {
  id: string;
  title: string;
  author: string | null;
  totalPages: number | null;
}

export function EditPaperModal({ paper, onClose, onUpdate }: { 
  paper: Paper, 
  onClose: () => void, 
  onUpdate: (updatedTitle: string, updatedAuthor: string, updatedPages: number) => void 
}) {
  const [title, setTitle] = useState(paper.title);
  const [author, setAuthor] = useState(paper.author || '');
  const [totalPages, setTotalPages] = useState(String(paper.totalPages || ''));
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsUpdating(true);
    setError(null);

    const pageCount = parseInt(totalPages, 10);
    const result = await updatePaperDetails(paper.id, title, author, isNaN(pageCount) ? 0 : pageCount);

    if (result.error) {
      setError(result.error);
      setIsUpdating(false);
    } else {
      setIsSuccess(true);
      setTimeout(() => {
        onUpdate(title, author, isNaN(pageCount) ? 0 : pageCount);
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-[#FDFCF7] p-6 sm:p-10 rounded-[2rem] shadow-2xl border border-[#10175b]/10 relative overflow-y-auto max-h-[90vh] w-full max-w-2xl mx-auto group"
      >
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-[0.2] pointer-events-none mix-blend-overlay" />
        
        {/* Decorative 'Archive' corner */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-slate-200 to-transparent opacity-30 pointer-events-none" />

        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 sm:top-8 sm:right-8 text-slate-400 hover:text-[#10175b] transition-all p-2 hover:bg-slate-100 rounded-full z-[20]"
          aria-label="Close modal"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="relative z-10 w-full">
          <div className="flex flex-col md:flex-row gap-6 mb-12 justify-between items-start md:items-end">
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl md:text-3xl font-serif text-[#10175b] tracking-tight">Update Archive.</h3>
              <p className="text-xs text-slate-500 font-medium italic opacity-70">Modify the research record in your library.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-8">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#10175b]/50 mb-3 ml-1">
                  Subject Property: Research Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Neural Machine Translation"
                  required
                  autoFocus
                  className="w-full px-4 py-3 bg-white/50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#10175b]/20 focus:border-[#10175b] text-base text-slate-900 placeholder-slate-300 font-serif transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#10175b]/50 mb-3 ml-1">
                    Research Lead(s)
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Bahdanau et al."
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#10175b]/20 focus:border-[#10175b] text-base text-slate-900 placeholder-slate-300 font-serif transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#10175b]/50 mb-3 ml-1">
                    Catalog Year
                  </label>
                  <input
                    type="number"
                    value={totalPages}
                    onChange={(e) => setTotalPages(e.target.value)}
                    placeholder="2014"
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#10175b]/20 focus:border-[#10175b] text-base text-slate-900 placeholder-slate-300 font-serif transition-all"
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm font-semibold text-red-600 bg-red-50 px-5 py-4 rounded-2xl border border-red-100 flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {error}
              </motion.div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdating || isSuccess}
                className="w-full inline-flex justify-center items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-[#10175b] hover:bg-black transition-all shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isSuccess ? <IconCheck /> : isUpdating ? <IconLoader className="w-5 h-5 animate-spin" /> : (
                  <>
                    Save Modifications
                    <IconChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
