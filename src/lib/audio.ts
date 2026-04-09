import { PREFERRED_FEMALE_VOICES, PREFERRED_MALE_VOICES } from './constants';

export function selectBestVoice(
    voices: SpeechSynthesisVoice[],
    lang: string,
    targetGender: string,
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

    // 1. Name Match (Fuzzy match to handle "(Enhanced)", "(Premium)", etc.)
    if (targetVoiceName) {
        // Try exact match first
        let found = langVoices.find(v => v.name === targetVoiceName);
        if (found) return found;
        
        // Try fuzzy match
        found = langVoices.find(v => v.name.includes(targetVoiceName) || targetVoiceName.includes(v.name));
        if (found) return found;
    }

    // 2. Gender-Specific Matching (Preferred lists)
    const preferred = targetGender === 'male' ? PREFERRED_MALE_VOICES : PREFERRED_FEMALE_VOICES;
    for (const prefName of preferred) {
        const found = langVoices.find(v => v.name.includes(prefName));
        if (found) return found;
    }

    // 3. Fallback Keyword Search (Correct Gender)
    const maleKeywords = ['male', 'guy', 'man', 'boy', 'david', 'alex', 'daniel', 'fred'];
    const femaleKeywords = ['female', 'lady', 'woman', 'girl', 'samantha', 'zira', 'victoria', 'siri', 'karen', 'tessa'];

    const targetKeywords = targetGender === 'male' ? maleKeywords : femaleKeywords;
    const opponentKeywords = targetGender === 'male' ? femaleKeywords : maleKeywords;

    let match = langVoices.find(v => {
        const name = v.name.toLowerCase();
        return targetKeywords.some(kw => name.includes(kw));
    });

    if (match) return match;

    // 4. Negative Filter (Pick anything that isn't EXPLICITLY the wrong gender)
    match = langVoices.find(v => {
        const name = v.name.toLowerCase();
        return !opponentKeywords.some(kw => name.includes(kw));
    });

    if (match) return match;

    // 5. Final Fallback: First voice in the language
    return langVoices[0];
}
