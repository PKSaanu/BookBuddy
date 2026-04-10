'use client';

import { useActionState, useRef, useEffect, useState } from 'react';
import { createBook } from '@/actions/books';
import { createPaper } from '@/actions/papers';
import { IconPlus, IconLoader, IconBook, IconFlask, IconChevronRight, IconSearch } from '@tabler/icons-react';
import { useFormStatus } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full inline-flex justify-center items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-[#10175b] hover:bg-black transition-all shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
    >
      {pending ? <IconLoader className="w-5 h-5 animate-spin" /> : (
        <>
          Create Archive Entry
          <IconChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </>
      )}
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

export function CreateBookModal({ onSuccess, isResearcher }: { onSuccess?: () => void, isResearcher?: boolean }) {
  const router = useRouter();
  const [type, setType] = useState<'book' | 'paper'>('book');
  
  // We use two different states because the actions have different signatures or roles
  // But for the modal, we can just switch which one we use or use a unified one.
  // Let's use a unified one to keep useActionState simple.
  const unifiedAction = async (prevState: any, formData: FormData) => {
    formData.append('type', type);
    if (type === 'book') {
      return await createBook(prevState, formData);
    } else {
      return await createPaper(prevState, formData);
    }
  };

  const [state, formAction] = useActionState(unifiedAction, null);
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
    const controller = new AbortController();
    const query = title.trim();

    if (query.length <= 2 || !showDropdown || type === 'paper') {
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
    <motion.div 
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="bg-[#FDFCF7] p-6 sm:p-10 rounded-[2rem] shadow-2xl border border-[#10175b]/10 relative overflow-y-auto max-h-[90vh] w-full max-w-2xl mx-auto group"
    >
      {/* Paper Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-[0.2] pointer-events-none mix-blend-overlay" />
      
      {/* Decorative 'Archive' corner */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-slate-200 to-transparent opacity-30 pointer-events-none" />


      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl md:text-3xl font-serif text-[#10175b] tracking-tight">Add to Archive.</h3>
            <p className="text-xs text-slate-500 font-medium italic opacity-70">Initialize a new reading record in your library.</p>
          </div>
          
          {/* Dashboard-style red 'Verified' stamp (subtle) */}
          <div className="border-2 border-red-600/20 text-red-600/30 text-[9px] font-mono font-black uppercase px-3 py-1 rotate-12 rounded-sm hidden md:block select-none">
            Authorized
          </div>
        </div>

        {isResearcher && (
          <div className="flex items-center gap-8 border-b border-[#10175b]/10 mb-10 overflow-x-auto whitespace-nowrap">
            <button
              type="button"
              onClick={() => setType('book')}
              className={`relative pb-3 text-[11px] font-bold uppercase tracking-widest transition-all ${type === 'book' ? 'text-[#10175b]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Bookshelf Collection
              {type === 'book' && <motion.div layoutId="modalActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10175b]" />}
            </button>
            <button
              type="button"
              onClick={() => setType('paper')}
              className={`relative pb-3 text-[11px] font-bold uppercase tracking-widest transition-all ${type === 'paper' ? 'text-[#10175b]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Academic Research
              {type === 'paper' && <motion.div layoutId="modalActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10175b]" />}
            </button>
          </div>
        )}

        <form action={formAction} ref={formRef} className="w-full space-y-5">

          <input type="hidden" name="coverImage" value={coverImage} />
          {state && state.error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-sm font-semibold text-red-600 bg-red-50 px-5 py-4 rounded-2xl border border-red-100 flex items-center gap-3"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {state.error}
            </motion.div>
          )}

          <div className="space-y-8 relative">
            <div className="relative">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#10175b]/50 mb-3 ml-1">
                {type === 'book' ? "Subject Property: Title" : "Subject Property: Research Title"}
              </label>
              <div className="relative group">
                <input
                  name="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder={type === 'book' ? "Enter book title..." : "Enter research title..."}
                  required
                  autoFocus
                  className="w-full px-4 py-2 bg-white/50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#10175b]/20 focus:border-[#10175b] text-base text-slate-900 placeholder-slate-300 font-serif transition-all"
                />
                {!isLoading ? (
                  <IconSearch className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#10175b]/20" strokeWidth={1} />
                ) : (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <IconLoader className="w-5 h-5 animate-spin text-[#10175b]/40" />
                  </div>
                )}
              </div>

              <AnimatePresence>
                {showDropdown && suggestions.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#FDFCF7] border border-[#10175b]/10 shadow-2xl z-[100] p-1.5 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-[0.1] pointer-events-none" />
                    <div className="relative max-h-[280px] overflow-y-auto space-y-1">
                      {suggestions.map((doc, idx) => {
                        const secureThumb = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-S.jpg` : null;

                        return (
                          <div
                            key={idx}
                            onClick={() => selectBook(doc)}
                            className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-4 transition-colors group"
                          >
                            <div className="shrink-0">
                              {secureThumb ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={secureThumb} alt="" className="w-10 h-14 object-cover rounded shadow-sm border border-slate-200" />
                              ) : (
                                <div className="w-10 h-14 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                                  <IconBook size={18} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 leading-tight mb-1 truncate group-hover:text-[#10175b] transition-colors">{doc.title}</p>
                              <p className="text-xs text-slate-500 truncate font-medium underline decoration-slate-200 underline-offset-4">
                                {doc.author_name ? doc.author_name.join(', ') : 'Unknown Scholar'}
                              </p>
                              <div className="flex gap-3 items-center mt-2">
                                {doc.number_of_pages_median && (
                                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{doc.number_of_pages_median} Pages</span>
                                )}
                                {doc.first_publish_year && (
                                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">• {doc.first_publish_year}</span>
                                )}
                              </div>
                            </div>
                            <IconChevronRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#10175b]/50 mb-3 ml-1">
                  {type === 'book' ? "Author Registry" : "Research Lead(s)"}
                </label>
                <input
                  name={type === 'book' ? "author" : "authors"}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="The Scholar's Name..."
                  className="w-full px-4 py-2 bg-white/50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#10175b]/20 focus:border-[#10175b] text-sm text-slate-800 placeholder-slate-300 font-serif transition-all"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#10175b]/50 mb-3 ml-1">
                  {type === 'book' ? "Archive Volume (Pages)" : "Catalog Year"}
                </label>
                <input
                  name={type === 'book' ? "totalPages" : "year"}
                  value={totalPages}
                  onChange={(e) => setTotalPages(e.target.value)}
                  placeholder="0000"
                  type="number"
                  className="w-full px-4 py-2 bg-white/50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#10175b]/20 focus:border-[#10175b] text-sm text-slate-800 placeholder-slate-300 font-serif transition-all"
                />
              </div>
            </div>
          </div>





          <div className="pt-2">
            <SubmitBtn />
          </div>
        </form>
      </div>
    </motion.div>
  );
}
