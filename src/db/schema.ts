import { pgTable, uuid, text, timestamp, varchar, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull().default(''),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  preferredLanguage: varchar('preferred_language', { length: 50 }).notNull().default('Tamil'), // 'Tamil' or 'Sinhala'
  gender: varchar('gender', { length: 50 }).notNull().default('male'), // 'male' or 'female'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const books = pgTable('books', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  author: varchar('author', { length: 255 }),
  coverImage: varchar('cover_image', { length: 1000 }),
  totalPages: integer('total_pages'),
  notes: text('notes').default(''),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const translations = pgTable('translations', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookId: uuid('book_id').references(() => books.id, { onDelete: 'cascade' }).notNull(),
  originalText: text('original_text').notNull(),
  translatedText: text('translated_text').notNull(),
  pageNumber: integer('page_number'),
  language: varchar('language', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
