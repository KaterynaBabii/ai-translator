import { useState } from 'react';
import { translateText } from '../helpers';
import { UseTranslationReturn } from '../types';
import { ERROR_MESSAGES } from '../constants';

export const useTranslation = (): UseTranslationReturn => {
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState('');

  const handleTranslate = async (
    inputText: string,
    sourceLanguage: string,
    targetLanguage: string,
    tone: string,
    conversationContext?: string
  ): Promise<string | null> => {
    if (!inputText.trim()) {
      setError('Please enter text to translate');
      return null;
    }

    setIsTranslating(true);
    setError('');

    try {
      const translation = await translateText(
        inputText, 
        sourceLanguage, 
        targetLanguage, 
        tone,
        conversationContext
      );
      setTranslatedText(translation);
      return translation;
    } catch (err) {
      setError(ERROR_MESSAGES.TRANSLATION_FAILED);
      console.error('Translation error:', err);
      return null;
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    translatedText,
    isTranslating,
    error,
    setError,
    handleTranslate,
    setTranslatedText,
  };
}; 