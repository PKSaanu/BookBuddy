import { NextRequest, NextResponse } from 'next/server';
import { searchCatalogBooks } from '@/db/queries';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchCatalogBooks(q, 8);
    return NextResponse.json({ results });
  } catch (err) {
    console.error('Catalog search error:', err);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
