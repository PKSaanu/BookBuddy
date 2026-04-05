'use server';

import { db } from '@/db/db';
import { translations, books } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
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

  try {
    await db.insert(translations).values({
      bookId,
      originalText,
      translatedText,
      language,
      pageNumber
    });
    
    revalidatePath(`/books/${bookId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
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

    await db.delete(translations).where(and(eq(translations.id, id), eq(translations.bookId, bookId)));
    revalidatePath(`/books/${bookId}`);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete translation' };
  }
}
