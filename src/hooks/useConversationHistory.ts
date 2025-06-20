import { useState, useEffect, useCallback } from 'react';

interface ConversationEntry {
  id: string;
  timestamp: number;
  sourceLanguage: string;
  targetLanguage: string;
  originalText: string;
  translatedText: string;
  tone: string;
  context?: string;
}

interface UseConversationHistoryReturn {
  conversationHistory: ConversationEntry[];
  addToHistory: (entry: Omit<ConversationEntry, 'id' | 'timestamp'>) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  getContextForTranslation: (sourceLanguage: string, targetLanguage: string, tone: string, currentText: string) => string;
  getSimilarTranslations: (text: string, sourceLanguage: string, targetLanguage: string, tone: string) => ConversationEntry[];
}

const STORAGE_KEY = 'ai-translator-conversation-history';
const MAX_HISTORY_SIZE = 100;

export const useConversationHistory = (): UseConversationHistoryReturn => {
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(STORAGE_KEY);
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        setConversationHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Failed to load conversation history from localStorage:', error);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversationHistory));
    } catch (error) {
      console.error('Failed to save conversation history to localStorage:', error);
    }
  }, [conversationHistory]);

  const addToHistory = useCallback((entry: Omit<ConversationEntry, 'id' | 'timestamp'>) => {
    const newEntry: ConversationEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };

    setConversationHistory(prevHistory => {
      // Add new entry at the beginning
      const updatedHistory = [newEntry, ...prevHistory];
      
      // Keep only the most recent entries
      return updatedHistory.slice(0, MAX_HISTORY_SIZE);
    });
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setConversationHistory(prevHistory => 
      prevHistory.filter(entry => entry.id !== id)
    );
  }, []);

  const clearHistory = useCallback(() => {
    setConversationHistory([]);
    // Also remove from localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear conversation history from localStorage:', error);
    }
  }, []);

  const getContextForTranslation = useCallback((
    sourceLanguage: string, 
    targetLanguage: string, 
    tone: string, 
    currentText: string
  ): string => {
    // Get recent translations for the same language pair and tone
    const relevantHistory = conversationHistory
      .filter(entry => 
        entry.sourceLanguage === sourceLanguage && 
        entry.targetLanguage === targetLanguage &&
        entry.tone === tone
      )
      .slice(0, 5); // Get last 5 relevant translations

    if (relevantHistory.length === 0) {
      return '';
    }

    const contextEntries = relevantHistory.map(entry => 
      `Original: "${entry.originalText}"\nTranslation: "${entry.translatedText}"`
    );

    return `Previous translations for ${sourceLanguage} to ${targetLanguage} (${tone} tone):\n${contextEntries.join('\n\n')}`;
  }, [conversationHistory]);

  const getSimilarTranslations = useCallback((
    text: string, 
    sourceLanguage: string, 
    targetLanguage: string, 
    tone: string
  ): ConversationEntry[] => {
    const lowerText = text.toLowerCase().trim();
    
    return conversationHistory.filter(entry => 
      entry.sourceLanguage === sourceLanguage && 
      entry.targetLanguage === targetLanguage &&
      entry.tone === tone &&
      (entry.originalText.toLowerCase().includes(lowerText) || 
       lowerText.includes(entry.originalText.toLowerCase()))
    );
  }, [conversationHistory]);

  return {
    conversationHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getContextForTranslation,
    getSimilarTranslations,
  };
}; 