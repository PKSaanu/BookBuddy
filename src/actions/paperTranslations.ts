'use server';

import { db } from '@/db/db';
import { paperTranslations, papers } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function saveTranslation(paperId: string, originalText: string, translatedText: string, language: string, pageNumber: number) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    // Verify paper belongs to user
    const [paper] = await db.select().from(papers).where(eq(papers.id, paperId));
    if (!paper || paper.userId !== session.id) {
      return { error: 'Unauthorized or paper not found' };
    }

    const cleanOriginal = originalText.trim();

    // Check if this word is already saved for this paper & user (case-insensitive)
    const existing = await db
      .select()
      .from(paperTranslations)
      .where(
        and(
          eq(paperTranslations.paperId, paperId),
          eq(paperTranslations.userId, session.id as string),
          sql`LOWER(TRIM(${paperTranslations.originalText})) = ${cleanOriginal.toLowerCase()}`
        )
      )
      .limit(1);

    if (existing && existing.length > 0) {
      // Update existing translation instead of inserting a duplicate
      const [updated] = await db
        .update(paperTranslations)
        .set({
          translatedText,
          language,
          pageNumber: pageNumber || existing[0].pageNumber,
          createdAt: new Date()
        })
        .where(eq(paperTranslations.id, existing[0].id))
        .returning();

      revalidatePath(`/papers/${paperId}`);
      return { success: true, translation: updated, isUpdate: true };
    }

    const [translation] = await db.insert(paperTranslations)
      .values({
        paperId,
        userId: session.id as string,
        originalText: cleanOriginal,
        translatedText,
        language,
        pageNumber,
      })
      .returning();

    revalidatePath(`/papers/${paperId}`);
    return { success: true, translation, isUpdate: false };
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
    console.error('Failed to delete paper translation:', error);
    return { error: 'Failed to delete translation' };
  }
}

export async function getLatestTranslations(paperId: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    const rawHistory = await db.select()
      .from(paperTranslations)
      .where(
        and(
          eq(paperTranslations.paperId, paperId),
          eq(paperTranslations.userId, session.id as string)
        )
      )
      .orderBy(desc(paperTranslations.createdAt))
      .limit(20);

    // Deduplicate history by word so same word never appears multiple times
    const seen = new Set<string>();
    const history = rawHistory.filter(item => {
      const key = item.originalText.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 10);

    return { success: true, history };
  } catch (error) {
    console.error('Failed to fetch paper history:', error);
    return { error: 'Failed' };
  }
}
