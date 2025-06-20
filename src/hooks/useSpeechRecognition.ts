import { useState, useEffect, useCallback } from 'react';
import { LANGUAGES, detectLanguage } from '../helpers';
import { UseSpeechRecognitionReturn } from '../types';
import { SPEECH_LANGUAGE_CODES, ERROR_MESSAGES } from '../constants';

export const useSpeechRecognition = (sourceLanguage: string): UseSpeechRecognitionReturn => {
  const [recognition, setRecognition] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [detectedVoiceLanguage, setDetectedVoiceLanguage] = useState<string | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      
      const speechLangCode = SPEECH_LANGUAGE_CODES[sourceLanguage as keyof typeof SPEECH_LANGUAGE_CODES];
      if (speechLangCode) {
        recognitionInstance.lang = speechLangCode;
      } else {
        recognitionInstance.lang = 'en-US';
      }
      
      setRecognition(recognitionInstance);
    }
  }, [sourceLanguage]);

  const detectLanguageFromSpeech = useCallback(async (transcript: string): Promise<string> => {
    try {
      const detected = await detectLanguage(transcript);
      return detected;
    } catch (error) {
      console.error('AI language detection failed, falling back to heuristic detection:', error);
      
      const lowerTranscript = transcript.toLowerCase();
      
      if (lowerTranscript.includes('hola') || lowerTranscript.includes('gracias') ||
          lowerTranscript.includes('por favor') || lowerTranscript.includes('buenos días')) {
        return 'es';
      }
      
      if (lowerTranscript.includes('bonjour') || lowerTranscript.includes('merci') ||
          lowerTranscript.includes('s\'il vous plaît') || lowerTranscript.includes('au revoir')) {
        return 'fr';
      }
      
      if (lowerTranscript.includes('hallo') || lowerTranscript.includes('danke') ||
          lowerTranscript.includes('bitte') || lowerTranscript.includes('auf wiedersehen')) {
        return 'de';
      }
      
      if (lowerTranscript.includes('ciao') || lowerTranscript.includes('grazie') ||
          lowerTranscript.includes('per favore') || lowerTranscript.includes('arrivederci')) {
        return 'it';
      }
      
      if (lowerTranscript.includes('olá') || lowerTranscript.includes('obrigado') ||
          lowerTranscript.includes('por favor') || lowerTranscript.includes('adeus')) {
        return 'pt';
      }
      
      if (lowerTranscript.includes('привіт') || lowerTranscript.includes('дякую') ||
          lowerTranscript.includes('будь ласка') || lowerTranscript.includes('до побачення')) {
        return 'ukr';
      }
      
      if (lowerTranscript.includes('こんにちは') || lowerTranscript.includes('ありがとう') ||
          lowerTranscript.includes('お願い') || lowerTranscript.includes('さようなら')) {
        return 'ja';
      }
      
      if (lowerTranscript.includes('안녕하세요') || lowerTranscript.includes('감사합니다') ||
          lowerTranscript.includes('부탁합니다') || lowerTranscript.includes('안녕히 가세요')) {
        return 'ko';
      }
      
      if (lowerTranscript.includes('你好') || lowerTranscript.includes('谢谢') ||
          lowerTranscript.includes('请') || lowerTranscript.includes('再见')) {
        return 'zh';
      }
      
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
      
      const detectedLang = await detectLanguageFromSpeech(transcript);
      setDetectedVoiceLanguage(detectedLang);
      
      if (detectedLang !== sourceLanguage) {
        console.log(`Detected voice language: ${detectedLang}, current source: ${sourceLanguage}`);
      }
      
      onTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage: string = ERROR_MESSAGES.SPEECH_RECOGNITION_FAILED;
      if (event.error === 'no-speech') {
        errorMessage = ERROR_MESSAGES.SPEECH_RECOGNITION_NO_SPEECH;
      } else if (event.error === 'audio-capture') {
        errorMessage = ERROR_MESSAGES.SPEECH_RECOGNITION_MICROPHONE_DENIED;
      } else if (event.error === 'not-allowed') {
        errorMessage = ERROR_MESSAGES.SPEECH_RECOGNITION_MICROPHONE_DENIED;
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
      setError(ERROR_MESSAGES.SPEECH_RECOGNITION_FAILED);
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