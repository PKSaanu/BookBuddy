'use client';

import { useState, useEffect } from 'react';
import { saveTranslation, getLatestTranslations } from '@/actions/translations';
import { updateBookNotes, getBookNotes } from '@/actions/books';
import { 
  IconLoader, 
  IconArrowRight, 
  IconBookmarkPlus, 
  IconCheck, 
  IconHistory, 
  IconNotes,
  IconCircleCheck,
  IconDeviceFloppy,
  IconX
} from '@tabler/icons-react';

import { PronunciationButton } from './pronunciation-button';
import DictionaryMeaningCard from '@/components/dictionary-meaning-card';
import { EnglishDictionaryData, AlternativeMeaningEntry } from '@/types/dictionary';

interface TranslationHistoryItem {
  id?: string;
  originalText: string;
  translatedText: string;
  pageNumber: number | null;
}

interface MiniTranslatorProps {
  bookId: string;
  preferredLanguage: string;
  text: string;
  pageNumber: number;
  savedVocab?: { originalText: string; translatedText?: string; pageNumber?: number | null }[];
  onSaved?: () => void;
  onNavigate?: (page: number) => void;
}

export default function MiniTranslator({ 
  bookId, 
  preferredLanguage, 
  text, 
  pageNumber,
  savedVocab,
  onSaved,
  onNavigate
}: MiniTranslatorProps) {

  const [currentText, setCurrentText] = useState(text);
  const [translatedText, setTranslatedText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [alternativeMeanings, setAlternativeMeanings] = useState<AlternativeMeaningEntry[] | null>(null);
  const [englishDictionary, setEnglishDictionary] = useState<EnglishDictionaryData | null>(null);

  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tabs State
  const [activeTab, setActiveTab] = useState<'history' | 'notes'>('history');
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [notes, setNotes] = useState('');

  // Check if current text is already saved in this book's vocabulary or history
  const isAlreadySaved = Boolean(
    isSaved || (
      currentText && (
        savedVocab?.some(
          v => v.originalText?.trim().toLowerCase() === currentText.trim().toLowerCase()
        ) ||
        history?.some(
          h => h.originalText?.trim().toLowerCase() === currentText.trim().toLowerCase()
        )
      )
    )
  );

  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);

  useEffect(() => {
    setCurrentText(text);
    if (text) {
      handleAutoTranslate(text);
    } else {
      setTranslatedText('');
      setCorrectedText('');
      setAlternativeMeanings(null);
      setEnglishDictionary(null);
      setIsSaved(false);
    }
  }, [text]);

  // Initial Data Fetch
  useEffect(() => {
    fetchHistory();
    fetchNotes();
  }, [bookId]);

  const fetchHistory = async (showLoading = true) => {
    if (showLoading) setIsLoadingHistory(true);
    const res = await getLatestTranslations(bookId);
    if (res.success && res.history) {
      setHistory(res.history);
    }
    if (showLoading) setIsLoadingHistory(false);
  };

  const fetchNotes = async () => {
    const res = await getBookNotes(bookId);
    if (res.success) {
      setNotes(res.notes || '');
      setIsModified(false);
    }
  };

  const handleAutoTranslate = async (inputText: string) => {
    setIsTranslating(true);
    setError(null);
    setTranslatedText('');
    setCorrectedText('');
    setAlternativeMeanings(null);
    setEnglishDictionary(null);
    setIsSaved(false);

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
        setError('Translation temporarily unavailable, but English definition was loaded.');
      } else {
        setError(data?.error || 'Translation failed.');
      }
    } catch {
      setError('Network connection error.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async () => {
    const finalOriginalText = correctedText || currentText;
    if (!translatedText || !finalOriginalText || isSaved) return;

    setIsSaving(true);
    const result = await saveTranslation(bookId, finalOriginalText, translatedText, preferredLanguage, pageNumber);
    
    if (result.error) {
      setError(result.error);
      setIsSaving(false);
    } else {
      setIsSaved(true);
      setIsSaving(false);
      
      // Update history locally without duplicate occurrences of the same word
      if (result.translation) {
        setHistory(prev => {
          const filtered = prev.filter(
            item => item.originalText.trim().toLowerCase() !== finalOriginalText.trim().toLowerCase()
          );
          return [result.translation, ...filtered.slice(0, 9)];
        });
      }
      
      fetchHistory(false); // Silent refresh
      if (onSaved) onSaved();
    }
  };

  // Manual Notes Save
  const saveCurrentNotes = async () => {
    if (!isModified || isSavingNotes) return;
    
    setIsSavingNotes(true);
    const res = await updateBookNotes(bookId, notes);
    if (res.success) {
      setIsModified(false);
      setIsSavingNotes(false);
      setShowSavedIndicator(true);
      setTimeout(() => setShowSavedIndicator(false), 2000);
    } else {
      setIsSavingNotes(false);
    }
  };

  const handleNotesChange = (val: string) => {
    setNotes(val);
    setIsModified(true);
  };

  const handleTabSwitch = (newTab: 'history' | 'notes') => {
    if (activeTab === 'notes' && isModified) {
      saveCurrentNotes();
    }
    setActiveTab(newTab);
  };

  const handleDismissSelection = () => {
    setCurrentText('');
    setTranslatedText('');
    setCorrectedText('');
    setAlternativeMeanings(null);
    setEnglishDictionary(null);
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 shadow-2xl overflow-hidden">
      
      {/* Top Section: Active Translation & Meanings */}
      <div className={`border-b border-slate-100 bg-white/95 backdrop-blur-xs flex flex-col shrink-0 transition-all ${
        currentText ? 'max-h-[62%] sm:max-h-[58%] overflow-y-auto custom-scrollbar p-4 sm:p-5' : 'p-4 sm:p-5'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[12px] sm:text-[13px] font-semibold text-[#10175b] flex items-center gap-2">
            <span>Active Decipher</span>
            {currentText ? (
              <span className="bg-[#10175b]/5 text-[#10175b]/70 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold">
                Page {pageNumber}
              </span>
            ) : null}
          </h3>

          {currentText ? (
            <button
              onClick={handleDismissSelection}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Clear active word"
              aria-label="Clear active word"
            >
              <IconX size={14} />
            </button>
          ) : (
            <span className="text-slate-400 font-normal text-[10px] sm:text-[11px]">Waiting for selection...</span>
          )}
        </div>

        {!currentText ? (
          <div className="py-6 sm:py-8 text-center">
            <p className="text-xs text-slate-400 italic">Select text in the PDF to translate & see meanings</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Original Text Section */}
            <div className="bg-slate-50/70 p-2.5 sm:p-3 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Original</span>
                <PronunciationButton 
                  text={currentText} 
                  lang="en-US" 
                />
              </div>
              <p className="text-sm sm:text-[15px] font-serif text-[#10175b] leading-snug italic font-medium">
                &ldquo;{currentText}&rdquo;
              </p>
            </div>

            {isTranslating ? (
              <div className="flex items-center justify-center gap-2 py-5 text-slate-400 animate-pulse bg-slate-50/40 rounded-xl">
                <IconLoader className="animate-spin w-4 h-4 text-indigo-500" />
                <span className="text-xs font-medium">Deciphering meanings...</span>
              </div>
            ) : (translatedText || englishDictionary) ? (
              <div className="animate-in fade-in slide-in-from-top-1 duration-200 space-y-3">
                
                {/* Target Translation */}
                {translatedText ? (
                  <div className="bg-indigo-50/40 border border-indigo-100/60 p-3 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] sm:text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                        {preferredLanguage} Translation
                      </span>
                      <PronunciationButton 
                        text={translatedText} 
                        lang={preferredLanguage === 'Tamil' ? 'ta-IN' : 'si-LK'} 
                      />
                    </div>
                    <p className="text-lg sm:text-xl font-serif font-bold text-[#10175b] leading-tight">
                      {translatedText}
                    </p>
                  </div>
                ) : null}

                {/* Save Word Button */}
                {translatedText ? (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all shadow-sm active:scale-[0.98] ${
                      isAlreadySaved 
                        ? 'bg-[#0f766e] text-white shadow-emerald-900/10' 
                        : 'bg-[#10175b] text-white hover:bg-[#1a2066]'
                    }`}
                  >
                    {isSaving ? (
                      <IconLoader className="animate-spin w-4 h-4" />
                    ) : isAlreadySaved ? (
                      <IconCheck size={16} strokeWidth={3} />
                    ) : (
                      <IconBookmarkPlus size={16} strokeWidth={2.5} />
                    )}
                    <span>{isSaving ? 'Saving...' : isAlreadySaved ? 'In Library' : 'Add Word'}</span>
                  </button>
                ) : null}

                {/* English Meanings & Alternative Tamil Meanings Card */}
                <DictionaryMeaningCard
                  englishDictionary={englishDictionary}
                  alternativeMeanings={alternativeMeanings}
                  targetLanguage={preferredLanguage}
                  onSelectAlternative={(alt) => setTranslatedText(alt)}
                />

              </div>
            ) : error ? (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100 text-center">
                {error}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-100 bg-slate-50/70 shrink-0">
        <button 
          type="button"
          onClick={() => handleTabSwitch('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[11px] sm:text-[12px] font-semibold transition-all ${
            activeTab === 'history' 
              ? 'bg-white text-[#10175b] border-b-2 border-[#10175b] shadow-2xs' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <IconHistory size={14} />
          <span>History</span>
          {history.length > 0 && (
            <span className="text-[9px] bg-slate-100 px-1.5 py-0.2 rounded-full font-mono text-slate-500">
              {history.length}
            </span>
          )}
        </button>
        <button 
          type="button"
          onClick={() => handleTabSwitch('notes')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[11px] sm:text-[12px] font-semibold transition-all ${
            activeTab === 'notes' 
              ? 'bg-white text-[#10175b] border-b-2 border-[#10175b] shadow-2xs' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <IconNotes size={14} />
          <span>Notes</span>
          {isModified && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
        {activeTab === 'history' ? (
          <div className="flex flex-col">
            {isLoadingHistory ? (
              // Skeleton UI
              [1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="p-3 sm:p-4 border-b border-slate-100 animate-pulse">
                  <div className="h-4 w-24 bg-slate-200 rounded mb-2" />
                  <div className="h-3 w-40 bg-slate-100 rounded" />
                </div>
              ))
            ) : history.length === 0 ? (
              <div className="py-12 text-center text-slate-300 italic text-xs">
                No translations yet.
              </div>
            ) : (
              history.map((item, i) => (
                <div 
                  key={i} 
                  onClick={() => {
                    if (typeof item.pageNumber === 'number') {
                      onNavigate?.(item.pageNumber);
                    }
                  }}
                  className="p-3 sm:p-4 border-b border-slate-100 hover:bg-slate-50/70 transition-colors group cursor-pointer active:bg-slate-100"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[12px] sm:text-[13px] font-serif font-bold text-[#10175b] group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {item.originalText}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                      P.{item.pageNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconArrowRight size={10} className="text-slate-300" />
                    <span className="text-[11px] sm:text-[12px] text-slate-500 font-medium">
                      {item.translatedText}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        ) : (
          <div className="p-3 sm:p-4 h-full flex flex-col bg-[#FCF9F0]">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#10175b]/60 uppercase tracking-wider">
                Quick Study Notes
              </span>
              <div className="flex items-center gap-2">
                {isSavingNotes ? (
                  <IconLoader size={14} className="animate-spin text-indigo-400" />
                ) : showSavedIndicator ? (
                  <IconCircleCheck size={14} className="text-emerald-500" />
                ) : isModified ? (
                  <button 
                    type="button"
                    onClick={saveCurrentNotes}
                    className="p-1 px-2.5 flex items-center gap-1 bg-[#10175b] text-white rounded-lg transition-all shadow-md active:scale-95 text-[10px] font-bold"
                    title="Save notes"
                  >
                    <IconDeviceFloppy size={13} />
                    <span>SAVE</span>
                  </button>
                ) : null}
              </div>
            </div>

            <textarea 
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Reflect on your reading..."
              className="flex-1 w-full bg-transparent border-none p-0 text-[14px] sm:text-[15px] text-[#10175b] font-serif placeholder:text-slate-300 focus:outline-none focus:ring-0 transition-all resize-none leading-relaxed"
            />
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="p-2.5 sm:p-3 bg-slate-50 border-t border-slate-100 text-center">
        <p className="text-[9px] text-slate-400 leading-tight italic">
          Decipherings are saved across all your sessions.
        </p>
      </div>
    </div>
  );
}
