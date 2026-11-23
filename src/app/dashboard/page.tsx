import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDashboardData } from '@/db/queries';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.id) {
    redirect('/login');
  }

  const { items, runnerItems, recentItem, userVocabCount, isResearcher, userName } =
    await getDashboardData(session.id as string);
  const oldItems = items.slice(1);

  return (
    <DashboardClient
      userName={userName}
      items={items}
      runnerItems={runnerItems}
      userVocabCount={userVocabCount}
      recentItem={recentItem}
      oldItems={oldItems}
      progress={recentItem?.progress || 0}
      isResearcher={isResearcher}
    />
  );
}
