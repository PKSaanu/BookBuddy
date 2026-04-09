import { useActionState, useState } from 'react';
import { login } from '@/actions/auth';
import { SubmitButton } from '@/components/submit-button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCircleCheck, IconCircleX, IconLoader2, IconEye, IconEyeOff } from '@tabler/icons-react';

export function LoginForm() {
  const [state, formAction] = useActionState(login, null);
  const [isResending, setIsResending] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleResend = async () => {
    if (!state?.email) return;
    setIsResending(true);
    const { resendVerificationEmail } = await import('@/actions/auth');
    await resendVerificationEmail(state.email);
    setIsResending(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  return (
    <>
      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="flex items-center gap-2">
                <IconCircleX size={16} />
                {state.error}
            </p>
            {state.unverified && (
              <button 
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="mt-3 block text-[11px] uppercase tracking-widest text-[#283593] hover:underline font-bold disabled:opacity-50 flex items-center gap-2 outline-none"
              >
                {isResending ? (
                    <>
                        <IconLoader2 size={12} className="animate-spin" />
                        Resending...
                    </>
                ) : (
                    'Resend Verification Link'
                )}
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
          <div className="relative group">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="block w-full px-5 py-4 bg-slate-50 placeholder-slate-300 focus:outline-none focus:bg-white transition-all text-slate-900 font-semibold pr-14"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-[#283593] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
            </button>
          </div>
          <p className="text-[10px] text-slate-400/80 font-medium ml-1">
            Minimum 8 characters
          </p>
        </div>

        <div className="pt-2">
          <SubmitButton className="w-full bg-[#283593] hover:bg-[#1a237e] text-white py-4 rounded-2xl font-bold text-[15px] shadow-lg shadow-[#283593]/20 transition-all active:scale-[0.98]">
            Sign in
          </SubmitButton>
        </div>
      </form>

      {/* Global Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[400px]"
          >
            <div className="bg-[#10175b] text-white px-6 py-4 rounded-[24px] shadow-2xl flex items-center justify-between gap-4 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                        <IconCircleCheck size={18} />
                    </div>
                    <div>
                        <p className="font-bold text-[13px] tracking-tight">Email Resent!</p>
                        <p className="text-white/60 text-[11px] font-medium">Please check your inbox to verify.</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowToast(false)}
                    className="text-white/40 hover:text-white transition-colors"
                >
                    <IconCircleX size={20} />
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
