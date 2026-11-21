import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LayoutWrapper from '@/components/layout-wrapper';
import WordPoolClient from './word-pool-client';
import { getWordPoolData } from '@/db/queries';

export default async function WordPoolPage() {
  const session = await getSession();
  
  if (!session?.id) {
    redirect('/login');
  }

  const userTranslations = await getWordPoolData(session.id as string);

  return (
    <LayoutWrapper>
      <div className="max-w-[1200px] mx-auto px-6 py-10 md:py-16">
        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#10175b] tracking-tight mb-4">
            Word Pool
          </h1>
          <p className="text-slate-500 text-lg md:text-xl font-serif italic">
            Visualizing your collection of deciphered gems
          </p>
        </header>

        <WordPoolClient initialWords={userTranslations} />
      </div>
    </LayoutWrapper>
  );
}
