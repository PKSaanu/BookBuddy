'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyEmail } from '@/actions/auth';
import { AuthBrandSection } from '@/components/auth/auth-brand-section';
import { IconLoader2, IconCircleCheck, IconCircleX, IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function process() {
      if (!token) {
        setStatus('error');
        setErrorMsg('Invalid or missing verification token.');
        return;
      }

      const result = await verifyEmail(token);
      if (result.success) {
        setStatus('success');
        // Auto-redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        setStatus('error');
        setErrorMsg(result.error || 'Failed to verify email.');
      }
    }
    process();
  }, [token, router]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center text-center py-12">
        <IconLoader2 size={48} className="animate-spin text-[#10175b] mb-6" />
        <h2 className="text-2xl font-serif font-black text-[#10175b]">Verifying your account</h2>
        <p className="text-slate-500 font-medium mt-2">Connecting you to the study hub...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center text-center py-10 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-500 text-white rounded-[32px] flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20">
          <IconCircleCheck size={40} />
        </div>
        <h2 className="text-3xl font-serif font-black text-[#10175b]">Verification Successful!</h2>
        <p className="text-slate-500 font-medium mt-4 leading-relaxed">
          Your scholarly journey begins now. We're redirecting you to your dashboard.
        </p>
        <Link 
            href="/dashboard"
            className="mt-10 inline-flex items-center gap-2 text-[#10175b] font-bold hover:underline underline-offset-8 decoration-2"
        >
          Go to Dashboard Now
          <IconArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center py-10 animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 bg-rose-500 text-white rounded-[32px] flex items-center justify-center mb-8 shadow-2xl shadow-rose-500/20">
        <IconCircleX size={40} />
      </div>
      <h2 className="text-3xl font-serif font-black text-[#10175b]">Verification Failed</h2>
      <p className="text-rose-600/70 font-medium mt-4 leading-relaxed bg-rose-50 p-4 rounded-2xl border border-rose-100">
        {errorMsg}
      </p>
      <div className="mt-10 flex flex-col gap-4 w-full">
        <Link 
            href="/verify-email/pending"
            className="w-full bg-[#10175b] text-white py-3.5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[12px] shadow-xl shadow-[#10175b]/20 hover:bg-[#283593] transition-all"
        >
          Request New Link
        </Link>
        <Link 
            href="/login"
            className="text-slate-400 hover:text-[#10175b] font-bold text-[10px] uppercase tracking-widest transition-colors py-2"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans overflow-hidden">
        {/* Desktop View: Left Brand Section */}
        <div className="hidden md:flex w-1/2 h-screen bg-slate-50 items-center justify-center p-16 z-20">
           <AuthBrandSection mode="login" />
        </div>

        {/* Right Content Section */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white z-10 sm:bg-slate-50 md:bg-white">
            <div className="w-full max-w-[420px] bg-white sm:p-10 sm:rounded-[32px] sm:shadow-2xl sm:shadow-[#10175b]/5 sm:border sm:border-slate-100">
                <Suspense fallback={
                    <div className="flex justify-center p-12">
                        <IconLoader2 size={40} className="animate-spin text-[#10175b]" />
                    </div>
                }>
                    <VerifyEmailContent />
                </Suspense>
            </div>
        </div>
    </div>
  );
}
