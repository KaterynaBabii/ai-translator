import { useState, useCallback } from 'react';
import { detectLanguage } from '../helpers';

interface UseLanguageDetectionReturn {
  isDetecting: boolean;
  detectedLanguage: string | null;
  detectInputLanguage: (text: string) => Promise<string>;
  resetDetection: () => void;
}

export const useLanguageDetection = (): UseLanguageDetectionReturn => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);

  const detectInputLanguage = useCallback(async (text: string): Promise<string> => {
    if (!text.trim()) {
      return 'en'; // Default to English for empty text
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