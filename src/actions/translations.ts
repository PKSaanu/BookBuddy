'use server';

import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import {
  getBookById,
  upsertBookTranslation,
  deleteBookTranslation,
  getLatestBookTranslations,
} from '@/db/queries';

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
  const book = await getBookById(bookId, session.id as string);
  if (!book) {
    return { error: 'Book not found or unauthorized' };
  }

  if (!pageNumber || pageNumber <= 0) {
    return { error: 'A valid Page Number is required to save this curation.' };
  }

  try {
    const { translation, isUpdate } = await upsertBookTranslation({
      bookId,
      userId: session.id as string,
      originalText,
      translatedText,
      language,
      pageNumber,
    });

    revalidatePath(`/books/${bookId}`);
    return { success: true, translation, isUpdate };
  } catch (error) {
    console.error('Failed to save translation:', error);
    return { error: 'Failed to save translation' };
  }
}

export async function deleteTranslation(id: string, bookId: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    const book = await getBookById(bookId, session.id as string);
    if (!book) return { error: 'Unauthorized' };

    await deleteBookTranslation(id, bookId, session.id as string);
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
    const history = await getLatestBookTranslations(bookId, session.id as string, limit);
    return { success: true, history };
  } catch (error) {
    console.error('Failed to fetch history:', error);
    return { error: 'Failed to fetch history' };
  }
}
