'use server';

import { db } from '@/db/db';
import { papers } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

export async function createPaper(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  const title = formData.get('title') as string;
  const authors = formData.get('authors') as string;
  const year = formData.get('year') ? parseInt(formData.get('year') as string, 10) : null;
  const fileUrl = formData.get('fileUrl') as string;

  if (!title) {
    return { error: 'Title is required' };
  }

  try {
    const [paper] = await db.insert(papers)
      .values({
        title,
        authors: authors || null,
        year: year || null,
        fileUrl: fileUrl || null,
        userId: session.id as string,
      })
      .returning();

    revalidatePath('/dashboard');
    revalidatePath('/library');
    return { success: true, paperId: paper.id };
  } catch (error) {
    console.error('Failed to save paper:', error);
    return { error: 'Failed to create paper' };
  }
}

export async function getPaperNotes(paperId: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    const [paper] = await db.select({ notes: papers.notes }).from(papers).where(eq(papers.id, paperId));
    return { success: true, notes: paper?.notes || '' };
  } catch (error) {
    return { error: 'Failed to fetch notes' };
  }
}

export async function savePaperNotes(paperId: string, notes: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    // Only allow updating if the user owns the paper
    const userPapers = await db.select().from(papers).where(eq(papers.id, paperId));
    if (!userPapers.length || userPapers[0].userId !== session.id) return { error: 'Unauthorized' };

    await db.update(papers)
      .set({ notes })
      .where(eq(papers.id, paperId));
    return { success: true };
  } catch (error) {
    return { error: 'Failed to save notes' };
  }
}

export async function removePaperFile(paperId: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    const [paper] = await db.select().from(papers).where(eq(papers.id, paperId));
    
    if (!paper || paper.userId !== session.id) {
      return { error: 'Unauthorized or paper not found' };
    }

    if (paper.fileUrl) {
      const { del } = await import('@vercel/blob');
      await del(paper.fileUrl);
    }

    await db.update(papers)
      .set({ fileUrl: null, currentPage: 1, pdfPageCount: null })
      .where(eq(papers.id, paperId));

    revalidatePath(`/papers/${paperId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to remove paper file:', error);
    return { error: 'Failed to remove file' };
  }
}

export async function deletePaper(paperId: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    const [paper] = await db.select().from(papers).where(eq(papers.id, paperId));
    
    if (!paper || paper.userId !== session.id) {
      return { error: 'Unauthorized or paper not found' };
    }

    if (paper.fileUrl) {
      const { del } = await import('@vercel/blob');
      await del(paper.fileUrl);
    }

    await db.delete(papers).where(eq(papers.id, paperId));
    
    revalidatePath('/dashboard');
    revalidatePath('/library');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete paper' };
  }
}

export async function updatePaperNotes(paperId: string, notes: string) {
  return await savePaperNotes(paperId, notes);
}

export async function updatePaperProgress(paperId: string, page: number) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    const [paper] = await db.select().from(papers).where(eq(papers.id, paperId));
    if (!paper || paper.userId !== session.id) return { error: 'Unauthorized' };

    await db.update(papers)
      .set({ currentPage: page })
      .where(eq(papers.id, paperId));
      
    // Intentionally not revalidating path to prevent reader stutter unless needed
    return { success: true };
  } catch (error) {
    return { error: 'Failed to save progress' };
  }
}

export async function updatePaperDetails(paperId: string, title: string, authors: string, year: number | null) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    if (!title) return { error: 'Title is required' };

    const [paper] = await db.select().from(papers).where(eq(papers.id, paperId));
    if (!paper || paper.userId !== session.id) return { error: 'Unauthorized' };

    await db.update(papers)
      .set({ title, authors: authors || null, year })
      .where(eq(papers.id, paperId));

    revalidatePath(`/papers/${paperId}`);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update details' };
  }
}


