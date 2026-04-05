import { db } from '@/db/db';
import { books, translations } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import TranslationPanel from './translation-panel';
import CurationList from './curation-list';
import LayoutWrapper from '@/components/layout-wrapper';
import { DeleteBookButton } from './delete-book-button';

export default async function BookPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  
  if (!session?.id) {
    redirect('/login');
  }

  const { id: bookId } = await params;

  const [book] = await db.select()
    .from(books)
    .where(eq(books.id, bookId));

  if (!book || book.userId !== session.id) {
    notFound();
  }

  const vocab = await db.select()
    .from(translations)
    .where(eq(translations.bookId, bookId))
    .orderBy(desc(translations.createdAt));

  const maxPage = vocab.reduce((max, t) => Math.max(max, t.pageNumber || 0), 0);
  const progressPercent = book.totalPages ? Math.round((maxPage / book.totalPages) * 100) : 0;

  return (
    <LayoutWrapper>
      <div className="px-5 py-8 md:px-12 md:py-10 xl:px-16 xl:py-12">
        <div className="max-w-[1000px] mx-auto">
            {/* Book Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between w-full mb-6">
                    <Link href="/library" className="inline-flex items-center text-[10px] md:text-[12px] font-bold text-[#10175b] hover:text-[#1a2066] transition-colors group uppercase tracking-[0.1em]">
                        <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
                        Back to Library
                    </Link>
                    <div className="flex items-center gap-3 md:gap-4">
                        <DeleteBookButton bookId={book.id} bookTitle={book.title} />
                        <div className="bg-[#0f766e] text-white text-[9px] md:text-[11px] font-bold tracking-[0.1em] uppercase px-3 md:px-4 py-1.5 rounded-full shadow-sm">
                            {progressPercent}% Complete
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col border-b border-slate-200/50 pb-8">
                     <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-[#171717] font-bold tracking-tight leading-[1.1] mb-4">{book.title}</h1>
                     {book.author && <div className="flex flex-wrap items-center gap-3 md:gap-4">
                         <p className="text-base md:text-lg text-slate-600 font-serif italic tracking-wide">
                            {book.author}
                         </p>
                         <span className="hidden sm:inline text-slate-300 font-sans font-normal">•</span>
                         <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#10175b]">
                            {book.totalPages ? `${book.totalPages} Total Pages` : 'Page tracking enabled'}
                         </p>
                     </div>}
                </div>
            </div>

            {/* Translation Interactive Panel */}
            <div className="mb-12">
                <TranslationPanel bookId={book.id} preferredLanguage={session.preferredLanguage as string} />
            </div>

            {/* Content Display / Saved Curation */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[10px] md:text-sm font-black uppercase tracking-[0.4em] text-[#10175b]">Your Saved Curation</h2>
                    <div className="h-[1px] flex-1 bg-[#10175b]/10 ml-4 md:ml-8" />
                </div>
                <CurationList vocab={vocab as any} bookId={book.id} />
                
                <div className="mt-24 pt-16 border-t border-slate-200/60 flex flex-col items-center gap-8 text-center">
                    <p className="text-slate-400 font-serif italic text-base md:text-lg max-w-lg">
                        "So we beat on, boats against the current, borne back ceaselessly into the past."
                    </p>
                    <div className="w-12 h-[1px] bg-slate-200" />
                </div>
            </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
