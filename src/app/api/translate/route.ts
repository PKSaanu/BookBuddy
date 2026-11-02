import { NextRequest, NextResponse } from 'next/server';
import { 
  EnglishDictionaryData, 
  AlternativeMeaningEntry, 
  DictionaryMeaning, 
  DictionaryDefinition 
} from '@/types/dictionary';

interface RawPhonetic {
  text?: string;
  audio?: string;
}

interface RawDefinition {
  definition: string;
  example?: string;
  synonyms?: string[];
}

interface RawMeaning {
  partOfSpeech?: string;
  definitions?: RawDefinition[];
}

interface RawDictionaryEntry {
  word?: string;
  phonetic?: string;
  phonetics?: RawPhonetic[];
  meanings?: RawMeaning[];
}

type GoogleTranslateSegment = [string, string, ...unknown[]];

interface TranslationResult {
  translatedText: string;
  originalText: string;
  alternativeMeanings: AlternativeMeaningEntry[];
}

async function fetchTranslationWithFallbacks(text: string, langCode: string): Promise<TranslationResult> {
  const trimmed = text.trim();

  // Tier 1: Google Translate GTX (supports full bilingual dictionary dt=bd & alternatives dt=at)
  try {
    const gtUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${langCode}&dt=t&dt=at&dt=bd&q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(gtUrl, {
      signal: AbortSignal.timeout(4000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });

    if (res.ok) {
      const data = await res.json();
      let translatedText = '';
      if (Array.isArray(data[0])) {
        translatedText = (data[0] as GoogleTranslateSegment[])
          .map((segment) => segment[0] || '')
          .join('')
          .trim();
      }

      const alternativeMeanings: AlternativeMeaningEntry[] = [];
      if (Array.isArray(data[1])) {
        for (const entry of data[1]) {
          if (entry && typeof entry[0] === 'string' && Array.isArray(entry[1]) && entry[1].length > 0) {
            alternativeMeanings.push({
              partOfSpeech: entry[0],
              meanings: (entry[1] as string[]).slice(0, 5)
            });
          }
        }
      }

      // If single word, prioritize precise dictionary entry if available
      if (trimmed.split(' ').length === 1 && alternativeMeanings.length > 0 && alternativeMeanings[0].meanings.length > 0) {
        const dictWord = alternativeMeanings[0].meanings[0];
        if (dictWord) translatedText = dictWord;
      }

      const originalText = Array.isArray(data[0])
        ? (data[0] as GoogleTranslateSegment[]).map((s) => s[1] || '').join('') || trimmed
        : trimmed;

      if (translatedText) {
        return { translatedText, originalText, alternativeMeanings };
      }
    }
  } catch (err) {
    console.warn('Google GTX translation failed, attempting Tier 2 fallback...', err);
  }

  // Tier 2: Google Chrome Extension Endpoint (different cluster & rate limit pool)
  try {
    const gDictUrl = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=${langCode}&q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(gDictUrl, {
      signal: AbortSignal.timeout(4000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });

    if (res.ok) {
      const data = await res.json();
      let translatedText = '';

      if (Array.isArray(data)) {
        translatedText = data
          .map((s) => (Array.isArray(s) ? s[0] : typeof s === 'string' ? s : ''))
          .join('')
          .trim();
      } else if (data && typeof data === 'object' && 'sentences' in data && Array.isArray((data as { sentences: { trans?: string }[] }).sentences)) {
        translatedText = (data as { sentences: { trans?: string }[] }).sentences
          .map((s) => s.trans || '')
          .join('')
          .trim();
      }

      if (translatedText) {
        return { translatedText, originalText: trimmed, alternativeMeanings: [] };
      }
    }
  } catch (err) {
    console.warn('Google dict-chrome-ex fallback failed, attempting Tier 3 fallback...', err);
  }

  // Tier 3: MyMemory Translation API (Free open service for English -> Tamil / Sinhala)
  try {
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=en|${langCode}`;
    const res = await fetch(myMemoryUrl, {
      signal: AbortSignal.timeout(4000),
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const data = (await res.json()) as { responseData?: { translatedText?: string } };
      const translatedText = data?.responseData?.translatedText?.trim();
      if (translatedText && !translatedText.toUpperCase().includes('MYMEMORY WARNING')) {
        return { translatedText, originalText: trimmed, alternativeMeanings: [] };
      }
    }
  } catch (err) {
    console.warn('MyMemory fallback failed:', err);
  }

  throw new Error('All translation providers failed');
}

export async function POST(request: NextRequest) {
  try {
    const { text, targetLang } = await request.json();

    if (!text || !targetLang) {
      return NextResponse.json({ error: 'Missing text or targetLang' }, { status: 400 });
    }

    const langCode = targetLang === 'Sinhala' ? 'si' : 'ta';
    const trimmedText = String(text).trim();
    const cleanWord = trimmedText.replace(/^[^a-zA-Z0-9'-]+|[^a-zA-Z0-9'-]+$/g, '').toLowerCase();
    const isSingleWord = cleanWord.length > 0 && !cleanWord.includes(' ');

    // Parallel fetch: fetch Translation with multi-tier fallbacks and English dictionary concurrently
    const [transPromise, dictPromise] = await Promise.allSettled([
      fetchTranslationWithFallbacks(trimmedText, langCode),
      isSingleWord 
        ? fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`, {
            signal: AbortSignal.timeout(3500),
            headers: { 'Accept': 'application/json' }
          })
        : Promise.resolve(null)
    ]);

    // 1. Process Translation
    let translatedText = '';
    let originalTextParts = trimmedText;
    let alternativeMeanings: AlternativeMeaningEntry[] = [];

    if (transPromise.status === 'fulfilled') {
      translatedText = transPromise.value.translatedText;
      originalTextParts = transPromise.value.originalText;
      alternativeMeanings = transPromise.value.alternativeMeanings;
    } else {
      console.warn('Translation pipeline failed:', transPromise.reason);
    }

    // 2. Process English Dictionary response
    let englishDictionary: EnglishDictionaryData | null = null;

    if (dictPromise.status === 'fulfilled' && dictPromise.value && dictPromise.value.ok) {
      try {
        const dictData = (await dictPromise.value.json()) as RawDictionaryEntry[];
        if (Array.isArray(dictData) && dictData.length > 0) {
          const first = dictData[0];
          
          let audioUrl: string | undefined;
          if (Array.isArray(first.phonetics)) {
            const withAudio = first.phonetics.find(
              (p) => typeof p.audio === 'string' && p.audio.trim().length > 0
            );
            if (withAudio && withAudio.audio) {
              audioUrl = withAudio.audio.startsWith('http') 
                ? withAudio.audio 
                : `https:${withAudio.audio}`;
            }
          }

          const parsedMeanings: DictionaryMeaning[] = [];
          if (Array.isArray(first.meanings)) {
            for (const m of first.meanings.slice(0, 3)) {
              const defs: DictionaryDefinition[] = (m.definitions || []).slice(0, 2).map((d) => ({
                definition: d.definition,
                example: d.example || undefined,
                synonyms: Array.isArray(d.synonyms) && d.synonyms.length > 0 ? d.synonyms.slice(0, 3) : undefined
              }));

              if (defs.length > 0) {
                parsedMeanings.push({
                  partOfSpeech: m.partOfSpeech || 'general',
                  definitions: defs
                });
              }
            }
          }

          if (parsedMeanings.length > 0) {
            englishDictionary = {
              word: first.word || cleanWord,
              phonetic: first.phonetic || first.phonetics?.find((p) => p.text)?.text || undefined,
              audio: audioUrl,
              meanings: parsedMeanings
            };
          }
        }
      } catch (parseErr) {
        console.warn('Failed to parse dictionary response:', parseErr);
      }
    }

    // Return translation and/or dictionary definitions
    if (translatedText || englishDictionary) {
      return NextResponse.json({ 
        translatedText: translatedText || '', 
        correctedText: originalTextParts,
        alternativeMeanings: alternativeMeanings.length > 0 ? alternativeMeanings : undefined,
        englishDictionary: englishDictionary || undefined
      });
    }

    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });

  } catch (error) {
    console.error('Translation route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
