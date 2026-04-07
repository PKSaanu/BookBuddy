'use server';

import { getSession } from '@/lib/auth';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getUserSessionInfo() {
    const session = await getSession();
    if (!session?.id) return null;

    const [user] = await db.select().from(users).where(eq(users.id, session.id as string));
    return {
        isResearcher: user?.isResearcher || false
    };
}
