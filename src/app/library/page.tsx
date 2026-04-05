import { db } from '@/db/db';
import { books, translations } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { eq, desc } from 'drizzle-orm';
import Sidebar from '@/components/sidebar';
import { AddBookHeaderButton } from '@/app/dashboard/add-book-header-button';
import Link from 'next/link';

// Expanded palette of premium academic gradients for better uniqueness
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

export default async function LibraryPage() {
  const session = await getSession();
  if (!session?.id) {
    redirect('/login');
  }

  const userBooks = await db.select()
    .from(books)
    .where(eq(books.userId, session.id as string))
    .orderBy(desc(books.createdAt));

  const allTranslations = await db.select().from(translations);
  
  // Group translations to get vocab count per book
  const vocabCounts = allTranslations.reduce((acc, current) => {
    acc[current.bookId] = (acc[current.bookId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex min-h-screen bg-[#F4F5F6]">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 px-12 py-16 xl:px-24 xl:py-20 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-16 pb-8 border-b border-slate-200 flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                <div className="max-w-2xl">
                    <p className="text-[12px] tracking-[0.15em] font-black text-slate-500 uppercase mb-4">Complete Archive</p>
                    <h1 className="text-5xl md:text-7xl font-serif text-[#10175b] tracking-tight leading-tight">
                        My Library
                    </h1>
                    <p className="mt-6 text-xl text-slate-600 font-medium">
                        Every text you've explored. Dive back in to review your saved vocabulary and translate new chapters.
                    </p>
                </div>
                <div className="shrink-0 mb-2">
                    <AddBookHeaderButton />
                </div>
            </div>

            {/* Book Showcase Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-16">
                {userBooks.map((book, idx) => {
                    const bgClass = coverBackgrounds[idx % coverBackgrounds.length];

                    // Calculate progress
                    const bookTranslations = allTranslations.filter(t => t.bookId === book.id);
                    const maxPage = bookTranslations.reduce((max, t) => Math.max(max, t.pageNumber || 0), 0);
                    const progress = book.totalPages ? Math.round((maxPage / book.totalPages) * 100) : 0;
                    const vocabCount = bookTranslations.length;

                    return (
                    <Link href={`/books/${book.id}`} key={book.id} className="group flex flex-col h-full">
                        
                        {/* Book Spine / Cover Representation */}
                        <div className="relative w-full aspect-[2/3] rounded-r-3xl rounded-l-md overflow-hidden shadow-[12px_15px_30px_rgba(0,0,0,0.15)] group-hover:shadow-[20px_25px_40px_rgba(0,0,0,0.25)] group-hover:-translate-y-2 transition-all duration-500 mb-6 border-l-8 border-white/10 flex flex-col items-center justify-center text-center bg-gradient-to-tr transition-all">
                            
                            {book.coverImage ? (
                                <>
                                    <img 
                                        src={book.coverImage.replace('http:', 'https:')} 
                                        alt={book.title}
                                        className="absolute inset-0 w-full h-full object-cover opacity-90 transition-all duration-700 group-hover:scale-110 group-hover:blur-[2px]"
                                    />
                                    <div className="absolute inset-0 bg-[#0a0f44]/10 group-hover:bg-[#0a0f44]/50 transition-colors duration-500"></div>
                                    
                                    {/* Cover Content Overlay - Hidden by default, visible only on hover */}
                                    <div className="relative z-10 w-full p-8 transition-all duration-500 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                                        <div className="h-0.5 w-12 bg-white/60 mx-auto mb-6"></div>
                                        <h3 className="text-3xl font-serif font-bold text-white leading-snug mb-4 px-2 group-hover:text-amber-100 transition-colors drop-shadow-xl">
                                            {book.title}
                                        </h3>
                                        <p className="text-[13px] font-bold tracking-[0.1em] text-white uppercase drop-shadow-md">
                                            {book.author || 'Unknown Author'}
                                        </p>
                                        <div className="h-0.5 w-12 bg-white/60 mx-auto mt-6"></div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Varied Gradient Background for books without images */}
                                    <div className={`absolute inset-0 bg-gradient-to-tr ${bgClass} opacity-100`}></div>
                                    <div 
                                        className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none" 
                                        style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/black-linen.png')` }}
                                    ></div>
                                    
                                    {/* Cover Content - Always visible for fallback colors as in design */}
                                    <div className="relative z-10 w-full p-8 transition-all duration-300 group-hover:scale-105">
                                        <div className="h-0.5 w-12 bg-white/30 mx-auto mb-6"></div>
                                        <h3 className="text-3xl font-serif font-bold text-white leading-snug mb-4 px-2 group-hover:text-amber-100 transition-colors">
                                            {book.title}
                                        </h3>
                                        <p className="text-[13px] font-bold tracking-[0.1em] text-white/60 uppercase">
                                            {book.author || 'Unknown Author'}
                                        </p>
                                        <div className="h-0.5 w-12 bg-white/30 mx-auto mt-6"></div>
                                    </div>
                                </>
                            )}
                            
                            <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/40 to-transparent z-20"></div>

                            {/* Progress Badge */}
                            {book.totalPages && (
                                <div className="absolute top-6 right-6 z-30 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-black/5">
                                    <p className="text-[10px] font-black text-[#10175b] uppercase tracking-wider">{progress}% Read</p>
                                </div>
                            )}

                        </div>

                        {/* Text Info */}
                        <div className="px-2">
                             <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    {vocabCount} Vocabs Mastered
                                </span>
                                {book.totalPages && (
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0f766e]">
                                        Page {maxPage} / {book.totalPages}
                                    </span>
                                )}
                             </div>
                             <h4 className="text-2xl font-serif font-bold text-[#10175b] group-hover:text-[#1a2066] transition-colors mb-1 line-clamp-1">{book.title}</h4>
                             <p className="text-sm text-slate-500 font-medium">{book.author || 'Unknown Author'}</p>
                             
                             {/* Small Progress Bar */}
                             {book.totalPages && (
                                <div className="mt-6 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-[#10175b] to-[#0f766e] transition-all duration-1000"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                             )}
                        </div>
                    </Link>
                    )
                })}
            </div>

            {userBooks.length === 0 && (
                 <div className="text-center py-20 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                     <p className="text-slate-500 text-lg font-medium">Your library is currently empty.</p>
                 </div>
            )}
        </div>
      </main>
    </div>
  );
}
