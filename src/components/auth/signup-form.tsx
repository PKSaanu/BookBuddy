'use client';

import { useActionState, useState } from 'react';
import { register } from '@/actions/auth';
import { SubmitButton } from '@/components/submit-button';
import { motion } from 'framer-motion';

export function SignupForm() {
  const [state, formAction] = useActionState(register, null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [preferredLanguage, setPreferredLanguage] = useState<'Tamil' | 'Sinhala'>('Tamil');

  const handleSubmit = (formData: FormData) => {
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
      setClientError("Passwords do not match");
      return;
    }
    setClientError(null);
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
          className="block w-full px-5 py-3 bg-slate-50 border-2 border-transparent rounded-2xl placeholder-slate-300 focus:outline-none focus:border-[#283593] focus:bg-white transition-all text-slate-900 font-semibold"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  onClick={() => setPreferredLanguage(lang as 'Tamil' | 'Sinhala')}
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 group">
            <label htmlFor="password" className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 group-focus-within:text-[#283593] transition-colors">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="block w-full px-5 py-3 bg-slate-50 border-2 border-transparent rounded-2xl placeholder-slate-300 focus:outline-none focus:border-[#283593] focus:bg-white transition-all text-slate-900 font-semibold"
            />
          </div>
          
          <div className="space-y-1.5 group">
            <label htmlFor="confirmPassword" className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 group-focus-within:text-[#283593] transition-colors">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              className="block w-full px-5 py-3 bg-slate-50 border-2 border-transparent rounded-2xl placeholder-slate-300 focus:outline-none focus:border-[#283593] focus:bg-white transition-all text-slate-900 font-semibold"
            />
          </div>
      </div>


      <div className="pt-3">
        <SubmitButton className="w-full bg-[#283593] hover:bg-[#1a237e] text-white py-4 rounded-2xl font-bold text-[15px] shadow-lg shadow-[#283593]/20 transition-all active:scale-[0.98]">
          Create Account
        </SubmitButton>
      </div>
    </form>
  );
}
