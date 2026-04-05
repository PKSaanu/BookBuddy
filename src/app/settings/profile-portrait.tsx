'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconRefresh, IconUser, IconUserCircle } from '@tabler/icons-react';
import { updateUserGender } from '@/actions/auth';
import { useRouter } from 'next/navigation';

interface ProfilePortraitProps {
    initialGender: string;
    userName: string;
    wordsCount: number;
    bookCount: number;
}

const STOCK_IMAGES = {
    male: '/avatars/male.png',
    female: '/avatars/female.png'
};

export function ProfilePortrait({ initialGender, userName, wordsCount, bookCount }: ProfilePortraitProps) {
    const [gender, setGender] = useState(initialGender);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSwap = async () => {
        const newGender = gender === 'male' ? 'female' : 'male';
        setGender(newGender);
        
        startTransition(async () => {
             await updateUserGender(newGender);
             router.refresh();
        });
    };

    return (
        <div className="bg-[#EBECEC] rounded-[32px] p-12 text-center shadow-sm relative overflow-hidden group">
            {/* Elegant Background Accent */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#10175b]/5 to-transparent"></div>
            
            <div className="relative mb-8 flex justify-center isolate">
                <div className="w-36 h-36 shrink-0 rounded-[28px] overflow-hidden border-4 border-[#F4F5F6] shadow-xl relative group isolate">
                    <AnimatePresence mode="wait">
                        <motion.img 
                            key={gender}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            src={gender === 'male' ? STOCK_IMAGES.male : STOCK_IMAGES.female} 
                            alt="Profile" 
                            className="w-full h-full object-cover object-top"
                        />
                    </AnimatePresence>

                    {/* Hover Overlay Button */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                            onClick={handleSwap}
                            disabled={isPending}
                            className="flex flex-col items-center gap-1.5 text-white/90 hover:text-white transition-colors"
                        >
                            <div className={`p-2 rounded-full bg-white/20 border border-white/30 ${isPending ? 'animate-spin' : ''}`}>
                                <IconRefresh size={18} strokeWidth={2.5} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-center shadow-sm">
                                {isPending ? 'Syncing...' : 'Swap Gender'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="relative z-10 space-y-1">
                <h2 className="text-4xl font-serif font-black text-[#10175b] tracking-tight">{userName}</h2>
                <p className="text-[11px] font-black uppercase text-[#10175b]/40 tracking-[0.3em] font-sans pb-8">
                    Linguistic Curator
                </p>
                
                <div className="flex items-center justify-center gap-12 pt-8 border-t border-slate-300/60 w-4/5 mx-auto">
                    <div className="text-center group/stat">
                        <p className="text-3xl font-serif font-bold text-[#10175b] group-hover/stat:scale-110 transition-transform">{wordsCount.toLocaleString()}</p>
                        <p className="text-[10px] uppercase font-black tracking-widest text-[#10175b]/50 mt-1">Words</p>
                    </div>
                    <div className="text-center group/stat">
                        <p className="text-3xl font-serif font-bold text-[#10175b] group-hover/stat:scale-110 transition-transform">{bookCount.toLocaleString()}</p>
                        <p className="text-[10px] uppercase font-black tracking-widest text-[#10175b]/50 mt-1">Books</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
