import { useState } from 'react';
import { UseLanguageSwapReturn } from '../types';

export const useLanguageSwap = (): UseLanguageSwapReturn => {
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');

  const swapLanguages = (
    inputText: string,
    translatedText: string,
    setInputText: (text: string) => void,
    setTranslatedText: (text: string) => void
  ) => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    if (translatedText) {
      setInputText(translatedText);
      setTranslatedText('');
    }
  };

  return {
    sourceLanguage,
    targetLanguage,
    setSourceLanguage,
    setTargetLanguage,
    swapLanguages,
  };
}; 