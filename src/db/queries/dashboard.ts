import { db } from '@/db/db';
import { books, papers, translations, paperTranslations, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export interface ItemCriteria {
  category: 'actively_reading' | 'recently_opened' | 'newly_added' | 'pick_up_again' | 'mastered' | 'revisit_recall';
  label: string;
  timeWindow: string;
  badgeBg: string;
}

export function determineItemCriteria(
  item: {
    type: 'book' | 'paper';
    createdAt: Date;
    lastOpenedAt?: Date | null;
  },
  lastTranslationDate?: Date | null,
  progress: number = 0,
  translationCount: number = 0
): ItemCriteria {
  const now = Date.now();
  const createdTime = new Date(item.createdAt).getTime();
  const openedTime = item.lastOpenedAt ? new Date(item.lastOpenedAt).getTime() : null;
  const transTime = lastTranslationDate ? new Date(lastTranslationDate).getTime() : null;

  const hoursSinceTrans = transTime ? (now - transTime) / (1000 * 60 * 60) : Infinity;
  const hoursSinceOpened = openedTime ? (now - openedTime) / (1000 * 60 * 60) : Infinity;
  const daysSinceOpened = openedTime ? (now - openedTime) / (1000 * 60 * 60 * 24) : Infinity;
  const daysSinceTrans = transTime ? (now - transTime) / (1000 * 60 * 60 * 24) : Infinity;
  const daysSinceAdded = (now - createdTime) / (1000 * 60 * 60 * 24);

  const isBook = item.type === 'book';

  // 1. Actively Reading: translated in last 48 hours, or opened within 24h with active translations
  if (hoursSinceTrans <= 48 || (hoursSinceOpened <= 24 && transTime !== null)) {
    let timeWindow = 'Active today';
    if (hoursSinceTrans < 1) {
      timeWindow = 'Translated just now';
    } else if (hoursSinceTrans < 24) {
      const h = Math.max(1, Math.floor(hoursSinceTrans));
      timeWindow = `Translated ${h}h ago`;
    } else if (hoursSinceTrans <= 48) {
      timeWindow = 'Translated yesterday';
    } else if (hoursSinceOpened < 24) {
      timeWindow = 'Active today';
    }

    return {
      category: 'actively_reading',
      label: isBook ? 'Actively Reading' : 'Active Research',
      timeWindow,
      badgeBg: isBook ? 'bg-emerald-600' : 'bg-teal-700',
    };
  }

  // 2. Revisit & Recall: completed book (progress >= 100) dormant for >= 7 days
  if (progress >= 100 && (daysSinceOpened >= 7 || (daysSinceTrans >= 7 && hoursSinceOpened > 48))) {
    let timeWindow = 'Mastered archive';
    if (daysSinceOpened < 30) {
      const d = Math.floor(daysSinceOpened);
      timeWindow = `Completed ${d}d ago${translationCount > 0 ? ` • ${translationCount} to recall` : ''}`;
    } else if (daysSinceOpened < 365) {
      const w = Math.floor(daysSinceOpened / 7);
      timeWindow = `Completed ${w}w ago${translationCount > 0 ? ` • ${translationCount} to recall` : ''}`;
    } else {
      timeWindow = `Completed archive${translationCount > 0 ? ` • ${translationCount} words` : ''}`;
    }

    return {
      category: 'revisit_recall',
      label: isBook ? 'Revisit & Recall' : 'Review Research',
      timeWindow,
      badgeBg: 'bg-purple-700',
    };
  }

  // 3. Mastered: 100% progress (recently completed within 7 days)
  if (progress >= 100) {
    return {
      category: 'mastered',
      label: isBook ? 'Mastered Volume' : 'Mastered Research',
      timeWindow: '100% Completed',
      badgeBg: 'bg-purple-700',
    };
  }

  // 4. Recently Opened: opened within 7 days (not today's active translation)
  if (daysSinceOpened <= 7) {
    let timeWindow = 'Opened this week';
    if (hoursSinceOpened < 24) {
      timeWindow = 'Opened today';
    } else if (daysSinceOpened < 2) {
      timeWindow = 'Opened yesterday';
    } else {
      const d = Math.floor(daysSinceOpened);
      timeWindow = `Opened ${d}d ago`;
    }

    return {
      category: 'recently_opened',
      label: isBook ? 'Recently Opened' : 'Recently Reviewed',
      timeWindow,
      badgeBg: 'bg-[#10175b]',
    };
  }

  // 5. Newly Added: added within 14 days and has not been extensively opened, or never opened
  if (daysSinceAdded <= 14 || openedTime === null) {
    let timeWindow = 'Newly added';
    if (daysSinceAdded < 1) {
      timeWindow = 'Added today';
    } else if (daysSinceAdded < 2) {
      timeWindow = 'Added yesterday';
    } else if (daysSinceAdded <= 14) {
      const d = Math.floor(daysSinceAdded);
      timeWindow = `Added ${d}d ago`;
    } else {
      timeWindow = 'Unopened volume';
    }

    return {
      category: 'newly_added',
      label: isBook ? 'Newly Added' : 'New Research',
      timeWindow,
      badgeBg: 'bg-amber-600',
    };
  }

  // 6. Pick Up Again (dormant / idle for > 7 days)
  let timeWindow = 'Dormant archive';
  if (daysSinceOpened < 30) {
    const d = Math.floor(daysSinceOpened);
    timeWindow = `Idle for ${d}d`;
  } else if (daysSinceOpened < 365) {
    const w = Math.floor(daysSinceOpened / 7);
    timeWindow = `Idle for ${w}w`;
  }

  return {
    category: 'pick_up_again',
    label: isBook ? 'Pick Up Again' : 'Resume Research',
    timeWindow,
    badgeBg: 'bg-slate-700',
  };
}

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

  // Process and enrich each item with progress, lastTranslationDate, and criteria
  const rawItems = [
    ...userBooks.map((b) => ({ ...b, type: 'book' as const })),
    ...userPapers.map((p) => ({ ...p, type: 'paper' as const, author: p.authors })),
  ];

  const enrichedItems = rawItems.map((item) => {
    const itemTranslations = item.type === 'book'
      ? allBookTranslations.filter((t) => t.bookId === item.id)
      : allPaperTranslations.filter((t) => t.paperId === item.id);

    const lastTranslationDate = itemTranslations.reduce<Date | null>((latest, t) => {
      if (!t.createdAt) return latest;
      const d = new Date(t.createdAt);
      return !latest || d > latest ? d : latest;
    }, null);

    const effectiveTotalPages = item.totalPages || (item.pdfPageCount ? Math.max(1, item.pdfPageCount - (item.pdfPageOffset || 0)) : 0);
    const maxPage = itemTranslations.reduce((max, t) => Math.max(max, t.pageNumber || 0), 0);
    const progress = effectiveTotalPages ? Math.min(100, Math.round((maxPage / effectiveTotalPages) * 100)) : 0;

    const transTime = lastTranslationDate ? lastTranslationDate.getTime() : 0;
    const openedTime = item.lastOpenedAt ? new Date(item.lastOpenedAt).getTime() : 0;
    const createdTime = item.createdAt ? new Date(item.createdAt).getTime() : 0;
    const lastActiveTime = Math.max(transTime, openedTime, createdTime);

    const criteria = determineItemCriteria(item, lastTranslationDate, progress, itemTranslations.length);

    const vocab = itemTranslations.map((t) => ({
      id: t.id,
      originalText: t.originalText,
      translatedText: t.translatedText,
      language: t.language,
      pageNumber: t.pageNumber,
    }));

    return {
      ...item,
      progress,
      lastActiveTime,
      lastTranslationDate: lastTranslationDate ? lastTranslationDate.toISOString() : null,
      criteria,
      vocab,
    };
  });

  // Sort by most recent activity (latest translation, open, or addition)
  const sortedItems = enrichedItems.sort((a, b) => b.lastActiveTime - a.lastActiveTime);

  // Build runner items (up to 4 items). If there is a completed book qualifying for revisit_recall, spotlight it in the runner
  const runnerItems = [...sortedItems.slice(0, 4)];
  const revisitCandidate = sortedItems.find((item) => item.criteria.category === 'revisit_recall');
  if (revisitCandidate && !runnerItems.some((item) => item.id === revisitCandidate.id)) {
    if (runnerItems.length >= 4) {
      runnerItems[3] = revisitCandidate;
    } else {
      runnerItems.push(revisitCandidate);
    }
  }

  const userVocabCount =
    allBookTranslations.filter((t) => userBooks.some((b) => b.id === t.bookId)).length +
    allPaperTranslations.filter((t) => userPapers.some((p) => p.id === t.paperId)).length;

  return {
    items: sortedItems,
    runnerItems,
    recentItem: sortedItems[0] || null,
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
      pdfPageOffset: item.pdfPageOffset || 0,
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
