'use server';

import { db } from '@/db/db';
import { users, books, translations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession, hashPassword, verifyPassword, createToken, setAuthCookie, removeAuthCookie } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateLanguage(language: string) {
    const session = await getSession();
    if (!session?.id) return { error: 'Unauthorized' };

    try {
        await db.update(users)
            .set({ preferredLanguage: language })
            .where(eq(users.id, session.id as string));

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
        // Check if email is already taken
        const existing = await db.select().from(users).where(eq(users.email, email));
        if (existing.length > 0 && existing[0].id !== session.id) {
            return { error: 'Email already in use' };
        }

        await db.update(users)
            .set({ email })
            .where(eq(users.id, session.id as string));

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
        const [user] = await db.select().from(users).where(eq(users.id, session.id as string));
        if (!user) return { error: 'User not found' };

        const isValid = await verifyPassword(currentPassword, user.passwordHash);
        if (!isValid) return { error: 'Incorrect current password' };

        const newHash = await hashPassword(newPassword);
        await db.update(users)
            .set({ passwordHash: newHash })
            .where(eq(users.id, session.id as string));

        return { success: true };
    } catch (error) {
        return { error: 'Failed to update password' };
    }
}

export async function deleteAccount() {
    const session = await getSession();
    if (!session?.id) return { error: 'Unauthorized' };

    try {
        // Cascading delete is handled by database schema (onDelete: 'cascade')
        // But for safety, we can explicitly delete or just delete the user
        await db.delete(users).where(eq(users.id, session.id as string));
        
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
        await db.update(users)
            .set({ isResearcher })
            .where(eq(users.id, session.id as string));

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

import { PREFERRED_FEMALE_VOICES, PREFERRED_MALE_VOICES } from '@/lib/constants';

export async function updateAudioSettings(rate: string, voiceGender: string, voiceName: string) {
    const session = await getSession();
    if (!session?.id) return { error: 'Unauthorized' };

    // Resolve "Auto" (empty string) to specific defaults for DB persistence
    const resolvedVoiceName = voiceName || (voiceGender === 'female' ? PREFERRED_FEMALE_VOICES[0] : PREFERRED_MALE_VOICES[0]);

    try {
        await db.update(users)
            .set({ 
                voiceRate: rate, 
                voiceGender: voiceGender, 
                voiceName: resolvedVoiceName 
            })
            .where(eq(users.id, session.id as string));

        // Refresh token with new settings to keep session in sync
        const token = await createToken({ 
            id: session.id,
            name: session.name,
            email: session.email,
            preferredLanguage: session.preferredLanguage,
            isResearcher: session.isResearcher,
            gender: session.gender,
            voiceGender: voiceGender,
            voiceRate: rate,
            voiceName: resolvedVoiceName
        });
        await setAuthCookie(token);

        revalidatePath('/settings');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update audio settings' };
    }
}
