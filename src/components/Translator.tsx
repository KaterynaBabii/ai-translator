import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LANGUAGES, TONES } from '../helpers';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguageSwap } from '../hooks/useLanguageSwap';
import { useConversationHistory } from '../hooks/useConversationHistory';
import { useLanguageDetection } from '../hooks/useLanguageDetection';
import { useImageProcessing } from '../hooks/useImageProcessing';
import { useSlangDetection } from '../hooks/useSlangDetection';
import { speakText } from '../utils/speechSynthesis';
import ConversationHistory from './ConversationHistory';
import ImageUpload from './ImageUpload';
import SlangDetectionDisplay from './SlangDetectionDisplay';
import { 
  MicrophoneIcon, 
  StopIcon, 
  SwapIcon, 
  SpinnerIcon, 
  PlayIcon,
  DetectIcon
} from './icons';

const Translator: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedTone, setSelectedTone] = useState('neutral');
  const [autoDetectEnabled, setAutoDetectEnabled] = useState(true);
  const [autoUpdateVoiceLanguage, setAutoUpdateVoiceLanguage] = useState(true);
  const [inputMode, setInputMode] = useState<'text' | 'image'>('text');

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
    detectedVoiceLanguage,
  } = useSpeechRecognition(sourceLanguage);

  const {
    conversationHistory,
    addToHistory,
    removeFromHistory,
    getContextForTranslation,
    clearHistory,
    getSimilarTranslations,
  } = useConversationHistory();

  const {
    isDetecting,
    detectedLanguage,
    detectInputLanguage,
    resetDetection,
  } = useLanguageDetection();

  const {
    isProcessing: isImageProcessing,
    extractedText,
    imageFile,
    error: imageError,
    setError: setImageError,
    extractText,
    translateImage,
    clearImage,
    setExtractedText,
  } = useImageProcessing();

  const {
    isAnalyzing: isSlangAnalyzing,
    detectionResult: slangDetectionResult,
    analyzeText: analyzeSlang,
    clearAnalysis: clearSlangAnalysis,
  } = useSlangDetection();

  const error = translationError || speechError || imageError;

  // Memoize handlers to prevent unnecessary re-renders
  const handleUseTranslation = useCallback((entry: any) => {
    setInputText(entry.originalText);
    setSelectedTone(entry.tone);
  }, []);

  const handleRemoveFromHistory = useCallback((id: string) => {
    removeFromHistory(id);
  }, [removeFromHistory]);

  const handleClearHistory = useCallback(() => {
    clearHistory();
  }, [clearHistory]);

  // Auto-detect language when text changes (with debounce)
  useEffect(() => {
    if (!autoDetectEnabled || !inputText.trim()) {
      resetDetection();
      return;
    }

    const timeoutId = setTimeout(async () => {
      if (inputText.trim().length > 3) { // Only detect if text is long enough
        const detected = await detectInputLanguage(inputText);
        if (detected && detected !== sourceLanguage) {
          setSourceLanguage(detected);
        }
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [inputText, autoDetectEnabled, detectInputLanguage, resetDetection, setSourceLanguage, sourceLanguage]);

  // Handle detected voice language
  useEffect(() => {
    if (detectedVoiceLanguage && autoUpdateVoiceLanguage && detectedVoiceLanguage !== sourceLanguage) {
      setSourceLanguage(detectedVoiceLanguage);
    }
  }, [detectedVoiceLanguage, autoUpdateVoiceLanguage, sourceLanguage, setSourceLanguage]);

  // Handle extracted text from image
  useEffect(() => {
    if (extractedText && inputMode === 'image') {
      setInputText(extractedText);
    }
  }, [extractedText, inputMode]);

  // Analyze text for slang and idioms when text changes
  useEffect(() => {
    if (inputText.trim() && inputMode === 'text') {
      const timeoutId = setTimeout(async () => {
        if (inputText.trim().length > 2) {
          await analyzeSlang(inputText, sourceLanguage);
        }
      }, 500); // 0.5 second debounce for slang detection

      return () => clearTimeout(timeoutId);
    } else {
      clearSlangAnalysis();
    }
  }, [inputText, sourceLanguage, inputMode, analyzeSlang, clearSlangAnalysis]);

  const handleStartListening = useCallback(() => {
    startSpeechRecognition(setInputText);
  }, [startSpeechRecognition]);

  const handleSpeakText = useCallback((text: string) => {
    speakText(text, targetLanguage);
  }, [targetLanguage]);

  const handleSwapLanguages = useCallback(() => {
    swapLanguages(inputText, translatedText, setInputText, setTranslatedText);
  }, [swapLanguages, inputText, translatedText, setInputText, setTranslatedText]);

  const handleManualDetect = useCallback(async () => {
    if (inputText.trim()) {
      const detected = await detectInputLanguage(inputText);
      if (detected && detected !== sourceLanguage) {
        setSourceLanguage(detected);
      }
    }
  }, [inputText, detectInputLanguage, sourceLanguage, setSourceLanguage]);

  const handleImageSelect = useCallback(async (file: File) => {
    if (inputMode === 'image') {
      await extractText(file);
    }
  }, [inputMode, extractText]);

  const handleTranslateWithContext = useCallback(async () => {
    if (inputMode === 'image' && imageFile) {
      // Translate image directly
      const context = getContextForTranslation(sourceLanguage, targetLanguage, selectedTone, inputText);
      
      try {
        const result = await translateImage(
          imageFile,
          sourceLanguage,
          targetLanguage,
          selectedTone,
          context
        );
        
        setTranslatedText(result.translatedText);
        
        // Add to conversation history
        addToHistory({
          sourceLanguage,
          targetLanguage,
          originalText: result.originalText,
          translatedText: result.translatedText,
          tone: selectedTone,
          context: 'Image translation',
        });
      } catch (err) {
        console.error('Image translation failed:', err);
      }
    } else {
      // Regular text translation with slang context
      const context = getContextForTranslation(sourceLanguage, targetLanguage, selectedTone, inputText);
      const similarTranslations = getSimilarTranslations(inputText, sourceLanguage, targetLanguage, selectedTone);
      
      // Add slang detection context if available
      let enhancedContext = context;
      if (slangDetectionResult?.hasSlang && slangDetectionResult.context) {
        enhancedContext = `${context}\n\n${slangDetectionResult.context}`;
      }
      
      await handleTranslate(inputText, sourceLanguage, targetLanguage, selectedTone, enhancedContext);
      
      if (translatedText) {
        addToHistory({
          sourceLanguage,
          targetLanguage,
          originalText: inputText,
          translatedText,
          tone: selectedTone,
          context: similarTranslations.length > 0 ? 'Similar translation found' : undefined,
        });
      }
    }
  }, [
    inputMode,
    imageFile,
    getContextForTranslation,
    sourceLanguage,
    targetLanguage,
    selectedTone,
    inputText,
    translateImage,
    setTranslatedText,
    addToHistory,
    getSimilarTranslations,
    handleTranslate,
    translatedText,
    slangDetectionResult
  ]);

  const handleInputModeChange = useCallback((mode: 'text' | 'image') => {
    setInputMode(mode);
    if (mode === 'text') {
      clearImage();
    }
    clearSlangAnalysis();
  }, [clearImage, clearSlangAnalysis]);

  const getLanguageName = useCallback((code: string) => {
    return LANGUAGES.find(lang => lang.code === code)?.name || code;
  }, []);

  return (
    <div className="app-container">
      <div className="header">
        <h1>AI Translator</h1>
      </div>

      <div className="main-content">
        {/* Sidebar with Conversation History */}
        <div className="sidebar">
          <ConversationHistory
            history={conversationHistory}
            onClearHistory={handleClearHistory}
            onUseTranslation={handleUseTranslation}
            onRemoveFromHistory={handleRemoveFromHistory}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            currentTone={selectedTone}
            isSidebar={true}
          />
        </div>

        {/* Main Translation Area */}
        <div className="translation-area">
          <div className="language-selector">
            <div className="source-language-section">
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
              
              <div className="detection-controls">
                <label className="auto-detect-toggle">
                  <input
                    type="checkbox"
                    checked={autoDetectEnabled}
                    onChange={(e) => setAutoDetectEnabled(e.target.checked)}
                  />
                  <span>Auto-detect text</span>
                </label>
                
                <label className="auto-detect-toggle">
                  <input
                    type="checkbox"
                    checked={autoUpdateVoiceLanguage}
                    onChange={(e) => setAutoUpdateVoiceLanguage(e.target.checked)}
                  />
                  <span>Auto-update voice</span>
                </label>
                
                <button
                  onClick={handleManualDetect}
                  disabled={isDetecting || !inputText.trim()}
                  className="detect-button"
                  title="Manually detect language"
                >
                  {isDetecting ? <SpinnerIcon className="spinner" /> : <DetectIcon />}
                </button>
              </div>
              
              {detectedLanguage && autoDetectEnabled && (
                <div className="detection-status">
                  Detected: {getLanguageName(detectedLanguage)}
                </div>
              )}
              
              {detectedVoiceLanguage && autoUpdateVoiceLanguage && (
                <div className="voice-detection-status">
                  Voice: {getLanguageName(detectedVoiceLanguage)}
                </div>
              )}
            </div>

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

          <div className="tone-selector">
            <label htmlFor="tone-select">Translation Tone:</label>
            <select
              id="tone-select"
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
            >
              {TONES.map((tone) => (
                <option key={tone.code} value={tone.code}>
                  {tone.name} - {tone.description}
                </option>
              ))}
            </select>
          </div>

          {/* Input Mode Tabs */}
          <div className="input-mode-tabs">
            <button
              className={`tab-button ${inputMode === 'text' ? 'active' : ''}`}
              onClick={() => handleInputModeChange('text')}
            >
              Text Input
            </button>
            <button
              className={`tab-button ${inputMode === 'image' ? 'active' : ''}`}
              onClick={() => handleInputModeChange('image')}
            >
              Image Upload
            </button>
          </div>

          {/* Input Section */}
          {inputMode === 'text' ? (
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
              
              {/* Slang Detection Display */}
              <SlangDetectionDisplay
                detectionResult={slangDetectionResult}
                isAnalyzing={isSlangAnalyzing}
              />
            </div>
          ) : (
            <div className="image-input-section">
              <ImageUpload
                onImageSelect={handleImageSelect}
                onClear={clearImage}
                selectedFile={imageFile}
                isProcessing={isImageProcessing}
                error={imageError}
              />
              {extractedText && (
                <div className="extracted-text-section">
                  <label>Extracted Text:</label>
                  <textarea
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    placeholder="Text extracted from image..."
                    readOnly={isImageProcessing}
                  />
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleTranslateWithContext}
            disabled={isTranslating || isImageProcessing || (!inputText.trim() && !imageFile)}
            className="translate-button"
          >
            {isTranslating || isImageProcessing ? (
              <>
                <SpinnerIcon className="spinner" />
                {isImageProcessing ? 'Processing...' : 'Translating...'}
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
      </div>
    </div>
  );
};

export default Translator; 