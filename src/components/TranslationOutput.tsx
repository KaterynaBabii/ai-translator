import React from 'react';
import { PlayIcon, RotateCcw, Loader } from 'lucide-react';
import { SaveToVocabularyButton } from './SaveToVocabularyButton';

interface TranslationOutputProps {
  translatedText: string;
  inputText: string;
  sourceLanguage: string;
  targetLanguage: string;
  selectedTone: string;
  handleSpeakText: (text: string) => void;
  handleGenerateExamples: () => void;
  isGeneratingExamples: boolean;
  generatedExamples: string[];
  setGeneratedExamples: (examples: string[]) => void;
  handleSaveToVocabulary: (entry: {
    originalText: string;
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
    tone: string;
    notes?: string;
  }) => void;
  isCurrentTranslationSaved: boolean;
  handleRemoveFromVocabulary: (id: string) => void;
  savedEntryId: string | null;
}

export const TranslationOutput: React.FC<TranslationOutputProps> = ({
  translatedText,
  inputText,
  sourceLanguage,
  targetLanguage,
  selectedTone,
  handleSpeakText,
  handleGenerateExamples,
  isGeneratingExamples,
  generatedExamples,
  setGeneratedExamples,
  handleSaveToVocabulary,
  isCurrentTranslationSaved,
  handleRemoveFromVocabulary,
  savedEntryId,
}) => {
  return (
    <>
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
    </>
  );
}; 