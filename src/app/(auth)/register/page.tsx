'use client';

import { useActionState } from 'react';
import { register } from '@/actions/auth';
import { SubmitButton } from '@/components/submit-button';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const [state, formAction] = useActionState(register, null);

  return (
    <div className="min-h-screen bg-[#F4F5F6] flex flex-col justify-center py-12 px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-10 text-center">
        <div className="inline-block p-4 mb-4">
          <Image 
            src="/logo.png" 
            alt="BookBuddy" 
            width={180} 
            height={40} 
            priority 
            style={{ height: 'auto' }}
            className="object-contain"
          />
        </div>
        <h2 className="text-4xl font-serif font-black text-[#10175b] tracking-tight">Create Account</h2>
        <p className="mt-3 text-slate-500 font-medium tracking-wide">Start your scholarly journey today</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[440px]">
        <div className="bg-white py-12 px-10 shadow-2xl shadow-[#10175b]/5 rounded-[32px] border border-slate-100">
          <form action={formAction} className="space-y-7">
            {state?.error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300">
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="block w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl placeholder-slate-300 focus:outline-none focus:border-[#10175b] focus:bg-white transition-all text-slate-900 font-semibold"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="block w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl placeholder-slate-300 focus:outline-none focus:border-[#10175b] focus:bg-white transition-all text-slate-900 font-semibold"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="preferredLanguage" className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Preferred translation language
              </label>
              <select
                  id="preferredLanguage"
                  name="preferredLanguage"
                  required
                  defaultValue="Tamil"
                  className="block w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-[#10175b] focus:bg-white transition-all text-slate-900 font-semibold appearance-none"
                >
                  <option value="Tamil">Tamil</option>
                  <option value="Sinhala">Sinhala</option>
                </select>
            </div>

            <div className="pt-2">
              <SubmitButton className="w-full bg-[#10175b] hover:bg-[#1a2066] text-white py-4 rounded-2xl font-bold text-[15px] shadow-lg shadow-[#10175b]/20 transition-all active:scale-[0.98]">
                Create My Account
              </SubmitButton>
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm font-medium text-slate-500">
              Already a member?{' '}
              <Link href="/login" className="font-bold text-[#10175b] hover:underline underline-offset-4 decoration-2">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
