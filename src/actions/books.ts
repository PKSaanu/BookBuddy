'use server';

import { del } from '@vercel/blob';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  checkBookDuplicate,
  insertBook,
  getBookById,
  deleteBook as deleteBookQuery,
  updateBookNotes as updateBookNotesQuery,
  updateBook as updateBookQuery,
  getBookNotes as getBookNotesQuery,
  updateBookCurrentPage,
  clearBookFile,
  touchBookLastOpened,
} from '@/db/queries';

export async function createBook(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session?.id) {
    redirect('/login');
  }

  const title = (formData.get('title') as string || '').trim();
  const author = (formData.get('author') as string || '').trim();
  const coverImage = formData.get('coverImage') as string;
  const totalPagesRaw = formData.get('totalPages');
  const totalPages = totalPagesRaw ? parseInt(totalPagesRaw as string, 10) : null;

  if (!title) {
    return { error: 'Book title is required' };
  }

  // Case-Insensitive Duplicate Check via DAL
  const isDuplicate = await checkBookDuplicate(title, session.id as string);
  if (isDuplicate) {
    return { error: 'This book is already in your library.' };
  }

  try {
    await insertBook({
      title,
      author,
      coverImage,
      totalPages,
      userId: session.id as string,
    });
    
    revalidatePath('/dashboard');
    revalidatePath('/library');
    redirect('/library');
  } catch (error) {
    if ((error as any).digest?.startsWith('NEXT_REDIRECT')) throw error;
    return { error: 'Failed to create book' };
  }
}

export async function deleteBook(id: string) {
  const session = await getSession();
  if (!session?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const book = await getBookById(id, session.id as string);

    if (book?.fileUrl) {
      try {
        await del(book.fileUrl);
      } catch (e) {
        console.error('Failed to delete blob from Vercel during book deletion:', e);
      }
    }

    await deleteBookQuery(id, session.id as string);
    
    revalidatePath('/dashboard');
    revalidatePath('/library');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete book' };
  }
}

export async function updateBookNotes(bookId: string, notes: string) {
  const session = await getSession();
  if (!session?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    await updateBookNotesQuery(bookId, session.id as string, notes);
    revalidatePath(`/books/${bookId}`);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update notes' };
  }
}

export async function updateBookDetails(bookId: string, title: string, author: string, totalPages: number) {
  const session = await getSession();
  if (!session?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    await updateBookQuery(bookId, session.id as string, { title, author, totalPages });
    revalidatePath(`/books/${bookId}`);
    revalidatePath('/dashboard');
    revalidatePath('/library');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update book details' };
  }
}

export async function getBookNotes(bookId: string) {
  const session = await getSession();
  if (!session?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const notes = await getBookNotesQuery(bookId, session.id as string);
    return { success: true, notes };
  } catch (error) {
    return { error: 'Failed to fetch notes' };
  }
}

export async function updateBookProgress(bookId: string, pageNumber: number) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    await updateBookCurrentPage(bookId, session.id as string, pageNumber);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update progress' };
  }
}

export async function removeBookFile(bookId: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    const book = await getBookById(bookId, session.id as string);

    if (book?.fileUrl) {
      try {
        await del(book.fileUrl);
      } catch (e) {
        console.error('Failed to delete blob from Vercel:', e);
      }
    }

    await clearBookFile(bookId, session.id as string);
    revalidatePath(`/books/${bookId}`);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to remove file' };
  }
}

export async function touchBookAccess(bookId: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    await touchBookLastOpened(bookId);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update access time' };
  }
}
