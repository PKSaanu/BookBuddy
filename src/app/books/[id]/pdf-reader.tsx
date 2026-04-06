'use client';

import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconChevronLeft, IconChevronRight, IconLanguage, IconLoader, IconMessageChatbot } from '@tabler/icons-react';
import { updateBookProgress, removeBookFile } from '@/actions/books';
import MiniTranslator from './mini-translator';
import BookChat from './book-chat';
import { IconTrash } from '@tabler/icons-react';


// Setting up the worker from CDN for reliability
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfReaderProps {
  fileUrl: string;
  bookId: string;
  bookTitle: string;
  bookAuthor?: string | null;
  preferredLanguage: string;
  initialPage?: number;
  onClose: () => void;
  onTranslate: (text: string, page: number) => void;
  onPageChange: (page: number) => void;
  onFileRemoved: () => void;
  savedVocab: any[];
}


export default function PdfReader({ 
  fileUrl, 
  bookId, 
  bookTitle,
  bookAuthor,
  preferredLanguage, 
  initialPage = 1, 
  onClose, 
  onTranslate, 
  onPageChange, 
  onFileRemoved,
  savedVocab
}: PdfReaderProps) {


  const [numPages, setNumPages] = useState<number | null>(null);


  const [pageNumber, setPageNumber] = useState(initialPage);
  const [scale, setScale] = useState(1.0);
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  const [activeTranslationText, setActiveTranslationText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [jumpPage, setJumpPage] = useState(String(initialPage));
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [pageHighlights, setPageHighlights] = useState<any[]>([]);
  const [hoveredHighlight, setHoveredHighlight] = useState<any | null>(null);
  const [selectionRects, setSelectionRects] = useState<any[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);
  const lastScanParams = useRef({ page: -1, scale: -1, vocabCount: -1 });



  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const handleMouseUp = () => {
    // If clicking a highlight, don't trigger selection
    if (hoveredHighlight) return;

    const sel = window.getSelection();

    if (sel && sel.toString().trim().length > 0) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelection({
        text: sel.toString().trim(),
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });

      // Calculate selection rects for visual feedback
      if (documentRef.current) {
        const textLayer = documentRef.current.querySelector('.react-pdf__Page__textContent');
        if (textLayer) {
          const pageRect = textLayer.getBoundingClientRect();
          const clientRects = Array.from(range.getClientRects());
          const newRects = clientRects.map(r => ({
            top: r.top - pageRect.top,
            left: r.left - pageRect.left,
            width: r.width,
            height: r.height
          }));
          setSelectionRects(newRects);
        }
      }
    } else {
      setSelection(null);
      setSelectionRects([]);
    }
  };

  const handleTranslateClick = () => {
    if (selection) {
      setActiveTranslationText(selection.text);
      setIsSidebarOpen(true);
      setSelection(null);
      // We no longer clear selectionRects here, to keep them visible while translating.
      // Clear selection
      window.getSelection()?.removeAllRanges();
    }
  };

  // Save progress with debounce
  useEffect(() => {
    if (!pageNumber || pageNumber < 1) return;
    
    const timer = setTimeout(async () => {
      await updateBookProgress(bookId, pageNumber);
      onPageChange(pageNumber); // Sync back to parent
    }, 3000); // 3 second debounce to keep it snappy

    return () => clearTimeout(timer);
  }, [pageNumber, bookId, onPageChange]);

  const handleRemoveFile = async () => {
    const res = await removeBookFile(bookId);

    if (res.success) {
      onFileRemoved();
      onClose();
    } else {
      alert(res.error || 'Failed to remove PDF');
    }
  };


  // Close reader on Escape key & Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') {
        setPageNumber(prev => Math.min(numPages || prev, prev + 1));
      }
      if (e.key === 'ArrowLeft') {
        setPageNumber(prev => Math.max(1, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, numPages]);


  // Sync jumpPage with actual pageNumber
  useEffect(() => {
    setJumpPage(String(pageNumber));
  }, [pageNumber]);

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(jumpPage, 10);
    if (!isNaN(val) && val >= 1 && val <= (numPages || 1)) {
      setPageNumber(val);
    } else {
      setJumpPage(String(pageNumber));
    }
  };

  // Highlighting Logic: Scan the TextLayer after it renders with pixel-precision
  const handlePageRenderSuccess = async () => {
    const startPage = pageNumber;
    const startScale = scale;
    const vocabCount = savedVocab.length;

    // Optimization: Skip if we just scanned this exact state
    if (lastScanParams.current.page === startPage && 
        lastScanParams.current.scale === startScale && 
        lastScanParams.current.vocabCount === vocabCount) {
        return;
    }

    // Wait a tiny bit for the DOM to settle, especially the text layer spans
    await new Promise(resolve => setTimeout(resolve, 50));

    // Cancellation check: if page or scale changed while we waited, abort this scan
    if (pageNumber !== startPage || scale !== startScale) return;

    if (!documentRef.current) return;
    
    const textLayer = documentRef.current.querySelector('.react-pdf__Page__textContent');
    if (!textLayer) {
        console.warn('Text layer not found for highlighting');
        return;
    }

    const spans = textLayer.querySelectorAll('span');
    if (spans.length === 0) {
        // If no spans, could be a scan or still loading. Try one more time briefly.
        await new Promise(resolve => setTimeout(resolve, 150));
        if (pageNumber !== startPage || scale !== startScale) return;
        
        const retrySpans = textLayer.querySelectorAll('span');
        if (retrySpans.length === 0) return;
    }

    const currentSpans = textLayer.querySelectorAll('span');
    const highlights: any[] = [];
    
    // Create a unique Book Library from all saved vocabulary
    // This allows a word deciphered on Page 1 to be highlighted on Page 100 automatically
    const uniqueVocab = new Map<string, any>();
    
    // Since savedVocab is already sorted by latest/highest page first, 
    // we use a simple loop to keep the most relevant entry.
    savedVocab.forEach(v => {
        const lower = v.originalText.toLowerCase();
        if (!uniqueVocab.has(lower)) {
            uniqueVocab.set(lower, v);
        }
    });

    const pageVocab = Array.from(uniqueVocab.values());

    if (pageVocab.length === 0) {
        setPageHighlights([]);
        lastScanParams.current = { page: startPage, scale: startScale, vocabCount };
        return;
    }

    currentSpans.forEach(span => {
      const text = span.textContent || '';
      const textLower = text.toLowerCase();
      
      pageVocab.forEach(v => {
        const word = v.originalText.toLowerCase();
        let startIndex = 0;
        
        while ((startIndex = textLower.indexOf(word, startIndex)) !== -1) {
          // Check for word boundaries to prevent partial matches (e.g. "his" in "this")
          const charBefore = startIndex > 0 ? textLower[startIndex - 1] : null;
          const charAfter = startIndex + word.length < textLower.length ? textLower[startIndex + word.length] : null;
          
          const isAlphaNumeric = (char: string | null) => char !== null && /[a-z0-9]/i.test(char);
          
          if (isAlphaNumeric(charBefore) || isAlphaNumeric(charAfter)) {
            startIndex += 1; // Move forward to find the next possible starting point
            continue;
          }

          try {
            const range = document.createRange();
            const textNode = span.firstChild;
            
            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
              range.setStart(textNode, startIndex);
              range.setEnd(textNode, startIndex + word.length);
              
              const rect = range.getBoundingClientRect();
              const pageRect = textLayer.getBoundingClientRect();
              
              highlights.push({
                id: v.id + '-' + startIndex,
                text: v.originalText,
                translation: v.translatedText,
                top: rect.top - pageRect.top,
                left: rect.left - pageRect.left,
                width: rect.width,
                height: rect.height,
                pageNumber: v.pageNumber
              });
            }
          } catch (e) {
            // Silently ignore range errors for individual spans
          }
          
          startIndex += word.length;
        }
      });
    });

    setPageHighlights(highlights);
    lastScanParams.current = { page: startPage, scale: startScale, vocabCount };
  };


  // Clear selection highlight once the word is saved in the vocabulary
  useEffect(() => {
    if (activeTranslationText && selectionRects.length > 0) {
      const isSaved = savedVocab.some(v => 
        v.originalText.toLowerCase() === activeTranslationText.toLowerCase()
      );
      if (isSaved) {
        setSelectionRects([]);
      }
    }
  }, [savedVocab, activeTranslationText, selectionRects.length]);


  // Clear highlights immediately when page or scale changes to avoid misalignment
  useEffect(() => {
    setPageHighlights([]);
    setSelectionRects([]);
  }, [pageNumber, scale]);


  // Re-scan highlights when saved vocabulary changes on the current page
  useEffect(() => {
    // Only trigger if we already have some highlights or if vocab changed
    // The Page component's onRenderTextLayerSuccess will handle the initial scan for a new page
    handlePageRenderSuccess();
  }, [savedVocab]);



  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-[#1a1c1e] flex flex-col h-screen w-screen overflow-hidden"
    >
      {/* Top Bar Navigation - Only show when loaded */}
      {numPages !== null && (
        <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <IconX size={24} />
          </button>
          <div className="h-px w-px bg-slate-700 hidden sm:block"></div>
          <span className="text-white font-serif font-bold text-sm hidden sm:block truncate max-w-[400px] italic">
            Reading: {bookTitle}
          </span>

        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 bg-slate-900/50 px-4 py-1.5 rounded-full border border-slate-700 shadow-inner">
            <button 
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber((prev: number) => Math.max(1, prev - 1))}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >

              <IconChevronLeft size={20} />
            </button>
            <form onSubmit={handleJumpPage} className="flex items-center gap-2 font-mono text-[13px] text-white select-none group">
              <input 
                type="text"
                value={jumpPage}
                onChange={(e) => setJumpPage(e.target.value)}
                onBlur={handleJumpPage}
                className="w-10 bg-slate-700/50 border border-slate-600 rounded text-center text-indigo-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold"
              />
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">{numPages || '...'}</span>
            </form>
            <button 
              disabled={numPages === null || pageNumber >= numPages}
              onClick={() => setNumPages === null ? null : setPageNumber((prev: number) => Math.min(numPages!, prev + 1))}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >

              <IconChevronRight size={20} />
            </button>
          </div>
          
          <button 
            onClick={() => setShowDiscardModal(true)}
            className="p-2 text-slate-400 hover:text-red-400 transition-all group relative"
            title="Discard PDF"
          >
            <IconTrash size={20} className="group-hover:scale-110 transition-transform" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700">Discard PDF</span>
          </button>
        </div>


        <div className="flex items-center gap-2">

            <button 
                onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white bg-slate-700/50 rounded-lg text-lg font-bold"
            >-</button>
            <span className="text-[11px] font-bold text-slate-400 min-w-[40px] text-center">{Math.round(scale * 100)}%</span>
            <button 
                onClick={() => setScale(prev => Math.min(2.5, prev + 0.1))}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white bg-slate-700/50 rounded-lg text-lg font-bold"
            >+</button>
        </div>
      </div>
    )}

      {/* Main Reading Area & Sidebar Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desk Surface (PDF Scroll Area) */}
        <div 
          ref={containerRef}
          onMouseUp={handleMouseUp}
          className="flex-1 overflow-y-auto overflow-x-hidden bg-[#1a1c1e] custom-scrollbar relative p-8 md:p-12 selection:bg-indigo-500/30 transition-all duration-500"
          style={{ 
            backgroundImage: 'radial-gradient(circle at center, #23272b 0%, #1a1c1e 100%)',
          }}
        >
          {/* Subtle noise texture overlay for realism */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

          <div className="relative mx-auto flex flex-col items-center">
                   <div ref={documentRef} className="relative group/pdf">

                      {/* Dynamic Page Shadow */}
                      <div className="absolute -inset-1 bg-black/40 blur-2xl rounded-sm transition-all duration-500 group-hover/pdf:bg-black/60" />
                      
                      <Document
                          file={fileUrl}
                          onLoadSuccess={onDocumentLoadSuccess}
                          loading={
                              <div className="fixed inset-0 bg-[#1a1c1e] flex flex-col items-center justify-center z-[250]">
                                   <IconLoader className="animate-spin text-indigo-500 w-12 h-12 mb-4" />
                                   <p className="text-slate-500 font-medium font-serif italic">Summoning your book...</p>
                              </div>
                          }
                      >
                          <Page 
                              pageNumber={pageNumber} 
                              scale={scale} 
                              renderAnnotationLayer={true}
                              renderTextLayer={true}
                              onRenderTextLayerSuccess={handlePageRenderSuccess}
                              className="shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.7)] rounded-sm overflow-hidden ring-1 ring-white/10"
                          />
                      </Document>

                      {/* Highlight Overlay Layer */}
                      <div className="absolute inset-0 pointer-events-none z-10">
                        {pageHighlights.map((h, i) => (
                          <div 
                            key={`${h.id}-${i}`}
                            style={{ 
                              top: h.top, 
                              left: h.left, 
                              width: h.width, 
                              height: h.height,
                              position: 'absolute'
                            }}
                            className="bg-indigo-500/20 border-b-2 border-indigo-500 pointer-events-auto cursor-help transition-colors hover:bg-indigo-500/40"
                            onMouseEnter={() => setHoveredHighlight(h)}
                            onMouseLeave={() => setHoveredHighlight(null)}
                          />
                        ))}
                      </div>

                      {/* Current Selection Highlight Layer */}
                      <div className="absolute inset-0 pointer-events-none z-10">
                        {selectionRects.map((r, i) => (
                          <div 
                            key={`sel-${i}`}
                            style={{ 
                              top: r.top, 
                              left: r.left, 
                              width: r.width, 
                              height: r.height,
                              position: 'absolute'
                            }}
                            className="bg-yellow-400/40 border-b-2 border-yellow-500 animate-in fade-in duration-200"
                          />
                        ))}
                      </div>

                      {/* Highlight Tooltip */}
                      <AnimatePresence>
                        {hoveredHighlight && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            style={{ 
                              position: 'absolute',
                              top: hoveredHighlight.top - 40,
                              left: hoveredHighlight.left + hoveredHighlight.width / 2,
                              transform: 'translateX(-50%)'
                            }}
                            className="bg-slate-900 border border-indigo-500/30 text-white px-3 py-1.5 rounded-lg shadow-xl text-xs font-serif italic z-50 pointer-events-none whitespace-nowrap"
                          >
                            {hoveredHighlight.translation}
                          </motion.div>
                        )}
                      </AnimatePresence>

                  {/* Realistic Paper Texture Overlay on Page */}
                  <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-[0.07] mix-blend-multiply" />
              </div>

              <div className="mt-8 text-slate-500/40 font-serif italic text-xs select-none">
                 BookBuddy Study Reader • {Math.round(scale * 100)}% view
              </div>
          </div>
        </div>


          {/* Floating HUD Bubble */}
          <AnimatePresence>
              {selection && (
                  <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      style={{ 
                          position: 'fixed', 
                          left: selection.x, 
                          top: selection.y,
                          transform: 'translateX(-50%) translateY(-100%)'
                      }}
                      className="z-[210] flex"
                  >
                      <button 
                          onClick={handleTranslateClick}
                          className="bg-indigo-600 text-white px-5 py-2.5 rounded-full shadow-[0_10px_25px_-5px_rgba(79,70,229,0.5)] flex items-center gap-2 whitespace-nowrap hover:bg-indigo-500 transition-all border border-white/20 active:scale-95"
                      >
                          <IconLanguage size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest italic">Translate</span>
                      </button>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-px w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-indigo-600" />
                  </motion.div>
              )}
          </AnimatePresence>


        {/* Translation Sidebar - Overlay Style */}


        {/* AI Chat Companion - Left Overlay Style */}
        <AnimatePresence>
            {isChatOpen && (
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="absolute left-0 top-0 bottom-0 w-[85%] sm:w-[350px] lg:w-[400px] h-full z-[210] shadow-[10px_0_30px_rgba(0,0,0,0.2)] bg-white"
                >
                    <div className="relative h-full">
                       {/* Close handle */}
                       <button 
                         onClick={() => setIsChatOpen(false)}
                         className="absolute -right-12 top-10 w-12 h-14 bg-[#10175b] border border-white/10 border-l-0 rounded-r-2xl flex items-center justify-center text-white/60 hover:text-white transition-colors group z-50 shadow-xl"
                       >
                          <IconChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
                       </button>

                       <BookChat 
                          bookTitle={bookTitle}
                          bookAuthor={bookAuthor}
                          preferredLanguage={preferredLanguage}
                          isSidebar={true}
                          onClose={() => setIsChatOpen(false)}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Re-open handle for Chat */}
        {!isChatOpen && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: 4 }}
            onClick={() => setIsChatOpen(true)}
            className="absolute left-0 top-10 w-12 h-14 bg-[#10175b] text-white flex items-center justify-center rounded-r-2xl shadow-xl z-40 border border-white/10 border-l-0 group overflow-hidden"
            title="Open AI Chat"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <IconMessageChatbot size={24} className="relative z-10" />
          </motion.button>
        )}

        <AnimatePresence>
            {isSidebarOpen && (
                <motion.div 
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="absolute right-0 top-0 bottom-0 w-[85%] sm:w-[350px] lg:w-[400px] h-full z-[210] shadow-[-10px_0_30px_rgba(0,0,0,0.2)]"
                >
                    <div className="relative h-full">
                       {/* Close handle handle */}
                       <button 
                         onClick={() => setIsSidebarOpen(false)}
                         className="absolute -left-12 top-10 w-12 h-14 bg-[#10175b] border border-white/10 border-r-0 rounded-l-2xl flex items-center justify-center text-white/60 hover:text-white transition-colors group z-50"
                       >
                          <IconChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
                       </button>

                       <MiniTranslator 
                          bookId={bookId}
                          preferredLanguage={preferredLanguage}
                          text={activeTranslationText}
                          pageNumber={pageNumber}
                          onNavigate={(page) => setPageNumber(page)}
                        />

                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Persistent Re-open Handle (Visible when sidebar is closed) */}
        {!isSidebarOpen && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -4 }}
            onClick={() => setIsSidebarOpen(true)}
            className="absolute right-0 top-10 w-12 h-14 bg-[#10175b] text-white flex items-center justify-center rounded-l-2xl shadow-xl z-40 border border-white/10 border-r-0 group overflow-hidden"
            title="Open Study Hub"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <IconChevronLeft size={24} className="relative z-10" />
          </motion.button>
        )}
      </div>

      {/* Discard PDF Confirmation Modal */}
      <AnimatePresence>
        {showDiscardModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDiscardModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative z-10 w-full max-w-md bg-[#1a1c1e] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-8"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 mx-auto">
                <IconTrash size={32} />
              </div>
              
              <h3 className="text-2xl font-serif font-bold text-white text-center mb-3">Discard PDF?</h3>
              <p className="text-slate-400 text-center mb-8 leading-relaxed">
                Are you sure you want to remove this PDF from your study desk? Your current reading progress for this book will be reset.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDiscardModal(false)}
                  className="flex-1 py-4 px-6 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all border border-white/5"
                >
                  Keep Reading
                </button>
                <button 
                  onClick={() => {
                    handleRemoveFile();
                    setShowDiscardModal(false);
                  }}
                  className="flex-1 py-4 px-6 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                  Yes, Discard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>

  );
}

