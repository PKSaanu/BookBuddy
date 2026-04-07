'use client';

import { useState, useRef, useEffect } from 'react';
import { updatePaperNotes } from '@/actions/papers';
import { IconNotes, IconCheck, IconLoader, IconX, IconList, IconCircleCheck } from '@tabler/icons-react';

interface PaperNotesProps {
  paperId: string;
  initialNotes: string | null;
  isLoading?: boolean;
  onClose?: () => void;
}

export default function PaperNotes({ paperId, initialNotes, isLoading = false, onClose }: PaperNotesProps) {
  const [notes, setNotes] = useState(initialNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state if initialNotes changes after initial fetch
  useEffect(() => {
    if (initialNotes !== null) {
      setNotes(initialNotes);
    }
  }, [initialNotes]);

  // Sync state if initialNotes changes after initial fetch
  useEffect(() => {
    if (initialNotes !== null) {
      setNotes(initialNotes);
    }
  }, [initialNotes]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    
    const result = await updatePaperNotes(paperId, notes);
    
    if (result.success) {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      setSaveStatus('error');
    }
    setIsSaving(false);
  };

  const insertSymbol = (symbol: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    // If not at the beginning of a line, find the beginning
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    const isAtNewLine = start === 0 || text[start - 1] === '\n';
    const finalSymbol = isAtNewLine ? symbol : `\n${symbol}`;
    
    const newText = before + finalSymbol + after;
    setNotes(newText);
    
    // Focus and position cursor after the symbol
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + finalSymbol.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = textarea.value.substring(0, cursorPosition);
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];

      let prefix = '';
      if (currentLine.trim().startsWith('•')) {
        prefix = '• ';
      }

      if (prefix) {
        // If the current line is just the prefix, clear it (user wants to end list)
        if (currentLine.trim() === '•' || currentLine.trim() === '[ ]') {
          // This logic is a bit complex for a simple textarea, 
          // let's stick to auto-insert for a smoother experience first.
        } else {
          e.preventDefault();
          const textAfterCursor = textarea.value.substring(cursorPosition);
          const newText = textBeforeCursor + '\n' + prefix + textAfterCursor;
          setNotes(newText);
          
          setTimeout(() => {
            const newPos = cursorPosition + prefix.length + 1;
            textarea.setSelectionRange(newPos, newPos);
          }, 0);
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.1)]">
      {/* Header */}
      <div className="px-4 py-4 md:px-6 md:py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#10175b]/5 flex items-center justify-center">
            <IconNotes size={16} className="text-[#10175b]" />
          </div>
          <div>
            <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-[#10175b] leading-tight">Reflective Notes</h3>
            <p className="hidden xs:block text-[9px] md:text-[10px] text-slate-400 font-medium">Capture your journey</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 md:gap-2">
           {saveStatus === 'saved' && (
            <span className="hidden sm:flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-teal-600 animate-in fade-in zoom-in duration-300 mr-1 md:mr-2">
              <IconCheck size={12} strokeWidth={3} />
              SAVED
            </span>
          )}
          
          <button 
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="flex items-center gap-1 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-[#10175b] text-[10px] font-bold text-white hover:bg-[#1a2066] transition-all disabled:opacity-50 shadow-md shadow-[#10175b]/20"
          >
            {isSaving ? <IconLoader size={12} className="animate-spin" /> : <IconCheck size={12} strokeWidth={3} />}
            <span className="md:inline">SAVE</span>
          </button>

          {onClose && (
            <button 
              onClick={onClose}
              className="p-1.5 md:p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-full"
            >
              <IconX className="w-4.5 h-4.5 md:w-5 md:h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2 md:px-6 md:py-3 border-b border-slate-50 flex items-center gap-3 md:gap-4 bg-[#FBFBFC]">
        <button 
          onClick={() => insertSymbol('• ')}
          disabled={isLoading}
          title="Bullet Point"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:text-[#10175b] hover:bg-white border border-transparent hover:border-slate-100 transition-all text-[10px] md:text-[11px] font-bold active:scale-95 disabled:opacity-50"
        >
          <IconList className="w-3.5 h-3.5 md:w-4 md:h-4" />
          Points
        </button>
      </div>
      
      {/* Editor Area */}
      <div 
        className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#FCF9F0] cursor-text relative"
        onClick={() => textareaRef.current?.focus()}
      >
        {isLoading ? (
          <div className="flex flex-col gap-4 animate-pulse pt-2">
            <div className="h-4 bg-slate-200/50 rounded w-3/4" />
            <div className="h-4 bg-slate-200/50 rounded w-1/2" />
            <div className="h-4 bg-slate-200/50 rounded w-5/6" />
            <div className="h-4 bg-slate-200/50 rounded w-2/3" />
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Reflect on your reading..."
            className="w-full h-full bg-transparent border-none focus:ring-0 focus:outline-none outline-none resize-none text-[15px] md:text-lg font-serif text-[#10175b] placeholder:text-slate-300 leading-relaxed relative z-10 animate-in fade-in duration-500"
            autoFocus
          />
        )}
      </div>

      <div className="px-4 py-3 md:px-6 md:py-4 bg-[#F8F9FA] border-t border-slate-100 italic text-[9px] md:text-[10px] text-slate-400 text-center uppercase tracking-wider font-bold opacity-60">
        Enter continues lists automatically.
      </div>
    </div>
  );
}
