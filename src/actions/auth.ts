'use server';

import { db } from '@/db/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword, createToken, setAuthCookie, removeAuthCookie } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function register(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const preferredLanguage = formData.get('preferredLanguage') as string;

  if (!email || !password || !preferredLanguage) {
    return { error: 'Missing required fields' };
  }

  try {
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return { error: 'Email already exists' };
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db.insert(users).values({
        email,
        passwordHash,
        preferredLanguage,
    }).returning({
        id: users.id,
        email: users.email,
        preferredLanguage: users.preferredLanguage
    });

    const token = await createToken({ id: newUser.id, email: newUser.email, preferredLanguage: newUser.preferredLanguage });
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

    const token = await createToken({ id: user.id, email: user.email, preferredLanguage: user.preferredLanguage });
    await setAuthCookie(token);

  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error; // Allow redirect to bubble up
    return { error: 'Something went wrong during login.' };
  }

  redirect('/dashboard');
}

export async function logout() {
  await removeAuthCookie();
  redirect('/login');
}
