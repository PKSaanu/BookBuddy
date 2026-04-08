'use client';

import { useActionState } from 'react';
import { login } from '@/actions/auth';
import { SubmitButton } from '@/components/submit-button';
import Link from 'next/link';

export function LoginForm() {
  const [state, formAction] = useActionState(login, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
          <p>{state.error}</p>
          {state.unverified && (
            <button 
              type="button"
              onClick={async () => {
                const { resendVerificationEmail } = await import('@/actions/auth');
                await resendVerificationEmail(state.email);
                alert('Verification email resent! Please check your inbox.');
              }}
              className="mt-2 block text-[11px] uppercase tracking-widest text-[#283593] hover:underline font-bold"
            >
              Resend Verification Link
            </button>
          )}
        </div>
      )}

      <div className="space-y-2 group">
        <label htmlFor="email" className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 group-focus-within:text-[#283593] transition-colors">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="block w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl placeholder-slate-300 focus:outline-none focus:border-[#283593] focus:bg-white transition-all text-slate-900 font-semibold"
        />
      </div>

      <div className="space-y-2 group">
        <div className="flex items-center justify-between ml-1">
          <label htmlFor="password" className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-[#283593] transition-colors">
            Password
          </label>
          <Link 
            href="/forgot-password" 
            className="text-[10px] font-bold uppercase tracking-widest text-[#283593] hover:text-[#10175b] transition-colors"
          >
            Forgot?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="block w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl placeholder-slate-300 focus:outline-none focus:border-[#283593] focus:bg-white transition-all text-slate-900 font-semibold"
        />
      </div>

      <div className="pt-2">
        <SubmitButton className="w-full bg-[#283593] hover:bg-[#1a237e] text-white py-4 rounded-2xl font-bold text-[15px] shadow-lg shadow-[#283593]/20 transition-all active:scale-[0.98]">
          Sign in
        </SubmitButton>
      </div>
    </form>
  );
}
