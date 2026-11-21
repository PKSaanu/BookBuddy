import LayoutWrapper from '@/components/layout-wrapper';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProfilePortrait } from './profile-portrait';
import SettingsClient from './settings-client';
import { DeleteAccountButton } from './delete-account-button';
import { getUserSettingsProfile, getSettingsStats } from '@/db/queries';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.id) {
    redirect('/login');
  }

  const [user, stats] = await Promise.all([
    getUserSettingsProfile(session.id as string),
    getSettingsStats(session.id as string),
  ]);
  
  if (!user) {
    redirect('/login');
  }

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
            wordsCount={stats.wordsCount}
            bookCount={stats.bookCount}
          />

          <DeleteAccountButton />

          {/* Footer Quote */}
          <div className="mt-auto pt-24 text-right pr-4 opacity-50 hover:opacity-100 transition-opacity duration-700">
            <p className="font-serif italic text-2xl text-slate-500 leading-relaxed max-w-sm ml-auto">
              &ldquo;The limits of my language mean the limits of my world.&rdquo;
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
