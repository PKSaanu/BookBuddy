import { getSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import LayoutWrapper from '@/components/layout-wrapper';
import BookContent from './book-content';
import {
  getBookById,
  getUserLanguagePreference,
  touchBookLastOpened,
  getBookTranslations,
} from '@/db/queries';

export default async function BookPage({ params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session?.id) {
    redirect('/login');
  }

  const { id: bookId } = await params;

  const [book, preferredLanguage, vocab] = await Promise.all([
    getBookById(bookId, session.id as string),
    getUserLanguagePreference(session.id as string),
    getBookTranslations(bookId, session.id as string),
    touchBookLastOpened(bookId),
  ]);

  if (!book) {
    notFound();
  }

  const maxPage = vocab.reduce((max, t) => Math.max(max, t.pageNumber || 0), 0);
  const progressPercent = book.totalPages ? Math.round((maxPage / book.totalPages) * 100) : 0;

  return (
    <LayoutWrapper disableScroll={true}>
      <BookContent
        book={book}
        session={session}
        vocab={vocab}
        progressPercent={progressPercent}
        preferredLanguage={preferredLanguage}
      />
    </LayoutWrapper>
  );
}
