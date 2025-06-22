import { useState, useEffect, useCallback } from 'react';
import { VocabularyEntry, UseVocabularyReturn } from '../types';
import { STORAGE_KEYS, UI_CONSTANTS } from '../constants';

const detectDifficulty = (text: string): 'easy' | 'medium' | 'hard' => {
  const wordCount = text.trim().split(/\s+/).length;
  const hasSpecialChars = /[^a-zA-Z0-9\s]/.test(text);
  const hasLongWords = text.split(/\s+/).some(word => word.length > 8);
  
  if (wordCount === 1 && !hasSpecialChars && !hasLongWords) {
    return 'easy';
  } else if (wordCount <= 3 && !hasLongWords) {
    return 'medium';
  } else {
    return 'hard';
  }
};

export const useVocabulary = (): UseVocabularyReturn => {
  const [vocabulary, setVocabulary] = useState<VocabularyEntry[]>([]);

  useEffect(() => {
    try {
      const storedVocabulary = localStorage.getItem(STORAGE_KEYS.VOCABULARY);
      if (storedVocabulary) {
        const parsedVocabulary = JSON.parse(storedVocabulary);
        setVocabulary(parsedVocabulary);
      }
    } catch (error) {
      console.error('Failed to load vocabulary from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify(vocabulary));
    } catch (error) {
      console.error('Failed to save vocabulary to localStorage:', error);
    }
  }, [vocabulary]);

  const addToVocabulary = useCallback((entry: Omit<VocabularyEntry, 'id' | 'timestamp' | 'reviewCount' | 'difficulty'>) => {
    const newEntry: VocabularyEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      reviewCount: 0,
      difficulty: detectDifficulty(entry.originalText),
    };

    setVocabulary(prevVocabulary => {
      const exists = prevVocabulary.some(item => 
        item.originalText.toLowerCase() === entry.originalText.toLowerCase() &&
        item.sourceLanguage === entry.sourceLanguage &&
        item.targetLanguage === entry.targetLanguage
      );

      if (exists) {
        return prevVocabulary;
      }

      const updatedVocabulary = [newEntry, ...prevVocabulary];
      return updatedVocabulary.slice(0, UI_CONSTANTS.MAX_VOCABULARY_SIZE);
    });
  }, []);

  const removeFromVocabulary = useCallback((id: string) => {
    setVocabulary(prevVocabulary => 
      prevVocabulary.filter(entry => entry.id !== id)
    );
  }, []);

  const updateVocabularyEntry = useCallback((id: string, updates: Partial<VocabularyEntry>) => {
    setVocabulary(prevVocabulary =>
      prevVocabulary.map(entry =>
        entry.id === id ? { ...entry, ...updates } : entry
      )
    );
  }, []);

  const clearVocabulary = useCallback(() => {
    setVocabulary([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.VOCABULARY);
    } catch (error) {
      console.error('Failed to clear vocabulary from localStorage:', error);
    }
  }, []);

  const markAsReviewed = useCallback((id: string) => {
    setVocabulary(prevVocabulary =>
      prevVocabulary.map(entry =>
        entry.id === id
          ? {
              ...entry,
              lastReviewed: Date.now(),
              reviewCount: entry.reviewCount + 1,
            }
          : entry
      )
    );
  }, []);

  const generateLearningContent = useCallback(async (entry: VocabularyEntry) => {
    try {
      const { generateExampleSentences } = await import('../helpers');
      
      const existingExamples = entry.exampleSentences || [];
      
      const newExampleSentences = await generateExampleSentences(
        entry.translatedText,
        entry.targetLanguage,
        existingExamples,
        entry.tone
      );

      const allExamples = [...existingExamples, ...newExampleSentences];

      updateVocabularyEntry(entry.id, {
        exampleSentences: allExamples,
      });

    } catch (error) {
      console.error('Failed to generate learning content:', error);
    }
  }, [updateVocabularyEntry]);

  const getVocabularyByLanguage = useCallback((sourceLanguage: string, targetLanguage: string) => {
    return vocabulary.filter(entry => 
      entry.sourceLanguage === sourceLanguage && 
      entry.targetLanguage === targetLanguage
    );
  }, [vocabulary]);

  const getVocabularyByDifficulty = useCallback((difficulty: 'easy' | 'medium' | 'hard') => {
    return vocabulary.filter(entry => entry.difficulty === difficulty);
  }, [vocabulary]);

  const getVocabularyForReview = useCallback(() => {
    const now = Date.now();
    
    return vocabulary.filter(entry => {
      return !entry.lastReviewed || (now - entry.lastReviewed) > UI_CONSTANTS.REVIEW_INTERVAL;
    }).sort((a, b) => {
      if (a.reviewCount !== b.reviewCount) {
        return a.reviewCount - b.reviewCount;
      }
      return a.timestamp - b.timestamp;
    });
  }, [vocabulary]);

  return {
    vocabulary,
    addToVocabulary,
    removeFromVocabulary,
    updateVocabularyEntry,
    clearVocabulary,
    markAsReviewed,
    generateLearningContent,
    getVocabularyByLanguage,
    getVocabularyByDifficulty,
    getVocabularyForReview,
  };
}; 