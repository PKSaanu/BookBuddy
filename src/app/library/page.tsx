import { db } from '@/db/db';
import { books, translations } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { eq, desc } from 'drizzle-orm';
import LayoutWrapper from '@/components/layout-wrapper';
import { AddBookHeaderButton } from '../dashboard/add-book-header-button';
import Link from 'next/link';

export default async function Library() {
  const session = await getSession();
  
  if (!session?.id) {
    redirect('/login');
  }

  const userBooks = await db.select()
    .from(books)
    .where(eq(books.userId, session.id as string))
    .orderBy(desc(books.createdAt));

  const allTranslations = await db.select().from(translations);

  return (
    <LayoutWrapper>
      <div className="px-6 py-10 md:px-12 md:py-16 xl:px-16 xl:py-20">
        <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-12 md:mb-16 pb-8 border-b border-slate-200 flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                <div className="max-w-2xl">
                    <p className="text-[10px] md:text-[12px] tracking-[0.2em] font-black text-slate-400 uppercase mb-3 md:mb-4">Private Collection</p>
                    <h1 className="text-4xl md:text-5xl xl:text-6xl font-serif text-[#10175b] font-bold tracking-tight leading-[1.1]">
                        Explore your <span className="italic">boundless</span> library.
                    </h1>
                </div>
                <div className="shrink-0 mb-2">
                    <AddBookHeaderButton />
                </div>
            </div>

            {/* Book Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 md:gap-x-10 gap-y-12 md:gap-y-16">
                {userBooks.map((book) => {
                    const bookTranslations = allTranslations.filter(t => t.bookId === book.id);
                    const maxPage = bookTranslations.reduce((max, t) => Math.max(max, t.pageNumber || 0), 0);
                    
                    return (
                        <Link 
                            key={book.id} 
                            href={`/books/${book.id}`}
                            className="group flex flex-col"
                        >
                            {/* Book Spine/Cover Container - Forced Curvature & Stable Animation */}
                            <div className="relative aspect-[2/3] mb-6 rounded-2xl overflow-hidden isolate transform-gpu backface-hidden shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.03] will-change-transform">
                                
                                {/* Paper Texture Overlay - Curved */}
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none mix-blend-overlay z-10 rounded-2xl" />
                                
                                {/* Binding Shadow - Curved */}
                                <div className="absolute inset-y-0 left-0 w-4 bg-black/20 blur-[1px] z-20 rounded-l-2xl" />
                                
                                {book.coverImage ? (
                                    <img 
                                        src={book.coverImage} 
                                        alt={book.title}
                                        className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-110 will-change-transform"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#10175b] flex flex-col items-center justify-center p-6 text-center rounded-2xl">
                                        <div className="w-12 h-1 bg-white/20 mb-4 rounded-full" />
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Scholar Edition</p>
                                        <h3 className="text-white text-lg md:text-xl font-serif font-bold italic leading-tight">{book.title}</h3>
                                    </div>
                                )}

                                {/* Hover Overlay - Curved */}
                                <div className="absolute inset-0 bg-[#0a0f44]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-30 rounded-2xl">
                                    <span className="px-6 py-2.5 bg-white text-[#10175b] text-[10px] font-black uppercase tracking-[0.2em] rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        Open
                                    </span>
                                </div>
                            </div>

                            {/* Text Metadata */}
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="h-[1px] w-4 bg-slate-300 transition-all duration-300 group-hover:w-8 group-hover:bg-[#10175b]" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10175b] whitespace-nowrap">
                                        {book.totalPages ? `PAGE ${maxPage} / ${book.totalPages}` : 'NEW ENTRY'}
                                    </p>
                                </div>
                                <h3 className="text-lg font-serif font-bold text-slate-800 leading-tight group-hover:text-[#10175b] transition-colors line-clamp-2">
                                    {book.title}
                                </h3>
                                <p className="text-sm text-slate-500 font-serif italic tracking-wide">
                                    {book.author || 'Anonymous Author'}
                                </p>
                            </div>
                        </Link>
                    );
                })}

                {userBooks.length === 0 && (
                    <div className="col-span-full py-32 text-center bg-white/50 rounded-[40px] border-2 border-dashed border-slate-200">
                        <div className="max-w-xs mx-auto">
                            <p className="text-slate-400 font-medium mb-6">Your collection is currently empty. Begin your journey by adding a master volume.</p>
                            <AddBookHeaderButton />
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
