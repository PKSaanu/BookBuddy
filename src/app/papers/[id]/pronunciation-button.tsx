'use client';

import { IconVolume } from '@tabler/icons-react';
import { useState } from 'react';
import { selectBestVoice } from '@/lib/audio';

interface PronunciationButtonProps {
    text: string;
    lang?: string;
    variant?: 'inline' | 'round';
    size?: 'sm' | 'md' | 'lg';
    theme?: 'default' | 'english' | 'translated';
    className?: string;
}

export function PronunciationButton({ 
    text, 
    lang = 'en-US',
    variant = 'inline',
    size = 'md',
    theme = 'default',
    className = ''
}: PronunciationButtonProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const voiceRate = '0.8';

    const speak = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = selectBestVoice(voices, lang);

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.lang = lang;
        utterance.rate = parseFloat(voiceRate);
        utterance.pitch = 1.1; // Slightly more positive
        
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        window.speechSynthesis.speak(utterance);
    };

    if (variant === 'round') {
        const sizeClasses = {
            sm: 'w-8 h-8 sm:w-9 sm:h-9',
            md: 'w-10 h-10 sm:w-11 sm:h-11',
            lg: 'w-12 h-12 sm:w-14 sm:h-14',
        }[size] || 'w-10 h-10 sm:w-11 sm:h-11';

        const iconSize = {
            sm: 18,
            md: 20,
            lg: 24,
        }[size] || 20;

        let themeClasses = 'bg-white text-[#10175b] border-slate-200/90 hover:bg-indigo-50/80 hover:border-indigo-300 hover:shadow-sm';
        let playingClasses = 'bg-[#10175b] text-white border-[#10175b] shadow-md scale-105 animate-pulse';

        if (theme === 'english') {
            themeClasses = 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-900 hover:border-slate-300 hover:shadow-2xs';
            playingClasses = 'bg-slate-800 text-white border-slate-800 shadow-md scale-105 animate-pulse';
        } else if (theme === 'translated') {
            themeClasses = 'bg-indigo-50 text-[#10175b] border-indigo-200 hover:bg-[#10175b] hover:text-white hover:border-[#10175b] hover:shadow-2xs';
            playingClasses = 'bg-[#10175b] text-white border-[#10175b] shadow-md scale-105 animate-pulse';
        }

        const langLabel = lang.startsWith('ta') ? 'Tamil' : lang.startsWith('si') ? 'Sinhala' : lang.startsWith('en') ? 'English' : lang;

        return (
            <button 
                type="button"
                onClick={speak}
                disabled={isPlaying}
                title={`Hear ${langLabel} pronunciation: "${text}"`}
                aria-label={`Hear ${langLabel} pronunciation: "${text}"`}
                className={`${sizeClasses} rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-90 shadow-xs border shrink-0 ${
                    isPlaying ? playingClasses : themeClasses
                } ${className}`}
            >
                <IconVolume size={iconSize} strokeWidth={2.4} />
            </button>
        );
    }

    return (
        <button 
            type="button"
            onClick={speak}
            disabled={isPlaying}
            title={`Hear pronunciation in ${lang}`}
            aria-label={`Hear pronunciation in ${lang}`}
            className={`p-1.5 rounded-full inline-flex items-center justify-center transition-all duration-300 transform active:scale-95 ${
                isPlaying 
                ? 'text-[#10175b] bg-indigo-50 scale-110' 
                : 'text-slate-400 hover:text-[#10175b] hover:bg-slate-100 hover:scale-105'
            } ${className}`}
        >
            <IconVolume size={18} strokeWidth={2.4} />
        </button>
    );
}
