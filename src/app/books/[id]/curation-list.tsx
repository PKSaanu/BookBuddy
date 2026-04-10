'use client';

import { useState, useMemo, useEffect } from 'react';
import { PronunciationButton } from './pronunciation-button';
import { DeleteTranslationButton } from './delete-button';
import { IconSearch, IconChevronLeft, IconChevronRight, IconArrowUp, IconX } from '@tabler/icons-react';

interface Translation {
    id: string;
    originalText: string;
    translatedText: string;
    language: string;
    pageNumber: number | null;
    createdAt: Date;
}

export default function CurationList({ 
    vocab, 
    bookId
}: { 
    vocab: Translation[], 
    bookId: string
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showGoToTop, setShowGoToTop] = useState(false);
    const itemsPerPage = 10;

    const filteredVocab = useMemo(() => {
        if (!searchQuery.trim()) return vocab;
        const query = searchQuery.toLowerCase();
        return vocab.filter(entry =>
            entry.originalText.toLowerCase().includes(query) ||
            entry.translatedText.toLowerCase().includes(query)
        );
    }, [vocab, searchQuery]);

    useEffect(() => {
        const handleScroll = () => {
            setShowGoToTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
    useEffect(() => { setHasMounted(true); }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

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
                <p className="text-slate-400 font-serif italic text-xl">"This curation is currently unwritten. Decipher your first sentence above."</p>
            </div>
        );
    }

    return (
        <div className="relative">

            {/* Search */}
            <div className="mb-8 relative">
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

            {filteredVocab.length === 0 ? (
                <div className="text-center py-16 bg-slate-50/50 rounded-[28px] border border-dashed border-slate-100">
                    <p className="text-slate-400 font-serif italic">No matching curations found for "{searchQuery}"</p>
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

                                    return (
                                        <div key={entry.id} className="group relative flex justify-between items-start gap-4 py-5 hover:bg-slate-50/60 -mx-4 px-4 rounded-xl transition-colors duration-200">

                                            {/* Left: text content */}
                                            <div className="flex-1 min-w-0">
                                                {/* English */}
                                                <div className="flex items-center gap-2 mb-4">
                                                    <h4 className="text-lg font-serif font-semibold text-[#171717] leading-tight group-hover:text-[#10175b] transition-colors truncate">
                                                        {entry.originalText}
                                                    </h4>
                                                    <div className="shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                        <PronunciationButton 
                                                            text={entry.originalText} 
                                                            lang="en-US" 
                                                        />
                                                    </div>
                                                </div>

                                                {/* Translation */}
                                                <div className="flex items-center gap-2">
                                                    <p className="text-lg font-sm text-[#012B5B] leading-tight truncate">
                                                        {entry.translatedText}
                                                    </p>
                                                </div>

                                                <p className="text-[9px] font-bold font-sans uppercase tracking-[0.2em] text-slate-400 mt-1.5">
                                                    {entry.language} Translation
                                                </p>
                                            </div>

                                            {/* Right: date + delete */}
                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                <span className="text-[10px] font-sans text-slate-400 tracking-wide">{dateStr}</span>
                                                <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    <DeleteTranslationButton id={entry.id} bookId={bookId} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-between py-6 border-t border-slate-100">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="flex items-center gap-2 text-[11px] font-bold font-sans uppercase tracking-widest text-slate-400 hover:text-[#10175b] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                        <IconChevronLeft size={14} strokeWidth={2.5} />
                        Previous
                    </button>

                    <span className="text-[11px] font-bold font-sans text-[#10175b] px-4 py-1.5 bg-[#10175b]/5 rounded-full">
                        {currentPage} / {totalPages}
                    </span>

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="flex items-center gap-2 text-[11px] font-bold font-sans uppercase tracking-widest text-slate-400 hover:text-[#10175b] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                        Next
                        <IconChevronRight size={14} strokeWidth={2.5} />
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
        </div>
    );
}
