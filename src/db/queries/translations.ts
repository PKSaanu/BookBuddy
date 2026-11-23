import { db } from '@/db/db';
import { translations, paperTranslations } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function getBookTranslations(bookId: string, userId: string) {
  const rows = await db
    .select()
    .from(translations)
    .where(
      and(
        eq(translations.bookId, bookId),
        eq(translations.userId, userId)
      )
    )
    .orderBy(desc(translations.pageNumber), desc(translations.createdAt));

  // Deduplicate case-insensitively for display
  const seenWords = new Set<string>();
  return rows.filter((item) => {
    const key = item.originalText.trim().toLowerCase();
    if (seenWords.has(key)) return false;
    seenWords.add(key);
    return true;
  });
}

export async function getPaperTranslations(paperId: string, userId: string) {
  const rows = await db
    .select()
    .from(paperTranslations)
    .where(
      and(
        eq(paperTranslations.paperId, paperId),
        eq(paperTranslations.userId, userId)
      )
    )
    .orderBy(desc(paperTranslations.pageNumber), desc(paperTranslations.createdAt));

  // Deduplicate case-insensitively for display
  const seenWords = new Set<string>();
  return rows.filter((item) => {
    const key = item.originalText.trim().toLowerCase();
    if (seenWords.has(key)) return false;
    seenWords.add(key);
    return true;
  });
}

export async function getUserBookTranslations(userId: string) {
  return db
    .select()
    .from(translations)
    .where(eq(translations.userId, userId))
    .orderBy(desc(translations.createdAt));
}

export async function getUserPaperTranslations(userId: string) {
  return db
    .select()
    .from(paperTranslations)
    .where(eq(paperTranslations.userId, userId))
    .orderBy(desc(paperTranslations.createdAt));
}

export async function getAllUserTranslations(userId: string) {
  const [bookVocab, paperVocab] = await Promise.all([
    getUserBookTranslations(userId),
    getUserPaperTranslations(userId),
  ]);

  return [...bookVocab, ...paperVocab].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

export async function upsertBookTranslation(data: {
  bookId: string;
  userId: string;
  originalText: string;
  translatedText: string;
  language: string;
  pageNumber?: number | null;
}) {
  const cleanOriginal = data.originalText.trim();

  // Check if already exists for this book & user
  const existing = await db
    .select()
    .from(translations)
    .where(
      and(
        eq(translations.bookId, data.bookId),
        eq(translations.userId, data.userId),
        sql`LOWER(TRIM(${translations.originalText})) = ${cleanOriginal.toLowerCase()}`
      )
    )
    .limit(1);

  if (existing && existing.length > 0) {
    return { 
      translation: existing[0], 
      isUpdate: true, 
      alreadyExists: true, 
      existingPage: existing[0].pageNumber 
    };
  }

  const [inserted] = await db
    .insert(translations)
    .values({
      bookId: data.bookId,
      userId: data.userId,
      originalText: cleanOriginal,
      translatedText: data.translatedText,
      language: data.language,
      pageNumber: data.pageNumber ?? null,
    })
    .returning();
  return { translation: inserted, isUpdate: false, alreadyExists: false };
}

export async function deleteBookTranslation(
  id: string,
  bookId: string,
  userId: string
) {
  await db
    .delete(translations)
    .where(
      and(
        eq(translations.id, id),
        eq(translations.bookId, bookId),
        eq(translations.userId, userId)
      )
    );
}

export async function upsertPaperTranslation(data: {
  paperId: string;
  userId: string;
  originalText: string;
  translatedText: string;
  language: string;
  pageNumber?: number | null;
}) {
  const cleanOriginal = data.originalText.trim();

  const existing = await db
    .select()
    .from(paperTranslations)
    .where(
      and(
        eq(paperTranslations.paperId, data.paperId),
        eq(paperTranslations.userId, data.userId),
        sql`LOWER(TRIM(${paperTranslations.originalText})) = ${cleanOriginal.toLowerCase()}`
      )
    )
    .limit(1);

  if (existing && existing.length > 0) {
    return { 
      translation: existing[0], 
      isUpdate: true, 
      alreadyExists: true, 
      existingPage: existing[0].pageNumber 
    };
  }

  const [inserted] = await db
    .insert(paperTranslations)
    .values({
      paperId: data.paperId,
      userId: data.userId,
      originalText: cleanOriginal,
      translatedText: data.translatedText,
      language: data.language,
      pageNumber: data.pageNumber ?? null,
    })
    .returning();
  return { translation: inserted, isUpdate: false, alreadyExists: false };
}

export async function deletePaperTranslation(
  id: string,
  paperId: string,
  userId: string
) {
  await db
    .delete(paperTranslations)
    .where(
      and(
        eq(paperTranslations.id, id),
        eq(paperTranslations.paperId, paperId),
        eq(paperTranslations.userId, userId)
      )
    );
}

export async function getLatestBookTranslations(
  bookId: string,
  userId: string,
  limit = 10
) {
  const rawHistory = await db
    .select()
    .from(translations)
    .where(
      and(
        eq(translations.bookId, bookId),
        eq(translations.userId, userId)
      )
    )
    .orderBy(desc(translations.createdAt))
    .limit(limit * 2);

  const seen = new Set<string>();
  return rawHistory
    .filter((item) => {
      const key = item.originalText.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

export async function getLatestPaperTranslations(
  paperId: string,
  userId: string,
  limit = 10
) {
  const rawHistory = await db
    .select()
    .from(paperTranslations)
    .where(
      and(
        eq(paperTranslations.paperId, paperId),
        eq(paperTranslations.userId, userId)
      )
    )
    .orderBy(desc(paperTranslations.createdAt))
    .limit(limit * 2);

  const seen = new Set<string>();
  return rawHistory
    .filter((item) => {
      const key = item.originalText.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

