import { db } from '@/db/db';
import { books, translations } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { eq, and, desc } from 'drizzle-orm';
import Sidebar from '@/components/sidebar';
import TranslationPanel from './translation-panel';
import { DeleteBookButton } from './delete-book-button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CurationList from './curation-list';

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
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-sm font-black uppercase tracking-[0.4em] text-[#10175b]">Your Saved Curation</h2>
                    <div className="h-[1px] flex-1 bg-[#10175b]/10 ml-8" />
                </div>
                
                <CurationList vocab={vocab as any} bookId={book.id} />

                {/* Footer Actions */}
                <div className="mt-24 pt-16 border-t border-slate-200/60 flex flex-col items-center gap-8 text-center">
                    <p className="text-slate-400 font-serif italic text-lg max-w-lg">
                        "So we beat on, boats against the current, borne back ceaselessly into the past."
                    </p>
                    <div className="flex items-center gap-10">
                        <button className="text-[11px] font-black uppercase tracking-[0.2em] text-[#10175b] hover:underline decoration-2 underline-offset-8">Export Library</button>
                        <button className="text-[11px] font-black uppercase tracking-[0.2em] text-[#10175b] hover:underline decoration-2 underline-offset-8">Revision Mode</button>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
