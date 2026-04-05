'use client';

import { useActionState, useRef, useEffect, useState } from 'react';
import { createBook } from '@/actions/books';
import { IconPlus, IconLoader } from '@tabler/icons-react';
import { useFormStatus } from 'react-dom';

function SubmitBtn() {
    const { pending } = useFormStatus();
    return (
        <button
          type="submit"
          disabled={pending}
          className="w-full inline-flex justify-center items-center gap-2 px-6 py-3.5 border border-transparent rounded-xl shadow-lg shadow-[#0a0f44]/20 text-sm font-bold text-white bg-[#10175b] hover:bg-[#1a2066] focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {pending ? <IconLoader className="w-5 h-5 animate-spin" /> : 'Create Book'}
        </button>
    )
}

export function CreateBookModal({ onSuccess }: { onSuccess?: () => void }) {
  const [state, formAction] = useActionState(createBook, null);
  const formRef = useRef<HTMLFormElement>(null);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [totalPages, setTotalPages] = useState<string>('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [suggestedCorrection, setSuggestedCorrection] = useState<any | null>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      setTitle('');
      setAuthor('');
      setCoverImage('');
      setTotalPages('');
      setSuggestedCorrection(null);
      if (onSuccess) onSuccess();
    }
  }, [state, onSuccess]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (title.trim().length > 3 && showDropdown) {
        try {
          const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=5`);
          const data = await res.json();
          if (data.items) {
            setSuggestions(data.items);
            
            // Heuristic for correction suggestion
            const topMatch = data.items[0].volumeInfo;
            if (topMatch.title.toLowerCase() !== title.toLowerCase() && !title.includes(topMatch.title)) {
                setSuggestedCorrection(data.items[0]);
            } else {
                setSuggestedCorrection(null);
            }
          } else {
            setSuggestions([]);
            setSuggestedCorrection(null);
          }
        } catch (e) {
          setSuggestions([]);
          setSuggestedCorrection(null);
        }
      } else {
        setSuggestions([]);
        setSuggestedCorrection(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [title, showDropdown]);

  const selectBook = (suggestion: any) => {
    const volInfo = suggestion.volumeInfo;
    const selectedTitle = volInfo.title || '';
    const selectedAuthor = volInfo.authors ? volInfo.authors[0] : '';
    const selectedCover = volInfo.imageLinks?.thumbnail || '';
    const selectedPageCount = volInfo.pageCount ? String(volInfo.pageCount) : '';
    
    setTitle(selectedTitle);
    setAuthor(selectedAuthor);
    setCoverImage(selectedCover);
    setTotalPages(selectedPageCount);
    setShowDropdown(false);
    setSuggestedCorrection(null);
  };

  return (
    <div className="bg-white p-8 rounded-[24px] shadow-2xl border border-slate-100 relative overflow-visible group w-full max-w-md">
      
      <div className="relative z-10 overflow-visible">
          <div className="w-14 h-14 bg-[#10175b]/5 border border-[#10175b]/10 rounded-2xl flex items-center justify-center mb-6 text-[#10175b]">
            <IconPlus className="w-7 h-7" strokeWidth={2.5} />
          </div>
          
          <h3 className="text-2xl font-bold text-[#10175b] mb-2">Add New Book</h3>
          <p className="text-sm text-slate-500 mb-8 font-medium">Start a new reading session and track your progress.</p>
          
          <form action={formAction} ref={formRef} className="w-full space-y-5">
            <input type="hidden" name="coverImage" value={coverImage} />
            {state?.error && (
              <div className="text-sm font-semibold text-red-600 bg-red-50/80 backdrop-blur border border-red-100 px-4 py-3 rounded-xl">
                {state.error}
              </div>
            )}
            
            <div className="space-y-4 relative">
              <div className="relative">
                <input
                  name="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Book Title"
                  required
                  autoComplete="off"
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10175b]/20 focus:border-[#10175b] text-slate-900 placeholder-slate-400 font-medium transition-all"
                />
                
                {showDropdown && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 max-h-60 overflow-y-auto z-50">
                    {suggestions.map((s, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => selectBook(s)}
                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                      >
                        <p className="text-sm font-bold text-slate-900">{s.volumeInfo?.title}</p>
                        {s.volumeInfo?.authors && (
                          <p className="text-xs text-slate-500">{s.volumeInfo.authors.join(', ')}</p>
                        )}
                        {s.volumeInfo?.pageCount && (
                          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">{s.volumeInfo.pageCount} Pages</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  name="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Author"
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10175b]/20 focus:border-[#10175b] text-slate-900 placeholder-slate-400 font-medium transition-all"
                />
                <input
                  name="totalPages"
                  value={totalPages}
                  onChange={(e) => setTotalPages(e.target.value)}
                  placeholder="Total Pages"
                  type="number"
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10175b]/20 focus:border-[#10175b] text-slate-900 placeholder-slate-400 font-medium transition-all"
                />
              </div>
            </div>

            {suggestedCorrection && !showDropdown && (
                <div className="bg-amber-50 p-4 border border-amber-200/50 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <p className="text-[11px] font-black uppercase text-amber-700 tracking-wider mb-2">Better Version Found?</p>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-900 italic font-serif leading-tight">"{suggestedCorrection.volumeInfo.title}"</p>
                            <p className="text-[10px] text-slate-500 font-medium">{suggestedCorrection.volumeInfo.authors?.[0]}</p>
                        </div>
                        <button 
                            type="button"
                            onClick={() => selectBook(suggestedCorrection)}
                            className="shrink-0 bg-amber-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors"
                        >
                            Correct it
                        </button>
                    </div>
                </div>
            )}
            
            <div className="pt-4">
                <SubmitBtn />
            </div>
          </form>
      </div>
    </div>
  );
}
