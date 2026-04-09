'use client';

import { useActionState, useState, useEffect } from 'react';
import { register } from '@/actions/auth';
import { SubmitButton } from '@/components/submit-button';
import { motion } from 'framer-motion';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import Link from 'next/link';

const STORAGE_KEY = 'signup_draft';

export function SignupForm() {
  const [state, formAction] = useActionState(register, null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [preferredLanguage, setPreferredLanguage] = useState<'Tamil' | 'Sinhala'>('Tamil');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Restore saved draft on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.name) setName(draft.name);
        if (draft.email) setEmail(draft.email);
        if (draft.preferredLanguage) setPreferredLanguage(draft.preferredLanguage);
      }
    } catch {}
  }, []);

  // Persist draft whenever fields change
  const saveDraft = (updates: Partial<{ name: string; email: string; preferredLanguage: string }>) => {
    try {
      const existing = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...updates }));
    } catch {}
  };

  const handleSubmit = (formData: FormData) => {
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    
    if (password.length < 8) {
      setClientError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setClientError("Passwords do not match");
      return;
    }
    setClientError(null);
    // Clear draft on submit
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
    formAction(formData);
  };

  return (
    <form action={handleSubmit} className="space-y-5">
      {(clientError || state?.error) && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-3 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300">
          {clientError || state?.error}
        </div>
      )}

      <div className="space-y-1.5 group">
        <label htmlFor="name" className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 group-focus-within:text-[#283593] transition-colors">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Saanusan"
          value={name}
          onChange={(e) => { setName(e.target.value); saveDraft({ name: e.target.value }); }}
          className="block w-full px-5 py-3 bg-slate-50 border-2 border-transparent rounded-2xl placeholder-slate-300 focus:outline-none focus:border-[#283593] focus:bg-white transition-all text-slate-900 font-semibold"
        />
      </div>

      <div className="space-y-1.5 group">
        <label htmlFor="email" className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 group-focus-within:text-[#283593] transition-colors">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); saveDraft({ email: e.target.value }); }}
          className="block w-full px-5 py-3 bg-slate-50 border-2 border-transparent rounded-2xl placeholder-slate-300 focus:outline-none focus:border-[#283593] focus:bg-white transition-all text-slate-900 font-semibold"
        />
      </div>

      <div className="space-y-1.5 group flex flex-col">
        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 transition-colors">
          Preferred Language
        </label>
        <div className="relative flex rounded-2xl bg-slate-50 border-2 border-transparent p-1 h-[52px] isolate">
          <input type="hidden" name="preferredLanguage" value={preferredLanguage} />
          
          {['Tamil', 'Sinhala'].map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => { setPreferredLanguage(lang as 'Tamil' | 'Sinhala'); saveDraft({ preferredLanguage: lang }); }}
              className={`relative flex-1 flex items-center justify-center rounded-xl text-sm font-bold outline-none z-10 transition-colors ${
                preferredLanguage === lang ? 'text-[#283593]' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {preferredLanguage === lang && (
                <motion.div
                  layoutId="languageSwitchBg"
                  className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_8px_-2px_rgba(40,53,147,0.15)] ring-1 ring-slate-900/5 -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 group">
            <label htmlFor="password" className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 group-focus-within:text-[#283593] transition-colors">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="block w-full px-5 py-3 bg-slate-50 placeholder-slate-300 focus:outline-none focus:bg-white transition-all text-slate-900 font-semibold pr-14"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-[#283593] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400/80 font-medium ml-1 mt-1">
              Minimum 8 characters
            </p>
          </div>
          
          <div className="space-y-1.5 group">
            <label htmlFor="confirmPassword" className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 group-focus-within:text-[#283593] transition-colors">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="block w-full px-5 py-3 bg-slate-50 placeholder-slate-300 focus:outline-none focus:bg-white transition-all text-slate-900 font-semibold pr-14"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-[#283593] transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </div>
          </div>
      </div>


      <div className="pt-3">
        <SubmitButton className="w-full bg-[#283593] hover:bg-[#1a237e] text-white py-4 rounded-2xl font-bold text-[15px] shadow-lg shadow-[#283593]/20 transition-all active:scale-[0.98]">
          Create Account
        </SubmitButton>
        <p className="text-center text-[10px] text-slate-400 font-medium mt-3 leading-relaxed px-2">
          By clicking Create Account, you agree to our{' '}
          <Link href="/terms?from=signup" className="text-[#283593] hover:underline underline-offset-2 font-bold">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy?from=signup" className="text-[#283593] hover:underline underline-offset-2 font-bold">Privacy Policy</Link>.
        </p>
      </div>
    </form>
  );
}
