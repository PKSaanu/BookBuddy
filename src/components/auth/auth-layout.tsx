'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AuthBrandSection } from './auth-brand-section';
import { AuthFormSection } from './auth-form-section';
import type { AuthMode } from './auth-page';
import { useEffect, useState } from 'react';

interface AuthLayoutProps {
  mode: AuthMode;
  onToggleMode: () => void;
}

export function AuthLayout({ mode, onToggleMode }: AuthLayoutProps) {
  const isLogin = mode === 'login';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans overflow-hidden">
        {/* Mobile View: Only Forms */}
        <div className="md:hidden flex w-full h-screen bg-slate-50 items-center justify-center p-6 overflow-hidden">
            <div className="w-full max-w-md bg-white p-8 rounded-[32px] shadow-2xl shadow-[#10175b]/5 border border-slate-100">
                <AuthFormSection mode={mode} onToggleMode={onToggleMode} />
            </div>
        </div>

        {/* Desktop View: 50/50 Swap with Framer Motion */}
        <div className="hidden md:flex w-full h-screen relative bg-slate-50 overflow-hidden">
            
            {/* Animated Diagonal Separator */}
            <motion.div
                className="absolute top-1/2 left-1/2 w-[2px] h-[150vh] bg-[#283593] z-30 pointer-events-none"
                style={{ originX: 0.5, originY: 0.5 }}
                initial={false}
                animate={{
                    x: "-50%",
                    y: "-50%",
                    rotate: isLogin ? 18 : -18
                }}
                transition={{ type: 'tween', ease: 'easeInOut', duration: 0.6 }}
            />

            <motion.div 
                className="absolute top-0 bottom-0 w-1/2 bg-white flex items-center justify-center p-16 z-20"
                initial={false}
                animate={{
                    left: isLogin ? 0 : '50%'
                }}
                transition={{ type: 'tween', ease: 'easeInOut', duration: 0.6 }}
            >
               <AuthBrandSection mode={mode} />
            </motion.div>

            <motion.div 
                className="absolute top-0 bottom-0 w-1/2 bg-white flex items-center justify-center p-12 z-10"
                initial={false}
                animate={{
                    left: isLogin ? '50%' : 0
                }}
                transition={{ type: 'tween', ease: 'easeInOut', duration: 0.6 }}
            >
                <div className="w-full max-w-[420px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, x: isLogin ? -30 : 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isLogin ? 30 : -30 }}
                        transition={{ duration: 0.3 }}
                    >
                        <AuthFormSection mode={mode} onToggleMode={onToggleMode} />
                    </motion.div>
                  </AnimatePresence>
                </div>
            </motion.div>
        </div>
    </div>
  );
}
