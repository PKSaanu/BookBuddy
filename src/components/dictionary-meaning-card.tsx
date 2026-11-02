'use client';

import { useState } from 'react';
import { 
  IconBook, 
  IconChevronDown, 
  IconChevronUp, 
  IconSparkles,
  IconQuote
} from '@tabler/icons-react';
import { EnglishDictionaryData, AlternativeMeaningEntry } from '@/types/dictionary';

interface DictionaryMeaningCardProps {
  englishDictionary?: EnglishDictionaryData | null;
  alternativeMeanings?: AlternativeMeaningEntry[] | null;
  targetLanguage?: string;
  onSelectAlternative?: (meaning: string) => void;
}

export default function DictionaryMeaningCard({
  englishDictionary,
  alternativeMeanings,
  targetLanguage = 'Tamil',
  onSelectAlternative
}: DictionaryMeaningCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasEnglishMeanings = Boolean(
    englishDictionary && englishDictionary.meanings && englishDictionary.meanings.length > 0
  );

  const hasAlternatives = Boolean(
    alternativeMeanings && alternativeMeanings.length > 0
  );

  if (!hasEnglishMeanings && !hasAlternatives) {
    return null;
  }

  // Count total definitions to determine if collapse toggle is helpful on mobile
  const allMeanings = englishDictionary?.meanings || [];
  const totalDefinitions = allMeanings.reduce(
    (acc, m) => acc + (m.definitions ? m.definitions.length : 0), 
    0
  );
  const shouldAllowToggle = totalDefinitions > 2 || allMeanings.length > 1;

  // If compact or mobile collapsed, only show the first meaning and its first definition
  const visibleMeanings = (!isExpanded && shouldAllowToggle) 
    ? [
        {
          ...allMeanings[0],
          definitions: (allMeanings[0]?.definitions || []).slice(0, 1)
        }
      ]
    : allMeanings;

  return (
    <div className="w-full space-y-3 mt-3 animate-in fade-in slide-in-from-top-1 duration-300">
      
      {/* 1. English Dictionary Meaning Section */}
      {hasEnglishMeanings && (
        <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="p-1 rounded-md bg-[#10175b]/5 text-[#10175b]">
                <IconBook size={13} strokeWidth={2.5} />
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#10175b]">
                English Meaning
              </span>
              {englishDictionary?.phonetic && (
                <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200/60">
                  {englishDictionary.phonetic}
                </span>
              )}
            </div>

            {shouldAllowToggle && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 py-1 px-1.5 rounded hover:bg-indigo-50 transition-colors"
              >
                <span>{isExpanded ? 'Less' : 'More'}</span>
                {isExpanded ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
              </button>
            )}
          </div>

          {/* Definitions List */}
          <div className="space-y-2.5">
            {visibleMeanings.map((meaning, mIdx) => (
              <div key={mIdx} className="space-y-1.5">
                {meaning.partOfSpeech && (
                  <span className="inline-block text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-100/70 text-indigo-800">
                    {meaning.partOfSpeech}
                  </span>
                )}

                {meaning.definitions.map((def, dIdx) => (
                  <div key={dIdx} className="text-left space-y-1 pl-1">
                    <p className="text-[12px] sm:text-[13px] text-slate-800 font-serif leading-snug">
                      {def.definition}
                    </p>

                    {def.example && (
                      <div className="flex items-start gap-1.5 text-[11px] text-slate-500 italic bg-white/80 p-1.5 rounded-lg border-l-2 border-indigo-400">
                        <IconQuote size={11} className="shrink-0 mt-0.5 text-indigo-400 rotate-180" />
                        <span className="leading-tight">&ldquo;{def.example}&rdquo;</span>
                      </div>
                    )}

                    {def.synonyms && def.synonyms.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-0.5">
                        <span className="text-[9px] text-slate-400 uppercase font-semibold">Syn:</span>
                        {def.synonyms.map((syn, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200/60"
                          >
                            {syn}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Alternative Meanings in Target Language (Tamil / Sinhala) */}
      {alternativeMeanings && alternativeMeanings.length > 0 && (
        <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-3 sm:p-4 shadow-xs">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="p-1 rounded-md bg-amber-500/10 text-amber-800">
              <IconSparkles size={13} strokeWidth={2.5} />
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-900">
              Other {targetLanguage} Meanings
            </span>
          </div>

          <div className="space-y-2">
            {alternativeMeanings.map((entry, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                {entry.partOfSpeech && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800/80">
                    {entry.partOfSpeech}:
                  </span>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {entry.meanings.map((meaning, mIdx) => (
                    <button
                      key={mIdx}
                      type="button"
                      onClick={() => onSelectAlternative?.(meaning)}
                      className={`text-[11px] sm:text-[12px] font-serif font-medium px-2 py-1 rounded-lg transition-all active:scale-95 ${
                        onSelectAlternative 
                          ? 'bg-white border border-amber-200 text-amber-950 hover:bg-amber-100/70 hover:border-amber-300 shadow-2xs cursor-pointer'
                          : 'bg-white border border-amber-200/70 text-amber-950 shadow-2xs cursor-default'
                      }`}
                      title={onSelectAlternative ? `Use "${meaning}" as main translation` : undefined}
                    >
                      {meaning}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
