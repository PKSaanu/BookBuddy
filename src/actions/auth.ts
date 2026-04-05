'use server';

import { db } from '@/db/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword, createToken, setAuthCookie, removeAuthCookie } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function register(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const preferredLanguage = formData.get('preferredLanguage') as string;

  if (!name || !email || !password || !preferredLanguage) {
    return { error: 'Missing required fields' };
  }

  try {
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return { error: 'Email already exists' };
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db.insert(users).values({
        name,
        email,
        passwordHash,
        preferredLanguage,
    }).returning();

    const token = await createToken({ 
      id: newUser.id, 
      name: newUser.name, 
      email: newUser.email, 
      preferredLanguage: newUser.preferredLanguage,
      gender: newUser.gender
    });
    await setAuthCookie(token);
    
  } catch (error: any) {
    return { error: 'Something went wrong during registration.' };
  }

  redirect('/dashboard');
}

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Missing required fields' };
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user) {
      return { error: 'Invalid email or password' };
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { error: 'Invalid email or password' };
    }

    const token = await createToken({ 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      preferredLanguage: user.preferredLanguage,
      gender: user.gender
    });
    await setAuthCookie(token);

  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error; // Allow redirect to bubble up
    return { error: 'Something went wrong during login.' };
  }

  redirect('/dashboard');
}

export async function updateUserGender(gender: string) {
  const { getSession, createToken, setAuthCookie } = await import('@/lib/auth');
  const session = await getSession();
  
  if (!session?.id) {
    throw new Error('Not authenticated');
  }

  try {
    await db.update(users)
      .set({ gender })
      .where(eq(users.id, session.id as string));

    // Update the session token with the new gender
    const newToken = await createToken({
      ...session,
      gender
    });
    await setAuthCookie(newToken);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update gender:', error);
    return { error: 'Failed to update gender' };
  }
}

export async function logout() {
  await removeAuthCookie();
  redirect('/login');
}
