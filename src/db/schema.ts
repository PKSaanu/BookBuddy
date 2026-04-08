import { pgTable, uuid, text, timestamp, varchar, integer, serial, boolean, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull().default(''),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  preferredLanguage: varchar('preferred_language', { length: 50 }).notNull().default('Tamil'), // 'Tamil' or 'Sinhala'
  gender: varchar('gender', { length: 50 }).notNull().default('female'), // 'male' or 'female'
  voiceRate: varchar('voice_rate', { length: 10 }).notNull().default('0.8'), // Speed multiplier like '0.8' or '1.0'
  voiceName: varchar('voice_name', { length: 100 }), // Specific voice name like 'Alex' or 'Samantha'
  isResearcher: boolean('is_researcher').default(false).notNull(),
  resetToken: text('reset_token'),
  resetTokenExpiry: timestamp('reset_token_expiry'),
  emailVerified: boolean('email_verified').default(false).notNull(),
  verificationToken: text('verification_token'),
  verificationTokenExpiry: timestamp('verification_token_expiry'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const books = pgTable('books', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  author: varchar('author', { length: 255 }),
  coverImage: varchar('cover_image', { length: 1000 }),
  totalPages: integer('total_pages'),
  pdfPageCount: integer('pdf_page_count'),
  notes: text('notes').default(''),
  fileUrl: varchar('file_url', { length: 1024 }),
  currentPage: integer('current_page').default(1),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  lastOpenedAt: timestamp('last_opened_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('books_user_id_idx').on(table.userId),
  }
});

export const translations = pgTable('translations', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookId: uuid('book_id').references(() => books.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  originalText: text('original_text').notNull(),
  translatedText: text('translated_text').notNull(),
  pageNumber: integer('page_number'),
  language: varchar('language', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('translations_user_id_idx').on(table.userId),
    bookIdIdx: index('translations_book_id_idx').on(table.bookId),
  }
});

// Read-only reference catalog seeded with curated accurate data from Google Books
export const bookCatalog = pgTable('book_catalog', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 512 }).notNull(),
  author: varchar('author', { length: 512 }),
  coverImage: varchar('cover_image', { length: 1024 }),
  totalPages: integer('total_pages'),
  isbn: varchar('isbn', { length: 64 }),
  genre: varchar('genre', { length: 128 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const papers = pgTable('papers', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 512 }).notNull(),
  authors: varchar('authors', { length: 512 }),
  year: integer('year'),
  totalPages: integer('total_pages'),
  pdfPageCount: integer('pdf_page_count'),
  fileUrl: varchar('file_url', { length: 1024 }),
  notes: text('notes').default(''),
  currentPage: integer('current_page').default(1),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  lastOpenedAt: timestamp('last_opened_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('papers_user_id_idx').on(table.userId),
  }
});

export const paperTranslations = pgTable('paper_translations', {
  id: uuid('id').defaultRandom().primaryKey(),
  paperId: uuid('paper_id').references(() => papers.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  originalText: text('original_text').notNull(),
  translatedText: text('translated_text').notNull(),
  pageNumber: integer('page_number'),
  language: varchar('language', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('paper_translations_user_id_idx').on(table.userId),
    paperIdIdx: index('paper_translations_paper_id_idx').on(table.paperId),
  }
});

