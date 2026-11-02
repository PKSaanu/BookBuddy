'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconX, 
  IconVolume, 
  IconRotate, 
  IconCheck, 
  IconRefresh, 
  IconTrophy, 
  IconCards,
  IconArrowLeft
} from '@tabler/icons-react';
import { selectBestVoice } from '@/lib/audio';

export interface FlashcardItem {
  id?: string;
  originalText: string;
  translatedText: string;
  language?: string;
  pageNumber?: number | null;
}

interface FlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  words: FlashcardItem[];
  title?: string;
  preferredLanguage?: string;
}

export default function FlashcardsModal({
  isOpen,
  onClose,
  words,
  title = 'Vocabulary Practice',
  preferredLanguage = 'Tamil'
}: FlashcardsModalProps) {
  // Active review deck
  const [deck, setDeck] = useState<FlashcardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);

  // Review scores
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<string>>(new Set());
  const [isFinished, setIsFinished] = useState(false);

  // Definition cache for back of card
  const [definitionCache, setDefinitionCache] = useState<Record<string, { definition: string; example?: string }>>({});

  // Helper to get unique key for a word
  const getWordKey = (item: FlashcardItem) => item.id || item.originalText.trim().toLowerCase();

  // Reset/initialize deck asynchronously when modal opens
  useEffect(() => {
    if (!isOpen || words.length === 0) return;

    const timer = setTimeout(() => {
      setDeck([...words]);
      setCurrentIndex(0);
      setIsFlipped(false);
      setMasteredIds(new Set());
      setReviewIds(new Set());
      setIsFinished(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [isOpen, words]);

  const currentCard = deck[currentIndex];

  // Speech synthesis audio helper
  const speakText = useCallback((textToSpeak: string, langCode: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = selectBestVoice(voices, langCode);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.lang = langCode;
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Fetch definition when current card is flipped
  useEffect(() => {
    if (!currentCard || !isFlipped) return;

    const wordKey = currentCard.originalText.trim().toLowerCase();
    const isSingleWord = !wordKey.includes(' ');

    if (!isSingleWord || definitionCache[wordKey]) return;

    let cancelled = false;

    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(wordKey)}`, {
      signal: AbortSignal.timeout(3000)
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0].meanings)) {
          const firstDef = data[0].meanings[0]?.definitions?.[0];
          if (firstDef?.definition) {
            setDefinitionCache(prev => ({
              ...prev,
              [wordKey]: {
                definition: firstDef.definition,
                example: firstDef.example
              }
            }));
          }
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [currentCard, isFlipped, definitionCache]);

  // Shuffle toggle
  const handleToggleShuffle = () => {
    if (isShuffled) {
      setDeck([...words]);
      setIsShuffled(false);
    } else {
      const shuffled = [...deck].sort(() => Math.random() - 0.5);
      setDeck(shuffled);
      setIsShuffled(true);
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Move to next card
  const handleRateCard = useCallback((mastered: boolean) => {
    if (!currentCard) return;

    const key = getWordKey(currentCard);

    if (mastered) {
      setMasteredIds(prev => new Set(prev).add(key));
      setReviewIds(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    } else {
      setReviewIds(prev => new Set(prev).add(key));
      setMasteredIds(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }

    if (currentIndex + 1 < deck.length) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  }, [currentCard, currentIndex, deck.length]);

  // Restart only words that need review
  const handlePracticeMissedOnly = () => {
    const missedCards = words.filter(w => reviewIds.has(getWordKey(w)));
    if (missedCards.length > 0) {
      setDeck(missedCards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsFinished(false);
    }
  };

  // Restart full deck
  const handleRestartFullDeck = () => {
    setDeck([...words]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredIds(new Set());
    setReviewIds(new Set());
    setIsFinished(false);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (isFinished) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.key === 'ArrowLeft' || e.key === '1') {
        e.preventDefault();
        handleRateCard(false);
      } else if (e.key === 'ArrowRight' || e.key === '2') {
        e.preventDefault();
        handleRateCard(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFinished, isFlipped, handleRateCard, onClose]);

  if (!isOpen) return null;

  const totalCards = deck.length;
  const progressPercent = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;
  const currentDef = currentCard ? definitionCache[currentCard.originalText.trim().toLowerCase()] : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] bg-[#0c1033]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-xl bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto"
        >
          {/* Header Bar */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#10175b] text-white">
                <IconCards size={18} />
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#10175b] line-clamp-1">
                  {title}
                </h2>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400">
                  {totalCards} {totalCards === 1 ? 'Card' : 'Cards'} in deck
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {!isFinished && totalCards > 1 && (
                <button
                  type="button"
                  onClick={handleToggleShuffle}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 active:scale-95 ${
                    isShuffled
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Shuffle deck"
                >
                  <IconRefresh size={13} className={isShuffled ? 'rotate-180 transition-transform' : ''} />
                  <span className="hidden sm:inline">Shuffle</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors active:scale-95"
                aria-label="Close flashcards"
              >
                <IconX size={18} />
              </button>
            </div>
          </div>

          {/* Progress Bar (During review) */}
          {!isFinished && totalCards > 0 && (
            <div className="w-full bg-slate-100 h-1.5 relative overflow-hidden">
              <motion.div
                className="bg-[#10175b] h-full"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}

          {/* Modal Content */}
          <div className="p-4 sm:p-6 flex-1 flex flex-col justify-center items-center">
            
            {/* Empty State */}
            {totalCards === 0 ? (
              <div className="py-16 text-center space-y-3">
                <p className="text-slate-400 font-serif italic text-base">
                  &ldquo;No vocabulary words saved yet. Highlight and save words while reading to practice!&rdquo;
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#10175b] text-white text-xs font-bold shadow-md hover:bg-[#1a2066]"
                >
                  Return to Reading
                </button>
              </div>
            ) : isFinished ? (
              /* Completion Celebration Screen */
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-6 w-full max-w-sm"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500 shadow-inner">
                  <IconTrophy size={36} strokeWidth={2} />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#10175b]">
                    Practice Complete!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    You reviewed all {totalCards} cards in this session.
                  </p>
                </div>

                {/* Score Pills */}
                <div className="grid grid-cols-2 gap-3 py-2">
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <span className="block text-2xl font-bold text-emerald-700">
                      {masteredIds.size}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      Mastered
                    </span>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl">
                    <span className="block text-2xl font-bold text-amber-700">
                      {reviewIds.size}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                      Needs Review
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  {reviewIds.size > 0 && (
                    <button
                      type="button"
                      onClick={handlePracticeMissedOnly}
                      className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                    >
                      <IconRotate size={16} />
                      <span>Review Missed Words ({reviewIds.size})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleRestartFullDeck}
                    className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all active:scale-98 flex items-center justify-center gap-2"
                  >
                    <IconRefresh size={16} />
                    <span>Practice All Again</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 text-xs text-slate-400 font-bold hover:text-slate-600 transition-colors"
                  >
                    Close Session
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Active Flashcard View */
              <div className="w-full flex flex-col items-center space-y-5">
                
                {/* Stats & Progress indicators */}
                <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
                  <span className="text-[#10175b] font-mono">
                    Card {currentIndex + 1} of {totalCards}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {masteredIds.size} Mastered
                    </span>
                    <span className="text-amber-600 flex items-center gap-1 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      {reviewIds.size} Review
                    </span>
                  </div>
                </div>

                {/* 3D Flip Card Container */}
                <div 
                  className="w-full [perspective:1000px] cursor-pointer min-h-[290px] sm:min-h-[330px]"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <div 
                    className="relative w-full h-full min-h-[290px] sm:min-h-[330px] rounded-3xl transition-transform duration-500 [transform-style:preserve-3d] shadow-lg hover:shadow-xl"
                    style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                  >
                    
                    {/* Front Face: English Word */}
                    <div className="absolute inset-0 [backface-visibility:hidden] bg-gradient-to-b from-white to-slate-50/70 border border-slate-200/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#10175b]/50">
                          English Word
                        </span>
                        {typeof currentCard.pageNumber === 'number' && currentCard.pageNumber > 0 && (
                          <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                            Page {currentCard.pageNumber}
                          </span>
                        )}
                      </div>

                      <div className="my-auto text-center space-y-3 py-4">
                        <h4 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#10175b] tracking-tight leading-tight">
                          {currentCard.originalText}
                        </h4>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakText(currentCard.originalText, 'en-US');
                          }}
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-bold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors active:scale-95"
                          title="Listen to English pronunciation"
                        >
                          <IconVolume size={15} />
                          <span>Listen</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium">
                        <IconRotate size={13} />
                        <span>Tap anywhere to flip card</span>
                      </div>
                    </div>

                    {/* Back Face: Tamil Translation & English Meaning */}
                    <div 
                      className="absolute inset-0 [backface-visibility:hidden] bg-gradient-to-b from-white to-amber-50/20 border border-amber-200/70 rounded-3xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto custom-scrollbar"
                      style={{ transform: 'rotateY(180deg)' }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700/80">
                          {currentCard.language || preferredLanguage} Translation
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const targetLangCode = (currentCard.language || preferredLanguage) === 'Tamil' ? 'ta-IN' : 'si-LK';
                            speakText(currentCard.translatedText, targetLangCode);
                          }}
                          className="p-1.5 rounded-full text-amber-800 bg-amber-100/60 hover:bg-amber-100 transition-colors active:scale-95"
                          title="Listen to translation"
                        >
                          <IconVolume size={15} />
                        </button>
                      </div>

                      <div className="my-auto text-center py-2 space-y-3">
                        <h4 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#10175b] tracking-tight leading-tight">
                          {currentCard.translatedText}
                        </h4>

                        {/* English Meaning Preview */}
                        {currentDef && (
                          <div className="text-left bg-slate-50/90 border border-slate-200/70 rounded-xl p-3 space-y-1 mt-2">
                            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Meaning</span>
                            <p className="text-xs sm:text-[13px] font-serif text-slate-700 leading-snug">
                              {currentDef.definition}
                            </p>
                            {currentDef.example && (
                              <p className="text-[11px] font-serif italic text-slate-500 pt-0.5">
                                &ldquo;{currentDef.example}&rdquo;
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium">
                        <IconRotate size={13} />
                        <span>Tap to flip back</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Rating Action Controls */}
                <div className="w-full flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRateCard(false);
                    }}
                    className="flex-1 py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs sm:text-sm transition-all shadow-xs active:scale-95 flex items-center justify-center gap-2"
                  >
                    <IconArrowLeft size={16} className="text-amber-600" />
                    <span>Still Learning</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRateCard(true);
                    }}
                    className="flex-1 py-3 px-4 rounded-2xl bg-[#10175b] hover:bg-[#1a2066] text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Mastered</span>
                    <IconCheck size={16} className="text-emerald-400" strokeWidth={3} />
                  </button>
                </div>

                {/* Keyboard Shortcuts Hint (Desktop only) */}
                <div className="hidden sm:flex items-center gap-4 text-[10px] text-slate-400 font-mono pt-1">
                  <span>[Space] Flip</span>
                  <span>[←] Review</span>
                  <span>[→] Mastered</span>
                </div>

              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
