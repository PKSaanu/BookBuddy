import { db } from '@/db/db';
import { books, papers, translations, paperTranslations, users } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { eq, desc } from 'drizzle-orm';
import LayoutWrapper from '@/components/layout-wrapper';
import { AddBookHeaderButton } from '../dashboard/add-book-header-button';
import { IconBooks, IconVocabulary, IconSignature } from '@tabler/icons-react';
import { LibraryClient } from './library-client';

export default async function Library() {
  const session = await getSession();
  
  if (!session?.id) {
    redirect('/login');
  }

  const [userBooks, userPapers, user] = await Promise.all([
    db.select().from(books).where(eq(books.userId, session.id as string)).orderBy(desc(books.createdAt)),
    db.select().from(papers).where(eq(papers.userId, session.id as string)).orderBy(desc(papers.createdAt)),
    db.select({ isResearcher: users.isResearcher }).from(users).where(eq(users.id, session.id as string)).limit(1)
  ]);

  const isResearcher = user[0]?.isResearcher ?? false;

  const [allBookTranslations, allPaperTranslations] = await Promise.all([
    db.select().from(translations).where(eq(translations.userId, session.id as string)),
    db.select().from(paperTranslations).where(eq(paperTranslations.userId, session.id as string))
  ]);

  // Combine items for the default "unified" view
  // If research mode is disabled, do not include papers in the library at all.
  const papersToInclude = isResearcher ? userPapers : [];
  
  const combinedRaw = [
    ...userBooks.map(b => ({ ...b, type: 'book' as const, year: null })),
    ...papersToInclude.map(p => ({ ...p, type: 'paper' as const, author: p.authors }))
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Serialize properties for client component
  const serializeItem = (item: any) => {
    const isBook = item.type === 'book';
    const itemTranslations = isBook 
      ? allBookTranslations.filter(t => t.bookId === item.id)
      : allPaperTranslations.filter(t => t.paperId === item.id);
      
    const maxPage = itemTranslations.reduce((max, t) => Math.max(max, t.pageNumber || 0), 0);

    return {
      id: item.id,
      title: item.title,
      author: item.author || null,
      coverImage: item.coverImage || null,
      totalPages: item.totalPages || null,
      year: item.year || null,
      type: item.type as 'book' | 'paper',
      translationCount: itemTranslations.length,
      maxPage
    };
  };

  const serializedBooks = userBooks.map(b => serializeItem({ ...b, type: 'book' }));
  const serializedPapers = papersToInclude.map(p => serializeItem({ ...p, type: 'paper', author: p.authors }));
  const serializedCombined = combinedRaw.map(serializeItem);

  const totalWords = 
    allBookTranslations.filter(t => userBooks.some(b => b.id === t.bookId)).length +
    allPaperTranslations.filter(t => papersToInclude.some(p => p.id === t.paperId)).length;
    
  const totalItems = combinedRaw.length;

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
                            <span className="text-4xl font-serif font-black text-[#10175b]">{totalItems}</span>
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
                    <AddBookHeaderButton isResearcher={isResearcher} />
                    <p className="text-[10px] font-mono font-bold text-[#10175b]/30 max-w-[200px] text-right leading-relaxed italic">
                        "Unlocking wisdom, one bound volume at a time."
                    </p>
                </div>
            </div>

            {/* Client Component: Animated Tabs & Grid */}
            <LibraryClient 
              isResearcher={isResearcher}
              books={serializedBooks}
              papers={serializedPapers}
              combinedItems={serializedCombined}
            />

        </div>
      </div>
    </LayoutWrapper>
  );
}

