import { db } from '@/db/db';
import { books, bookCatalog } from '@/db/schema';
import { eq, and, desc, ilike, or } from 'drizzle-orm';

export async function getBookById(bookId: string, userId: string) {
  const [book] = await db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      coverImage: books.coverImage,
      totalPages: books.totalPages,
      pdfPageCount: books.pdfPageCount,
      notes: books.notes,
      userId: books.userId,
      fileUrl: books.fileUrl,
      currentPage: books.currentPage,
      createdAt: books.createdAt,
      lastOpenedAt: books.lastOpenedAt,
    })
    .from(books)
    .where(and(eq(books.id, bookId), eq(books.userId, userId)))
    .limit(1);
  return book || null;
}

export async function getUserBooks(userId: string) {
  return db
    .select()
    .from(books)
    .where(eq(books.userId, userId))
    .orderBy(desc(books.createdAt));
}

export async function checkBookDuplicate(title: string, userId: string) {
  const existing = await db
    .select()
    .from(books)
    .where(and(ilike(books.title, title.trim()), eq(books.userId, userId)))
    .limit(1);
  return existing.length > 0;
}

export async function insertBook(data: {
  title: string;
  author?: string;
  coverImage?: string;
  totalPages?: number | null;
  userId: string;
}) {
  const [newBook] = await db
    .insert(books)
    .values({
      title: data.title.trim(),
      author: data.author?.trim() || null,
      coverImage: data.coverImage || null,
      totalPages: data.totalPages ?? null,
      userId: data.userId,
    })
    .returning();
  return newBook;
}

export async function updateBook(
  bookId: string,
  userId: string,
  data: {
    title?: string;
    author?: string;
    totalPages?: number | null;
  }
) {
  const [updated] = await db
    .update(books)
    .set({
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.author !== undefined ? { author: data.author.trim() || null } : {}),
      ...(data.totalPages !== undefined ? { totalPages: data.totalPages } : {}),
    })
    .where(and(eq(books.id, bookId), eq(books.userId, userId)))
    .returning();
  return updated || null;
}

export async function deleteBook(bookId: string, userId: string) {
  await db
    .delete(books)
    .where(and(eq(books.id, bookId), eq(books.userId, userId)));
}

export async function updateBookCurrentPage(
  bookId: string,
  userId: string,
  currentPage: number
) {
  await db
    .update(books)
    .set({ currentPage })
    .where(and(eq(books.id, bookId), eq(books.userId, userId)));
}

export async function getBookNotes(bookId: string, userId: string) {
  const [book] = await db
    .select({ notes: books.notes })
    .from(books)
    .where(and(eq(books.id, bookId), eq(books.userId, userId)))
    .limit(1);
  return book?.notes || '';
}

export async function updateBookNotes(
  bookId: string,
  userId: string,
  notes: string
) {
  await db
    .update(books)
    .set({ notes })
    .where(and(eq(books.id, bookId), eq(books.userId, userId)));
}

export async function updateBookFileUrl(
  bookId: string,
  userId: string,
  fileUrl: string | null,
  pdfPageCount?: number | null
) {
  const [updated] = await db
    .update(books)
    .set({
      fileUrl,
      ...(pdfPageCount !== undefined ? { pdfPageCount } : {}),
    })
    .where(and(eq(books.id, bookId), eq(books.userId, userId)))
    .returning();
  return updated || null;
}

export async function clearBookFile(bookId: string, userId: string) {
  await db
    .update(books)
    .set({ fileUrl: null, currentPage: 1, pdfPageCount: null })
    .where(and(eq(books.id, bookId), eq(books.userId, userId)));
}

export async function touchBookLastOpened(bookId: string) {
  await db
    .update(books)
    .set({ lastOpenedAt: new Date() })
    .where(eq(books.id, bookId));
}

export async function searchCatalogBooks(query: string, limit = 8) {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  return db
    .select({
      title: bookCatalog.title,
      author: bookCatalog.author,
      coverImage: bookCatalog.coverImage,
      totalPages: bookCatalog.totalPages,
      genre: bookCatalog.genre,
    })
    .from(bookCatalog)
    .where(
      or(
        ilike(bookCatalog.title, `%${trimmed}%`),
        ilike(bookCatalog.author, `%${trimmed}%`)
      )
    )
    .limit(limit);
}
