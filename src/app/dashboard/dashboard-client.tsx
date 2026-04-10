'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import MobileNav from '@/components/mobile-nav';
import Link from 'next/link';
import { IconBook2, IconBook, IconMicroscopeFilled, IconFileText, IconBookFilled, IconBookmarkFilled, IconArrowRight } from '@tabler/icons-react';

import { AddBookHeaderButton } from './add-book-header-button';
import { coverBackgrounds } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';

const readingQuotes = [
    { text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.", author: "G.R.R. Martin", id: "88-2024-GRRM" },
    { text: "There is no friend as loyal as a book.", author: "Ernest Hemingway", id: "12-1950-HEM" },
    { text: "The reading of all good books is like conversation with the finest men of past centuries.", author: "Rene Descartes", id: "04-1637-DESC" },
    { text: "Books are a uniquely portable magic.", author: "Stephen King", id: "99-2000-KING" },
    { text: "I have always imagined that Paradise will be a kind of library.", author: "Jorge Luis Borges", id: "44-1970-BORG" },
];

const carouselBackdrops = {
    book: [
        "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=2000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1495640388908-05fa85288e61?q=80&w=2000&auto=format&fit=crop"
    ],
    paper: [
        "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?q=80&w=2000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=2000&auto=format&fit=crop"
    ]
};




export default function DashboardPage({
    userName,
    items,
    userVocabCount,
    recentItem,
    oldItems,
    progress,
    isResearcher
}: {
    userName?: string,
    items: any[],
    userVocabCount: number,
    recentItem: any,
    oldItems: any[],
    progress: number,
    isResearcher: boolean
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [heroIndex, setHeroIndex] = useState(0);

    const carouselItems = items.slice(0, Math.min(3, items.length));

    useEffect(() => {
        window.scrollTo(0, 0);
        const scrollContainer = document.getElementById('dashboard-main-scroll');
        if (scrollContainer) scrollContainer.scrollTop = 0;

        const interval = setInterval(() => {
            setQuoteIndex(prev => (prev + 1) % readingQuotes.length);
        }, 8000);

        let heroInterval: NodeJS.Timeout;
        if (carouselItems.length > 1) {
            heroInterval = setInterval(() => {
                setHeroIndex(prev => (prev + 1) % carouselItems.length);
            }, 5000);
        }

        return () => {
            clearInterval(interval);
            if (heroInterval) clearInterval(heroInterval);
        };
    }, [carouselItems.length]);

    return (
        <div className="flex min-h-screen bg-[#F4F5F6]">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <MobileNav onOpenMenu={() => setIsSidebarOpen(true)} />

                <main id="dashboard-main-scroll" className="flex-1 md:ml-56 mt-16 md:mt-0 px-8 py-10 md:px-12 md:py-12 xl:px-24 xl:py-16 overflow-y-scroll overflow-x-hidden scroll-smooth">
                    <div className="max-w-7xl mx-auto">
                        {/* Header / Intro */}
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-12 gap-8">
                            <div className="max-w-2xl w-full">
                                <p className="text-[12px] tracking-[0.2em] font-black text-slate-400 uppercase mb-4">Welcome back, {userName || 'Scholar'}</p>
                                <h2 className="text-5xl md:text-7xl font-serif text-[#10175b] leading-[1.1] tracking-tight">
                                    Your library is an <span className="italic">unwritten</span> chapter.
                                </h2>
                            </div>
                            <div className="shrink-0 mb-2">
                                <AddBookHeaderButton isResearcher={isResearcher} />
                            </div>
                        </div>

                        {carouselItems.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                                    {/* Huge Left Item Card (Carousel) */}
                                    <div className="xl:col-span-2 relative group h-[380px] sm:h-[450px] md:h-[500px] rounded-[2rem] overflow-hidden shadow-xl border border-slate-200/20 group-hover:shadow-2xl transition-all duration-500 will-change-transform isolate">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={`hero-${heroIndex}-${carouselItems[heroIndex].id}`}
                                                initial={{ opacity: 0, scale: 1.02 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.98 }}
                                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                                className="absolute inset-0 w-full h-full"
                                            >
                                                <Link href={carouselItems[heroIndex].type === 'book' ? `/books/${carouselItems[heroIndex].id}` : `/papers/${carouselItems[heroIndex].id}`} className="block w-full h-full relative">
                                                    {/* Backdrop Image */}
                                                    <img
                                                        src={carouselItems[heroIndex].type === 'book'
                                                            ? carouselBackdrops.book[heroIndex % carouselBackdrops.book.length]
                                                            : carouselBackdrops.paper[heroIndex % carouselBackdrops.paper.length]
                                                        }
                                                        alt="Library Backdrop"
                                                        className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-[10000ms] group-hover:scale-105 will-change-transform"
                                                    />

                                                    {/* Dynamic Gradients based on index to ensure distinct feel */}
                                                    <div className={`absolute inset-0 bg-gradient-to-tr ${carouselItems[heroIndex].type === 'book' ? 'from-[#0a0d2e] to-[#0a0d2e]/40' : (heroIndex % 2 === 0 ? 'from-rose-950 to-rose-950/40' : 'from-indigo-950 to-indigo-950/40')} opacity-80`} />
                                                    <div className={`absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t ${carouselItems[heroIndex].type === 'book' ? 'from-[#0a0d2e] via-[#0a0d2e]/60' : (heroIndex % 2 === 0 ? 'from-rose-950 via-rose-950/60' : 'from-indigo-950 via-indigo-950/60')} to-transparent z-10`} />

                                                    <div className="absolute bottom-0 left-0 p-6 sm:p-8 md:p-12 w-full z-20">
                                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                                                            <div className={`${carouselItems[heroIndex].type === 'book' ? 'bg-[#0f766e]' : 'bg-rose-700'} text-white text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.1em] px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-sm flex items-center`}>
                                                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-2" />
                                                                {heroIndex === 0 ? 'Latest Addition' : 'Recently Opened'} {carouselItems[heroIndex].type === 'paper' ? 'Research' : ''}
                                                            </div>
                                                            {heroIndex === 0 && carouselItems[0].type === 'book' && carouselItems[0].totalPages && progress > 0 && (
                                                                <div className="bg-white/10 backdrop-blur text-white text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.1em] px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/20">
                                                                    {progress}% Mastered
                                                                </div>
                                                            )}
                                                        </div>
                                                        <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white leading-tight mb-2 sm:mb-3 drop-shadow-2xl line-clamp-3 md:line-clamp-2">
                                                            {carouselItems[heroIndex].title}
                                                        </h3>
                                                        <p className="text-base sm:text-xl text-slate-300 font-medium drop-shadow-lg italic line-clamp-1">{carouselItems[heroIndex].author || 'Unknown Author'}</p>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        </AnimatePresence>

                                        {/* Carousel Indicators if multiple items */}
                                        {carouselItems.length > 1 && (
                                            <div className="absolute top-6 right-6 z-30 flex gap-2">
                                                {carouselItems.map((_, i) => (
                                                    <button
                                                        key={`indicator-${i}`}
                                                        onClick={() => setHeroIndex(i)}
                                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${i === heroIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/70'}`}
                                                        aria-label={`Go to slide ${i + 1}`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>


                                    <div className="xl:col-span-1 flex flex-col gap-6 h-[500px]">
                                        {/* Daily Progress Card */}
                                        <div className="flex-1 bg-[#10175b] text-white p-6 md:p-8 rounded-[2rem] shadow-xl flex flex-col items-start relative overflow-hidden isolate transform-gpu">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                                            <div className="mb-4 text-white/80">
                                                <IconBook size={28} strokeWidth={1.5} />
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-serif font-bold mb-3 tracking-tight">Daily Progress</h3>
                                            <p className="text-indigo-100/90 text-sm leading-[1.5] font-serif font-medium">
                                                {userVocabCount === 0
                                                    ? "You haven't deciphered any words yet. Start reading to build your vocabulary."
                                                    : `You have successfully translated and deciphered ${userVocabCount} total words across your entire library collection.`}
                                            </p>
                                        </div>

                                        {/* Unique 'Library Archive' Reading Quote Card */}
                                        <div className="flex-1 bg-[#FDFCF7] border-l-8 border-[#10175b] rounded-r-[2rem] rounded-l-md p-6 md:p-8 relative overflow-hidden shadow-xl group transition-all duration-500 hover:shadow-2xl hover:translate-x-1">
                                            {/* Subtle Paper Texture */}
                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-[0.15] pointer-events-none" />

                                            <div className="relative z-10 h-full flex flex-col justify-between">
                                                <AnimatePresence mode="wait">
                                                    <motion.div
                                                        key={quoteIndex}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        transition={{ duration: 0.5 }}
                                                        className="h-full flex flex-col justify-between"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#10175b]/40 mb-0.5">Archive No.</span>
                                                                <span className="text-[11px] font-mono font-bold text-[#10175b]/60">{readingQuotes[quoteIndex].id}</span>
                                                            </div>
                                                            {/* Decorative Red 'Stamp' */}
                                                            <div className="border-2 border-red-600/30 text-red-600/40 text-[8px] font-mono font-black uppercase px-2 py-0.5 rotate-12 rounded-sm select-none">
                                                                Verified
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 flex items-center py-4 min-h-[100px]">
                                                            <p className="text-lg md:text-xl font-serif italic text-[#10175b] leading-snug tracking-tight group-hover:text-black transition-colors duration-500 line-clamp-4">
                                                                "{readingQuotes[quoteIndex].text}"
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <div className="h-[1px] w-8 bg-[#10175b]/20" />
                                                            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#10175b]">
                                                                {readingQuotes[quoteIndex].author}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                </AnimatePresence>
                                            </div>

                                            {/* Corner Fold Effect */}
                                            <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-bl from-slate-200 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                                        </div>

                                    </div>
                                </div>

                                {oldItems.length > 0 && (() => {
                                    const showSeeAll = oldItems.length > 3;
                                    const displayItems = showSeeAll ? oldItems.slice(0, 3) : oldItems;

                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 pb-12">
                                            <div className="col-span-full flex justify-between items-end mb-2">
                                                <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[11px]">Previous Collection</h3>
                                                {showSeeAll && (
                                                    <Link href="/library" className="group flex items-center text-[11px] font-bold text-[#10175b] hover:text-[#10175b]/80 uppercase tracking-widest transition-colors pb-0.5">
                                                        See All <IconArrowRight size={14} strokeWidth={2.5} className="ml-1 transition-transform group-hover:translate-x-1" />
                                                    </Link>
                                                )}
                                            </div>
                                            {displayItems.map((item, index) => (
                                                <Link href={item.type === 'book' ? `/books/${item.id}` : `/papers/${item.id}`} key={item.id} className="group">
                                                    <div className={`relative h-56 rounded-[24px] p-8 overflow-hidden isolate shadow-sm hover:shadow-xl transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-1 transform-gpu`}>
                                                        {/* Dynamic Gradient Background */}
                                                        <div className={`absolute inset-0 bg-gradient-to-br ${item.type === 'book' ? coverBackgrounds[index % coverBackgrounds.length] : 'from-[#0f172a] via-[#1e293b] to-[#0f172a]'} transition-transform duration-700 group-hover:scale-110`} />

                                                        {/* Texture Overlay */}
                                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-10 pointer-events-none mix-blend-overlay" />

                                                        {/* Realistic Paper Fold Corner effect for Books and Papers */}
                                                        <div className="absolute top-0 right-0 w-16 h-16 z-20 group-hover:w-20 group-hover:h-20 transition-all duration-500">
                                                            {/* Erases the top-right corner to blend with dashboard background */}
                                                            <div className="absolute inset-0 bg-[#F4F5F6]" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />

                                                            {/* The folded flap geometry casting a soft realistic shadow */}
                                                            <div className="absolute inset-0 filter drop-shadow-[-3px_3px_5px_rgba(0,0,0,0.5)]">
                                                                <div className="absolute inset-0 bg-gradient-to-bl from-slate-100 to-slate-300 border-l border-b border-white/50 rounded-bl-[24px]" style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }} />
                                                            </div>

                                                            {/* The Icon firmly seated on the flap */}
                                                            <div className="absolute bottom-3 left-3 text-[#0f172a] drop-shadow-sm transition-transform duration-500 group-hover:scale-110 z-30">
                                                                {item.type === 'paper' && <IconMicroscopeFilled size={20} className="text-[#10175b]/30" />}
                                                            </div>
                                                        </div>

                                                        {/* Glassmorphism Effect for text content */}
                                                        <div className="relative z-10 h-full flex flex-col justify-end">
                                                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="text-lg font-serif font-bold text-white line-clamp-1 drop-shadow-sm">{item.title}</h4>
                                                                </div>
                                                                <p className="text-[12px] text-white/70 font-medium line-clamp-1 italic">{item.author || 'Anonymous Author'} {item.year ? `(${item.year})` : ''}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </>
                        ) : (
                            <div className="h-[400px] rounded-[2rem] border border-dashed border-slate-300 bg-white/50 flex flex-col items-center justify-center p-8 text-center">
                                <div className="bg-[#10175b]/5 p-5 rounded-2xl mb-6 shadow-sm border border-[#10175b]/10 text-[#10175b]">
                                    <IconBook2 size={40} />
                                </div>
                                <h3 className="text-2xl font-serif font-bold text-[#10175b]">No entries yet</h3>
                                <p className="mt-3 text-slate-500 font-medium text-lg">Click "Add New" to start exploring.</p>
                            </div>
                        )}
                    </div>
                    <footer className="mt-8 text-center pb-4">
                        <p className="text-[11px] font-sans text-slate-400">
                            © {new Date().getFullYear()} BookBudddy. Built by <a href="https://www.linkedin.com/in/saanusan/" target="_blank" rel="noopener noreferrer" className="hover:text-[#10175b] underline decoration-slate-300 underline-offset-2 transition-colors">P.K. Saanu</a>.
                        </p>
                    </footer>
                </main>
            </div>
        </div>
    );
}
