import { db } from '@/db/db';
import { books, translations, users } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { eq, desc, and } from 'drizzle-orm';
import LayoutWrapper from '@/components/layout-wrapper';
import BookContent from './book-content';

export default async function BookPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  
  if (!session?.id) {
    redirect('/login');
  }

  const { id: bookId } = await params;

  const [book] = await db.select({
      id: books.id,
      title: books.title,
      author: books.author,
      coverImage: books.coverImage,
      totalPages: books.totalPages,
      pdfPageCount: books.pdfPageCount,
      userId: books.userId,
      fileUrl: books.fileUrl,
      currentPage: books.currentPage,
      createdAt: books.createdAt,
    })
    .from(books)
    .where(eq(books.id, bookId));

  const [user] = await db.select({
      preferredLanguage: users.preferredLanguage,
      gender: users.gender,
      voiceGender: users.voiceGender,
      voiceRate: users.voiceRate,
      voiceName: users.voiceName,
    })
    .from(users)
    .where(eq(users.id, session.id as string));

  const preferredLanguage = user?.preferredLanguage || 'Tamil';
  const voiceGender = user?.voiceGender || 'female';
  const voiceRate = user?.voiceRate || '0.8';

  if (!book || book.userId !== session.id) {
    notFound();
  }

  const vocab = await db.select()
    .from(translations)
    .where(
        and(
            eq(translations.bookId, bookId),
            eq(translations.userId, session.id as string)
        )
    )
    .orderBy(desc(translations.pageNumber), desc(translations.createdAt));

  const maxPage = vocab.reduce((max, t) => Math.max(max, t.pageNumber || 0), 0);
  const progressPercent = book.totalPages ? Math.round((maxPage / book.totalPages) * 100) : 0;

  return (
    <LayoutWrapper disableScroll={true}>
      <BookContent 
        book={book as any} 
        session={session} 
        vocab={vocab as any} 
        progressPercent={progressPercent} 
        preferredLanguage={user.preferredLanguage || 'Tamil'}
        voiceGender={user.gender || 'female'}
        voiceRate={user.voiceRate || '0.8'}
        voiceName={user.voiceName || ''}
      />
    </LayoutWrapper>
  );
}
