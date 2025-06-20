import { useState, useEffect, useCallback } from 'react';
import { ConversationEntry, UseConversationHistoryReturn } from '../types';
import { STORAGE_KEYS, UI_CONSTANTS } from '../constants';

export const useConversationHistory = (): UseConversationHistoryReturn => {
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(STORAGE_KEYS.CONVERSATION_HISTORY);
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        setConversationHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Failed to load conversation history from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATION_HISTORY, JSON.stringify(conversationHistory));
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
      const updatedHistory = [newEntry, ...prevHistory];
      
      return updatedHistory.slice(0, UI_CONSTANTS.MAX_HISTORY_SIZE);
    });
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setConversationHistory(prevHistory => 
      prevHistory.filter(entry => entry.id !== id)
    );
  }, []);

  const clearHistory = useCallback(() => {
    setConversationHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.CONVERSATION_HISTORY);
    } catch (error) {
      console.error('Failed to clear conversation history from localStorage:', error);
    }
  }, []);

  const getContextForTranslation = useCallback((
    sourceLanguage: string, 
    targetLanguage: string, 
    tone: string
  ): string => {
    const relevantHistory = conversationHistory
      .filter(entry => 
        entry.sourceLanguage === sourceLanguage && 
        entry.targetLanguage === targetLanguage &&
        entry.tone === tone
      )
      .slice(0, 5);

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