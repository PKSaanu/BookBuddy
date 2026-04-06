import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { bookCatalog } from '@/db/schema';
import { ilike, or } from 'drizzle-orm';

const db = drizzle(neon(process.env.DATABASE_URL!));

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await db
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
          ilike(bookCatalog.title, `%${q}%`),
          ilike(bookCatalog.author, `%${q}%`)
        )
      )
      .limit(8);

    return NextResponse.json({ results });
  } catch (err) {
    console.error('Catalog search error:', err);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
