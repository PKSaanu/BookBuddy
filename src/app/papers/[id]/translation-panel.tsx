'use client';

import { useState, useEffect } from 'react';
import { saveTranslation } from '@/actions/paperTranslations';
import { IconLoader, IconWorld, IconHistory, IconArrowRight, IconLanguage, IconBook, IconBookmarkPlus } from '@tabler/icons-react';
import { PronunciationButton } from './pronunciation-button';

export default function TranslationPanel({ 
  paperId, 
  preferredLanguage,
  externalText,
  externalPageNumber,
}: { 
  paperId: string, 
  preferredLanguage: string,
  externalText?: string,
  externalPageNumber?: number
}) {
  const [mounted, setMounted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [pageNumber, setPageNumber] = useState<string>('');
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle external selection from PDF Reader
  useEffect(() => {
    if (externalText) {
      setInputText(externalText);
      setTranslatedText(''); // Clear old translation
      setCorrectedText('');
    }
    if (externalPageNumber) {
      setPageNumber(String(externalPageNumber));
    }
  }, [externalText, externalPageNumber]);

  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSaved) return;

    setIsTranslating(true);
    setError(null);
    setTranslatedText('');
    setCorrectedText('');

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, targetLang: preferredLanguage })
      });
      const data = await res.json();

      if (data.translatedText) {
        setTranslatedText(data.translatedText);
        setCorrectedText(data.correctedText || inputText);
      } else {
        setTranslatedText("I apologize, I'm unable to translate this section right now. Please try again soon.");
      }
    } catch (err) {
      setTranslatedText("I apologize, I'm unable to translate this section right now. Please try again soon.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async () => {
    const finalOriginalText = correctedText || inputText;
    if (!translatedText || !finalOriginalText || isSaved) return;

    if (!pageNumber || parseInt(pageNumber, 10) <= 0) {
      setError('A valid Page Number is required to save this curation.');
      return;
    }

    setIsSaving(true);

    const pageNum = parseInt(pageNumber, 10);
    const result = await saveTranslation(paperId, finalOriginalText, translatedText, preferredLanguage, pageNum);
    if (result.error) {
      setError(result.error);
      setIsSaving(false);
    } else {
      setIsSaved(true);
      setError(null);

      // Delay cleaning to prevent UI jump
      setTimeout(() => {
        setInputText('');
        setTranslatedText('');
        setCorrectedText('');
        setIsSaved(false);
        setIsSaving(false);
      }, 1700);

      // We keep the page number for the next translation as requested
    }
  };

  return (
    <div className="w-full">
      <div className="bg-[#EBECEF] rounded-[32px] p-6 sm:p-10 relative overflow-hidden group">

        <form onSubmit={handleTranslate} className="relative z-10 w-full flex flex-col h-full min-h-[150px] sm:min-h-[220px]">
          <div>
            <label htmlFor="english-text" className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] text-[#10175b] mb-4">
              Enter a word or sentence
            </label>
            <textarea
              id="english-text"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (translatedText) {
                  setTranslatedText('');
                  setCorrectedText('');
                }
              }}
              placeholder="Type here to decipher..."
              className="w-full bg-transparent border-b border-slate-300 focus:border-[#10175b] focus:outline-none resize-none text-2xl sm:text-[32px] md:text-[40px] font-serif text-[#10175b] transition-colors placeholder:text-slate-300/80 pb-2 h-[60px] sm:h-[80px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTranslate(e as any);
                }
              }}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between mt-auto pt-6 gap-6 sm:gap-0">

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-3 sm:gap-4 bg-white px-4 sm:px-6 py-3 rounded-full shadow-sm border border-slate-200 w-full sm:w-auto justify-center sm:justify-start">
                <IconWorld size={16} className="text-[#10175b]/60" />
                <div className="flex items-center gap-2">
                  <span className="text-[13px] sm:text-[14px] font-bold text-[#10175b]">English</span>
                  {inputText && (
                    <PronunciationButton 
                      text={inputText} 
                      lang="en-US" 
                    />
                  )}
                </div>
                <IconArrowRight size={14} className="text-slate-300 mx-1" />
                <span className="text-[13px] sm:text-[14px] font-bold text-[#10175b]">
                  {mounted ? preferredLanguage : '...'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isTranslating || !inputText.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 rounded-[16px] shadow-lg shadow-[#10175b]/20 text-[15px] font-bold text-white bg-[#10175b] hover:bg-[#1a2066] focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap active:scale-[0.98]"
            >
              {isTranslating ? <IconLoader className="animate-spin w-5 h-5" /> : <IconLanguage className="w-5 h-5" />}
              {isTranslating ? 'Translating...' : 'Translate'}
            </button>

          </div>
        </form>
      </div>

      {error && (
        <div className="mt-5 p-4 bg-red-50 text-red-600 font-bold rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Render translation output */}
      {translatedText && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="p-6 sm:p-10 bg-white border border-slate-200 rounded-[32px] shadow-sm relative overflow-hidden flex flex-col xl:flex-row items-center xl:items-center justify-between gap-8 md:gap-10">
            <div className="flex-1 w-full text-center xl:text-left">
              <div className="flex flex-col gap-1 mb-4 xl:mb-2 items-center xl:items-start">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#10175b]/50 inline-block">{preferredLanguage} Translation</span>
                {correctedText && correctedText.toLowerCase() !== inputText.toLowerCase() && (
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-bold uppercase tracking-tighter">Corrected Entry</span>
                    <span className="text-[11px] font-serif italic text-slate-400">"{correctedText}"</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center xl:justify-start gap-4">
                <p className="text-3xl sm:text-4xl text-[#10175b] font-serif font-bold tracking-tight leading-tight">{translatedText}</p>
                <PronunciationButton
                  text={translatedText}
                  lang={preferredLanguage === 'Tamil' ? 'ta-IN' : 'si-LK'}
                />
              </div>
            </div>

            <div className="flex flex-row items-center justify-center sm:justify-start gap-3 w-full xl:w-auto">
              <div className="relative w-20 sm:w-24">
                <input
                  type="number"
                  value={pageNumber}
                  onChange={(e) => setPageNumber(e.target.value)}
                  placeholder="0"
                  required
                  className={`w-full px-3 py-3 sm:py-4 text-center rounded-[18px] border-2 focus:outline-none font-bold text-[#10175b] transition-all bg-[#F8F9FA] ${!pageNumber ? 'border-red-100 bg-red-50/30' : 'border-[#F0F1F3] focus:border-[#10175b]'
                    }`}
                />
                <span className={`absolute -top-2 left-3 px-2 bg-[#F8F9FA] sm:bg-white text-[9px] font-black uppercase transition-colors rounded-sm ${!pageNumber ? 'text-red-400' : 'text-slate-400'
                  }`}>
                  Pg *
                </span>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving || isSaved}
                className={`flex-1 sm:flex-none sm:min-w-[120px] inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-4 text-[13px] font-bold rounded-[18px] border-2 transition-all duration-300 uppercase tracking-wider active:scale-[0.98] ${isSaved
                    ? 'bg-[#0f766e] border-[#0f766e] text-white'
                    : 'border-[#10175b] text-[#10175b] hover:bg-[#10175b] hover:text-white disabled:opacity-40'
                  }`}
              >
                <div className="flex items-center gap-2">
                  {isSaved ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> : isSaving ? <IconLoader className="animate-spin w-4 h-4" /> : <IconBookmarkPlus className="w-4 h-4" strokeWidth={2.5} />}
                  <span>{isSaved ? 'Saved' : isSaving ? '...' : 'Add'}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
