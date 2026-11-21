import { getSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import LayoutWrapper from '@/components/layout-wrapper';
import PaperContent from './paper-content';
import {
  getPaperById,
  getUserLanguagePreference,
  touchPaperLastOpened,
  getPaperTranslations,
} from '@/db/queries';

export default async function PaperPage({ params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session?.id) {
    redirect('/login');
  }

  const { id: paperId } = await params;

  const [paper, preferredLanguage, vocab] = await Promise.all([
    getPaperById(paperId, session.id as string),
    getUserLanguagePreference(session.id as string),
    getPaperTranslations(paperId, session.id as string),
    touchPaperLastOpened(paperId),
  ]);

  if (!paper) {
    notFound();
  }

  const progressPercent = 0;

  return (
    <LayoutWrapper disableScroll={true}>
      <PaperContent
        paper={paper}
        session={session}
        vocab={vocab}
        progressPercent={progressPercent}
        preferredLanguage={preferredLanguage}
      />
    </LayoutWrapper>
  );
}
