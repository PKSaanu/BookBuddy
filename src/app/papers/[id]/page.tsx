import { db } from '@/db/db';
import { papers, paperTranslations, users } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { eq, desc, and } from 'drizzle-orm';
import LayoutWrapper from '@/components/layout-wrapper';
import PaperContent from './paper-content';

export default async function PaperPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  
  if (!session?.id) {
    redirect('/login');
  }

  const { id: paperId } = await params;

  const [paper] = await db.select({
      id: papers.id,
      title: papers.title,
      author: papers.authors,
      year: papers.year,
      userId: papers.userId,
      fileUrl: papers.fileUrl,
      currentPage: papers.currentPage,
      createdAt: papers.createdAt,
    })
    .from(papers)
    .where(eq(papers.id, paperId));

  const [user] = await db.select({
      preferredLanguage: users.preferredLanguage,
      gender: users.gender,
      voiceRate: users.voiceRate,
      voiceName: users.voiceName,
    })
    .from(users)
    .where(eq(users.id, session.id as string));

  const preferredLanguage = user?.preferredLanguage || 'Tamil';
  const voiceGender = user?.gender || 'female';
  const voiceRate = user?.voiceRate || '0.8';
  const voiceName = user?.voiceName || '';

  if (!paper || paper.userId !== session.id) {
    notFound();
  }

  const vocab = await db.select()
    .from(paperTranslations)
    .where(
        and(
            eq(paperTranslations.paperId, paperId),
            eq(paperTranslations.userId, session.id as string)
        )
    )
    .orderBy(desc(paperTranslations.pageNumber), desc(paperTranslations.createdAt));

  const maxPage = vocab.reduce((max, t) => Math.max(max, t.pageNumber || 0), 0);
  const progressPercent = 0;

  return (
    <LayoutWrapper disableScroll={true}>
      <PaperContent 
        paper={paper as any} 
        session={session} 
        vocab={vocab as any} 
        progressPercent={progressPercent} 
        preferredLanguage={preferredLanguage}
        voiceGender={voiceGender}
        voiceRate={voiceRate}
        voiceName={voiceName}
      />
    </LayoutWrapper>
  );
}
