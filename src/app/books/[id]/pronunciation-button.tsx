'use client';

import { IconVolume } from '@tabler/icons-react';
import { useState } from 'react';

export function PronunciationButton({ 
    text, 
    lang = 'en-US',
    voiceGender = 'female',
    voiceRate = '0.8',
    voiceName = ''
}: { 
    text: string, 
    lang?: string,
    voiceGender?: string,
    voiceRate?: string,
    voiceName?: string
}) {
    const [isPlaying, setIsPlaying] = useState(false);

    const speak = () => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        const voices = window.speechSynthesis.getVoices();
        let selectedVoice: SpeechSynthesisVoice | undefined;

        // 1. Try exact match from preferences
        if (voiceName) {
            selectedVoice = voices.find(v => v.name === voiceName);
        }

        // 2. Fallback to gender-based preferred lists if English
        if (!selectedVoice && lang.startsWith('en')) {
            const preferredMale = ['Google UK English Male', 'Alex', 'Microsoft David', 'Daniel'];
            const preferredFemale = ['Google US English', 'Google UK English Female', 'Samantha', 'Microsoft Zira'];
            
            const preferred = voiceGender === 'male' ? preferredMale : preferredFemale;
            
            selectedVoice = preferred
                .map(v => voices.find(voice => voice.name.includes(v)))
                .find(v => !!v);
        }

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
