'use client';

import { useState, useMemo, useEffect } from 'react';
import { PronunciationButton } from './pronunciation-button';
import { DeleteTranslationButton } from './delete-button';
import { Search, ChevronLeft, ChevronRight, ArrowUp, X } from 'lucide-react';

interface Translation {
    id: string;
    originalText: string;
    translatedText: string;
    language: string;
    pageNumber: number | null;
    createdAt: Date;
}

export default function CurationList({ vocab, bookId }: { vocab: Translation[], bookId: string }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showGoToTop, setShowGoToTop] = useState(false);
    const itemsPerPage = 10;

    // Filter items based on search query
    const filteredVocab = useMemo(() => {
        if (!searchQuery.trim()) return vocab;
        const query = searchQuery.toLowerCase();
        return vocab.filter(entry => 
            entry.originalText.toLowerCase().includes(query) || 
            entry.translatedText.toLowerCase().includes(query)
        );
    }, [vocab, searchQuery]);

    // Handle show/hide of "Go to Top" button
    useEffect(() => {
        const handleScroll = () => {
            setShowGoToTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Pagination logic
    const totalPages = Math.ceil(filteredVocab.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedVocab = filteredVocab.slice(startIndex, startIndex + itemsPerPage);

    // Grouping logic (grouped by pageNumber)
    const groupedVocab = useMemo(() => {
        const groups: Record<number, Translation[]> = {};
        paginatedVocab.forEach(entry => {
            const page = entry.pageNumber || 0;
            if (!groups[page]) groups[page] = [];
            groups[page].push(entry);
        });
        // Sort pages descending
        return Object.entries(groups).sort(([a], [b]) => Number(b) - Number(a));
    }, [paginatedVocab]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (vocab.length === 0) {
        return (
            <div className="bg-transparent border border-dashed border-slate-300 rounded-[24px] p-24 text-center">
                <p className="text-slate-400 font-serif italic text-xl">"This curation is currently unwritten. Decipher your first sentence above."</p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Search Bar */}
            <div className="mb-10 relative">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Search size={18} className="text-slate-400" />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                    }}
                    placeholder="Search in your curation..."
                    className="w-full pl-14 pr-12 py-4 bg-white border border-slate-200 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-slate-50 focus:border-[#10175b] transition-all text-sm font-medium text-[#10175b] placeholder:text-slate-300 shadow-sm"
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-5 flex items-center text-slate-300 hover:text-slate-500"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {filteredVocab.length === 0 ? (
                <div className="text-center py-20 bg-slate-50/50 rounded-[32px] border border-slate-100 border-dashed">
                    <p className="text-slate-400 font-serif italic">No matching curations found for "{searchQuery}"</p>
                </div>
            ) : (
                <div className="space-y-16">
                    {groupedVocab.map(([page, entries]) => (
                        <div key={page} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Page Heading */}
                            <div className="flex items-center gap-4">
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-slate-200" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
                                    {page === '0' ? 'NO PAGE' : `PAGE ${page}`}
                                </h3>
                                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-slate-200" />
                            </div>

                            <div className="space-y-12">
                                {entries.map((entry) => {
                                    const dateStr = new Intl.DateTimeFormat('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric'
                                    }).format(new Date(entry.createdAt)).toUpperCase();

                                    return (
                                        <div key={entry.id} className="relative group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1 pr-12">
                                                    <div className="flex items-center gap-3 mb-1.5">
                                                        <h4 className="text-xl md:text-2xl font-serif font-bold text-[#171717] leading-tight group-hover:text-[#10175b] transition-colors">
                                                            {entry.originalText}
                                                        </h4>
                                                        <div className="mt-0.5">
                                                            <PronunciationButton text={entry.originalText} lang="en-US" />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-xl md:text-2xl font-bold text-[#012B5B] tracking-tight">
                                                                {entry.translatedText}
                                                            </p>
                                                            <div className="mt-1">
                                                                <PronunciationButton 
                                                                    text={entry.translatedText} 
                                                                    lang={entry.language === 'Tamil' ? 'ta-IN' : 'si-LK'} 
                                                                />
                                                            </div>
                                                        </div>
                                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                            {entry.language} Translation
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end shrink-0">
                                                    <span className="text-[10px] font-bold text-slate-400 tracking-wider mb-4">{dateStr}</span>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <DeleteTranslationButton id={entry.id} bookId={bookId} />
                                                    </div>
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-20 flex items-center justify-between py-8 border-t border-slate-100">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#10175b] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                        <ChevronLeft size={16} strokeWidth={3} />
                        Previous
                    </button>

                    <div className="flex items-center gap-4">
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#10175b]">
                            {currentPage} / {totalPages}
                        </span>
                    </div>

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#10175b] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                        Next
                        <ChevronRight size={16} strokeWidth={3} />
                    </button>
                </div>
            )}

            {/* Go to Top Navigator */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-10 right-10 p-5 bg-[#10175b] text-white rounded-full shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-95 z-50 ${
                    showGoToTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                }`}
            >
                <ArrowUp size={24} strokeWidth={3} />
            </button>
        </div>
    );
}
