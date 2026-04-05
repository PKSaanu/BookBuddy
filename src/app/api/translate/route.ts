import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, targetLang } = await request.json();

    if (!text || !targetLang) {
      return NextResponse.json({ error: 'Missing text or targetLang' }, { status: 400 });
    }

    const langCode = targetLang === 'Sinhala' ? 'si' : 'ta';
    
    // Using a more comprehensive set of dt parameters to get better results
    // t: translation, at: alternative translations, bd: binary dictionary (for more accurate words)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${langCode}&dt=t&dt=at&dt=bd&q=${encodeURIComponent(text)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const data = await response.json();

    if (data) {
      // 1. Try to find the translation in the primary segments (joined)
      let translatedText = '';
      if (data[0]) {
        translatedText = data[0].map((segment: any) => segment[0]).join('').trim();
      }

      // 2. If the primary translation is just a transliteration (too long or similar to original), 
      // try to find a better one in the dictionary entries if they exist
      if (data[1] && data[1][0] && data[1][0][1]) {
        const dictionaryTranslation = data[1][0][1][0];
        // If the primary one looks like a phonetic transliteration (you can't easily detect this, but we can check if it's longer than a typical word)
        // For now, we'll just prioritize the dictionary translation if it exists for single words
        if (text.split(' ').length === 1 && dictionaryTranslation) {
          translatedText = dictionaryTranslation;
        }
      }

      // 3. Get original text segments
      const originalTextParts = data[0]?.map((segment: any) => segment[1]).join('') || text;
      
      return NextResponse.json({ 
        translatedText: translatedText || 'Translation failed', 
        correctedText: originalTextParts 
      });
    } else {
      return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
