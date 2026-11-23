'use client';

import { useState, useEffect, useRef } from 'react';
import { saveTranslation } from '@/actions/paperTranslations';
import { IconLoader, IconWorld, IconArrowRight, IconLanguage, IconBookmarkPlus, IconCheck, IconBookmarkFilled } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PronunciationButton } from './pronunciation-button';
import DictionaryMeaningCard from '@/components/dictionary-meaning-card';
import { EnglishDictionaryData, AlternativeMeaningEntry } from '@/types/dictionary';

export default function TranslationPanel({ 
  paperId, 
  preferredLanguage,
  externalText,
  externalPageNumber,
  totalPages,
}: { 
  paperId: string, 
  preferredLanguage: string,
  externalText?: string,
  externalPageNumber?: number,
  totalPages?: number | null
}) {
  const [mounted, setMounted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [alternativeMeanings, setAlternativeMeanings] = useState<AlternativeMeaningEntry[] | null>(null);
  const [englishDictionary, setEnglishDictionary] = useState<EnglishDictionaryData | null>(null);
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
      setAlternativeMeanings(null);
      setEnglishDictionary(null);
    }
    if (externalPageNumber) {
      setPageNumber(String(externalPageNumber));
    }
  }, [externalText, externalPageNumber]);

  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateAlert, setDuplicateAlert] = useState<{
    word: string;
    page?: number | null;
  } | null>(null);
  const duplicateTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (duplicateTimerRef.current) clearTimeout(duplicateTimerRef.current);
    };
  }, []);

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSaved) return;

    setIsTranslating(true);
    setError(null);
    setTranslatedText('');
    setCorrectedText('');
    setAlternativeMeanings(null);
    setEnglishDictionary(null);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, targetLang: preferredLanguage })
      });
      const data = await res.json();

      if (res.ok && data.translatedText) {
        setTranslatedText(data.translatedText);
        setCorrectedText(data.correctedText || inputText);
        setAlternativeMeanings(data.alternativeMeanings || null);
        setEnglishDictionary(data.englishDictionary || null);
      } else if (res.ok && data.englishDictionary) {
        setTranslatedText('');
        setAlternativeMeanings(null);
        setEnglishDictionary(data.englishDictionary);
        setError('Tamil translation is temporarily unavailable, but English definition was found below.');
      } else {
        setError(data?.error || 'Translation is currently unavailable. Please try again in a moment.');
      }
    } catch {
      setError('Network connection error. Please check your internet and try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async () => {
    const finalOriginalText = correctedText || inputText;
    if (!translatedText || !finalOriginalText || isSaved) return;

    const pageNum = parseInt(pageNumber, 10);
    if (!pageNumber || isNaN(pageNum) || pageNum <= 0) {
      setError('A valid Page Number (1 or greater) is required to save this curation.');
      return;
    }

    if (totalPages && pageNum > totalPages) {
      setError(`Page number cannot exceed total page count of ${totalPages}.`);
      return;
    }

    setIsSaving(true);

    const result = await saveTranslation(paperId, finalOriginalText, translatedText, preferredLanguage, pageNum);
    if (result.error) {
      setError(result.error);
      setIsSaving(false);
    } else if (result.alreadyExists) {
      setIsSaving(false);
      setError(null);

      if (duplicateTimerRef.current) {
        clearTimeout(duplicateTimerRef.current);
      }

      setDuplicateAlert({
        word: finalOriginalText,
        page: result.existingPage || pageNum,
      });

      duplicateTimerRef.current = setTimeout(() => {
        setDuplicateAlert(null);
      }, 3000);
    } else {
      setIsSaved(true);
      setError(null);

      // Delay cleaning to prevent UI jump
      setTimeout(() => {
        setInputText('');
        setTranslatedText('');
        setCorrectedText('');
        setAlternativeMeanings(null);
        setEnglishDictionary(null);
        setIsSaved(false);
        setIsSaving(false);
      }, 1100);

      // We keep the page number for the next translation as requested
    }
  };

  return (
    <div className="w-full">
      {/* Friendly Research-Themed Duplicate Alert Popup */}
      <AnimatePresence>
        {duplicateAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed top-6 right-4 left-4 sm:left-auto sm:right-8 z-[300] max-w-md bg-[#10175b] text-white p-4 sm:p-5 rounded-2xl shadow-2xl border border-white/20 flex items-start gap-3.5 backdrop-blur-md"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 border border-amber-400/30">
              <IconBookmarkFilled size={20} />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-sm font-bold tracking-tight text-white font-sans mb-1">
                Already in Your Curation!
              </h4>

              <p className="text-xs text-white/80 leading-relaxed font-serif italic mb-3">
                &ldquo;{duplicateAlert.word}&rdquo; is already bookmarked in this paper{duplicateAlert.page ? ` (Page ${duplicateAlert.page})` : ''}. Duplicate save was omitted so your research archive stays clean and organized.
              </p>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (duplicateTimerRef.current) clearTimeout(duplicateTimerRef.current);
                    setDuplicateAlert(null);
                  }}
                  className="px-3.5 py-1 bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-bold rounded-lg transition-all"
                >
                  OK
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#EBECEF] rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 md:p-10 relative overflow-hidden group">
        {/* Upper right round speaking button for the inputted English word */}
        {inputText.trim() && (
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
            <PronunciationButton
              text={inputText.trim()}
              lang="en-US"
              variant="round"
              size="md"
            />
          </div>
        )}

        <form onSubmit={handleTranslate} className="relative z-10 w-full flex flex-col h-full min-h-[140px] sm:min-h-[200px]">
          <div className="pr-12 sm:pr-14">
            <label htmlFor="english-text" className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] text-[#10175b] mb-3">
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
                  setAlternativeMeanings(null);
                  setEnglishDictionary(null);
                }
              }}
              placeholder="Type here to decipher..."
              className="w-full bg-transparent border-b border-slate-300 focus:border-[#10175b] focus:outline-none resize-none text-xl sm:text-[30px] md:text-[38px] font-serif text-[#10175b] transition-colors placeholder:text-slate-300/80 pb-2 h-[55px] sm:h-[75px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTranslate(e as unknown as React.FormEvent);
                }
              }}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between mt-auto pt-5 sm:pt-6 gap-4 sm:gap-0">

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2 sm:gap-4 bg-white px-3 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-xs border border-slate-200 w-full sm:w-auto justify-center sm:justify-start">
                <IconWorld size={16} className="text-[#10175b]/60 shrink-0" />
                <span className="text-[12px] sm:text-[14px] font-bold text-[#10175b]">English</span>
                <IconArrowRight size={14} className="text-slate-300 mx-1 shrink-0" />
                <span className="text-[12px] sm:text-[14px] font-bold text-[#10175b]">
                  {mounted ? preferredLanguage : '...'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isTranslating || !inputText.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 rounded-[16px] shadow-lg shadow-[#10175b]/15 text-[14px] sm:text-[15px] font-bold text-white bg-[#10175b] hover:bg-[#1a2066] focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap active:scale-[0.98]"
            >
              {isTranslating ? <IconLoader className="animate-spin w-4 h-4 sm:w-5 sm:h-5" /> : <IconLanguage className="w-4 h-4 sm:w-5 sm:h-5" />}
              <span>{isTranslating ? 'Translating...' : 'Translate'}</span>
            </button>

          </div>
        </form>
      </div>

      {error && (
        <div className="mt-4 p-3.5 sm:p-4 bg-red-50 text-red-600 font-bold rounded-xl text-xs sm:text-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Render translation output */}
      <AnimatePresence>
        {(translatedText || englishDictionary) && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, height: 0, marginTop: 0, overflow: 'hidden' }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="mt-4 origin-top"
          >
            <div className="p-5 sm:p-8 md:p-10 bg-white border border-slate-200 rounded-[24px] sm:rounded-[32px] shadow-xs relative flex flex-col xl:flex-row items-stretch xl:items-start justify-between gap-6 md:gap-8">
              
              <div className="flex-1 w-full text-left">
                {translatedText ? (
                  <div className="relative pr-14 sm:pr-16 mb-4">
                    {/* Upper right round speaking button */}
                    <div className="absolute top-0 right-0">
                      <PronunciationButton
                        text={translatedText}
                        lang={preferredLanguage === 'Tamil' ? 'ta-IN' : 'si-LK'}
                        variant="round"
                      />
                    </div>

                    <div className="flex flex-col gap-1 mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#10175b]/50 inline-block">
                        {preferredLanguage} Translation
                      </span>
                      {correctedText && correctedText.toLowerCase() !== inputText.toLowerCase() && (
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-bold uppercase tracking-tighter">
                            Corrected Entry
                          </span>
                          <span className="text-[11px] font-serif italic text-slate-400">&ldquo;{correctedText}&rdquo;</span>
                        </div>
                      )}
                    </div>

                    <p className="text-2xl sm:text-3xl lg:text-4xl text-[#10175b] font-serif font-bold tracking-tight leading-snug">
                      {translatedText}
                    </p>
                  </div>
                ) : null}

                {/* English Meanings & Alternative Tamil Meanings Card */}
                <DictionaryMeaningCard
                  englishDictionary={englishDictionary}
                  alternativeMeanings={alternativeMeanings}
                  targetLanguage={preferredLanguage}
                  onSelectAlternative={(alt) => setTranslatedText(alt)}
                />
              </div>

              {/* Page Number & Save Controls */}
              {translatedText ? (
                <div className="flex flex-row items-center justify-between sm:justify-start gap-3 w-full xl:w-auto shrink-0 pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="relative w-20 sm:w-24">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="off"
                        value={pageNumber}
                        onChange={(e) => {
                          const cleanInt = e.target.value.replace(/[^0-9]/g, '');
                          if (cleanInt && totalPages && parseInt(cleanInt, 10) > totalPages) {
                            setPageNumber(String(totalPages));
                            setError(`Page number cannot exceed total page count of ${totalPages}. Clamped to max.`);
                          } else {
                            setPageNumber(cleanInt);
                            if (error && error.includes('total page count')) {
                              setError(null);
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (['.', '-', '+', 'e', 'E', ','].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        placeholder="1"
                        required
                        className={`w-full px-3 py-3 sm:py-3.5 text-center rounded-[16px] sm:rounded-[18px] border-2 focus:outline-none font-bold text-[#10175b] transition-all bg-[#F8F9FA] ${
                          !pageNumber || (totalPages && parseInt(pageNumber, 10) > totalPages)
                            ? 'border-red-200 bg-red-50/30' 
                            : 'border-[#F0F1F3] focus:border-[#10175b]'
                        }`}
                      />
                      <span className={`absolute -top-2 left-3 px-2 bg-[#F8F9FA] sm:bg-white text-[9px] font-black uppercase transition-colors rounded-sm ${
                        !pageNumber ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        Pg *
                      </span>
                    </div>

                    {totalPages ? (
                      <span className="text-xs font-bold text-slate-400 font-mono tracking-tight shrink-0">
                        / {totalPages}
                      </span>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving || isSaved}
                    className={`flex-1 sm:flex-none sm:min-w-[135px] inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-bold rounded-[16px] sm:rounded-[18px] transition-all duration-200 tracking-wide active:scale-[0.98] select-none ${
                      isSaved
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-[#10175b] hover:bg-[#18237e] text-white shadow-md shadow-[#10175b]/15 hover:shadow-lg hover:shadow-[#10175b]/25 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      {isSaved ? (
                        <IconCheck className="w-4 h-4 stroke-[2.5]" />
                      ) : isSaving ? (
                        <IconLoader className="animate-spin w-4 h-4" />
                      ) : (
                        <IconBookmarkPlus className="w-4 h-4" strokeWidth={2.2} />
                      )}
                      <span>{isSaved ? 'Saved!' : isSaving ? 'Saving...' : 'Save Word'}</span>
                    </div>
                  </button>
                </div>
              ) : null}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
