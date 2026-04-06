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

// OpenLibrary Search Document Interface
interface OpenLibraryDoc {
  title: string;
  author_name?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
  first_publish_year?: number;
}

export function CreateBookModal({ onSuccess }: { onSuccess?: () => void }) {
  const [state, formAction] = useActionState(createBook, null);
  const formRef = useRef<HTMLFormElement>(null);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [totalPages, setTotalPages] = useState<string>('');
  const [suggestions, setSuggestions] = useState<OpenLibraryDoc[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [suggestedCorrection, setSuggestedCorrection] = useState<OpenLibraryDoc | null>(null);

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
    const controller = new AbortController();
    const query = title.trim();

    if (query.length <= 2 || !showDropdown) {
      setSuggestions([]);
      setSuggestedCorrection(null);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=7&fields=title,author_name,cover_i,number_of_pages_median,first_publish_year`, {
          signal: controller.signal
        });

        if (!res.ok) throw new Error('API Error');
        const data = await res.json();

        if (!controller.signal.aborted) {
          if (data.docs && data.docs.length > 0) {
            setSuggestions(data.docs);

            // Heuristic for correction suggestion
            const topMatch = data.docs[0];
            if (topMatch && topMatch.title.toLowerCase() !== query.toLowerCase() && !query.toLowerCase().includes(topMatch.title.toLowerCase())) {
              setSuggestedCorrection(topMatch);
            } else {
              setSuggestedCorrection(null);
            }
          } else {
            setSuggestions([]);
            setSuggestedCorrection(null);
          }
        }
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          setSuggestions([]);
          setSuggestedCorrection(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 450); // Generous debounce for OpenLibrary's slower servers

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [title, showDropdown]);

  const selectBook = (doc: OpenLibraryDoc) => {
    const selectedTitle = doc.title || '';
    const selectedAuthor = doc.author_name ? doc.author_name[0] : '';

    // Natively construct deterministic OpenLibrary high-res URL if cover_i exists
    const selectedCover = doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
      : '';

    const selectedPageCount = doc.number_of_pages_median ? String(doc.number_of_pages_median) : '';

    setTitle(selectedTitle);
    setAuthor(selectedAuthor);
    setCoverImage(selectedCover);
    setTotalPages(selectedPageCount);
    setShowDropdown(false);
    setSuggestedCorrection(null);
  };

  return (
    <div className="bg-white p-8 rounded-[24px] shadow-2xl border border-slate-100 relative overflow-visible group w-full max-w-3xl mx-auto">


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
                  className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10175b]/20 focus:border-[#10175b] text-base text-slate-900 placeholder-slate-400 font-medium transition-all"

                />
                {isLoading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#10175b]/50">
                    <IconLoader className="w-5 h-5 animate-spin" />
                  </div>
                )}
              </div>

              {showDropdown && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 max-h-60 overflow-y-auto z-50">
                  {suggestions.map((doc, idx) => {
                    const secureThumb = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-S.jpg` : null;

                    return (
                      <div
                        key={idx}
                        onClick={() => selectBook(doc)}
                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 flex items-center gap-3"
                      >
                        {secureThumb ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={secureThumb} alt="" className="w-8 h-11 object-cover rounded-sm shadow-sm opacity-90" />
                        ) : (
                          <div className="w-8 h-11 bg-slate-100 rounded-sm shadow-sm flex items-center justify-center shrink-0">
                            <span className="text-[8px] text-slate-400 uppercase font-black text-center leading-none">No<br />Img</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 leading-tight mb-0.5 truncate">{doc.title}</p>
                          {doc.author_name && (
                            <p className="text-xs text-slate-500 truncate">{doc.author_name.join(', ')}</p>
                          )}
                          <div className="flex gap-2 items-center mt-1">
                            {doc.number_of_pages_median && (
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{doc.number_of_pages_median} Pages</p>
                            )}
                            {doc.first_publish_year && (
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">• {doc.first_publish_year}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                name="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10175b]/20 focus:border-[#10175b] text-base text-slate-900 placeholder-slate-400 font-medium transition-all"

              />
              <input
                name="totalPages"
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                placeholder="Total Pages"
                type="number"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10175b]/20 focus:border-[#10175b] text-base text-slate-900 placeholder-slate-400 font-medium transition-all"

              />
            </div>
          </div>

          {suggestedCorrection && !showDropdown && (
            <div className="bg-amber-50 p-4 border border-amber-200/50 rounded-xl animate-in fade-in slide-in-from-top-2">
              <p className="text-[11px] font-black uppercase text-amber-700 tracking-wider mb-2">Better Version Found?</p>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 italic font-serif leading-tight truncate">"{suggestedCorrection.title}"</p>
                  <p className="text-[10px] text-slate-500 font-medium truncate">{suggestedCorrection.author_name?.[0]}</p>
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

          <div className="pt-2">
            <SubmitBtn />
          </div>
        </form>
      </div>
    </div>
  );
}
