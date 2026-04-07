'use client';

import { IconVolume } from '@tabler/icons-react';
import { useState } from 'react';

export function PronunciationButton({ text, lang = 'en-US' }: { text: string, lang?: string }) {
    const [isPlaying, setIsPlaying] = useState(false);

    const speak = () => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Find best voice for English
        if (lang.startsWith('en')) {
            const voices = window.speechSynthesis.getVoices();
            const preferred = [
                'Google US English', 
                'Samantha', 
                'Microsoft Zira', 
                'Alex'
            ];
            
            const bestVoice = preferred
                .map(v => voices.find(voice => voice.name.includes(v)))
                .find(v => !!v);

            if (bestVoice) {
                utterance.voice = bestVoice;
            }
        }

        utterance.lang = lang;
        utterance.rate = 1.0; // Standard speed
        utterance.pitch = 1.1; // Slightly more positive
        
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        window.speechSynthesis.speak(utterance);
    };

    return (
        <button 
            type="button"
            onClick={speak}
            disabled={isPlaying}
            title={`Hear pronunciation in ${lang}`}
            className={`transition-all duration-300 transform active:scale-95 ${
                isPlaying 
                ? 'text-[#10175b] scale-110' 
                : 'text-slate-300 hover:text-[#10175b] hover:scale-105'
            }`}
        >
            <IconVolume size={15} strokeWidth={2.5} />
        </button>
    );
}
