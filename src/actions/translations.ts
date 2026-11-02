'use server';

import { db } from '@/db/db';
import { translations, books } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq, and, desc, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function saveTranslation(
  bookId: string,
  originalText: string,
  translatedText: string,
  language: string,
  pageNumber?: number
) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  // Verify book belongs to user
  const [book] = await db.select().from(books).where(and(eq(books.id, bookId), eq(books.userId, session.id as string)));
  
  if (!book) {
    return { error: 'Book not found or unauthorized' };
  }

  if (!pageNumber || pageNumber <= 0) {
    return { error: 'A valid Page Number is required to save this curation.' };
  }

  const cleanOriginal = originalText.trim();

  try {
    // Check if this word is already saved for this book & user (case-insensitive)
    const existing = await db
      .select()
      .from(translations)
      .where(
        and(
          eq(translations.bookId, bookId),
          eq(translations.userId, session.id as string),
          sql`LOWER(TRIM(${translations.originalText})) = ${cleanOriginal.toLowerCase()}`
        )
      )
      .limit(1);

    if (existing && existing.length > 0) {
      // Update existing translation instead of inserting a duplicate
      const [updated] = await db
        .update(translations)
        .set({
          translatedText,
          language,
          pageNumber: pageNumber || existing[0].pageNumber,
          createdAt: new Date()
        })
        .where(eq(translations.id, existing[0].id))
        .returning();

      revalidatePath(`/books/${bookId}`);
      return { success: true, translation: updated, isUpdate: true };
    }

    const [newTranslation] = await db.insert(translations).values({
      bookId,
      userId: session.id as string,
      originalText: cleanOriginal,
      translatedText,
      language,
      pageNumber
    }).returning();
    
    revalidatePath(`/books/${bookId}`);
    return { success: true, translation: newTranslation, isUpdate: false };
  } catch (error) {
    console.error('Failed to save translation:', error);
    return { error: 'Failed to save translation' };
  }
}

export async function deleteTranslation(id: string, bookId: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    // Need to make sure translation belongs to user's book
    const [book] = await db.select().from(books).where(and(eq(books.id, bookId), eq(books.userId, session.id as string)));
    if (!book) return { error: 'Unauthorized' };

    await db.delete(translations).where(
      and(
        eq(translations.id, id), 
        eq(translations.bookId, bookId),
        eq(translations.userId, session.id as string)
      )
    );
    revalidatePath(`/books/${bookId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete translation:', error);
    return { error: 'Failed to delete translation' };
  }
}

export async function getLatestTranslations(bookId: string, limit = 10) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    const rawHistory = await db.select()
      .from(translations)
      .where(
        and(
          eq(translations.bookId, bookId),
          eq(translations.userId, session.id as string)
        )
      )
      .orderBy(desc(translations.createdAt))
      .limit(limit * 2);

    // Deduplicate history by word so same word never appears multiple times
    const seen = new Set<string>();
    const history = rawHistory.filter(item => {
      const key = item.originalText.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, limit);

    return { success: true, history };
  } catch (error) {
    console.error('Failed to fetch history:', error);
    return { error: 'Failed to fetch history' };
  }
}
