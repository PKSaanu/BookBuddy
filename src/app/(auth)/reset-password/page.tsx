'use client';

import { useActionState, Suspense } from 'react';
import { resetPassword } from '@/actions/auth';
import { AuthBrandSection } from '@/components/auth/auth-brand-section';
import { IconLock, IconLoader2, IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [state, action, isPending] = useActionState(resetPassword, null);

  if (!token) {
    return (
      <div className="bg-rose-50 border border-rose-100 p-8 rounded-[32px] flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center mb-4">
          <IconCircleX size={24} />
        </div>
        <h3 className="text-[#10175b] font-serif font-black text-xl mb-2">Invalid Session</h3>
        <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">
          The password reset link is missing or invalid. Please request a new one.
        </p>
        <Link 
          href="/forgot-password"
          className="bg-[#10175b] text-white py-3 px-8 rounded-xl font-bold text-sm hover:bg-[#283593] transition-all"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  if (state?.success) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[32px] flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-4">
          <IconCircleCheck size={24} />
        </div>
        <h3 className="text-emerald-800 font-serif font-black text-xl mb-2">Password Updated</h3>
        <p className="text-emerald-700/70 text-sm leading-relaxed mb-6">
          Your password has been reset successfully. You can now login with your new credentials.
        </p>
        <Link 
          href="/login"
          className="bg-emerald-600 text-white py-3 px-8 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
        >
          Login Now
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 text-center md:text-left">
          <h2 className="text-3xl font-serif font-black text-[#10175b] tracking-tight">
              New Password
          </h2>
          <p className="text-slate-500 font-medium mt-2">
              Create a strong password for your account.
          </p>
      </div>

      <form action={action} className="space-y-6">
          <input type="hidden" name="token" value={token} />
          
          <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#10175b]/60 ml-1">
                  Choose New Password
              </label>
              <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#10175b] transition-colors">
                      <IconLock size={20} />
                  </div>
                  <input 
                      name="password"
                      type="password" 
                      required
                      placeholder="Minimum 8 characters"
                      className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#10175b]/10 transition-all font-medium"
                      minLength={8}
                  />
              </div>
          </div>

          {state?.error && (
              <p className="text-rose-600 text-[13px] font-bold bg-rose-50 p-4 rounded-xl border border-rose-100">
                  {state.error}
              </p>
          )}

          <button 
              type="submit"
              disabled={isPending}
              className="w-full bg-[#10175b] text-white py-4 px-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[13px] shadow-xl shadow-[#10175b]/20 hover:bg-[#283593] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
          >
              {isPending ? (
                  <>
                      <IconLoader2 size={20} className="animate-spin" />
                      Updating Password...
                  </>
              ) : (
                  'Update Password'
              )}
          </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans overflow-hidden">
        {/* Desktop View: Left Brand Section */}
        <div className="hidden md:flex w-1/2 h-screen bg-slate-50 items-center justify-center p-16 z-20 transition-all duration-600">
           <AuthBrandSection mode="signup" />
        </div>

        {/* Right Form Section */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white z-10 sm:bg-slate-50 md:bg-white">
            <div className="w-full max-w-[420px] bg-white sm:p-10 sm:rounded-[32px] sm:shadow-2xl sm:shadow-[#10175b]/5 sm:border sm:border-slate-100">
              <Suspense fallback={
                <div className="flex justify-center p-12">
                  <IconLoader2 size={40} className="animate-spin text-[#10175b]" />
                </div>
              }>
                <ResetPasswordForm />
              </Suspense>
            </div>
        </div>
    </div>
  );
}
