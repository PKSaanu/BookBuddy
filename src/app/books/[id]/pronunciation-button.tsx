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

        // 1. If English, use preferred lists or specifically selected voice
        if (lang.startsWith('en')) {
            if (voiceName) {
                selectedVoice = voices.find(v => v.name === voiceName);
            }
            
            if (!selectedVoice) {
                const preferredMale = ['Google UK English Male', 'Alex', 'Microsoft David', 'Daniel'];
                const preferredFemale = ['Google US English', 'Google UK English Female', 'Samantha', 'Microsoft Zira'];
                
                const preferred = voiceGender === 'male' ? preferredMale : preferredFemale;
                
                selectedVoice = preferred
                    .map(v => voices.find(voice => voice.name.includes(v)))
                    .find(v => !!v);
            }
        } else {
            // 2. For non-English (Tamil, Sinhala), find voices matching the language
            const langVoices = voices.filter(v => 
                v.lang.toLowerCase().replace('_', '-') === lang.toLowerCase() || 
                v.lang.toLowerCase().startsWith(lang.toLowerCase().split('-')[0])
            );
            
            if (langVoices.length > 0) {
                // Try to match gender if possible (most non-English voices don't specify gender in metadata consistently)
                selectedVoice = langVoices.find(v => (v as any).gender === voiceGender) || langVoices[0];
            }
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
