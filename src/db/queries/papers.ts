import { db } from '@/db/db';
import { papers } from '@/db/schema';
import { eq, and, desc, ilike } from 'drizzle-orm';

export async function getPaperById(paperId: string, userId: string) {
  const [paper] = await db
    .select({
      id: papers.id,
      title: papers.title,
      author: papers.authors,
      authors: papers.authors,
      year: papers.year,
      totalPages: papers.totalPages,
      pdfPageCount: papers.pdfPageCount,
      fileUrl: papers.fileUrl,
      notes: papers.notes,
      currentPage: papers.currentPage,
      userId: papers.userId,
      createdAt: papers.createdAt,
      lastOpenedAt: papers.lastOpenedAt,
    })
    .from(papers)
    .where(and(eq(papers.id, paperId), eq(papers.userId, userId)))
    .limit(1);
  return paper || null;
}

export async function getUserPapers(userId: string) {
  return db
    .select()
    .from(papers)
    .where(eq(papers.userId, userId))
    .orderBy(desc(papers.createdAt));
}

export async function checkPaperDuplicate(title: string, userId: string) {
  const existing = await db
    .select()
    .from(papers)
    .where(and(ilike(papers.title, title.trim()), eq(papers.userId, userId)))
    .limit(1);
  return existing.length > 0;
}

export async function insertPaper(data: {
  title: string;
  authors?: string | null;
  year?: number | null;
  totalPages?: number | null;
  fileUrl?: string | null;
  userId: string;
}) {
  const [newPaper] = await db
    .insert(papers)
    .values({
      title: data.title.trim(),
      authors: data.authors?.trim() || null,
      year: data.year ?? null,
      totalPages: data.totalPages ?? null,
      fileUrl: data.fileUrl || null,
      userId: data.userId,
    })
    .returning();
  return newPaper;
}

export async function updatePaper(
  paperId: string,
  userId: string,
  data: {
    title?: string;
    authors?: string | null;
    year?: number | null;
    totalPages?: number | null;
  }
) {
  const [updated] = await db
    .update(papers)
    .set({
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.authors !== undefined ? { authors: data.authors?.trim() || null } : {}),
      ...(data.year !== undefined ? { year: data.year } : {}),
      ...(data.totalPages !== undefined ? { totalPages: data.totalPages } : {}),
    })
    .where(and(eq(papers.id, paperId), eq(papers.userId, userId)))
    .returning();
  return updated || null;
}

export async function deletePaper(paperId: string, userId: string) {
  await db
    .delete(papers)
    .where(and(eq(papers.id, paperId), eq(papers.userId, userId)));
}

export async function updatePaperCurrentPage(
  paperId: string,
  userId: string,
  currentPage: number
) {
  await db
    .update(papers)
    .set({ currentPage })
    .where(and(eq(papers.id, paperId), eq(papers.userId, userId)));
}

export async function getPaperNotes(paperId: string, userId: string) {
  const [paper] = await db
    .select({ notes: papers.notes })
    .from(papers)
    .where(and(eq(papers.id, paperId), eq(papers.userId, userId)))
    .limit(1);
  return paper?.notes || '';
}

export async function updatePaperNotes(
  paperId: string,
  userId: string,
  notes: string
) {
  await db
    .update(papers)
    .set({ notes })
    .where(and(eq(papers.id, paperId), eq(papers.userId, userId)));
}

export async function updatePaperFileUrl(
  paperId: string,
  userId: string,
  fileUrl: string | null,
  pdfPageCount?: number | null
) {
  const [updated] = await db
    .update(papers)
    .set({
      fileUrl,
      ...(pdfPageCount !== undefined ? { pdfPageCount } : {}),
    })
    .where(and(eq(papers.id, paperId), eq(papers.userId, userId)))
    .returning();
  return updated || null;
}

export async function clearPaperFile(paperId: string, userId: string) {
  await db
    .update(papers)
    .set({ fileUrl: null, currentPage: 1, pdfPageCount: null })
    .where(and(eq(papers.id, paperId), eq(papers.userId, userId)));
}

export async function touchPaperLastOpened(paperId: string) {
  await db
    .update(papers)
    .set({ lastOpenedAt: new Date() })
    .where(eq(papers.id, paperId));
}
