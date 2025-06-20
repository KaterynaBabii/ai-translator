import React, { useState } from 'react';
import { LANGUAGES } from '../helpers';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguageSwap } from '../hooks/useLanguageSwap';
import { speakText } from '../utils/speechSynthesis';
import { 
  MicrophoneIcon, 
  StopIcon, 
  SwapIcon, 
  SpinnerIcon, 
  PlayIcon 
} from './icons';

const Translator: React.FC = () => {
  const [inputText, setInputText] = useState('');

  const {
    sourceLanguage,
    targetLanguage,
    setSourceLanguage,
    setTargetLanguage,
    swapLanguages,
  } = useLanguageSwap();

  const {
    translatedText,
    isTranslating,
    error: translationError,
    handleTranslate,
    setTranslatedText,
  } = useTranslation();

  const {
    isListening,
    startListening: startSpeechRecognition,
    error: speechError,
  } = useSpeechRecognition(sourceLanguage);

  const error = translationError || speechError;

  const handleStartListening = () => {
    startSpeechRecognition(setInputText);
  };

  const handleSpeakText = (text: string) => {
    speakText(text, targetLanguage);
  };

  const handleSwapLanguages = () => {
    swapLanguages(inputText, translatedText, setInputText, setTranslatedText);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>AI Translator</h1>
      </div>

      <div className="language-selector">
        <select
          value={sourceLanguage}
          onChange={(e) => setSourceLanguage(e.target.value)}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleSwapLanguages}
          className="swap-button"
          title="Swap languages"
        >
          <SwapIcon />
        </button>

        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div className="input-section">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to translate or click the microphone to speak..."
        />
        <button
          onClick={handleStartListening}
          disabled={isListening}
          className={`mic-button ${isListening ? 'listening' : ''}`}
          title={isListening ? 'Listening... Click to stop' : 'Click to speak'}
        >
          {isListening ? <StopIcon /> : <MicrophoneIcon />}
        </button>
      </div>

      <button
        onClick={() => handleTranslate(inputText, sourceLanguage, targetLanguage)}
        disabled={isTranslating || !inputText.trim()}
        className="translate-button"
      >
        {isTranslating ? (
          <>
            <SpinnerIcon className="spinner" />
            Translating...
          </>
        ) : (
          'Translate'
        )}
      </button>

      {translatedText && (
        <div className="output-section">
          <p>{translatedText}</p>
          <button
            onClick={() => handleSpeakText(translatedText)}
            className="play-button"
          >
            <PlayIcon />
          </button>
        </div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}
    </div>
  );
};

export default Translator; 