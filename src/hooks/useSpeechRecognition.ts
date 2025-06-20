import { useState, useEffect, useCallback } from 'react';
import { LANGUAGES, detectLanguage } from '../helpers';

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  startListening: (onTranscript: (transcript: string) => void) => void;
  error: string;
  setError: (error: string) => void;
  detectedVoiceLanguage: string | null;
}

// Language codes for Web Speech API
const SPEECH_LANGUAGE_CODES = {
  'en': 'en-US',
  'es': 'es-ES',
  'fr': 'fr-FR',
  'de': 'de-DE',
  'it': 'it-IT',
  'pt': 'pt-PT',
  'ukr': 'uk-UA',
  'ja': 'ja-JP',
  'ko': 'ko-KR',
  'zh': 'zh-CN',
};

export const useSpeechRecognition = (sourceLanguage: string): UseSpeechRecognitionReturn => {
  const [recognition, setRecognition] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [detectedVoiceLanguage, setDetectedVoiceLanguage] = useState<string | null>(null);

  // Initialize speech recognition with automatic language detection
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      // Configure for automatic language detection
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      
      // Try to use the source language if available, otherwise use auto-detection
      const speechLangCode = SPEECH_LANGUAGE_CODES[sourceLanguage as keyof typeof SPEECH_LANGUAGE_CODES];
      if (speechLangCode) {
        recognitionInstance.lang = speechLangCode;
      } else {
        // Fallback to auto-detection for unsupported languages
        recognitionInstance.lang = 'en-US';
      }
      
      setRecognition(recognitionInstance);
    }
  }, [sourceLanguage]);

  const detectLanguageFromSpeech = useCallback(async (transcript: string): Promise<string> => {
    try {
      // Use AI-powered language detection for better accuracy
      const detected = await detectLanguage(transcript);
      return detected;
    } catch (error) {
      console.error('AI language detection failed, falling back to heuristic detection:', error);
      
      // Fallback to heuristic detection
      const lowerTranscript = transcript.toLowerCase();
      
      // Spanish patterns
      if (lowerTranscript.includes('hola') || lowerTranscript.includes('gracias') || 
          lowerTranscript.includes('por favor') || lowerTranscript.includes('buenos días')) {
        return 'es';
      }
      
      // French patterns
      if (lowerTranscript.includes('bonjour') || lowerTranscript.includes('merci') || 
          lowerTranscript.includes('s\'il vous plaît') || lowerTranscript.includes('au revoir')) {
        return 'fr';
      }
      
      // German patterns
      if (lowerTranscript.includes('hallo') || lowerTranscript.includes('danke') || 
          lowerTranscript.includes('bitte') || lowerTranscript.includes('auf wiedersehen')) {
        return 'de';
      }
      
      // Italian patterns
      if (lowerTranscript.includes('ciao') || lowerTranscript.includes('grazie') || 
          lowerTranscript.includes('per favore') || lowerTranscript.includes('arrivederci')) {
        return 'it';
      }
      
      // Portuguese patterns
      if (lowerTranscript.includes('olá') || lowerTranscript.includes('obrigado') || 
          lowerTranscript.includes('por favor') || lowerTranscript.includes('adeus')) {
        return 'pt';
      }
      
      // Ukrainian patterns
      if (lowerTranscript.includes('привіт') || lowerTranscript.includes('дякую') || 
          lowerTranscript.includes('будь ласка') || lowerTranscript.includes('до побачення')) {
        return 'ukr';
      }
      
      // Japanese patterns
      if (lowerTranscript.includes('こんにちは') || lowerTranscript.includes('ありがとう') || 
          lowerTranscript.includes('お願い') || lowerTranscript.includes('さようなら')) {
        return 'ja';
      }
      
      // Korean patterns
      if (lowerTranscript.includes('안녕하세요') || lowerTranscript.includes('감사합니다') || 
          lowerTranscript.includes('부탁합니다') || lowerTranscript.includes('안녕히 가세요')) {
        return 'ko';
      }
      
      // Chinese patterns
      if (lowerTranscript.includes('你好') || lowerTranscript.includes('谢谢') || 
          lowerTranscript.includes('请') || lowerTranscript.includes('再见')) {
        return 'zh';
      }
      
      // Default to English if no patterns match
      return 'en';
    }
  }, []);

  const startListening = useCallback(async (onTranscript: (transcript: string) => void) => {
    if (!recognition) {
      setError('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      
      // Detect the language of the spoken text
      const detectedLang = await detectLanguageFromSpeech(transcript);
      setDetectedVoiceLanguage(detectedLang);
      
      // If the detected language is different from the current source language,
      // we could optionally update the source language here
      if (detectedLang !== sourceLanguage) {
        console.log(`Detected voice language: ${detectedLang}, current source: ${sourceLanguage}`);
      }
      
      onTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      // Handle specific error cases
      let errorMessage = 'Speech recognition error. Please try again.';
      if (event.error === 'no-speech') {
        errorMessage = 'No speech detected. Please try speaking again.';
      } else if (event.error === 'audio-capture') {
        errorMessage = 'Microphone access denied. Please allow microphone access.';
      } else if (event.error === 'not-allowed') {
        errorMessage = 'Microphone access denied. Please allow microphone access.';
      }
      
      setError(errorMessage);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
      setIsListening(true);
      setError('');
      setDetectedVoiceLanguage(null);
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setError('Failed to start speech recognition. Please try again.');
    }
  }, [recognition, detectLanguageFromSpeech, sourceLanguage]);

  return {
    isListening,
    startListening,
    error,
    setError,
    detectedVoiceLanguage,
  };
}; 