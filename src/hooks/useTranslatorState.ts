import { useState, useCallback } from 'react';

export interface TranslatorState {
  inputText: string;
  selectedTone: string;
  autoDetectEnabled: boolean;
  autoUpdateVoiceLanguage: boolean;
  inputMode: 'text' | 'image';
  isGeneratingExamples: boolean;
  generatedExamples: string[];
}

export const useTranslatorState = () => {
  const [state, setState] = useState<TranslatorState>({
    inputText: '',
    selectedTone: 'neutral',
    autoDetectEnabled: true,
    autoUpdateVoiceLanguage: true,
    inputMode: 'text',
    isGeneratingExamples: false,
    generatedExamples: [],
  });

  const setInputText = useCallback((text: string) => {
    setState(prev => ({ ...prev, inputText: text }));
  }, []);

  const setSelectedTone = useCallback((tone: string) => {
    setState(prev => ({ ...prev, selectedTone: tone }));
  }, []);

  const setAutoDetectEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, autoDetectEnabled: enabled }));
  }, []);

  const setAutoUpdateVoiceLanguage = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, autoUpdateVoiceLanguage: enabled }));
  }, []);

  const setInputMode = useCallback((mode: 'text' | 'image') => {
    setState(prev => ({ ...prev, inputMode: mode }));
  }, []);

  const setIsGeneratingExamples = useCallback((generating: boolean) => {
    setState(prev => ({ ...prev, isGeneratingExamples: generating }));
  }, []);

  const setGeneratedExamples = useCallback((examples: string[]) => {
    setState(prev => ({ ...prev, generatedExamples: examples }));
  }, []);

  const clearGeneratedExamples = useCallback(() => {
    setState(prev => ({ ...prev, generatedExamples: [] }));
  }, []);

  return {
    state,
    setInputText,
    setSelectedTone,
    setAutoDetectEnabled,
    setAutoUpdateVoiceLanguage,
    setInputMode,
    setIsGeneratingExamples,
    setGeneratedExamples,
    clearGeneratedExamples,
  };
}; 