'use client';

import { useState } from 'react';
import { saveTranslation } from '@/actions/translations';
import { Loader2, Globe, History, ArrowRight, Languages, Book, BookmarkPlus } from 'lucide-react';

export default function TranslationPanel({ bookId, preferredLanguage }: { bookId: string, preferredLanguage: string }) {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [pageNumber, setPageNumber] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsTranslating(true);
    setError(null);
    setTranslatedText('');

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, targetLang: preferredLanguage })
      });
      const data = await res.json();
      
      if (data.translatedText) {
        setTranslatedText(data.translatedText);
      } else {
        setError('Translation API failed. Please try again.');
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async () => {
    if (!translatedText || !inputText) return;
    
    if (!pageNumber || parseInt(pageNumber, 10) <= 0) {
      setError('A valid Page Number is required to save this curation.');
      return;
    }
    
    setIsSaving(true);
    
    const pageNum = parseInt(pageNumber, 10);
    const result = await saveTranslation(bookId, inputText, translatedText, preferredLanguage, pageNum);
    if (result.error) {
      setError(result.error);
    } else {
      setInputText('');
      setTranslatedText('');
      setError(null);
      // We keep the page number for the next translation as requested
    }
    
    setIsSaving(false);
  };

  return (
    <div className="w-full">
      <div className="bg-[#EBECEF] rounded-[32px] p-8 sm:p-12 relative overflow-hidden group">
        
        {/* Giant Watermark Icon */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none">
             <Book size={280} strokeWidth={1} />
        </div>

        <form onSubmit={handleTranslate} className="relative z-10 w-full flex flex-col h-full min-h-[220px]">
           <div>
             <label htmlFor="english-text" className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#10175b] mb-6">
               Enter a word or sentence
             </label>
             <textarea
                id="english-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type here to decipher..."
                className="w-full bg-transparent border-b border-slate-300 focus:border-[#10175b] focus:outline-none resize-none text-[32px] sm:text-[40px] font-serif text-[#10175b] transition-colors placeholder:text-slate-300/80 pb-4 h-[100px]"
                onKeyDown={(e) => {
                   if (e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault();
                       handleTranslate(e as any);
                   }
                }}
             />
           </div>

           <div className="flex flex-col sm:flex-row items-center justify-between mt-auto pt-8">
               
               <div className="flex items-center gap-4 mb-6 sm:mb-0">
                   <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200">
                       <Globe size={16} className="text-slate-500" />
                       <span className="text-[13px] font-semibold text-[#10175b]">English</span>
                       <ArrowRight size={14} className="text-slate-400" />
                       <span className="text-[13px] font-semibold text-[#10175b]">{preferredLanguage}</span>
                   </div>
                   
                   <button type="button" className="p-3 bg-white rounded-full text-slate-500 hover:text-[#10175b] hover:bg-slate-50 transition-colors shadow-sm border border-slate-200">
                       <History size={18} />
                   </button>
               </div>

               <button
                 type="submit"
                 disabled={isTranslating || !inputText.trim()}
                 className="inline-flex items-center gap-3 px-8 py-4 rounded-[14px] shadow-lg shadow-[#10175b]/20 text-[15px] font-bold text-white bg-[#10175b] hover:bg-[#1a2066] focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap active:scale-[0.98]"
               >
                 {isTranslating ? <Loader2 className="animate-spin w-5 h-5" /> : <Languages className="w-5 h-5" />}
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
        <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="p-8 sm:p-10 bg-white border border-slate-200 rounded-[32px] shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
              
              <div className="flex-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#10175b]/50 mb-3 inline-block">{preferredLanguage} Translation</span>
                  <p className="text-4xl text-[#10175b] font-serif font-bold tracking-tight">{translatedText}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative">
                    <input 
                        type="number"
                        value={pageNumber}
                        onChange={(e) => setPageNumber(e.target.value)}
                        placeholder="0"
                        required
                        className={`w-24 px-4 py-4 text-center rounded-[14px] border-2 focus:outline-none font-bold text-[#10175b] transition-all ${
                            !pageNumber ? 'border-red-100 bg-red-50/30' : 'border-slate-100 focus:border-[#10175b]'
                        }`}
                    />
                    <span className={`absolute -top-2 left-3 px-2 bg-white text-[9px] font-black uppercase transition-colors ${
                        !pageNumber ? 'text-red-400' : 'text-slate-400'
                    }`}>
                        Page *
                    </span>
                </div>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-3 px-8 py-4 text-[15px] font-bold rounded-[14px] border-2 border-[#10175b] text-[#10175b] hover:bg-[#10175b] hover:text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider active:scale-[0.98]"
                >
                  {isSaving ? <Loader2 className="animate-spin w-5 h-5" /> : <BookmarkPlus className="w-5 h-5" strokeWidth={2.5} />}
                  {isSaving ? 'Add to Curation' : 'Add to Curation'}
                </button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}
