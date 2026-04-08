'use client';

import { useActionState } from 'react';
import { requestPasswordReset } from '@/actions/auth';
import { AuthBrandSection } from '@/components/auth/auth-brand-section';
import { IconArrowLeft, IconMail, IconLoader2, IconCircleCheck } from '@tabler/icons-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [state, action, isPending] = useActionState(requestPasswordReset, null);

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans overflow-hidden">
        {/* Desktop View: Left Brand Section */}
        <div className="hidden md:flex w-1/2 h-screen bg-slate-50 items-center justify-center p-16 z-20 transition-all duration-600">
           <AuthBrandSection mode="login" />
        </div>

        {/* Right Form Section */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white z-10 sm:bg-slate-50 md:bg-white">
            <div className="w-full max-w-[420px] bg-white sm:p-10 sm:rounded-[32px] sm:shadow-2xl sm:shadow-[#10175b]/5 sm:border sm:border-slate-100">
                <div className="mb-8 text-center md:text-left">
                    <Link 
                        href="/login" 
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-[#10175b] transition-colors mb-6 group text-[10px] font-bold uppercase tracking-widest"
                    >
                        <IconArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                    </Link>
                    <h2 className="text-3xl font-serif font-black text-[#10175b] tracking-tight">
                        Reset Password
                    </h2>
                    <p className="text-slate-500 font-medium mt-2">
                        We'll send you a link to reset your password.
                    </p>
                </div>

                {state?.success ? (
                    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-4">
                            <IconCircleCheck size={24} />
                        </div>
                        <p className="text-emerald-800 font-medium mb-2">Email Sent!</p>
                        <p className="text-emerald-700/70 text-sm leading-relaxed">
                            {state.message}
                        </p>
                        <Link 
                            href="/login"
                            className="mt-6 text-[#10175b] font-bold text-sm hover:underline underline-offset-4"
                        >
                            Return to Login
                        </Link>
                    </div>
                ) : (
                    <form action={action} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#10175b]/60 ml-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#10175b] transition-colors">
                                    <IconMail size={20} />
                                </div>
                                <input 
                                    name="email"
                                    type="email" 
                                    required
                                    placeholder="Enter your registered email"
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#10175b]/10 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {state?.error && (
                            <p className="text-rose-600 text-[13px] font-bold bg-rose-50 p-4 rounded-xl border border-rose-100 animate-in slide-in-from-top-1">
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
                                    Sending Link...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    </div>
  );
}
