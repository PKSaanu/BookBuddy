import { db } from '@/db/db';
import { books, papers, translations, paperTranslations, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getDashboardData(userId: string) {
  const [userBooks, userPapers, userRecord, allBookTranslations, allPaperTranslations] =
    await Promise.all([
      db
        .select()
        .from(books)
        .where(eq(books.userId, userId))
        .orderBy(desc(books.createdAt)),
      db
        .select()
        .from(papers)
        .where(eq(papers.userId, userId))
        .orderBy(desc(papers.createdAt)),
      db
        .select({ isResearcher: users.isResearcher, name: users.name })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1),
      db
        .select()
        .from(translations)
        .where(eq(translations.userId, userId)),
      db
        .select()
        .from(paperTranslations)
        .where(eq(paperTranslations.userId, userId)),
    ]);

  const isResearcher = userRecord[0]?.isResearcher ?? false;
  const userName = userRecord[0]?.name || '';

  // Merge and sort recent items
  const combinedItems = [
    ...userBooks.map((b) => ({ ...b, type: 'book' as const })),
    ...userPapers.map((p) => ({ ...p, type: 'paper' as const, author: p.authors })),
  ].sort((a, b) => {
    const aTime = a.lastOpenedAt ? a.lastOpenedAt.getTime() : a.createdAt.getTime();
    const bTime = b.lastOpenedAt ? b.lastOpenedAt.getTime() : b.createdAt.getTime();
    return bTime - aTime;
  });

  const userVocabCount =
    allBookTranslations.filter((t) => userBooks.some((b) => b.id === t.bookId)).length +
    allPaperTranslations.filter((t) => userPapers.some((p) => p.id === t.paperId)).length;

  // Calculate progress for top 3 carousel items
  const finalItems = combinedItems.map((item, index) => {
    let itemProgress = 0;
    if (index <= 2 && item.type === 'book') {
      const recentTranslations = allBookTranslations.filter((t) => t.bookId === item.id);
      const maxPage = recentTranslations.reduce((max, t) => Math.max(max, t.pageNumber || 0), 0);
      const effectiveTotalPages = item.totalPages || (item.pdfPageCount ? Math.max(1, item.pdfPageCount - (item.pdfPageOffset || 0)) : 0);
      itemProgress = effectiveTotalPages ? Math.round((maxPage / effectiveTotalPages) * 100) : 0;
    }
    return { ...item, progress: itemProgress };
  });

  return {
    items: finalItems,
    recentItem: finalItems[0] || null,
    userVocabCount,
    isResearcher,
    userName,
  };
}

export async function getLibraryData(userId: string) {
  const [userBooks, userPapers, userRecord, allBookTranslations, allPaperTranslations] =
    await Promise.all([
      db
        .select()
        .from(books)
        .where(eq(books.userId, userId))
        .orderBy(desc(books.createdAt)),
      db
        .select()
        .from(papers)
        .where(eq(papers.userId, userId))
        .orderBy(desc(papers.createdAt)),
      db
        .select({ isResearcher: users.isResearcher })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1),
      db
        .select({ id: translations.id, bookId: translations.bookId, pageNumber: translations.pageNumber })
        .from(translations)
        .where(eq(translations.userId, userId)),
      db
        .select({ id: paperTranslations.id, paperId: paperTranslations.paperId, pageNumber: paperTranslations.pageNumber })
        .from(paperTranslations)
        .where(eq(paperTranslations.userId, userId)),
    ]);

  const isResearcher = userRecord[0]?.isResearcher ?? false;
  const papersToInclude = isResearcher ? userPapers : [];

  const combinedRaw = [
    ...userBooks.map((b) => ({ ...b, type: 'book' as const, year: null as number | null })),
    ...papersToInclude.map((p) => ({ ...p, type: 'paper' as const, author: p.authors, coverImage: null as string | null })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const serializeItem = (item: (typeof combinedRaw)[number]) => {
    const isBook = item.type === 'book';
    const itemTranslations = isBook
      ? allBookTranslations.filter((t) => t.bookId === item.id)
      : allPaperTranslations.filter((t) => t.paperId === item.id);

    const maxPage = itemTranslations.reduce((max, t) => Math.max(max, t.pageNumber || 0), 0);

    return {
      id: item.id,
      title: item.title,
      author: item.author || null,
      coverImage: item.coverImage || null,
      totalPages: item.totalPages || null,
      pdfPageCount: item.pdfPageCount || null,
      year: item.year || null,
      type: item.type,
      translationCount: itemTranslations.length,
      maxPage,
    };
  };

  const serializedBooks = userBooks.map((b) => serializeItem({ ...b, type: 'book' as const, year: null }));
  const serializedPapers = papersToInclude.map((p) => serializeItem({ ...p, type: 'paper' as const, author: p.authors, coverImage: null }));
  const serializedCombined = combinedRaw.map(serializeItem);

  const totalWords =
    allBookTranslations.filter((t) => userBooks.some((b) => b.id === t.bookId)).length +
    allPaperTranslations.filter((t) => papersToInclude.some((p) => p.id === t.paperId)).length;

  return {
    isResearcher,
    serializedBooks,
    serializedPapers,
    serializedCombined,
    totalItems: combinedRaw.length,
    totalWords,
  };
}

export async function getWordPoolData(userId: string) {
  const [bookTranslations, researchTranslations] = await Promise.all([
    db
      .select()
      .from(translations)
      .where(eq(translations.userId, userId))
      .orderBy(desc(translations.createdAt)),
    db
      .select()
      .from(paperTranslations)
      .where(eq(paperTranslations.userId, userId))
      .orderBy(desc(paperTranslations.createdAt)),
  ]);

  return [...bookTranslations, ...researchTranslations].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

export async function getSettingsStats(userId: string) {
  const [userBooks, userTranslations] = await Promise.all([
    db.select({ id: books.id }).from(books).where(eq(books.userId, userId)),
    db.select({ id: translations.id, bookId: translations.bookId }).from(translations).where(eq(translations.userId, userId)),
  ]);

  const bookCount = userBooks.length;
  const wordsCount = userTranslations.filter((t) =>
    userBooks.some((b) => b.id === t.bookId)
  ).length;

  return {
    bookCount,
    wordsCount,
  };
}
