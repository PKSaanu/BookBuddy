import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { PDFDocument } from 'pdf-lib';
import {
  getBookById,
  updateBookFileUrl,
  getPaperById,
  updatePaperFileUrl,
} from '@/db/queries';

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

    // Extract page count from PDF using pdf-lib
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pdfPageCount = pdfDoc.getPageCount();

    if (bookId) {
      const book = await getBookById(bookId, session.id as string);
      if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });

      const filename = `book-${bookId}-${Date.now()}.pdf`;
      const blob = await put(filename, file, { access: 'public' });
      
      await updateBookFileUrl(bookId, session.id as string, blob.url, pdfPageCount);

      revalidatePath(`/books/${bookId}`);
      revalidatePath('/library');
      revalidatePath('/dashboard');
      return NextResponse.json({ success: true, fileUrl: blob.url, pdfPageCount });
    }

    if (paperId) {
      const paper = await getPaperById(paperId, session.id as string);
      if (!paper) return NextResponse.json({ error: 'Paper not found' }, { status: 404 });

      const filename = `paper-${paperId}-${Date.now()}.pdf`;
      const blob = await put(filename, file, { access: 'public' });
      
      await updatePaperFileUrl(paperId, session.id as string, blob.url, pdfPageCount);

      revalidatePath(`/papers/${paperId}`);
      revalidatePath('/library');
      revalidatePath('/dashboard');
      return NextResponse.json({ success: true, fileUrl: blob.url, pdfPageCount });
    }

    return NextResponse.json({ error: 'Failed' }, { status: 400 });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
