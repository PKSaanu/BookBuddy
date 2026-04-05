import { db } from '@/db/db';
import { books, translations } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { eq, desc } from 'drizzle-orm';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.id) {
    redirect('/login');
  }

  const userBooks = await db.select()
    .from(books)
    .where(eq(books.userId, session.id as string))
    .orderBy(desc(books.createdAt));

  const recentBook = userBooks[0];
  const oldBooks = userBooks.slice(1);

  // Stats
  const allTranslations = await db.select().from(translations);
  const userVocabCount = allTranslations.filter(t => userBooks.some(b => b.id === t.bookId)).length;

  const recentBookTranslations = allTranslations.filter(t => recentBook && t.bookId === recentBook.id);
  const maxPage = recentBookTranslations.reduce((max, t) => Math.max(max, t.pageNumber || 0), 0);
  const progress = recentBook?.totalPages ? Math.round((maxPage / recentBook.totalPages) * 100) : 0;

  return (
    <DashboardClient 
      userBooks={userBooks}
      userVocabCount={userVocabCount}
      recentBook={recentBook}
      oldBooks={oldBooks}
      progress={progress}
    />
  );
}
