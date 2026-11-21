import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LayoutWrapper from '@/components/layout-wrapper';
import { AddBookHeaderButton } from '../dashboard/add-book-header-button';
import { IconBooks, IconVocabulary, IconSignature } from '@tabler/icons-react';
import { LibraryClient } from './library-client';
import { getLibraryData } from '@/db/queries';

export default async function Library() {
  const session = await getSession();
  
  if (!session?.id) {
    redirect('/login');
  }

  const {
    isResearcher,
    serializedBooks,
    serializedPapers,
    serializedCombined,
    totalItems,
    totalWords,
  } = await getLibraryData(session.id as string);

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
                The <span className="italic">Scholar&apos;s</span> <br/> Private Archive.
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
                &ldquo;Unlocking wisdom, one bound volume at a time.&rdquo;
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
