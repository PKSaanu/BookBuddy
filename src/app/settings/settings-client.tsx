'use client';

import { useState, useTransition } from 'react';
import { updateLanguage, updateEmail, updatePassword } from '@/actions/user';
import { IconLoader, IconCheck } from '@tabler/icons-react';

interface SettingsClientProps {
    initialEmail: string;
    initialPreferredLanguage: string;
}

export default function SettingsClient({ initialEmail, initialPreferredLanguage }: SettingsClientProps) {
    const [preferredLanguage, setPreferredLanguage] = useState(initialPreferredLanguage);
    const [email, setEmail] = useState(initialEmail);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [isPendingLang, startTransitionLang] = useTransition();
    const [isPendingSecurity, startTransitionSecurity] = useTransition();
    
    const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

    const handleLanguageSelect = (lang: string) => {
        setPreferredLanguage(lang);
        startTransitionLang(async () => {
            const res = await updateLanguage(lang);
            if (res.error) {
                setStatusMessage({ type: 'error', message: res.error });
            } else {
                setStatusMessage({ type: 'success', message: 'Language updated' });
                setTimeout(() => setStatusMessage(null), 3000);
            }
        });
    };

    const handleSecurityUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        startTransitionSecurity(async () => {
            if (email !== initialEmail) {
                const res = await updateEmail(email);
                if (res.error) {
                     setStatusMessage({ type: 'error', message: res.error });
                     return;
                }
            }

            if (currentPassword && newPassword) {
                const res = await updatePassword(currentPassword, newPassword);
                 if (res.error) {
                     setStatusMessage({ type: 'error', message: res.error });
                     return;
                }
                setCurrentPassword('');
                setNewPassword('');
            }
            
            setStatusMessage({ type: 'success', message: 'Credentials updated successfully' });
            setTimeout(() => setStatusMessage(null), 3000);
        });
    };

    return (
        <>
            {/* Status Notification */}
            {statusMessage && (
                <div className={`fixed top-10 right-10 z-[200] max-w-sm w-full p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-10 ${statusMessage.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                    {statusMessage.type === 'success' ? <IconCheck size={20} className="text-emerald-500" /> : <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />}
                    <p className="font-medium text-sm">{statusMessage.message}</p>
                </div>
            )}

            {/* Section 1: Preferred Translation */}
            <section className="bg-transparent">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-4xl font-serif text-[#10175b] font-normal tracking-tight">Preferred Translation</h2>
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">Curated Experience</span>
                </div>
                
                <div className="bg-[#EBECEC] rounded-[24px] p-[64px] border border-slate-200/50 relative overflow-hidden">
                    

                    <div className="relative z-10 max-w-2xl">
                        <p className="text-lg text-slate-600 font-medium leading-relaxed mb-10 max-w-lg">
                            Select the primary script for your curated translations. This will affect all future vocabulary cards and library annotations.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-6 relative">
                            {/* Disabled Overlay pending action */}
                            {isPendingLang && (
                                <div className="absolute -inset-2 bg-[#EBECEC]/50 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-[24px]">
                                    <div className="bg-white p-4 rounded-full shadow-xl">
                                        <IconLoader className="w-6 h-6 text-[#10175b] animate-spin" />
                                    </div>
                                </div>
                            )}

                            {/* Tamil Card */}
                            <button 
                                onClick={() => handleLanguageSelect('Tamil')}
                                disabled={isPendingLang}
                                className={`flex-1 text-left bg-white p-10 rounded-[20px] transition-all duration-300 relative border-2 group ${
                                    preferredLanguage === 'Tamil' 
                                    ? 'border-[#10175b] shadow-xl shadow-[#10175b]/10 transform -translate-y-1' 
                                    : 'border-slate-200 hover:border-[#10175b]/30 shadow-sm hover:shadow-md'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className={`text-2xl font-serif font-bold transition-colors ${preferredLanguage === 'Tamil' ? 'text-[#10175b]' : 'text-slate-800 group-hover:text-[#10175b]'}`}>Tamil</h3>
                                    {preferredLanguage === 'Tamil' && (
                                        <div className="w-6 h-6 rounded-full bg-[#10175b] text-white flex items-center justify-center animate-in zoom-in">
                                            <IconCheck className="w-3.5 h-3.5" />
                                        </div>
                                    )}
                                </div>
                                <p className={`text-sm transition-colors ${preferredLanguage === 'Tamil' ? 'text-slate-600' : 'text-slate-400 group-hover:text-slate-500'}`}>தமிழ்</p>
                            </button>

                            {/* Sinhala Card */}
                            <button 
                                onClick={() => handleLanguageSelect('Sinhala')}
                                disabled={isPendingLang}
                                className={`flex-1 text-left bg-white p-10 rounded-[20px] transition-all duration-300 relative border-2 group ${
                                    preferredLanguage === 'Sinhala' 
                                    ? 'border-[#10175b] shadow-xl shadow-[#10175b]/10 transform -translate-y-1' 
                                    : 'border-slate-200 hover:border-[#10175b]/30 shadow-sm hover:shadow-md'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className={`text-2xl font-serif font-bold transition-colors ${preferredLanguage === 'Sinhala' ? 'text-[#10175b]' : 'text-slate-800 group-hover:text-[#10175b]'}`}>Sinhala</h3>
                                    {preferredLanguage === 'Sinhala' && (
                                        <div className="w-6 h-6 rounded-full bg-[#10175b] text-white flex items-center justify-center animate-in zoom-in">
                                            <IconCheck className="w-3.5 h-3.5" />
                                        </div>
                                    )}
                                </div>
                                <p className={`text-sm transition-colors ${preferredLanguage === 'Sinhala' ? 'text-slate-600' : 'text-slate-400 group-hover:text-slate-500'}`}>සිංහල</p>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Divider */}
             <div className="w-16 h-[2px] bg-slate-200" />

            {/* Section 2: Security */}
            <section className="bg-transparent mt-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-4xl font-serif text-[#10175b] font-normal tracking-tight">Security</h2>
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">Credentials</span>
                </div>

                <form onSubmit={handleSecurityUpdate} className="space-y-12">
                    {/* Email Field */}
                    <div className="space-y-3">
                        <label className="block text-[11px] font-black uppercase tracking-widest text-[#10175b]/60">Email Address</label>
                        <div className="relative group">
                            <input 
                                type="email" 
                                value={email}
                                autoComplete="email"
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#EBECEC] border border-slate-300/50 text-[#10175b] text-lg font-serif font-bold px-6 py-5 rounded-none outline-none focus:border-[#10175b] focus:ring-1 focus:ring-[#10175b] transition-all"
                            />

                        </div>
                    </div>

                    {/* Password Update Fields */}
                    <div className="space-y-8">
                         <div className="space-y-3">
                            <label className="block text-[11px] font-black uppercase tracking-widest text-[#10175b]/60">Current Password</label>
                            <input 
                                type="password" 
                                placeholder="••••••••••••"
                                value={currentPassword}
                                autoComplete="current-password"
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-[#EBECEC] border border-slate-300/50 text-[#10175b] text-lg font-bold px-6 py-5 rounded-none outline-none focus:border-[#10175b] focus:ring-1 focus:ring-[#10175b] transition-all placeholder:text-[#10175b]/40 placeholder:tracking-widest"
                            />

                        </div>

                        {currentPassword && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                                <label className="block text-[11px] font-black uppercase tracking-widest text-[#10175b]/60">New Password</label>
                                <input 
                                    type="password" 
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    autoComplete="new-password"
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-[#EBECEC] border border-slate-300/50 text-[#10175b] text-lg font-bold px-6 py-5 rounded-none outline-none focus:border-[#10175b] focus:ring-1 focus:ring-[#10175b] transition-all"
                                />

                            </div>
                        )}
                    </div>

                    {/* Submit Button for Security Changes */}
                     {(email !== initialEmail || (currentPassword && newPassword)) && (
                        <div className="pt-4 flex justify-end animate-in fade-in">
                            <button 
                                type="submit"
                                disabled={isPendingSecurity}
                                className="font-black text-[12px] uppercase tracking-widest text-white tracking-widest bg-[#10175b] py-5 px-10 rounded-none hover:bg-[#0a0f44] transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-3"
                            >
                                {isPendingSecurity ? <IconLoader className="w-4 h-4 animate-spin" /> : null}
                                {isPendingSecurity ? 'Updating...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </form>
            </section>
        </>
    );
}
