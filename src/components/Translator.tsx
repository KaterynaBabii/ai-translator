import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LANGUAGES, TONES } from '../helpers';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguageSwap } from '../hooks/useLanguageSwap';
import { useConversationHistory } from '../hooks/useConversationHistory';
import { useLanguageDetection } from '../hooks/useLanguageDetection';
import { useImageProcessing } from '../hooks/useImageProcessing';
import { useSlangDetection } from '../hooks/useSlangDetection';
import { useVocabulary } from '../hooks/useVocabulary';
import { speakText } from '../utils/speechSynthesis';
import ConversationHistory from './ConversationHistory';
import ImageUpload from './ImageUpload';
import SlangDetectionDisplay from './SlangDetectionDisplay';
import SaveToVocabularyButton from './SaveToVocabularyButton';
import VocabularySidebar from './VocabularySidebar';
import { Mic, MicOff, ArrowRightLeft, Loader, PlayIcon, RotateCcw } from 'lucide-react';
import { DetectIcon } from "./icons/DetectIcon";

const Translator: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedTone, setSelectedTone] = useState('neutral');
  const [autoDetectEnabled, setAutoDetectEnabled] = useState(true);
  const [autoUpdateVoiceLanguage, setAutoUpdateVoiceLanguage] = useState(true);
  const [inputMode, setInputMode] = useState<'text' | 'image'>('text');
  const [isGeneratingExamples, setIsGeneratingExamples] = useState(false);
  const [generatedExamples, setGeneratedExamples] = useState<string[]>([]);

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

  const {
    vocabulary,
    addToVocabulary,
    removeFromVocabulary,
    updateVocabularyEntry,
    markAsReviewed,
    generateLearningContent,
  } = useVocabulary();

  const error = translationError || speechError || imageError;

  const isCurrentTranslationSaved = useMemo(() => {
    if (!translatedText || !inputText) return false;
    return vocabulary.some(entry => 
      entry.originalText.toLowerCase() === inputText.toLowerCase() &&
      entry.translatedText.toLowerCase() === translatedText.toLowerCase() &&
      entry.sourceLanguage === sourceLanguage &&
      entry.targetLanguage === targetLanguage
    );
  }, [translatedText, inputText, vocabulary, sourceLanguage, targetLanguage]);

  const savedEntryId = useMemo(() => {
    if (!translatedText || !inputText) return null;
    const entry = vocabulary.find(entry => 
      entry.originalText.toLowerCase() === inputText.toLowerCase() &&
      entry.translatedText.toLowerCase() === translatedText.toLowerCase() &&
      entry.sourceLanguage === sourceLanguage &&
      entry.targetLanguage === targetLanguage
    );
    return entry?.id || null;
  }, [translatedText, inputText, vocabulary, sourceLanguage, targetLanguage]);

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

  const handleSaveToVocabulary = useCallback(async (entry: {
    originalText: string;
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
    tone: string;
    notes?: string;
  }) => {
    addToVocabulary(entry);
  }, [addToVocabulary]);

  const handleRemoveFromVocabulary = useCallback((id: string) => {
    removeFromVocabulary(id);
  }, [removeFromVocabulary]);

  const handleGenerateExamples = useCallback(async () => {
    if (!inputText.trim() || !translatedText.trim()) return;

    setIsGeneratingExamples(true);
    try {
      const { generateExampleSentences } = await import('../helpers');
      const examples = await generateExampleSentences(
        inputText,
          targetLanguage
      );

      if (examples && examples.length > 0) {
        setGeneratedExamples(examples);
      } else {
        setGeneratedExamples([]);
        alert('No examples could be generated. Please try again.');
      }
    } catch (error) {
      console.error('Failed to generate examples:', error);
      setGeneratedExamples([]);
      alert('Failed to generate examples. Please try again.');
    } finally {
      setIsGeneratingExamples(false);
    }
  }, [inputText, translatedText, targetLanguage]);

  useEffect(() => {
    if (!autoDetectEnabled || !inputText.trim()) {
      resetDetection();
      return;
    }

    const timeoutId = setTimeout(async () => {
      if (inputText.trim().length > 3) {
        const detected = await detectInputLanguage(inputText);
        if (detected && detected !== sourceLanguage) {
          setSourceLanguage(detected);
        }
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [inputText, autoDetectEnabled, detectInputLanguage, resetDetection, setSourceLanguage, sourceLanguage]);

  useEffect(() => {
    if (detectedVoiceLanguage && autoUpdateVoiceLanguage && detectedVoiceLanguage !== sourceLanguage) {
      setSourceLanguage(detectedVoiceLanguage);
    }
  }, [detectedVoiceLanguage, autoUpdateVoiceLanguage, sourceLanguage, setSourceLanguage]);

  useEffect(() => {
    if (extractedText && inputMode === 'image') {
      setInputText(extractedText);
    }
  }, [extractedText, inputMode]);

  useEffect(() => {
    if (inputText.trim() && inputMode === 'text') {
      const timeoutId = setTimeout(async () => {
        if (inputText.trim().length > 2) {
          await analyzeSlang(inputText, sourceLanguage);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      clearSlangAnalysis();
    }
  }, [inputText, sourceLanguage, inputMode, analyzeSlang, clearSlangAnalysis]);

  useEffect(() => {
    setGeneratedExamples([]);
  }, [inputText]);

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
      const context = getContextForTranslation(sourceLanguage, targetLanguage, selectedTone, inputText);
      const similarTranslations = getSimilarTranslations(inputText, sourceLanguage, targetLanguage, selectedTone);
      
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 m-0">AI Translator</h1>
      </div>

      <div className="grid grid-cols-[350px_1fr_350px] gap-6 min-h-[calc(100vh-200px)]">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col border-r border-gray-200">
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

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white min-w-[150px]"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoDetectEnabled}
                    onChange={(e) => setAutoDetectEnabled(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Auto-detect text</span>
                </label>
                
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoUpdateVoiceLanguage}
                    onChange={(e) => setAutoUpdateVoiceLanguage(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Auto-update voice</span>
                </label>
                
                <button
                  onClick={handleManualDetect}
                  disabled={isDetecting || !inputText.trim()}
                  className="p-2 bg-transparent border border-gray-300 rounded-md cursor-pointer text-gray-500 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Manually detect language"
                >
                  {isDetecting ? <Loader className="animate-spin w-4 h-4" /> : <DetectIcon className="w-4 h-4" />}
                </button>
              </div>
              
              {detectedLanguage && autoDetectEnabled && (
                <div className="text-xs text-green-600 mt-1 font-medium">
                  Detected: {getLanguageName(detectedLanguage)}
                </div>
              )}
              
              {detectedVoiceLanguage && autoUpdateVoiceLanguage && (
                <div className="text-xs text-green-600 mt-1 font-medium">
                  Voice: {getLanguageName(detectedVoiceLanguage)}
                </div>
              )}
            </div>

            <button
              onClick={handleSwapLanguages}
              className="p-3 bg-transparent border border-gray-300 rounded-lg cursor-pointer text-gray-500 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 transition-all duration-200 flex items-center justify-center"
              title="Swap languages"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>

            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg text-sm bg-white min-w-[150px]"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="tone-select" className="block text-sm font-medium text-gray-700 mb-2">
              Translation Tone:
            </label>
            <select
              id="tone-select"
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white"
            >
              {TONES.map((tone) => (
                <option key={tone.code} value={tone.code}>
                  {tone.name} - {tone.description}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              className={`flex-1 py-3 px-4 bg-transparent border border-gray-300 rounded-lg text-sm cursor-pointer transition-all duration-200 ${
                inputMode === 'text' 
                  ? 'bg-blue-600 border-blue-600' 
                  : 'text-gray-500 hover:bg-gray-50 hover:border-gray-400'
              }`}
              onClick={() => handleInputModeChange('text')}
            >
              Text Input
            </button>
            <button
              className={`flex-1 py-3 px-4 bg-transparent border border-gray-300 rounded-lg text-sm cursor-pointer transition-all duration-200 ${
                inputMode === 'image' 
                  ? 'bg-blue-600 border-blue-600 ' 
                  : 'text-gray-500 hover:bg-gray-50 hover:border-gray-400'
              }`}
              onClick={() => handleInputModeChange('image')}
            >
              Image Upload
            </button>
          </div>

          {inputMode === 'text' ? (
            <div className="relative mb-6">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to translate or click the microphone to speak..."
                className="w-full min-h-[120px] p-4 border border-gray-300 rounded-lg text-base resize-y font-inherit focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
              <button
                onClick={handleStartListening}
                disabled={isListening}
                className={`absolute bottom-4 right-4 p-3 bg-transparent border-none cursor-pointer rounded-lg transition-all duration-200 flex items-center justify-center ${
                  isListening 
                    ? 'text-red-500 bg-red-50' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isListening ? 'Listening... Click to stop' : 'Click to speak'}
              >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              
              <SlangDetectionDisplay
                detectionResult={slangDetectionResult}
                isAnalyzing={isSlangAnalyzing}
              />
            </div>
          ) : (
            <div className="mb-6">
              <ImageUpload
                onImageSelect={handleImageSelect}
                onClear={clearImage}
                selectedFile={imageFile}
                isProcessing={isImageProcessing}
                error={imageError}
              />
              {extractedText && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extracted Text:
                  </label>
                  <textarea
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    placeholder="Text extracted from image..."
                    readOnly={isImageProcessing}
                    className="w-full min-h-[80px] p-3 border border-gray-300 rounded-lg text-sm resize-y font-inherit"
                  />
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleTranslateWithContext}
            disabled={isTranslating || isImageProcessing || (!inputText.trim() && !imageFile)}
            className="w-full p-4 bg-blue-600 text-white border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTranslating || isImageProcessing ? (
              <>
                <Loader className="animate-spin w-5 h-5" />
                {isImageProcessing ? 'Processing...' : 'Translating...'}
              </>
            ) : (
              'Translate'
            )}
          </button>

          {translatedText && (
            <div className="relative bg-gray-50 p-4 rounded-lg min-h-[150px] mt-6">
              <p className="whitespace-pre-wrap m-0 flex-1 text-base leading-relaxed min-h-[100px]">
                {translatedText}
              </p>
              <div className="flex items-end gap-4 justify-end">

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleSpeakText(translatedText)}
                    className="p-2 bg-transparent border-none cursor-pointer text-gray-500 rounded-md transition-all duration-200 flex items-center gap-1 text-sm hover:text-gray-700 hover:bg-gray-100"
                    title="Play pronunciation"
                  >
                    <PlayIcon className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={handleGenerateExamples}
                    disabled={isGeneratingExamples}
                    className="p-2 bg-transparent border-none cursor-pointer text-gray-500 rounded-md transition-all duration-200 flex items-center gap-1 text-sm hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Generate example sentences"
                  >
                    {isGeneratingExamples ? (
                      <>
                        <Loader className="animate-spin w-5 h-5" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-5 h-5" />
                        Examples
                      </>
                    )}
                  </button>
                  
                  <SaveToVocabularyButton
                    originalText={inputText}
                    translatedText={translatedText}
                    sourceLanguage={sourceLanguage}
                    targetLanguage={targetLanguage}
                    tone={selectedTone}
                    onSave={handleSaveToVocabulary}
                    isSaved={isCurrentTranslationSaved}
                    onRemove={handleRemoveFromVocabulary}
                    entryId={savedEntryId || undefined}
                  />
                </div>
              </div>
            </div>
          )}

          {generatedExamples.length > 0 && (
            <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-blue-800 m-0">
                  Example Sentences for "{inputText}"
                </h4>
                <button
                  onClick={() => setGeneratedExamples([])}
                  className="p-1 bg-transparent border-none cursor-pointer text-blue-600 rounded transition-all duration-200 hover:text-blue-800 hover:bg-blue-100"
                  title="Clear examples"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                {generatedExamples.map((example, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 leading-relaxed m-0">
                        {example}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSpeakText(example)}
                      className="p-2 bg-transparent border-none cursor-pointer text-blue-600 rounded transition-all duration-200 hover:text-blue-800 hover:bg-blue-100 flex-shrink-0"
                      title="Play pronunciation"
                    >
                      <PlayIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col border-l border-gray-200">
          <VocabularySidebar
            vocabulary={vocabulary}
            onUpdateEntry={updateVocabularyEntry}
            onRemoveEntry={removeFromVocabulary}
            onMarkReviewed={markAsReviewed}
            onGenerateContent={generateLearningContent}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
          />
        </div>
      </div>
    </div>
  );
};

export default Translator; 