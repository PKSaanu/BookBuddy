import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, targetLang } = await request.json();

    if (!text || !targetLang) {
      return NextResponse.json({ error: 'Missing text or targetLang' }, { status: 400 });
    }

    const langCode = targetLang === 'Sinhala' ? 'si' : 'ta';
    
    // Using the free Google Translate API endpoint for better accuracy
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data && data[0] && data[0][0] && data[0][0][0]) {
      const translatedText = data[0][0][0];
      const correctedText = data[0][0][1] || text; // Corrected version is often here
      return NextResponse.json({ translatedText, correctedText });
    } else {
      return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
