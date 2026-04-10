'use client';

import { useState, useEffect, useRef } from 'react';
import { saveTranslation, getLatestTranslations } from '@/actions/translations';
import { updateBookNotes, getBookNotes } from '@/actions/books';
import { 
  IconLoader, 
  IconWorld, 
  IconArrowRight, 
  IconLanguage, 
  IconBookmarkPlus, 
  IconCheck, 
  IconHistory, 
  IconNotes,
  IconCircleCheck,
  IconDeviceFloppy
} from '@tabler/icons-react';

import { PronunciationButton } from './pronunciation-button';

interface MiniTranslatorProps {
  bookId: string;
  preferredLanguage: string;
  text: string;
  pageNumber: number;
  onSaved?: () => void;
  onNavigate?: (page: number) => void;
}



export default function MiniTranslator({ 
  bookId, 
  preferredLanguage, 
  text, 
  pageNumber,
  onSaved,
  onNavigate
}: MiniTranslatorProps) {

  const [translatedText, setTranslatedText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Tabs State
  const [activeTab, setActiveTab] = useState<'history' | 'notes'>('history');
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [notes, setNotes] = useState('');

  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);


  useEffect(() => {
    if (text) {
      handleAutoTranslate(text);
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
    setIsSaved(false);

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
        setError('Translation failed.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async () => {
    const finalOriginalText = correctedText || text;
    if (!translatedText || !finalOriginalText || isSaved) return;

    setIsSaving(true);
    const result = await saveTranslation(bookId, finalOriginalText, translatedText, preferredLanguage, pageNumber);
    
    if (result.error) {
      setError(result.error);
      setIsSaving(false);
    } else {
      setIsSaved(true);
      setIsSaving(false);
      
      // Update history locally for instant feedback "passively"
      if (result.translation) {
        setHistory(prev => [result.translation, ...prev.slice(0, 9)]);
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


  return (
    <div className="flex flex-col h-full bg-white/50 backdrop-blur-xl border-l border-slate-200 shadow-2xl overflow-hidden">
      {/* Top Section: Active Translation */}
      <div className="p-6 border-b border-slate-100 bg-white/80 shrink-0">
        <h3 className="text-[13px] font-semibold text-[#10175b] mb-4 flex items-center justify-between">
          <span>Active Decipher</span>
          {text ? (
            <span className="bg-[#10175b]/5 text-[#10175b]/60 px-2.5 py-1 rounded-md text-[10px] font-bold">Page {pageNumber}</span>
          ) : (
             <span className="text-slate-400 font-normal text-[11px]">Waiting for selection...</span>
          )}
        </h3>

        {!text ? (
          <div className="py-8 text-center">
            <p className="text-xs text-slate-400 italic">Select text in the PDF to translate</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Original</span>
                <PronunciationButton 
                  text={text} 
                  lang="en-US" 
                />
              </div>
              <p className="text-sm font-serif text-[#10175b] leading-tight line-clamp-2 italic">
                "{text}"
              </p>
            </div>

            {isTranslating ? (
              <div className="flex items-center gap-2 py-4 text-slate-400 animate-pulse">
                <IconLoader className="animate-spin w-4 h-4" />
                <span className="text-[11px] font-medium">Processing...</span>
              </div>
            ) : translatedText ? (
              <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">{preferredLanguage}</span>
                  <PronunciationButton 
                    text={translatedText} 
                    lang={preferredLanguage === 'Tamil' ? 'ta-IN' : 'si-LK'} 
                  />
                </div>
                <p className="text-lg font-serif font-bold text-[#10175b] leading-tight mb-4">
                  {translatedText}
                </p>
                <button
                  onClick={handleSave}
                  disabled={isSaving || isSaved}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold transition-all ${
                    isSaved 
                      ? 'bg-[#0f766e] text-white shadow-lg shadow-[#0f766e]/20' 
                      : 'bg-[#10175b] text-white hover:bg-[#1a2066] shadow-md disabled:opacity-50'
                  }`}

                >
                  {isSaved ? <IconCheck size={16} strokeWidth={3} /> : isSaving ? <IconLoader className="animate-spin w-4 h-4" /> : <IconBookmarkPlus size={16} strokeWidth={2.5} />}
                  {isSaved ? 'In Library' : isSaving ? 'Saving...' : 'Add Word'}
                </button>
              </div>
            ) : error ? (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold border border-red-100 text-center">
                {error}
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-100 bg-slate-50/50">
        <button 
          onClick={() => handleTabSwitch('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[12px] font-semibold transition-all ${activeTab === 'history' ? 'bg-white text-[#10175b] border-b-2 border-[#10175b]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <IconHistory size={14} />
          History
        </button>
        <button 
          onClick={() => handleTabSwitch('notes')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[12px] font-semibold transition-all ${activeTab === 'notes' ? 'bg-white text-[#10175b] border-b-2 border-[#10175b]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <IconNotes size={14} />
          Notes
        </button>
      </div>


      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white/30">
        {activeTab === 'history' ? (
          <div className="flex flex-col bg-white/50">
            {isLoadingHistory ? (
              // Skeleton UI
              [1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="p-4 border-b border-slate-100/50 animate-pulse">
                  <div className="h-4 w-24 bg-slate-200 rounded mb-2" />
                  <div className="h-3 w-40 bg-slate-100 rounded" />
                </div>
              ))
            ) : history.length === 0 ? (
              <div className="py-12 text-center text-slate-300 italic text-[11px]">
                No translations yet.
              </div>
            ) : (
              history.map((item, i) => (
                <div 
                  key={i} 
                  onClick={() => onNavigate?.(item.pageNumber)}
                  className="p-4 border-b border-slate-100 hover:bg-white transition-colors group cursor-pointer active:bg-slate-50"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[12px] font-serif font-bold text-[#10175b] group-hover:text-indigo-600 transition-colors line-clamp-1">{item.originalText}</span>
                    <span className="text-[9px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">P.{item.pageNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconArrowRight size={10} className="text-slate-300" />
                    <span className="text-[11px] text-slate-500 font-medium">{item.translatedText}</span>
                  </div>
                </div>
              ))
            )}
          </div>

        ) : (
          <div className="p-4 h-full flex flex-col bg-[#FCF9F0]">
            <div className="flex items-center justify-between mb-4 px-1">
               <span className="text-[11px] font-bold text-[#10175b]/60 uppercase tracking-wider">Quick Study Notes</span>
               <div className="flex items-center gap-2">
                  {isSavingNotes ? (
                    <IconLoader size={14} className="animate-spin text-indigo-400" />
                  ) : showSavedIndicator ? (
                    <IconCircleCheck size={14} className="text-emerald-500" />
                  ) : isModified ? (
                    <button 
                      onClick={saveCurrentNotes}
                      className="p-1 px-2 flex items-center gap-1 bg-[#10175b] text-white rounded-lg transition-all shadow-md active:scale-95"
                      title="Save notes"
                    >
                      <IconDeviceFloppy size={14} />
                      <span className="text-[9px] font-bold">SAVE</span>
                    </button>
                  ) : null}
               </div>
            </div>

            <textarea 
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Reflect on your reading..."
              className="flex-1 w-full bg-transparent border-none p-0 text-[15px] text-[#10175b] font-serif placeholder:text-slate-300 focus:outline-none focus:ring-0 transition-all resize-none leading-relaxed"
            />
          </div>

        )}
      </div>

      {/* Footer info */}
      <div className="p-4 bg-slate-50/80 border-t border-slate-100">
        <p className="text-[9px] text-slate-400 leading-tight italic text-center">
          Decipherings are saved across all your sessions.
        </p>
      </div>
    </div>
  );
}
