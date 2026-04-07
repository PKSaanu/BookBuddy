import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { db } from '@/db/db';
import { books, papers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bookId = formData.get('bookId') as string;
    const paperId = formData.get('paperId') as string;

    if (!file || (!bookId && !paperId)) {
      return NextResponse.json({ error: 'Missing file or id' }, { status: 400 });
    }

    if (bookId) {
      const [book] = await db.select().from(books).where(and(eq(books.id, bookId), eq(books.userId, session.id as string)));
      if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });

      const filename = `book-${bookId}-${Date.now()}.pdf`;
      const blob = await put(filename, file, { access: 'public' });
      await db.update(books).set({ fileUrl: blob.url }).where(eq(books.id, bookId));
      revalidatePath(`/books/${bookId}`);
      return NextResponse.json({ success: true, fileUrl: blob.url });
    }

    if (paperId) {
      const [paper] = await db.select().from(papers).where(and(eq(papers.id, paperId), eq(papers.userId, session.id as string)));
      if (!paper) return NextResponse.json({ error: 'Paper not found' }, { status: 404 });

      const filename = `paper-${paperId}-${Date.now()}.pdf`;
      const blob = await put(filename, file, { access: 'public' });
      await db.update(papers).set({ fileUrl: blob.url }).where(eq(papers.id, paperId));
      revalidatePath(`/papers/${paperId}`);
      return NextResponse.json({ success: true, fileUrl: blob.url });
    }

    return NextResponse.json({ error: 'Failed' }, { status: 400 });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
