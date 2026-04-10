import { PREFERRED_FEMALE_VOICES, PREFERRED_MALE_VOICES } from './constants';

export function selectBestVoice(
    voices: SpeechSynthesisVoice[],
    lang: string,
    targetGender: string = 'female',
    targetVoiceName?: string
): SpeechSynthesisVoice | undefined {
    // 0. Pre-filter by language
    const langLower = lang.toLowerCase().replace('_', '-');
    const langBase = langLower.split('-')[0];
    
    const langVoices = voices.filter(v => {
        const vLang = v.lang.toLowerCase().replace('_', '-');
        return vLang === langLower || vLang.startsWith(langBase);
    });

    if (langVoices.length === 0) return undefined;

    // 1. Preferred Selection (Priority: Samantha)
    // We prioritize Samantha because it's the requested standard.
    const samantha = langVoices.find(v => v.name.includes('Samantha'));
    if (samantha) return samantha;

    // 2. Gender-Specific Matching (Preferred lists)
    // We still support high-quality female fallbacks from our constants.
    for (const prefName of PREFERRED_FEMALE_VOICES) {
        const found = langVoices.find(v => v.name.includes(prefName));
        if (found) return found;
    }

    // 3. Fallback Keyword Search (Female)
    const femaleKeywords = ['female', 'lady', 'woman', 'girl', 'samantha', 'zira', 'victoria', 'siri', 'karen', 'tessa'];

    let match = langVoices.find(v => {
        const name = v.name.toLowerCase();
        return femaleKeywords.some(kw => name.includes(kw));
    });

    if (match) return match;

    // 4. Final Fallback: First voice in the language
    return langVoices[0];
}
