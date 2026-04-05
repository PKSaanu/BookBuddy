import { db } from '@/db/db';
import { books, translations } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { eq, and, desc, asc } from 'drizzle-orm';
import Sidebar from '@/components/sidebar';
import TranslationPanel from './translation-panel';
import { DeleteTranslationButton } from './delete-button';
import { DeleteBookButton } from './delete-book-button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;
  
  if (!session?.id) {
    redirect('/login');
  }

  const [book] = await db.select().from(books).where(and(eq(books.id, id), eq(books.userId, session.id as string)));

  if (!book) {
    redirect('/dashboard');
  }

  const vocab = await db.select()
    .from(translations)
    .where(eq(translations.bookId, id))
    .orderBy(desc(translations.pageNumber), desc(translations.createdAt));

  const maxPage = vocab.reduce((max, t) => Math.max(max, t.pageNumber || 0), 0);
  const progressPercent = book.totalPages ? Math.round((maxPage / book.totalPages) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-[#F4F5F6]">
      <Sidebar />
      <main className="flex-1 md:ml-64 px-8 py-10 md:px-16 md:py-16 xl:px-32 xl:py-24 overflow-y-auto w-full">
        <div className="max-w-[1000px] mx-auto">
            {/* Book Header Section */}
            <div className="mb-20">
                <div className="flex items-center justify-between w-full mb-10">
                    <Link href="/library" className="inline-flex items-center text-[12px] font-bold text-[#10175b] hover:text-[#1a2066] transition-colors group uppercase tracking-[0.1em]">
                        <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
                        Back to Library
                    </Link>
                    <div className="flex items-center gap-4">
                        <DeleteBookButton bookId={book.id} bookTitle={book.title} />
                        <div className="bg-[#0f766e] text-white text-[11px] font-bold tracking-[0.1em] uppercase px-4 py-1.5 rounded-full shadow-sm">
                            {progressPercent}% Complete
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col border-b border-slate-200/50 pb-12">
                     <h1 className="text-5xl sm:text-[76px] font-serif text-[#171717] font-bold tracking-tight leading-[1] mb-6">{book.title}</h1>
                     {book.author && <div className="flex items-center gap-4">
                         <p className="text-xl text-slate-600 font-serif italic tracking-wide">
                            {book.author}
                         </p>
                         <span className="text-slate-300 font-sans font-normal">•</span>
                         <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#10175b]">
                            {book.totalPages ? `${book.totalPages} Total Pages` : 'Page tracking enabled'}
                         </p>
                     </div>}
                </div>
            </div>

            {/* Translation Interactive Panel */}
            <div className="mb-24">
                <TranslationPanel bookId={book.id} preferredLanguage={session.preferredLanguage as string} />
            </div>

            {/* Vocabulary List Section */}
            <div className="pb-32">
                <div className="flex items-center justify-between mb-16 pt-16 border-t border-slate-200/60">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Your Saved Curation</h3>
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">{vocab.length} saved items</p>
                </div>
                
                {vocab.length === 0 ? (
                    <div className="bg-transparent border border-dashed border-slate-300 rounded-[24px] p-24 text-center">
                        <p className="text-slate-400 font-serif italic text-xl">"This curation is currently unwritten. Decipher your first sentence above."</p>
                    </div>
                ) : (
                    <div className="space-y-24">
                        {vocab.map((entry) => {
                            const dateStr = new Intl.DateTimeFormat('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric'
                            }).format(new Date(entry.createdAt)).toUpperCase();

                            return (
                                <div key={entry.id} className="relative group animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1 pr-12">
                                            <div className="flex items-center gap-3 mb-1.5">
                                                {entry.pageNumber && (
                                                    <span className="shrink-0 bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-1 rounded uppercase tracking-tighter mr-1">
                                                        P. {entry.pageNumber}
                                                    </span>
                                                )}
                                                <h4 className="text-xl md:text-2xl font-serif font-bold text-[#171717] leading-tight">
                                                    {entry.originalText}
                                                </h4>
                                                <button className="text-slate-300 hover:text-[#10175b] transition-colors mt-0.5">
                                                     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                                                </button>
                                            </div>
                                            
                                            <div className="space-y-1">
                                                <p className="text-xl md:text-2xl font-bold text-[#012B5B] tracking-tight">
                                                    {entry.translatedText}
                                                </p>
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                    {entry.language} Translation
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end shrink-0">
                                            <span className="text-[10px] font-bold text-slate-400 tracking-wider mb-4">{dateStr}</span>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <DeleteTranslationButton id={entry.id} bookId={book.id} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Footer Links Match */}
                        <div className="pt-24 flex flex-col items-center gap-12">
                             <p className="text-slate-400 font-serif italic text-lg text-center max-w-lg">
                                "So we beat on, boats against the current, borne back ceaselessly into the past."
                             </p>
                             <div className="flex items-center gap-10">
                                 <button className="text-[11px] font-black uppercase tracking-[0.2em] text-[#10175b] hover:underline decoration-2 underline-offset-8">Export Library</button>
                                 <button className="text-[11px] font-black uppercase tracking-[0.2em] text-[#10175b] hover:underline decoration-2 underline-offset-8">Revision Mode</button>
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}
