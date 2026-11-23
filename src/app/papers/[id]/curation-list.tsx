'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { PronunciationButton } from './pronunciation-button';
import { DeleteTranslationButton } from './delete-button';
import { IconSearch, IconChevronLeft, IconChevronRight, IconArrowUp, IconX, IconCards, IconChevronDown, IconLoader } from '@tabler/icons-react';
import FlashcardsModal from '@/components/flashcards-modal';
import DictionaryMeaningCard from '@/components/dictionary-meaning-card';
import { EnglishDictionaryData, AlternativeMeaningEntry } from '@/types/dictionary';

interface Translation {
    id: string;
    originalText: string;
    translatedText: string;
    language: string;
    pageNumber: number | null;
    createdAt: Date;
}

interface DictionaryCacheItem {
    englishDictionary?: EnglishDictionaryData | null;
    alternativeMeanings?: AlternativeMeaningEntry[] | null;
    loading: boolean;
    error?: string | null;
}

function getPageNumbers(current: number, total: number): (number | string)[] {
    if (total <= 5) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
        return [1, 2, 3, '...', total];
    }
    if (current >= total - 2) {
        return [1, '...', total - 2, total - 1, total];
    }
    return [1, '...', current, '...', total];
}

export default function CurationList({ 
    vocab, 
    paperId
}: { 
    vocab: Translation[], 
    paperId: string
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showGoToTop, setShowGoToTop] = useState(false);
    const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [dictCache, setDictCache] = useState<Record<string, DictionaryCacheItem>>({});
    const curationTopRef = useRef<HTMLDivElement>(null);
    const itemsPerPage = 10;

    const toggleExpand = async (entry: Translation) => {
        const isCurrentlyExpanded = expandedIds.has(entry.id);
        const nextExpanded = new Set(expandedIds);
        
        if (isCurrentlyExpanded) {
            nextExpanded.delete(entry.id);
            setExpandedIds(nextExpanded);
            return;
        }

        nextExpanded.add(entry.id);
        setExpandedIds(nextExpanded);

        const cacheKey = `${entry.originalText.trim().toLowerCase()}_${entry.language}`;
        if (dictCache[cacheKey]) {
            return;
        }

        setDictCache(prev => ({
            ...prev,
            [cacheKey]: { loading: true }
        }));

        try {
            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: entry.originalText, targetLang: entry.language })
            });
            const data = await res.json();
            if (res.ok) {
                setDictCache(prev => ({
                    ...prev,
                    [cacheKey]: {
                        englishDictionary: data.englishDictionary || null,
                        alternativeMeanings: data.alternativeMeanings || null,
                        loading: false
                    }
                }));
            } else {
                setDictCache(prev => ({
                    ...prev,
                    [cacheKey]: {
                        loading: false,
                        error: data.error || 'Failed to load details'
                    }
                }));
            }
        } catch {
            setDictCache(prev => ({
                ...prev,
                [cacheKey]: {
                    loading: false,
                    error: 'Network error loading definitions'
                }
            }));
        }
    };

    const filteredVocab = useMemo(() => {
        if (!searchQuery.trim()) return vocab;
        const query = searchQuery.toLowerCase();
        return vocab.filter(entry =>
            entry.originalText.toLowerCase().includes(query) ||
            entry.translatedText.toLowerCase().includes(query)
        );
    }, [vocab, searchQuery]);

    useEffect(() => {
        const scrollContainer = document.getElementById('book-content-scroll') || document.getElementById('paper-content-scroll');
        const handleScroll = () => {
            const currentY = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
            setShowGoToTop(currentY > 300);
        };

        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        }
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            if (scrollContainer) scrollContainer.removeEventListener('scroll', handleScroll);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const totalPages = Math.ceil(filteredVocab.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedVocab = filteredVocab.slice(startIndex, startIndex + itemsPerPage);

    const groupedVocab = useMemo(() => {
        const groups: Record<number, Translation[]> = {};
        paginatedVocab.forEach(entry => {
            const page = entry.pageNumber || 0;
            if (!groups[page]) groups[page] = [];
            groups[page].push(entry);
        });
        return Object.entries(groups).sort(([a], [b]) => Number(b) - Number(a));
    }, [paginatedVocab]);

    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => { 
        const timer = setTimeout(() => setHasMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    const scrollToTop = () => {
        const scrollContainer = document.getElementById('book-content-scroll') || document.getElementById('paper-content-scroll');
        if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToCurationTop = () => {
        const scrollContainer = document.getElementById('book-content-scroll') || document.getElementById('paper-content-scroll');
        if (curationTopRef.current && scrollContainer) {
            const containerRect = scrollContainer.getBoundingClientRect();
            const elementRect = curationTopRef.current.getBoundingClientRect();
            const targetScrollTop = scrollContainer.scrollTop + (elementRect.top - containerRect.top) - 30;
            scrollContainer.scrollTo({
                top: Math.max(0, targetScrollTop),
                behavior: 'smooth'
            });
        } else if (curationTopRef.current) {
            curationTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage === currentPage || newPage < 1 || newPage > totalPages) return;
        setCurrentPage(newPage);
        setTimeout(() => {
            scrollToCurationTop();
        }, 40);
    };

    if (!hasMounted) {
        return (
            <div className="min-h-[300px] flex items-center justify-center">
                <div className="w-7 h-7 border-[3px] border-[#10175b] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (vocab.length === 0) {
        return (
            <div className="bg-transparent border border-dashed border-slate-200 rounded-[24px] p-20 text-center">
                <p className="text-slate-400 font-serif italic text-xl">&ldquo;This curation is currently unwritten. Decipher your first sentence above.&rdquo;</p>
            </div>
        );
    }

    return (
        <div ref={curationTopRef} className="relative scroll-mt-8">

            {/* Search & Flashcards Bar */}
            <div className="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                        <IconSearch size={16} className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        placeholder="Search in your curation..."
                        className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-[18px] focus:outline-none focus:ring-4 focus:ring-slate-50 focus:border-[#10175b] transition-all text-sm font-medium text-[#10175b] placeholder:text-slate-300 shadow-sm"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-5 flex items-center text-slate-300 hover:text-slate-500">
                            <IconX size={16} />
                        </button>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setIsFlashcardsOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-[#10175b] text-white rounded-[18px] text-xs sm:text-sm font-bold shadow-md shadow-[#10175b]/15 hover:bg-[#1a2066] transition-all active:scale-95 shrink-0"
                    title="Practice vocabulary with interactive flashcards"
                >
                    <IconCards size={18} />
                    <span>Practice Flashcards ({filteredVocab.length})</span>
                </button>
            </div>

            {filteredVocab.length === 0 ? (
                <div className="text-center py-16 bg-slate-50/50 rounded-[28px] border border-dashed border-slate-100">
                    <p className="text-slate-400 font-serif italic">No matching curations found for &ldquo;{searchQuery}&rdquo;</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {groupedVocab.map(([page, entries]) => (
                        <div key={page} className="space-y-0 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Page Group Header */}
                            <div className="flex items-center gap-4 mb-5">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />
                                <h3 className="text-[10px] font-bold font-sans uppercase tracking-[0.3em] text-slate-400 px-1">
                                    {page === '0' ? 'No Page' : `Page ${page}`}
                                </h3>
                                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
                            </div>

                            {/* Entries — separated by a thin divider */}
                            <div className="divide-y divide-slate-100">
                                {entries.map((entry) => {
                                    const dateStr = new Intl.DateTimeFormat('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric'
                                    }).format(new Date(entry.createdAt)).toUpperCase();

                                    const isExpanded = expandedIds.has(entry.id);
                                    const cacheKey = `${entry.originalText.trim().toLowerCase()}_${entry.language}`;
                                    const cachedData = dictCache[cacheKey];

                                    return (
                                        <div 
                                            key={entry.id} 
                                            onClick={() => toggleExpand(entry)}
                                            className={`group relative py-4 sm:py-5 -mx-4 px-4 rounded-2xl transition-all duration-200 cursor-pointer ${
                                                isExpanded 
                                                    ? 'bg-slate-50/90 ring-1 ring-slate-200/80 shadow-xs' 
                                                    : 'hover:bg-slate-50/60'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start gap-4">
                                                {/* Left: text content */}
                                                <div className="flex-1 min-w-0">
                                                    {/* English */}
                                                    <div className="flex items-start justify-between gap-3 mb-2">
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-base sm:text-lg font-serif font-semibold text-[#171717] leading-relaxed group-hover:text-[#10175b] transition-colors break-words whitespace-normal">
                                                                {entry.originalText}
                                                            </h4>
                                                        </div>
                                                        <div className="shrink-0 pt-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                            <PronunciationButton 
                                                                text={entry.originalText} 
                                                                lang="en-US" 
                                                                variant="round"
                                                                size="sm"
                                                                theme="english"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Translation */}
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-base sm:text-lg font-serif text-[#012B5B] leading-relaxed break-words whitespace-normal font-medium">
                                                                {entry.translatedText}
                                                            </p>
                                                        </div>
                                                        <div className="shrink-0 pt-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                            <PronunciationButton 
                                                                text={entry.translatedText} 
                                                                lang={entry.language === 'Tamil' ? 'ta-IN' : 'si-LK'} 
                                                                variant="round"
                                                                size="sm"
                                                                theme="translated"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Footer info: Language tag + Expand/Collapse indicator */}
                                                    <div className="flex items-center gap-3 mt-2.5">
                                                        <span className="text-[9px] font-bold font-sans uppercase tracking-[0.2em] text-slate-400">
                                                            {entry.language} Translation
                                                        </span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold transition-colors ${
                                                            isExpanded ? 'text-[#10175b]' : 'text-slate-400 group-hover:text-[#10175b]'
                                                        }`}>
                                                            <span>{isExpanded ? 'Hide Meanings' : 'Context & Meanings'}</span>
                                                            <IconChevronDown size={13} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Right: date + delete */}
                                                <div className="flex flex-col items-end gap-2 shrink-0">
                                                    <span className="text-[10px] font-sans text-slate-400 tracking-wide">{dateStr}</span>
                                                    <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                        <DeleteTranslationButton id={entry.id} paperId={paperId} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* EXPANDED INLINE SECTION: No popup, smooth inline card */}
                                            {isExpanded && (
                                                <div 
                                                    onClick={(e) => e.stopPropagation()} 
                                                    className="mt-4 pt-3 border-t border-slate-200/60 animate-in fade-in slide-in-from-top-2 duration-200 cursor-default"
                                                >
                                                    {cachedData?.loading ? (
                                                        <div className="flex items-center gap-2 py-3 px-3.5 bg-white/80 rounded-xl border border-slate-200/70 text-slate-500 text-xs font-medium">
                                                            <IconLoader className="w-4 h-4 animate-spin text-[#10175b]" />
                                                            <span>Looking up English definitions & other {entry.language} meanings...</span>
                                                        </div>
                                                    ) : cachedData?.error ? (
                                                        <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl text-xs text-red-600">
                                                            {cachedData.error}
                                                        </div>
                                                    ) : cachedData ? (
                                                        (cachedData.englishDictionary || (cachedData.alternativeMeanings && cachedData.alternativeMeanings.length > 0)) ? (
                                                            <DictionaryMeaningCard
                                                                englishDictionary={cachedData.englishDictionary}
                                                                alternativeMeanings={cachedData.alternativeMeanings}
                                                                targetLanguage={entry.language}
                                                                defaultExpanded={true}
                                                            />
                                                        ) : (
                                                            <div className="p-3 bg-white/80 border border-slate-200/70 rounded-xl text-xs text-slate-400 font-serif italic">
                                                                No extended dictionary definitions found for this phrase.
                                                            </div>
                                                        )
                                                    ) : null}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination with specific numbered pages */}
            {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-1.5 sm:gap-2 py-6 border-t border-slate-100 w-full select-none">
                    <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="h-8 sm:h-9 px-2 sm:px-3.5 flex items-center justify-center gap-1 text-xs font-bold text-slate-600 hover:text-[#10175b] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 active:scale-95 shrink-0"
                        aria-label="Previous page"
                    >
                        <IconChevronLeft size={16} strokeWidth={2.5} />
                        <span className="hidden sm:inline text-[11px] font-sans uppercase tracking-widest">Prev</span>
                    </button>

                    {/* Numbered Page Buttons */}
                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                        {getPageNumbers(currentPage, totalPages).map((p, idx) => {
                            if (p === '...') {
                                return (
                                    <span 
                                        key={`ellipsis-${idx}`} 
                                        className="w-6 h-8 sm:w-8 sm:h-9 flex items-center justify-center text-slate-400 text-xs font-mono select-none"
                                    >
                                        ...
                                    </span>
                                );
                            }

                            const pageNum = p as number;
                            const isActive = pageNum === currentPage;

                            return (
                                <button
                                    key={`page-${pageNum}`}
                                    type="button"
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
                                        isActive
                                            ? 'bg-[#10175b] text-white shadow-md shadow-[#10175b]/20 scale-105'
                                            : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-[#10175b] border border-slate-200/80 active:scale-95'
                                    }`}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="h-8 sm:h-9 px-2 sm:px-3.5 flex items-center justify-center gap-1 text-xs font-bold text-slate-600 hover:text-[#10175b] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 active:scale-95 shrink-0"
                        aria-label="Next page"
                    >
                        <span className="hidden sm:inline text-[11px] font-sans uppercase tracking-widest">Next</span>
                        <IconChevronRight size={16} strokeWidth={2.5} />
                    </button>
                </div>
            )}

            {/* Go to Top */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-10 right-10 p-4 bg-[#10175b] text-white rounded-full shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-95 z-50 ${showGoToTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
            >
                <IconArrowUp size={20} strokeWidth={2.5} />
            </button>

            {/* Interactive Flashcards Practice Modal */}
            <FlashcardsModal
                isOpen={isFlashcardsOpen}
                onClose={() => setIsFlashcardsOpen(false)}
                words={filteredVocab}
                title="Paper Vocabulary Practice"
            />
        </div>
    );
}
