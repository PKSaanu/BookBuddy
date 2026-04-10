'use server';

import { db } from '@/db/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword, createToken, setAuthCookie, removeAuthCookie } from '@/lib/auth';
import { redirect } from 'next/navigation';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';
import { and, gte } from 'drizzle-orm';
import { isEmailDeliverable } from '@/lib/dns';
import { loginRatelimit, signupRatelimit, resetRatelimit } from '@/lib/ratelimit';
import { headers } from 'next/headers';

async function getIP(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    '127.0.0.1'
  );
}

// Fail-safe wrapper: if Redis is unavailable, allow the request through
async function isRateLimited(limiter: typeof loginRatelimit, ip: string): Promise<boolean> {
  try {
    const { success } = await limiter.limit(ip);
    return !success;
  } catch (err) {
    console.warn('[RateLimit] Redis unavailable, skipping rate limit check:', err);
    return false; // Allow through if Redis is down
  }
}

export async function requestPasswordReset(prevState: any, formData: FormData) {
  const ip = await getIP();
  if (await isRateLimited(resetRatelimit, ip)) {
    return { error: 'Too many requests. Please wait a few minutes before trying again.' };
  }

  const email = formData.get('email') as string;
  if (!email) return { error: 'Email is required' };

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    // For security, always return success even if email not found
    if (!user) {
      return { success: true, message: 'If an account exists with that email, a reset link has been sent.' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await hashPassword(token); // Hash the token for storage
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await db.update(users)
      .set({ resetToken: resetTokenHash, resetTokenExpiry })
      .where(eq(users.id, user.id));

    await sendPasswordResetEmail(email, token);

    return { success: true, message: 'If an account exists with that email, a reset link has been sent.' };
  } catch (error) {
    console.error('Reset request error:', error);
    return { error: 'Something went wrong. Please try again later.' };
  }
}

export async function verifyEmail(token: string) {
  try {
    const allUsers = await db.select().from(users).where(gte(users.verificationTokenExpiry, new Date()));
    
    let targetUser = null;
    for (const user of allUsers) {
      if (user.verificationToken && await verifyPassword(token, user.verificationToken)) {
        targetUser = user;
        break;
      }
    }

    if (!targetUser) {
      return { error: 'Invalid or expired verification link' };
    }

    await db.update(users)
      .set({ 
        emailVerified: true, 
        verificationToken: null, 
        verificationTokenExpiry: null 
      })
      .where(eq(users.id, targetUser.id));

    // Auto-login after verification
    const tokenStr = await createToken({ 
      id: targetUser.id, 
      name: targetUser.name, 
      email: targetUser.email, 
      preferredLanguage: targetUser.preferredLanguage,
      gender: targetUser.gender,
    });
    await setAuthCookie(tokenStr);

    return { success: true };
  } catch (error) {
    console.error('Verification error:', error);
    return { error: 'Failed to verify email' };
  }
}

export async function resendVerificationEmail(email: string) {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user || user.emailVerified) {
      return { success: true }; // Silent success
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = await hashPassword(verificationToken);
    const verificationTokenExpiry = new Date(Date.now() + 24 * 3600000);

    await db.update(users)
      .set({ 
        verificationToken: verificationTokenHash, 
        verificationTokenExpiry 
      })
      .where(eq(users.id, user.id));

    const { sendEmailVerificationEmail } = await import('@/lib/email');
    await sendEmailVerificationEmail(email, verificationToken);

    return { success: true };
  } catch (error) {
    console.error('Resend error:', error);
    return { error: 'Failed to resend verification email' };
  }
}

export async function resetPassword(prevState: any, formData: FormData) {
  const token = formData.get('token') as string;
  const password = formData.get('password') as string;

  if (!token || !password) return { error: 'Missing required fields' };

  try {
    const allUsers = await db.select().from(users).where(gte(users.resetTokenExpiry, new Date()));
    
    let targetUser = null;
    for (const user of allUsers) {
      if (user.resetToken && await verifyPassword(token, user.resetToken)) {
        targetUser = user;
        break;
      }
    }

    if (!targetUser) {
      return { error: 'Invalid or expired reset token' };
    }

    const passwordHash = await hashPassword(password);
    await db.update(users)
      .set({ 
        passwordHash, 
        resetToken: null, 
        resetTokenExpiry: null 
      })
      .where(eq(users.id, targetUser.id));

    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { error: 'Failed to reset password. Please try again.' };
  }
}

export async function register(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const preferredLanguage = formData.get('preferredLanguage') as string;

  if (!name || !email || !password || !preferredLanguage) {
    return { error: 'Missing required fields' };
  }

  const ip = await getIP();
  if (await isRateLimited(signupRatelimit, ip)) {
    return { error: 'Too many signup attempts. Please wait 10 minutes before trying again.' };
  }

  // 1. MX record check — block fake/non-existent domains before touching the DB
  const deliverable = await isEmailDeliverable(email);
  if (!deliverable) {
    return { error: 'Please enter a valid email address. We couldn\'t verify this domain.' };
  }

  try {
    const [existing] = await db.select().from(users).where(eq(users.email, email));

    if (existing) {
      // 2. Bounce check — block re-registration with a hard-bounced address
      if (existing.emailBounced) {
        return { error: 'This email address is not deliverable. Please use a different email.' };
      }
      return { error: 'An account with this email already exists.' };
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db.insert(users).values({
        name,
        email,
        passwordHash,
        preferredLanguage,
    }).returning();

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = await hashPassword(verificationToken);
    const verificationTokenExpiry = new Date(Date.now() + 24 * 3600000); // 24 hours

    await db.update(users)
      .set({ 
        verificationToken: verificationTokenHash, 
        verificationTokenExpiry 
      })
      .where(eq(users.id, newUser.id));

    const { sendEmailVerificationEmail } = await import('@/lib/email');
    await sendEmailVerificationEmail(email, verificationToken);

    redirect('/verify-email/pending');
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error;
    console.error('Registration error:', error);
    return { error: 'Something went wrong during registration.' };
  }
}


export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Missing required fields' };
  }

  const ip = await getIP();
  if (await isRateLimited(loginRatelimit, ip)) {
    return { error: 'Too many login attempts. Please wait 1 minute before trying again.' };
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

    if (!user.emailVerified) {
      return { 
        error: 'Please verify your email address before logging in.',
        unverified: true,
        email: user.email 
      };
    }

    const token = await createToken({ 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      preferredLanguage: user.preferredLanguage,
      gender: user.gender    });
    await setAuthCookie(token);

  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    if (error?.message === 'NEXT_REDIRECT') throw error;
    console.error('[Login] Error:', error?.message, error?.stack);
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

    // Update the session token with the new gender, while preserving other settings
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
