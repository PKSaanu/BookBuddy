import { db } from '@/db/db';
import { books, translations } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { eq, desc } from 'drizzle-orm';
import LayoutWrapper from '@/components/layout-wrapper';
import { AddBookHeaderButton } from '../dashboard/add-book-header-button';
import { IconBooks, IconVocabulary, IconSignature } from '@tabler/icons-react';
import Link from 'next/link';
import { coverBackgrounds } from '@/lib/constants';

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
  const totalWords = allTranslations.length;
  const totalBooks = userBooks.length;

  return (
    <LayoutWrapper>
      <div className="px-6 py-10 md:px-12 md:py-16 xl:px-16 xl:py-20 bg-[#F4F5F6] min-h-screen">
        <div className="max-w-7xl mx-auto">
            {/* Museum-style Header Section */}
            <div className="mb-16 md:mb-20 pb-12 border-b border-slate-300 flex flex-col xl:flex-row xl:items-end justify-between gap-12 relative">
                <div className="max-w-3xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-[#10175b] rounded-xl flex items-center justify-center text-white shadow-lg">
                            <IconSignature size={24} />
                        </div>
                        <p className="text-[11px] md:text-[13px] tracking-[0.3em] font-black text-[#10175b]/40 uppercase">Curated Collection</p>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif text-[#10175b] font-bold tracking-tight leading-[1.1] mb-8">
                        The <span className="italic">Scholar's</span> <br/> Private Archive.
                    </h1>
                    
                    {/* Visual Stats Bar */}
                    <div className="flex items-center gap-10 md:gap-16 pt-2">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                                <IconBooks size={18} className="text-[#10175b]/40" />
                                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#10175b]/50">Volumes</span>
                            </div>
                            <span className="text-4xl font-serif font-black text-[#10175b]">{totalBooks}</span>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                                <IconVocabulary size={18} className="text-[#10175b]/40" />
                                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#10175b]/50">Words Deciphered</span>
                            </div>
                            <span className="text-4xl font-serif font-black text-[#10175b]">{totalWords}</span>
                        </div>
                    </div>
                </div>
                
                <div className="shrink-0 flex flex-col items-end gap-6 mb-2">
                    <AddBookHeaderButton />
                    <p className="text-[10px] font-mono font-bold text-[#10175b]/30 max-w-[200px] text-right leading-relaxed italic">
                        "Unlocking wisdom, one bound volume at a time."
                    </p>
                </div>
            </div>

            {/* Book Grid - Restored Vertical Layout */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 md:gap-x-10 gap-y-12 md:gap-y-16">
                {userBooks.map((book, index) => {
                    const bookTranslations = allTranslations.filter(t => t.bookId === book.id);
                    const maxPage = bookTranslations.reduce((max, t) => Math.max(max, t.pageNumber || 0), 0);
                    
                    return (
                        <Link 
                            key={book.id} 
                            href={`/books/${book.id}`}
                            className="group flex flex-col"
                        >
                            {/* Book Cover Container */}
                            <div className="relative aspect-[2/3] mb-6 rounded-2xl overflow-hidden isolate transform-gpu backface-hidden shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.03] will-change-transform bg-white">
                                
                                {/* Paper Texture Overlay */}
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none mix-blend-overlay z-10 rounded-2xl" />
                                
                                {/* Binding Shadow */}
                                <div className="absolute inset-y-0 left-0 w-4 bg-black/20 blur-[1px] z-20 rounded-l-2xl" />
                                
                                {book.coverImage ? (
                                    <img 
                                        src={book.coverImage} 
                                        alt={book.title}
                                        className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-110 will-change-transform"
                                    />
                                ) : (
                                    <div className={`w-full h-full bg-gradient-to-br ${coverBackgrounds[index % coverBackgrounds.length]} flex flex-col items-center justify-center p-6 text-center rounded-2xl relative overflow-hidden isolate shadow-inner`}>
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-10 pointer-events-none mix-blend-overlay" />
                                        <div className="w-12 h-0.5 bg-white/30 mb-4 rounded-full" />
                                        <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-2 drop-shadow-sm">Scholar Edition</p>
                                        <h3 className="text-white text-lg md:text-xl font-serif font-bold italic leading-tight drop-shadow-md">{book.title}</h3>
                                    </div>
                                )}

                                {/* Subtle Glint/Shine Animation on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out z-20" />

                                {/* Modern 'Archival Glass' Hover Overlay */}
                                <div className="absolute inset-x-0 bottom-0 py-5 bg-white/20 backdrop-blur-md border-t border-white/30 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 flex items-center justify-center z-30">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white drop-shadow-sm">Open Volume</span>
                                        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-[#10175b]">
                                            <IconBooks size={12} strokeWidth={2.5} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Text Metadata */}
                            <div className="flex flex-col space-y-1.5 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="h-[1px] w-4 bg-slate-300 transition-all duration-300 group-hover:w-8 group-hover:bg-[#10175b]" />
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#10175b]/40 whitespace-nowrap">
                                        {book.totalPages ? `PAGE ${maxPage} / ${book.totalPages}` : 'NEW ARCHIVE'}
                                    </p>
                                </div>
                                <h3 className="text-base md:text-lg font-serif font-bold text-slate-800 leading-tight group-hover:text-[#10175b] transition-colors line-clamp-2">
                                    {book.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono font-bold text-slate-400">{bookTranslations.length} WORDS</span>
                                    <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                    <p className="text-[11px] text-slate-500 font-serif italic truncate">
                                        {book.author || 'Anonymous'}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    );
                })}

                {userBooks.length === 0 && (
                    <div className="col-span-full py-40 text-center bg-[#EBECEF] rounded-[40px] border-2 border-dashed border-slate-300 shadow-inner group">
                        <div className="max-w-sm mx-auto flex flex-col items-center">
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 mb-8 shadow-sm group-hover:scale-110 transition-transform">
                                <IconBooks size={40} />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-[#10175b] mb-4">Archive Empty</h3>
                            <p className="text-slate-500 font-medium leading-relaxed mb-10 italic">"The greatest library begins with a single selection. Start your curation today."</p>
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

