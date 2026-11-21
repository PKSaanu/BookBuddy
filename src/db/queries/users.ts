import { db } from '@/db/db';
import { users } from '@/db/schema';
import { eq, ilike, gte } from 'drizzle-orm';

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user || null;
}

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(ilike(users.email, email.trim().toLowerCase()))
    .limit(1);
  return user || null;
}

export async function getUserLanguagePreference(userId: string): Promise<string> {
  const [user] = await db
    .select({ preferredLanguage: users.preferredLanguage })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user?.preferredLanguage || 'Tamil';
}

export async function getUserSettingsProfile(userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      preferredLanguage: users.preferredLanguage,
      gender: users.gender,
      isResearcher: users.isResearcher,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user || null;
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  preferredLanguage: string;
}) {
  const [newUser] = await db
    .insert(users)
    .values({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      passwordHash: data.passwordHash,
      preferredLanguage: data.preferredLanguage,
    })
    .returning();
  return newUser;
}

export async function updateUserVerificationToken(
  userId: string,
  tokenHash: string,
  expiry: Date
) {
  await db
    .update(users)
    .set({
      verificationToken: tokenHash,
      verificationTokenExpiry: expiry,
    })
    .where(eq(users.id, userId));
}

export async function getUsersWithActiveVerificationToken() {
  return db
    .select()
    .from(users)
    .where(gte(users.verificationTokenExpiry, new Date()));
}

export async function markUserEmailVerified(userId: string) {
  await db
    .update(users)
    .set({
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    })
    .where(eq(users.id, userId));
}

export async function setUserPasswordResetToken(
  userId: string,
  tokenHash: string,
  expiry: Date
) {
  await db
    .update(users)
    .set({
      resetToken: tokenHash,
      resetTokenExpiry: expiry,
    })
    .where(eq(users.id, userId));
}

export async function getUsersWithActiveResetToken() {
  return db
    .select()
    .from(users)
    .where(gte(users.resetTokenExpiry, new Date()));
}

export async function updateUserPassword(userId: string, passwordHash: string) {
  await db
    .update(users)
    .set({
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    })
    .where(eq(users.id, userId));
}

export async function updateUserEmail(userId: string, email: string) {
  await db
    .update(users)
    .set({ email: email.trim().toLowerCase() })
    .where(eq(users.id, userId));
}

export async function updateUserLanguage(userId: string, preferredLanguage: string) {
  await db
    .update(users)
    .set({ preferredLanguage })
    .where(eq(users.id, userId));
}

export async function updateUserGender(userId: string, gender: string) {
  await db
    .update(users)
    .set({ gender })
    .where(eq(users.id, userId));
}

export async function updateUserResearcherStatus(userId: string, isResearcher: boolean) {
  await db
    .update(users)
    .set({ isResearcher })
    .where(eq(users.id, userId));
}

export async function markUserEmailBounced(email: string) {
  await db
    .update(users)
    .set({ emailBounced: true })
    .where(eq(users.email, email.trim().toLowerCase()));
}

export async function deleteUser(userId: string) {
  await db.delete(users).where(eq(users.id, userId));
}
