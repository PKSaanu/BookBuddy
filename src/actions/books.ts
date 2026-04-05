'use server';

import { db } from '@/db/db';
import { books } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { eq, and } from 'drizzle-orm';

export async function createBook(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session?.id) {
    redirect('/login');
  }

  const title = formData.get('title') as string;
  const author = formData.get('author') as string;
  const coverImage = formData.get('coverImage') as string;
  const totalPagesRaw = formData.get('totalPages');
  const totalPages = totalPagesRaw ? parseInt(totalPagesRaw as string, 10) : null;

  if (!title) {
    return { error: 'Book title is required' };
  }

  try {
    await db.insert(books).values({
      title,
      author,
      coverImage,
      totalPages,
      userId: session.id as string,
    });
    
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to create book' };
  }
}

export async function deleteBook(id: string) {
  const session = await getSession();
  if (!session?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    await db.delete(books).where(
      and(
        eq(books.id, id),
        eq(books.userId, session.id as string)
      )
    );
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
    await db.update(books)
      .set({ notes })
      .where(
        and(
          eq(books.id, bookId),
          eq(books.userId, session.id as string)
        )
      );
    
    revalidatePath(`/books/${bookId}`);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update notes' };
  }
}

export async function getBookNotes(bookId: string) {
  const session = await getSession();
  if (!session?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const [book] = await db.select({ notes: books.notes })
      .from(books)
      .where(
        and(
          eq(books.id, bookId),
          eq(books.userId, session.id as string)
        )
      );
    
    return { success: true, notes: book?.notes || '' };
  } catch (error) {
    return { error: 'Failed to fetch notes' };
  }
}
