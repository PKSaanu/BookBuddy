export interface DictionaryDefinition {
  definition: string;
  example?: string;
  synonyms?: string[];
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
}

export interface EnglishDictionaryData {
  word: string;
  phonetic?: string;
  audio?: string;
  meanings: DictionaryMeaning[];
}

export interface AlternativeMeaningEntry {
  partOfSpeech: string;
  meanings: string[];
}

export interface TranslationResponse {
  translatedText: string;
  correctedText?: string;
  alternativeMeanings?: AlternativeMeaningEntry[];
  englishDictionary?: EnglishDictionaryData;
  error?: string;
}

