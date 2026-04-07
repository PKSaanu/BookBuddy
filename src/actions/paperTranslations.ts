'use server';

import { db } from '@/db/db';
import { paperTranslations, papers } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { eq, and, desc } from 'drizzle-orm';

export async function saveTranslation(paperId: string, originalText: string, translatedText: string, language: string, pageNumber: number) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    // Verify paper belongs to user
    const [paper] = await db.select().from(papers).where(eq(papers.id, paperId));
    if (!paper || paper.userId !== session.id) {
      return { error: 'Unauthorized or paper not found' };
    }

    const [translation] = await db.insert(paperTranslations)
      .values({
        paperId,
        userId: session.id as string,
        originalText,
        translatedText,
        language,
        pageNumber,
      })
      .returning();

    revalidatePath(`/papers/${paperId}`);
    return { success: true, translation };
  } catch (error) {
    console.error('Failed to save translation for paper:', error);
    return { error: 'Failed to save translation' };
  }
}

export async function deleteTranslation(id: string, paperId: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    // Verify paper belongs to user
    const [paper] = await db.select().from(papers).where(eq(papers.id, paperId));
    if (!paper || paper.userId !== session.id) {
      return { error: 'Unauthorized' };
    }

    await db.delete(paperTranslations)
      .where(and(
        eq(paperTranslations.id, id),
        eq(paperTranslations.paperId, paperId),
        eq(paperTranslations.userId, session.id as string)
      ));

    revalidatePath(`/papers/${paperId}`);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete translation' };
  }
}

export async function getLatestTranslations(paperId: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    const history = await db.select()
      .from(paperTranslations)
      .where(
        and(
          eq(paperTranslations.paperId, paperId),
          eq(paperTranslations.userId, session.id as string)
        )
      )
      .orderBy(desc(paperTranslations.pageNumber), desc(paperTranslations.createdAt))
      .limit(10);
    return { success: true, history };
  } catch(error) {
    return { error: 'Failed' };
  }
}

