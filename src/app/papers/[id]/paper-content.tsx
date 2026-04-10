'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconNotes, IconChevronRight, IconTrash, IconArrowLeft, IconEdit, IconBook, IconLoader, IconFileUpload, IconMessageChatbot, IconChevronLeft, IconArrowsDiagonalMinimize2, IconCheck } from '@tabler/icons-react';
import Link from 'next/link';
import TranslationPanel from './translation-panel';
import CurationList from './curation-list';
import PaperNotes from './paper-notes';
import { DeletePaperButton } from './delete-paper-button';
import { EditPaperModal } from './edit-paper-modal';
import { getPaperNotes, removePaperFile, touchPaperAccess } from '@/actions/papers';
import dynamic from 'next/dynamic';
import PaperChat from './paper-chat';
import ExportRibbon from '@/components/export-ribbon';

const PdfReader = dynamic(() => import('./pdf-reader'), { 
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[300] bg-[#1a1c1e] flex flex-col items-center justify-center">
       <IconLoader className="animate-spin text-indigo-500 w-12 h-12 mb-4" />
       <p className="text-slate-500 font-medium font-serif italic">Summoning your paper...</p>
    </div>
  )
});


interface PaperContentProps {
  paper: {
    id: string;
    title: string;
    author?: string | null;
    coverImage?: string | null;
    totalPages?: number | null;
    pdfPageCount?: number | null;
    userId: string;
    fileUrl?: string | null;
    currentPage?: number | null;
    createdAt: Date;
  };
  session: any;
  vocab: any[];
  progressPercent: number;
  preferredLanguage?: string;
}

export default function PaperContent({ 
  paper, 
  session, 
  vocab, 
  progressPercent, 
  preferredLanguage = 'Tamil'
}: PaperContentProps) {
  const [mounted, setMounted] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0);
    const scrollContainer = document.getElementById('paper-content-scroll');
    if (scrollContainer) scrollContainer.scrollTop = 0;
    touchPaperAccess(paper.id);
  }, [paper.id]);
  const [fetchedNotes, setFetchedNotes] = useState<string | null>(null);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  
  // Local state for paper details to allow instant updates
  const [currentPaper, setCurrentBook] = useState(paper);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [localFileUrl, setLocalFileUrl] = useState(paper.fileUrl);
  const [localCurrentPage, setLocalCurrentPage] = useState(paper.currentPage || 1);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const [selectedText, setSelectedText] = useState('');
  const [selectedPage, setSelectedPage] = useState<number | undefined>(undefined);


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('paperId', paper.id);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.fileUrl) {
        setLocalFileUrl(data.fileUrl);
        if (data.pdfPageCount) {
          setCurrentBook(prev => ({ ...prev, pdfPageCount: data.pdfPageCount }));
        }
      } else {
        setStatusMessage({ type: 'error', message: data.error || 'Upload failed' });
        setTimeout(() => setStatusMessage(null), 5000);
      }
    } catch (err) {
      setStatusMessage({ type: 'error', message: 'Upload failed' });
      setTimeout(() => setStatusMessage(null), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = async () => {
    if (!confirm('Are you sure you want to remove the uploaded PDF? Your reading progress will be reset.')) return;
    
    const res = await removePaperFile(paper.id);
    if (res.success) {
      setLocalFileUrl(null);
      setLocalCurrentPage(1);
      setCurrentBook(prev => ({ ...prev, pdfPageCount: null }));
    } else {
      setStatusMessage({ type: 'error', message: res.error || 'Failed to remove PDF' });
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };



  const toggleNotes = async () => {
    const nextState = !isNotesOpen;
    setIsNotesOpen(nextState);

    if (nextState && fetchedNotes === null) {
      setIsLoadingNotes(true);
      const result = await getPaperNotes(paper.id);
      if (result.success) {
        setFetchedNotes(result.notes || '');
      }
      setIsLoadingNotes(false);
    }
  };

  // Re-calculate progress if paper details change
  const maxPage = vocab.reduce((max, t) => Math.max(max, t.pageNumber || 0), 0);
  const effectiveTotalPages = currentPaper.pdfPageCount || currentPaper.totalPages;
  const progressPercentValue = effectiveTotalPages 
    ? Math.round((maxPage / effectiveTotalPages) * 100) 
    : 0;
  
  const showProgress = !!currentPaper.pdfPageCount;

  return (
    <div className="flex h-[calc(100vh-80px)] md:h-screen w-full overflow-hidden relative">
      {/* Status Notification */}
      {statusMessage && (
        <div className={`fixed top-4 right-4 left-4 sm:left-auto sm:top-10 sm:right-10 z-[200] max-w-sm sm:w-80 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-10 ${statusMessage.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {statusMessage.type === 'success' ? 
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white"><IconCheck size={14} strokeWidth={3} /></div> : 
            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          }
          <p className="font-medium text-sm">{statusMessage.message}</p>
        </div>
      )}

      {/* Main Content Area */}
      <motion.div 
        id="paper-content-scroll"
        layout
        className="flex-1 h-full overflow-y-auto md:px-12 md:py-10 xl:px-16 xl:py-12 relative"
      >
        {/* Mobile Action Ribbon (Visible only < md) - Flush to container top */}
        <div className="md:hidden flex w-full bg-[#10175b] text-white overflow-x-auto hide-scrollbar border-b border-[#10175b]/80 shadow-md">
            <Link href="/library" className="flex-1 flex items-center justify-center py-4 px-2 border-r border-white/10 active:bg-white/10 transition-colors shrink-0 min-w-[64px]">
              <IconArrowLeft className="w-6 h-6 text-white/80" />
            </Link>
            
            <button onClick={() => setIsEditModalOpen(true)} className="flex-1 flex items-center justify-center py-4 px-2 border-r border-white/10 active:bg-white/10 transition-colors shrink-0 min-w-[64px]">
              <IconEdit className="w-6 h-6 text-white/80" />
            </button>

            <button onClick={toggleNotes} className={`flex-1 flex items-center justify-center py-4 px-2 border-r border-white/10 transition-colors shrink-0 min-w-[64px] ${isNotesOpen ? 'bg-white/20' : 'active:bg-white/10'}`}>
              <IconNotes className="w-6 h-6 text-white/80" />
            </button>
            
            <DeletePaperButton paperId={paper.id} paperTitle={currentPaper.title} variant="ribbon" />
            
            {showProgress && (
              <div className="flex-1 flex items-center justify-center py-4 px-2 bg-[#0f766e] active:bg-[#0f766e]/90 transition-colors shrink-0 min-w-[64px]">
                <span className="text-[14px] font-black">{progressPercentValue}%</span>
              </div>
            )}
        </div>

        {/* Padded inner content wrapper for mobile */}
        <div className="px-5 py-8 md:p-0">
        {/* Export Archive Ribbon - Now inside scrollable area */}
        <ExportRibbon 
          title={currentPaper.title}
          author={currentPaper.author}
          vocab={vocab}
          notes={fetchedNotes}
          isChatOpen={isChatOpen}
        />

        <div className="max-w-[900px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="hidden md:flex items-center justify-between w-full mb-6">
              <Link href="/library" className="inline-flex items-center text-[10px] md:text-[12px] font-bold text-[#10175b] hover:text-[#1a2066] transition-colors group uppercase tracking-[0.1em]">
                <IconArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
                Back to Library
              </Link>
              
              <div className="flex items-center gap-3 md:gap-4">
                <button 
                   onClick={() => setIsEditModalOpen(true)}
                   className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all duration-300 border-2 bg-white text-slate-500 border-slate-200 hover:border-[#10175b] hover:text-[#10175b] shadow-sm"
                >
                  <IconEdit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden xs:inline">Edit Details</span>
                </button>

                <button 
                   onClick={toggleNotes}
                   className={`inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all duration-300 border-2 ${isNotesOpen ? 'bg-[#10175b] text-white border-[#10175b]' : 'bg-white text-[#10175b] border-slate-200 hover:border-[#10175b] shadow-sm'}`}
                >
                  <IconNotes className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={isNotesOpen ? 3 : 2} />
                  <span className="hidden xs:inline">{isNotesOpen ? 'Hide Notes' : 'Notes'}</span>
                </button>
                
                <DeletePaperButton paperId={paper.id} paperTitle={currentPaper.title} />
                
                {showProgress && (
                  <div className="bg-[#0f766e] text-white text-[9px] md:text-[11px] font-bold tracking-[0.1em] uppercase px-3 md:px-4 py-1.5 rounded-full shadow-sm">
                    {progressPercentValue}%
                  </div>
                )}

                {/* PDF Control Buttons - Desktop Only */}
                <div className="flex items-center gap-3">
                  {localFileUrl ? (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setIsReaderOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-[#10175b] text-white border-2 border-[#10175b] hover:bg-white hover:text-[#10175b] transition-all shadow-md group"
                      >
                        <IconBook className="w-4 h-4" />
                        Read Paper
                      </button>
                    </div>

                  ) : (

                    <div className="relative">
                      <input 
                        type="file" 
                        accept=".pdf" 
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                      <button 
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-white text-[#10175b] border-2 border-[#10175b] hover:bg-[#10175b] hover:text-white transition-all shadow-sm"
                      >
                        {isUploading ? <IconLoader className="animate-spin w-4 h-4" /> : <IconFileUpload className="w-4 h-4" />}

                        {isUploading ? 'Uploading...' : 'Upload PDF'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            
            <div className="flex flex-col border-b border-slate-200/50 pb-8">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-[#171717] font-bold tracking-tight leading-[1.2] mb-4">{currentPaper.title}</h1>
              
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                <p className="text-base md:text-lg text-slate-600 font-serif italic tracking-wide">
                  {currentPaper.author || 'Unknown Author'}
                </p>
                
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline text-slate-300 font-sans font-normal">•</span>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#10175b] bg-[#10175b]/5 sm:bg-transparent px-2 sm:px-0 py-0.5 sm:py-0 rounded-md">
                    {currentPaper.pdfPageCount ? `${currentPaper.pdfPageCount} Total Pages` : 'Research Document'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ... existing panels ... */}
          <div className="mb-12">
            <TranslationPanel 
              paperId={paper.id} 
              preferredLanguage={preferredLanguage} 
              externalText={selectedText}
              externalPageNumber={selectedPage}
            />
          </div>


          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#10175b]/50">Your Saved Curation</h2>
              <div className="h-[1px] flex-1 bg-[#10175b]/10 ml-4 md:ml-8" />
            </div>
            <CurationList 
              vocab={vocab as any} 
              paperId={paper.id} 
            />
          </div>
        </div>
        </div>
      </motion.div>

      {/* Right Sidebar: AI Chat companion (Retractable) */}
      <AnimatePresence mode="wait">
        {isChatOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: typeof window !== 'undefined' && window.innerWidth > 1280 ? 420 : 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="hidden lg:block h-full border-l border-slate-100 bg-white shrink-0 z-10 relative overflow-hidden"
          >
            <div className="w-[380px] xl:w-[420px] h-full">
              <div className="h-full w-full">
                <PaperChat 
                  paperTitle={currentPaper.title} 
                  paperAuthors={currentPaper.author} 
                  preferredLanguage={mounted ? preferredLanguage : undefined}
                  onClose={() => setIsChatOpen(false)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Handle for Dashboard Chat */}
      {!isChatOpen && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex fixed right-0 top-24 flex-col items-center z-40"
        >
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-12 h-12 bg-[#10175b] text-white flex flex-col items-center justify-center rounded-l-2xl shadow-lg border border-white/10 border-r-0 group overflow-hidden transition-all hover:w-14"
            title="Open Paper Buddy"
          >
            <IconMessageChatbot size={22} />
          </button>
        </motion.div>
      )}

      {/* Modals & Panels */}
      {isEditModalOpen && (
        <EditPaperModal 
          paper={currentPaper as any} 
          onClose={() => setIsEditModalOpen(false)} 
          onUpdate={(t, a, p) => {
            setCurrentBook({ ...currentPaper, title: t, author: a, totalPages: p });
          }}
        />
      )}

      <AnimatePresence>
        {isNotesOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotesOpen(false)}
              className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 w-[92%] md:w-[60%] lg:w-[50%] xl:w-[45%] h-[100dvh] z-[101]"
            >
              <PaperNotes 
                paperId={paper.id} 
                initialNotes={fetchedNotes} 
                isLoading={isLoadingNotes}
                onClose={() => setIsNotesOpen(false)}
                onSave={(newNotes) => setFetchedNotes(newNotes)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isReaderOpen && localFileUrl && (
          <PdfReader 
            fileUrl={localFileUrl} 
            paperId={paper.id}
            paperTitle={currentPaper.title}
            preferredLanguage={session.preferredLanguage as string}
            initialPage={localCurrentPage}
            savedVocab={vocab}
            onClose={() => setIsReaderOpen(false)}
            onPageChange={(page) => setLocalCurrentPage(page)}
            onFileRemoved={() => {
              setLocalFileUrl(null);
              setLocalCurrentPage(1);
              setCurrentBook(prev => ({ ...prev, pdfPageCount: null }));
            }}
            onTranslate={(text, page) => {
              setSelectedText(text);
              setSelectedPage(page);
              // Reader no longer closes automatically to preserve progress
            }}
          />


        )}

      </AnimatePresence>

    </div>

  );
}
