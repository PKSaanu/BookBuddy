'use client';

import { useState } from 'react';
import { updateBookDetails } from '@/actions/books';
import { IconBook, IconUser, IconHash, IconLoader, IconCheck } from '@tabler/icons-react';

interface Book {
  id: string;
  title: string;
  author: string | null;
  totalPages: number | null;
}

export function EditBookModal({ book, onClose, onUpdate }: { 
  book: Book, 
  onClose: () => void, 
  onUpdate: (updatedTitle: string, updatedAuthor: string, updatedPages: number) => void 
}) {
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author || '');
  const [totalPages, setTotalPages] = useState(String(book.totalPages || ''));
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsUpdating(true);
    setError(null);

    const pageCount = parseInt(totalPages, 10);
    const result = await updateBookDetails(book.id, title, author, isNaN(pageCount) ? 0 : pageCount);

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
      <div className="w-full max-w-sm bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-serif font-bold text-[#10175b]">Edit Details</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#10175b]/50 px-1">Book Title</label>
              <div className="relative">
                <IconBook className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The Alchemist"
                  required
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10175b]/10 focus:border-[#10175b] text-[#10175b] font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#10175b]/50 px-1">Author Name</label>
              <div className="relative">
                <IconUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Paulo Coelho"
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10175b]/10 focus:border-[#10175b] text-[#10175b] font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#10175b]/50 px-1">Total Pages</label>
              <div className="relative">
                <IconHash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="number"
                  value={totalPages}
                  onChange={(e) => setTotalPages(e.target.value)}
                  placeholder="208"
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10175b]/10 focus:border-[#10175b] text-[#10175b] font-medium transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-red-500 px-1">{error}</p>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isUpdating || isSuccess}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  isSuccess 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-[#10175b] text-white hover:bg-[#1a2066]'
                } disabled:opacity-70`}
              >
                {isSuccess ? <IconCheck /> : isUpdating ? <IconLoader className="animate-spin" /> : null}
                {isSuccess ? 'Updated Successfully' : isUpdating ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
