'use server';

import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import {
  getPaperById,
  upsertPaperTranslation,
  deletePaperTranslation,
  getLatestPaperTranslations,
} from '@/db/queries';

export async function saveTranslation(
  paperId: string,
  originalText: string,
  translatedText: string,
  language: string,
  pageNumber: number
) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    const paper = await getPaperById(paperId, session.id as string);
    if (!paper) {
      return { error: 'Unauthorized or paper not found' };
    }

    const { translation, isUpdate } = await upsertPaperTranslation({
      paperId,
      userId: session.id as string,
      originalText,
      translatedText,
      language,
      pageNumber,
    });

    revalidatePath(`/papers/${paperId}`);
    return { success: true, translation, isUpdate };
  } catch (error) {
    console.error('Failed to save paper translation:', error);
    return { error: 'Failed to save translation' };
  }
}

export async function deleteTranslation(id: string, paperId: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    const paper = await getPaperById(paperId, session.id as string);
    if (!paper) return { error: 'Unauthorized or paper not found' };

    await deletePaperTranslation(id, paperId, session.id as string);
    revalidatePath(`/papers/${paperId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete paper translation:', error);
    return { error: 'Failed to delete translation' };
  }
}

export async function getLatestTranslations(paperId: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    const history = await getLatestPaperTranslations(paperId, session.id as string, 10);
    return { success: true, history };
  } catch (error) {
    console.error('Failed to fetch paper history:', error);
    return { error: 'Failed' };
  }
}
