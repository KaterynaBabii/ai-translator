import { useState, useCallback } from 'react';
import { detectLanguage } from '../helpers';
import { UseLanguageDetectionReturn } from '../types';

export const useLanguageDetection = (): UseLanguageDetectionReturn => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);

  const detectInputLanguage = useCallback(async (text: string): Promise<string> => {
    if (!text.trim()) {
      return 'en';
    }

    setIsDetecting(true);
    
    try {
      const detected = await detectLanguage(text);
      setDetectedLanguage(detected);
      return detected;
    } catch (error) {
      console.error('Language detection failed:', error);
      setDetectedLanguage('en');
      return 'en';
    } finally {
      setIsDetecting(false);
    }
  }, []);

  const resetDetection = useCallback(() => {
    setDetectedLanguage(null);
  }, []);

  return {
    isDetecting,
    detectedLanguage,
    detectInputLanguage,
    resetDetection,
  };
}; 