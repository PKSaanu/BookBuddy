import { db } from '@/db/db';
import { books, translations } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { eq, desc, inArray } from 'drizzle-orm';
import LayoutWrapper from '@/components/layout-wrapper';
import WordPoolClient from './word-pool-client';

export default async function WordPoolPage() {
  const session = await getSession();
  
  if (!session?.id) {
    redirect('/login');
  }

  // Fetch all books for the user to get their IDs
  const userBooks = await db.select({ id: books.id })
    .from(books)
    .where(eq(books.userId, session.id as string));

  const bookIds = userBooks.map(b => b.id);

  let userTranslations: any[] = [];
  if (bookIds.length > 0) {
    userTranslations = await db.select()
      .from(translations)
      .where(inArray(translations.bookId, bookIds))
      .orderBy(desc(translations.createdAt));
  }

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
