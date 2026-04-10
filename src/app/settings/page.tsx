import LayoutWrapper from '@/components/layout-wrapper';
import { getSession } from '@/lib/auth';
import { db } from '@/db/db';
import { users, books, translations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { ProfilePortrait } from './profile-portrait';
import SettingsClient from './settings-client';
import { DeleteAccountButton } from './delete-account-button';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.id) {
    redirect('/login');
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.id as string));
  
  if (!user) {
    redirect('/login');
  }

  // Get user stats
  const userBooks = await db.select().from(books).where(eq(books.userId, session.id as string));
  const bookCount = userBooks.length;
  
  const allTranslations = await db.select().from(translations);
  const wordsCount = allTranslations.filter(t => userBooks.some(b => b.id === t.bookId)).length;

  return (
    <LayoutWrapper>
      <div className="max-w-[1400px] mx-auto p-10 lg:p-16 min-h-full flex flex-col xl:flex-row gap-16 xl:gap-24 relative">
        {/* Main Content Area */}
        <div className="flex-1 space-y-20 max-w-4xl pt-8">
            <SettingsClient 
                initialEmail={user.email} 
                initialPreferredLanguage={user.preferredLanguage}
                initialIsResearcher={user.isResearcher}
            />
        </div>

        {/* Right Sidebar - Profile Info and Danger Zone */}
        <div className="xl:w-[420px] shrink-0 pt-8 flex flex-col min-h-full gap-16 pb-32 xl:pb-0">
          
          <ProfilePortrait 
            initialGender={user.gender} 
            userName={user.name}
            wordsCount={wordsCount}
            bookCount={bookCount}
          />

          <DeleteAccountButton />

          {/* Footer Quote - Positioned beautifully matching design */}
          <div className="mt-auto pt-24 text-right pr-4 opacity-50 hover:opacity-100 transition-opacity duration-700">
              <p className="font-serif italic text-2xl text-slate-500 leading-relaxed max-w-sm ml-auto">
                  "The limits of my language mean the limits of my world."
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-6 flex items-center justify-end gap-3">
                  <span className="w-8 h-[1px] bg-slate-300"></span>
                  Ludwig Wittgenstein
              </p>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
