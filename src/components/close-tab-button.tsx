'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { IconArrowLeft } from '@tabler/icons-react';
import { Suspense } from 'react';

function CloseTabButtonInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleBack = () => {
    const from = searchParams.get('from');
    if (from === 'signup') {
      router.push('/login?mode=signup');
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-slate-400 hover:text-[#10175b] transition-colors mb-10 group text-[10px] font-bold uppercase tracking-widest"
    >
      <IconArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
      Back
    </button>
  );
}

export function CloseTabButton() {
  return (
    <Suspense>
      <CloseTabButtonInner />
    </Suspense>
  );
}

