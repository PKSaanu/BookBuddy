'use client';

import { useState, useTransition, useEffect } from 'react';
import { updateLanguage, updateEmail, updatePassword, updateResearcherMode, updateAudioSettings } from '@/actions/user';
import { IconLoader, IconCheck } from '@tabler/icons-react';

interface SettingsClientProps {
    initialEmail: string;
    initialPreferredLanguage: string;
    initialIsResearcher: boolean;
    initialVoiceRate: string;
    initialVoiceGender: string;
    initialVoiceName: string;
}

export default function SettingsClient({ 
    initialEmail, 
    initialPreferredLanguage,
    initialIsResearcher,
    initialVoiceRate,
    initialVoiceGender,
    initialVoiceName
}: SettingsClientProps) {
    const [preferredLanguage, setPreferredLanguage] = useState(initialPreferredLanguage);
    const [isResearcher, setIsResearcher] = useState(initialIsResearcher);
    const [email, setEmail] = useState(initialEmail);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    // Audio Settings State
    const [voicePace, setVoicePace] = useState(initialVoiceRate);
    const [voiceGender, setVoiceGender] = useState(initialVoiceGender);
    const [voiceName, setVoiceName] = useState(initialVoiceName);
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [hasUnsavedAudio, setHasUnsavedAudio] = useState(false);

    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                setAvailableVoices(voices);
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    const [isPendingLang, startTransitionLang] = useTransition();
    const [isPendingSecurity, startTransitionSecurity] = useTransition();
    const [isPendingResearcher, startTransitionResearcher] = useTransition();
    const [isPendingAudio, startTransitionAudio] = useTransition();
    
    const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

    const handleAudioPreview = (pace: string, gender: string, specificVoiceName?: string) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance("This is how your translated vocabulary will sound.");
        utterance.rate = parseFloat(pace);
        
        const voices = window.speechSynthesis.getVoices();
        const preferredFemale = ['Google US English', 'Google UK English Female', 'Samantha', 'Microsoft Zira'];
        const preferredMale = ['Google UK English Male', 'Alex', 'Microsoft David', 'Daniel'];
        
        let selectedVoice: SpeechSynthesisVoice | undefined;

        if (specificVoiceName) {
            selectedVoice = voices.find(v => v.name === specificVoiceName);
        }

        if (!selectedVoice) {
            const targetList = gender === 'female' ? preferredFemale : preferredMale;
            selectedVoice = targetList.map(v => voices.find(voice => voice.name.includes(v))).find(v => !!v);
        }
        
        if (selectedVoice) utterance.voice = selectedVoice;
        window.speechSynthesis.speak(utterance);
    };

    const handleSaveAudio = () => {
        startTransitionAudio(async () => {
            const res = await updateAudioSettings(voicePace, voiceGender, voiceName);
            if (res.error) {
                setStatusMessage({ type: 'error', message: res.error });
            } else {
                setHasUnsavedAudio(false);
                setStatusMessage({ type: 'success', message: 'Audio styling saved successfully' });
                setTimeout(() => setStatusMessage(null), 3000);
            }
        });
    };

    const handleResearcherToggle = () => {
        const newValue = !isResearcher;
        setIsResearcher(newValue);
        startTransitionResearcher(async () => {
            const res = await updateResearcherMode(newValue);
            if (res.error) {
                setStatusMessage({ type: 'error', message: res.error });
            } else {
                setStatusMessage({ type: 'success', message: 'Researcher Mode updated' });
                setTimeout(() => setStatusMessage(null), 3000);
            }
        });
    };

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
             <div className="w-16 h-[2px] bg-slate-200 mt-16" />

            {/* Section 1.5: Voice Settings */}
            <section className="bg-transparent mt-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-4xl font-serif text-[#10175b] font-normal tracking-tight">Audio Styling</h2>
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">Personalize</span>
                </div>
                
                <div className="bg-[#EBECEC] rounded-[24px] p-10 sm:p-[64px] border border-slate-200/50">
                    <p className="text-lg text-slate-600 font-medium leading-relaxed mb-8 max-w-2xl">
                        Customize the pacing of your pronunciation guide. We recommend the "Smooth" setting for a perfectly polite and un-rushed learning experience.
                    </p>

                    <div className="space-y-6 mb-8 max-w-2xl">
                        {/* Voice Gender Selection */}
                        <div className="flex flex-col sm:flex-row gap-6">
                            <button 
                                type="button"
                                onClick={() => {
                                    setVoiceGender('female');
                                    setVoiceName(''); // Reset specific voice on gender change
                                    setHasUnsavedAudio(true);
                                    handleAudioPreview(voicePace, 'female');
                                }}
                                className={`flex-1 bg-white p-6 rounded-[20px] transition-all text-left border-2 flex items-center justify-between group ${
                                    voiceGender === 'female' 
                                    ? 'border-[#10175b] shadow-xl shadow-[#10175b]/10 transform -translate-y-1' 
                                    : 'border-slate-200 hover:border-[#10175b]/30 shadow-sm hover:shadow-md'
                                }`}
                            >
                                <div>
                                    <h3 className={`text-lg font-serif font-bold mb-1 ${voiceGender === 'female' ? 'text-[#10175b]' : 'text-slate-800'}`}>Female Voice</h3>
                                    <p className="text-sm text-slate-500">Standard female pronunciation.</p>
                                </div>
                                {voiceGender === 'female' && (
                                    <div className="w-5 h-5 rounded-full bg-[#10175b] text-white flex items-center justify-center animate-in zoom-in shrink-0">
                                        <IconCheck className="w-3 h-3" />
                                    </div>
                                )}
                            </button>

                            <button 
                                type="button"
                                onClick={() => {
                                    setVoiceGender('male');
                                    setVoiceName(''); // Reset specific voice on gender change
                                    setHasUnsavedAudio(true);
                                    handleAudioPreview(voicePace, 'male');
                                }}
                                className={`flex-1 bg-white p-6 rounded-[20px] transition-all text-left border-2 flex items-center justify-between group ${
                                    voiceGender === 'male' 
                                    ? 'border-[#10175b] shadow-xl shadow-[#10175b]/10 transform -translate-y-1' 
                                    : 'border-slate-200 hover:border-[#10175b]/30 shadow-sm hover:shadow-md'
                                }`}
                            >
                                <div>
                                    <h3 className={`text-lg font-serif font-bold mb-1 ${voiceGender === 'male' ? 'text-[#10175b]' : 'text-slate-800'}`}>Male Voice</h3>
                                    <p className="text-sm text-slate-500">Standard male pronunciation.</p>
                                </div>
                                {voiceGender === 'male' && (
                                    <div className="w-5 h-5 rounded-full bg-[#10175b] text-white flex items-center justify-center animate-in zoom-in shrink-0">
                                        <IconCheck className="w-3 h-3" />
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Specific Voice Selection */}
                        <div className="bg-white/50 p-6 rounded-[20px] border border-slate-200/50">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-[#10175b]/60 mb-4">Specific Voice Choice</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {(voiceGender === 'female' 
                                    ? ['Google US English', 'Google UK English Female', 'Samantha', 'Microsoft Zira']
                                    : ['Google UK English Male', 'Alex', 'Microsoft David', 'Daniel']
                                ).map((prefName) => {
                                    const actualVoice = availableVoices.find(v => v.name.includes(prefName));
                                    if (!actualVoice) return null;
                                    
                                    return (
                                        <button
                                            key={prefName}
                                            type="button"
                                            onClick={() => {
                                                setVoiceName(actualVoice.name);
                                                setHasUnsavedAudio(true);
                                                handleAudioPreview(voicePace, voiceGender, actualVoice.name);
                                            }}
                                            className={`p-4 rounded-xl text-left border-2 transition-all flex items-center justify-between ${
                                                voiceName === actualVoice.name 
                                                ? 'bg-[#10175b] border-[#10175b] text-white shadow-lg' 
                                                : 'bg-white border-slate-100 text-slate-700 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">{prefName}</span>
                                                <span className={`text-[10px] ${voiceName === actualVoice.name ? 'text-blue-100' : 'text-slate-400'}`}>
                                                    {actualVoice.lang}
                                                </span>
                                            </div>
                                            {voiceName === actualVoice.name && (
                                                <IconCheck className="w-4 h-4" />
                                            )}
                                        </button>
                                    );
                                })}
                                {/* Auto option */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setVoiceName('');
                                        setHasUnsavedAudio(true);
                                        handleAudioPreview(voicePace, voiceGender);
                                    }}
                                    className={`p-4 rounded-xl text-left border-2 transition-all flex items-center justify-between ${
                                        voiceName === '' 
                                        ? 'bg-[#10175b] border-[#10175b] text-white shadow-lg' 
                                        : 'bg-white border-slate-100 text-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">Auto Selection</span>
                                        <span className={`text-[10px] ${voiceName === '' ? 'text-blue-100' : 'text-slate-400'}`}>
                                            Best available for {voiceGender}
                                        </span>
                                    </div>
                                    {voiceName === '' && (
                                        <IconCheck className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Pace Selection */}
                        <div className="flex flex-col sm:flex-row gap-6">
                            <button 
                                type="button"
                                onClick={() => {
                                    setVoicePace('1.0');
                                    setHasUnsavedAudio(true);
                                    handleAudioPreview('1.0', voiceGender);
                                }}
                                className={`flex-1 bg-white p-6 rounded-[20px] transition-all text-left border-2 flex items-center justify-between group ${
                                    voicePace === '1.0' 
                                    ? 'border-[#10175b] shadow-xl shadow-[#10175b]/10 transform -translate-y-1' 
                                    : 'border-slate-200 hover:border-[#10175b]/30 shadow-sm hover:shadow-md'
                                }`}
                            >
                                <div>
                                    <h3 className={`text-lg font-serif font-bold mb-1 ${voicePace === '1.0' ? 'text-[#10175b]' : 'text-slate-800'}`}>Native Pace</h3>
                                    <p className="text-sm text-slate-500">Standard 1.0x speed.</p>
                                </div>
                                {voicePace === '1.0' && (
                                    <div className="w-5 h-5 rounded-full bg-[#10175b] text-white flex items-center justify-center animate-in zoom-in shrink-0">
                                        <IconCheck className="w-3 h-3" />
                                    </div>
                                )}
                            </button>

                            <button 
                                type="button"
                                onClick={() => {
                                    setVoicePace('0.8');
                                    setHasUnsavedAudio(true);
                                    handleAudioPreview('0.8', voiceGender);
                                }}
                                className={`flex-1 bg-white p-6 rounded-[20px] transition-all text-left border-2 flex items-center justify-between group ${
                                    voicePace === '0.8' 
                                    ? 'border-[#10175b] shadow-xl shadow-[#10175b]/10 transform -translate-y-1' 
                                    : 'border-slate-200 hover:border-[#10175b]/30 shadow-sm hover:shadow-md'
                                }`}
                            >
                                <div>
                                    <h3 className={`text-lg font-serif font-bold mb-1 ${voicePace === '0.8' ? 'text-[#10175b]' : 'text-slate-800'}`}>Smooth & Polite</h3>
                                    <p className="text-sm text-slate-500">Slower 0.8x setting.</p>
                                </div>
                                {voicePace === '0.8' && (
                                    <div className="w-5 h-5 rounded-full bg-[#10175b] text-white flex items-center justify-center animate-in zoom-in shrink-0">
                                        <IconCheck className="w-3 h-3" />
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>

                    {hasUnsavedAudio && (
                        <div className="animate-in fade-in slide-in-from-top-4 pt-2">
                            <button 
                                type="button"
                                onClick={handleSaveAudio}
                                className="font-black text-[12px] uppercase tracking-widest text-white tracking-widest bg-[#10175b] py-4 px-8 rounded-none hover:bg-[#0a0f44] transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                            >
                                Save Audio Preferences
                            </button>
                        </div>
                    )}
                </div>
            </section>

             {/* Divider */}
             <div className="w-16 h-[2px] bg-slate-200 mt-16" />

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

            {/* Divider */}
            <div className="w-16 h-[2px] bg-slate-200 mt-16" />

            {/* Section 3: Platform Features */}
            <section className="bg-transparent mt-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-4xl font-serif text-[#10175b] font-normal tracking-tight">Platform Features</h2>
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">Advanced</span>
                </div>

                <div className="bg-[#EBECEC] rounded-[24px] p-[40px] sm:p-[64px] border border-slate-200/50 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    {/* Disabled Overlay */}
                    {isPendingResearcher && (
                        <div className="absolute -inset-2 bg-[#EBECEC]/50 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-[24px]">
                            <div className="bg-white p-4 rounded-full shadow-xl">
                                <IconLoader className="w-6 h-6 text-[#10175b] animate-spin" />
                            </div>
                        </div>
                    )}
                    <div className="max-w-md">
                        <h3 className="text-2xl font-serif font-bold text-[#10175b] mb-3">Researcher Mode</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Unlock a specialized workspace for reading and organizing research papers alongside your books. Add papers manually to your unified library.
                        </p>
                    </div>
                    
                    <button 
                        onClick={handleResearcherToggle}
                        disabled={isPendingResearcher}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent focus:outline-none transition-colors duration-200 ease-in-out ${isResearcher ? 'bg-[#10175b]' : 'bg-slate-300'}`}
                        role="switch"
                        aria-checked={isResearcher}
                    >
                        <span className="sr-only">Toggle Researcher Mode</span>
                        <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isResearcher ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                    </button>
                </div>
            </section>
        </>
    );
}
