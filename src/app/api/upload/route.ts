import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { db } from '@/db/db';
import { books } from '@/db/schema';
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

    if (!file || !bookId) {
      return NextResponse.json({ error: 'Missing file or bookId' }, { status: 400 });
    }

    // Check if the book belongs to the user
    const [book] = await db.select()
      .from(books)
      .where(and(eq(books.id, bookId), eq(books.userId, session.id as string)));

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const filename = `${bookId}-${Date.now()}.pdf`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'pdfs');
    
    // Ensure directory exists (even if already created by mkdir -p)
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/pdfs/${filename}`;

    // Update database
    await db.update(books)
      .set({ fileUrl })
      .where(eq(books.id, bookId));

    revalidatePath(`/books/${bookId}`);

    return NextResponse.json({ success: true, fileUrl });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
