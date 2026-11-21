'use server';

import { getSession } from '@/lib/auth';
import { getUserById } from '@/db/queries';

export async function getUserSessionInfo() {
  const session = await getSession();
  if (!session?.id) return null;

  const user = await getUserById(session.id as string);
  return {
    isResearcher: user?.isResearcher || false,
  };
}
