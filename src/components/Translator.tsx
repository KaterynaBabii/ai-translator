import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { LANGUAGES, TONES } from '../helpers';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguageSwap } from '../hooks/useLanguageSwap';
import { useConversationHistory } from '../hooks/useConversationHistory';
import { useLanguageDetection } from '../hooks/useLanguageDetection';
import { useImageProcessing } from '../hooks/useImageProcessing';
import { useSlangDetection } from '../hooks/useSlangDetection';
import { useVocabulary } from '../hooks/useVocabulary';
import { useTranslatorState } from '../hooks/useTranslatorState';
import { speakText } from '../utils/speechSynthesis';
import { ConversationHistory } from './ConversationHistory';
import {ImageUpload} from './ImageUpload';
import { VocabularySidebar } from './VocabularySidebar';
import { LanguageSelector } from './LanguageSelector';
import { ToneSelector } from './ToneSelector';
import { InputModeSelector } from './InputModeSelector';
import { TextInputArea } from './TextInputArea';
import { TranslationOutput } from './TranslationOutput';
import { TranslationControls } from './TranslationControls';
import { ArticleLearning } from './ArticleLearning';

export const Translator: React.FC = () => {
  const {
    state: {
      inputText,
      selectedTone,
      autoDetectEnabled,
      autoUpdateVoiceLanguage,
      inputMode,
      isGeneratingExamples,
      generatedExamples,
    },
    setInputText,
    setSelectedTone,
    setAutoDetectEnabled,
    setAutoUpdateVoiceLanguage,
    setInputMode,
    setIsGeneratingExamples,
    setGeneratedExamples,
    clearGeneratedExamples,
  } = useTranslatorState();

  const lastAddedTranslationRef = useRef<string>('');

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
    setSourceLanguage(entry.sourceLanguage);
    setTargetLanguage(entry.targetLanguage);
  }, [setInputText, setSelectedTone, setSourceLanguage, setTargetLanguage]);

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
        targetLanguage,
        [],
        selectedTone
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
  }, [inputText, translatedText, targetLanguage, selectedTone, setIsGeneratingExamples, setGeneratedExamples]);

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
  }, [extractedText, inputMode, setInputText]);

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
    clearGeneratedExamples();
  }, [inputText, clearGeneratedExamples]);

  useEffect(() => {
    lastAddedTranslationRef.current = '';
  }, [inputText]);

  useEffect(() => {
    if (translatedText && translatedText.trim() && inputMode === 'text') {
      const translationKey = `${inputText}-${sourceLanguage}-${targetLanguage}-${selectedTone}`;
      
      if (lastAddedTranslationRef.current !== translationKey) {
        const similarTranslations = getSimilarTranslations(inputText, sourceLanguage, targetLanguage, selectedTone);
        addToHistory({
          sourceLanguage,
          targetLanguage,
          originalText: inputText,
          translatedText,
          tone: selectedTone,
          context: similarTranslations.length > 0 ? 'Similar translation found' : undefined,
        });
        
        lastAddedTranslationRef.current = translationKey;
      }
    }
  }, [translatedText, inputText, sourceLanguage, targetLanguage, selectedTone, addToHistory, getSimilarTranslations, inputMode]);

  const handleStartListening = useCallback(() => {
    startSpeechRecognition(setInputText);
  }, [startSpeechRecognition, setInputText]);

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

      let enhancedContext = context;
      if (slangDetectionResult?.hasSlang && slangDetectionResult.context) {
        enhancedContext = `${context}\n\n${slangDetectionResult.context}`;
      }
      
      await handleTranslate(inputText, sourceLanguage, targetLanguage, selectedTone, enhancedContext);
      
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
    slangDetectionResult
  ]);

  const handleInputModeChange = useCallback((mode: 'text' | 'image' | 'article') => {
    setInputMode(mode);
    if (mode === 'text') {
      clearImage();
    }
    clearSlangAnalysis();
  }, [setInputMode, clearImage, clearSlangAnalysis]);

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

        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 rounded-xl ">
            <h3 className="text-lg font-semibold text-gray-800 m-0">Translation</h3>
          </div>
          <div className="p-6">
            <LanguageSelector
              sourceLanguage={sourceLanguage}
              targetLanguage={targetLanguage}
              setSourceLanguage={setSourceLanguage}
              setTargetLanguage={setTargetLanguage}
              swapLanguages={handleSwapLanguages}
              autoDetectEnabled={autoDetectEnabled}
              setAutoDetectEnabled={setAutoDetectEnabled}
              autoUpdateVoiceLanguage={autoUpdateVoiceLanguage}
              setAutoUpdateVoiceLanguage={setAutoUpdateVoiceLanguage}
              isDetecting={isDetecting}
              handleManualDetect={handleManualDetect}
              detectedLanguage={detectedLanguage}
              detectedVoiceLanguage={detectedVoiceLanguage}
              getLanguageName={getLanguageName}
              languages={LANGUAGES}
            />

            <ToneSelector
              selectedTone={selectedTone}
              setSelectedTone={setSelectedTone}
              tones={TONES}
            />

            <InputModeSelector
              inputMode={inputMode}
              handleInputModeChange={handleInputModeChange}
            />

            {inputMode === 'text' ? (
              <TextInputArea
                inputText={inputText}
                setInputText={setInputText}
                isListening={isListening}
                handleStartListening={handleStartListening}
                slangDetectionResult={slangDetectionResult}
                isSlangAnalyzing={isSlangAnalyzing}
              />
            ) : inputMode === 'image' ? (
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
            ) : (
              <ArticleLearning
                sourceLanguage={sourceLanguage}
                targetLanguage={targetLanguage}
                selectedTone={selectedTone}
                languages={LANGUAGES}
                tones={TONES}
                onSaveToVocabulary={handleSaveToVocabulary}
              />
            )}

            {inputMode !== 'article' && (
              <TranslationControls
                handleTranslateWithContext={handleTranslateWithContext}
                isTranslating={isTranslating}
                isImageProcessing={isImageProcessing}
                inputText={inputText}
                imageFile={imageFile}
                error={error}
              />
            )}

            {translatedText && inputMode !== 'article' && (
              <TranslationOutput
                translatedText={translatedText}
                inputText={inputText}
                sourceLanguage={sourceLanguage}
                targetLanguage={targetLanguage}
                selectedTone={selectedTone}
                handleSpeakText={handleSpeakText}
                handleGenerateExamples={handleGenerateExamples}
                isGeneratingExamples={isGeneratingExamples}
                generatedExamples={generatedExamples}
                setGeneratedExamples={setGeneratedExamples}
                handleSaveToVocabulary={handleSaveToVocabulary}
                isCurrentTranslationSaved={isCurrentTranslationSaved}
                handleRemoveFromVocabulary={handleRemoveFromVocabulary}
                savedEntryId={savedEntryId}
              />
            )}
          </div>
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