'use server';

import { getSession, hashPassword, verifyPassword, createToken, setAuthCookie, removeAuthCookie } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import {
  getUserById,
  getUserByEmail,
  updateUserLanguage,
  updateUserEmail,
  updateUserPassword,
  updateUserResearcherStatus,
  deleteUser,
} from '@/db/queries';

export async function updateLanguage(language: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    await updateUserLanguage(session.id as string, language);

    // Refresh token with new language
    const token = await createToken({ 
      id: session.id, 
      email: session.email, 
      preferredLanguage: language 
    });
    await setAuthCookie(token);
    
    revalidatePath('/settings');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update language' };
  }
}

export async function updateEmail(email: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    const existing = await getUserByEmail(email);
    if (existing && existing.id !== session.id) {
      return { error: 'Email already in use' };
    }

    await updateUserEmail(session.id as string, email);

    // Refresh token with new email
    const token = await createToken({ 
      id: session.id, 
      email, 
      preferredLanguage: session.preferredLanguage 
    });
    await setAuthCookie(token);

    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update email' };
  }
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    const user = await getUserById(session.id as string);
    if (!user) return { error: 'User not found' };

    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) return { error: 'Incorrect current password' };

    if (newPassword.length < 8) {
      return { error: 'New password must be at least 8 characters' };
    }

    const newHash = await hashPassword(newPassword);
    await updateUserPassword(session.id as string, newHash);

    return { success: true };
  } catch (error) {
    return { error: 'Failed to update password' };
  }
}

export async function deleteAccount() {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    await deleteUser(session.id as string);
    await removeAuthCookie();
    return { success: true };
  } catch (error) {
    return { error: 'Failed to deactivate account' };
  }
}

export async function updateResearcherMode(isResearcher: boolean) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    await updateUserResearcherStatus(session.id as string, isResearcher);

    const token = await createToken({ 
      id: session.id, 
      email: session.email, 
      preferredLanguage: session.preferredLanguage,
      isResearcher
    });
    await setAuthCookie(token);

    revalidatePath('/settings');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update researcher mode' };
  }
}
