'use server';

import { del } from '@vercel/blob';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  checkPaperDuplicate,
  insertPaper,
  getPaperById,
  deletePaper as deletePaperQuery,
  updatePaper as updatePaperQuery,
  updatePaperNotes as updatePaperNotesQuery,
  getPaperNotes as getPaperNotesQuery,
  updatePaperCurrentPage,
  clearPaperFile,
  touchPaperLastOpened,
} from '@/db/queries';

export async function createPaper(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  const title = (formData.get('title') as string || '').trim();
  const authors = formData.get('authors') as string;
  const year = formData.get('year') ? parseInt(formData.get('year') as string, 10) : null;
  const fileUrl = formData.get('fileUrl') as string;

  if (!title) {
    return { error: 'Title is required' };
  }

  const isDuplicate = await checkPaperDuplicate(title, session.id as string);
  if (isDuplicate) {
    return { error: 'This paper is already in your research library.' };
  }

  try {
    await insertPaper({
      title,
      authors: authors || null,
      year: year || null,
      fileUrl: fileUrl || null,
      userId: session.id as string,
    });

    revalidatePath('/dashboard');
    revalidatePath('/library');
    redirect('/library');
  } catch (error) {
    if ((error as any).digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Failed to save paper:', error);
    return { error: 'Failed to create paper' };
  }
}

export async function getPaperNotes(paperId: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    const notes = await getPaperNotesQuery(paperId, session.id as string);
    return { success: true, notes };
  } catch (error) {
    return { error: 'Failed to fetch notes' };
  }
}

export async function savePaperNotes(paperId: string, notes: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    await updatePaperNotesQuery(paperId, session.id as string, notes);
    revalidatePath(`/papers/${paperId}`);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to save notes' };
  }
}

export async function updatePaperNotes(paperId: string, notes: string) {
  return await savePaperNotes(paperId, notes);
}

export async function updatePaperDetails(paperId: string, title: string, authors: string, year: number, totalPages?: number) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    await updatePaperQuery(paperId, session.id as string, {
      title,
      authors,
      year,
      totalPages,
    });

    revalidatePath(`/papers/${paperId}`);
    revalidatePath('/library');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update paper details' };
  }
}

export async function deletePaper(paperId: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    const paper = await getPaperById(paperId, session.id as string);

    if (paper?.fileUrl) {
      try {
        await del(paper.fileUrl);
      } catch (e) {
        console.error('Failed to delete file from blob storage:', e);
      }
    }

    await deletePaperQuery(paperId, session.id as string);

    revalidatePath('/dashboard');
    revalidatePath('/library');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete paper' };
  }
}

export async function updatePaperProgress(paperId: string, pageNumber: number) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    await updatePaperCurrentPage(paperId, session.id as string, pageNumber);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update progress' };
  }
}

export async function removePaperFile(paperId: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    const paper = await getPaperById(paperId, session.id as string);

    if (paper?.fileUrl) {
      try {
        await del(paper.fileUrl);
      } catch (e) {
        console.error('Failed to delete blob from Vercel:', e);
      }
    }

    await clearPaperFile(paperId, session.id as string);
    revalidatePath(`/papers/${paperId}`);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to remove file' };
  }
}

export async function touchPaperAccess(paperId: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    await touchPaperLastOpened(paperId);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update access time' };
  }
}
