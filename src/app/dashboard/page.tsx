import { db } from '@/db/db';
import { books, papers, translations, paperTranslations, users } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { eq, desc } from 'drizzle-orm';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.id) {
    redirect('/login');
  }

  // Fetch items from both tables
  const [userBooks, userPapers, user] = await Promise.all([
    db.select().from(books).where(eq(books.userId, session.id as string)).orderBy(desc(books.createdAt)),
    db.select().from(papers).where(eq(papers.userId, session.id as string)).orderBy(desc(papers.createdAt)),
    db.select({ isResearcher: users.isResearcher, name: users.name }).from(users).where(eq(users.id, session.id as string)).limit(1)
  ]);

  const isResearcher = user[0]?.isResearcher ?? false;
  const userName = user[0]?.name || '';

  // Merge and sort
  const combinedItems = [
    ...userBooks.map(b => ({ ...b, type: 'book' as const })),
    ...userPapers.map(p => ({ ...p, type: 'paper' as const, author: p.authors })) 
  ].sort((a, b) => {
    const aTime = a.lastOpenedAt ? a.lastOpenedAt.getTime() : a.createdAt.getTime();
    const bTime = b.lastOpenedAt ? b.lastOpenedAt.getTime() : b.createdAt.getTime();
    return bTime - aTime;
  });


  // Stats
  const [allBookTranslations, allPaperTranslations] = await Promise.all([
    db.select().from(translations).where(eq(translations.userId, session.id as string)),
    db.select().from(paperTranslations).where(eq(paperTranslations.userId, session.id as string))
  ]);

  const userVocabCount = 
    allBookTranslations.filter(t => userBooks.some(b => b.id === t.bookId)).length +
    allPaperTranslations.filter(t => userPapers.some(p => p.id === t.paperId)).length;

  // Map progress directly into the items array for the carousel items
  const finalItems = combinedItems.map((item, index) => {
    let itemProgress = 0;
    
    // Only calculate progress for top 3 carousel items to save resources
    if (index <= 2 && item.type === 'book') {
      const recentTranslations = allBookTranslations.filter(t => t.bookId === item.id);
      const maxPage = recentTranslations.reduce((max, t) => Math.max(max, t.pageNumber || 0), 0);
      const effectiveTotalPages = (item as any).pdfPageCount || (item as any).totalPages || 0;
      itemProgress = effectiveTotalPages ? Math.round((maxPage / effectiveTotalPages) * 100) : 0;
    }
    
    return { ...item, progress: itemProgress };
  });

  const recentItem = finalItems[0];
  const oldItems = finalItems.slice(1);

  return (
    <DashboardClient 
      userName={userName}
      items={finalItems}
      userVocabCount={userVocabCount}
      recentItem={recentItem}
      oldItems={oldItems}
      progress={recentItem?.progress || 0}
      isResearcher={isResearcher}
    />
  );
}
