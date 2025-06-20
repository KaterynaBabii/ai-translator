import { useState, useCallback } from 'react';
import { UseSlangDetectionReturn, SlangDetectionResult } from '../types';
import { SLANG_PATTERNS } from '../constants';

export const useSlangDetection = (): UseSlangDetectionReturn => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<SlangDetectionResult | null>(null);

  const analyzeText = useCallback(async (text: string, sourceLanguage: string): Promise<SlangDetectionResult> => {
    if (!text.trim()) {
      return {
        hasSlang: false,
        slangTerms: [],
        suggestions: [],
        context: '',
      };
    }

    setIsAnalyzing(true);

    try {
      const patterns = SLANG_PATTERNS[sourceLanguage as keyof typeof SLANG_PATTERNS] || [];
      
      const slangTerms: string[] = [];
      const suggestions: string[] = [];

      patterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
          slangTerms.push(...matches);
        }
      });

      let context = '';
      if (slangTerms.length > 0) {
        context = `This text contains ${slangTerms.length} slang or idiomatic expression${slangTerms.length > 1 ? 's' : ''}: ${slangTerms.join(', ')}. Please translate these naturally and contextually, not literally.`;
        
        slangTerms.forEach(term => {
          const lowerTerm = term.toLowerCase();
          if (lowerTerm.includes('what') && lowerTerm.includes('up')) {
            suggestions.push('Consider translating "What\'s up?" as a natural greeting equivalent');
          } else if (lowerTerm.includes('cool')) {
            suggestions.push('Translate "cool" as an appropriate casual expression in the target language');
          } else if (lowerTerm.includes('break') && lowerTerm.includes('leg')) {
            suggestions.push('Translate "break a leg" as a cultural equivalent for good luck');
          } else if (lowerTerm.includes('piece') && lowerTerm.includes('cake')) {
            suggestions.push('Translate "piece of cake" as a natural equivalent for "easy"');
          }
        });
      }

      const result: SlangDetectionResult = {
        hasSlang: slangTerms.length > 0,
        slangTerms,
        suggestions,
        context,
      };

      setDetectionResult(result);
      return result;
    } catch (error) {
      console.error('Slang detection error:', error);
      return {
        hasSlang: false,
        slangTerms: [],
        suggestions: [],
        context: '',
      };
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setDetectionResult(null);
  }, []);

  return {
    isAnalyzing,
    detectionResult,
    analyzeText,
    clearAnalysis,
  };
}; 