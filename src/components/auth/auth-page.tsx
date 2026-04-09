'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthLayout } from './auth-layout';

export type AuthMode = 'login' | 'signup';

function AuthPageInner() {
  const searchParams = useSearchParams();
  const initialMode: AuthMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
  };

  return <AuthLayout mode={mode} onToggleMode={toggleMode} />;
}

export function AuthPage() {
  return (
    <Suspense>
      <AuthPageInner />
    </Suspense>
  );
}

