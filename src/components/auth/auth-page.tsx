'use client';

import { useState } from 'react';
import { AuthLayout } from './auth-layout';

export type AuthMode = 'login' | 'signup';

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
  };

  return <AuthLayout mode={mode} onToggleMode={toggleMode} />;
}
