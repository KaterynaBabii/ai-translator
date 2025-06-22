import React, { useState, useMemo, useEffect } from 'react';
import { PlayIcon, PauseIcon, TrashIcon, CheckIcon, Loader} from 'lucide-react';
import { speakText } from '../utils/speechSynthesis';
import { VocabularyEntry, VocabularySidebarProps } from '../types';
import { LANGUAGES, UI_CONSTANTS } from '../constants';

export const VocabularySidebar: React.FC<VocabularySidebarProps> = ({
  vocabulary,
  onUpdateEntry,
  onRemoveEntry,
  onMarkReviewed,
  onGenerateContent,
}) => {
  const [selectedEntry, setSelectedEntry] = useState<VocabularyEntry | null>(null);
  const [playingEntryId, setPlayingEntryId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard' | 'review'>('all');
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);

  useEffect(() => {
    if (selectedEntry) {
      const updatedEntry = vocabulary.find(v => v.id === selectedEntry.id);
      if (updatedEntry) {
        setSelectedEntry(updatedEntry);
      }
    }
  }, [vocabulary, selectedEntry?.id]);

  const filteredVocabulary = useMemo(() => {
    switch (filter) {
      case 'easy':
        return vocabulary.filter(entry => entry.difficulty === 'easy');
      case 'medium':
        return vocabulary.filter(entry => entry.difficulty === 'medium');
      case 'hard':
        return vocabulary.filter(entry => entry.difficulty === 'hard');
      case 'review':
        return vocabulary.filter(entry => {
          const now = Date.now();
          return !entry.lastReviewed || (now - entry.lastReviewed) > UI_CONSTANTS.REVIEW_INTERVAL;
        });
      default:
        return vocabulary;
    }
  }, [vocabulary, filter]);

  const handlePlayAudio = (entryId: string, text: string, language: string) => {
    if (playingEntryId === entryId) {
      setPlayingEntryId(null);
      return;
    }

    setPlayingEntryId(entryId);
    speakText(text, language).finally(() => {
      setPlayingEntryId(null);
    });
  };

  const handleGenerateContent = async (entry: VocabularyEntry) => {
    setIsGeneratingMore(true);
    try {
      await onGenerateContent(entry);
    } catch (error) {
      console.error('Failed to generate content:', error);
    } finally {
      setIsGeneratingMore(false);
    }
  };

  const handleGenerateMoreExamples = async (entry: VocabularyEntry) => {
    setIsGeneratingMore(true);
    try {
      const entryWithMoreExamples = {
        ...entry,
        exampleSentences: entry.exampleSentences || []
      };
      
      await onGenerateContent(entryWithMoreExamples);
    } catch (error) {
      console.error('Failed to generate more examples:', error);
    } finally {
      setIsGeneratingMore(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getLanguageName = (code: string) => {
    return LANGUAGES.find(lang => lang.code === code)?.name || code;
  };
  const isExamplesGenerated = selectedEntry && selectedEntry?.exampleSentences && selectedEntry?.exampleSentences.length > 0;

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 m-0">My Vocabulary ({vocabulary.length})</h3>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
          >
            <option value="all">All Words</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="review">Need Review</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filteredVocabulary.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="mb-2">No vocabulary items found</p>
              <p className="text-sm text-gray-400">Save words from translations to see them here</p>
            </div>
          ) : (
            filteredVocabulary.map((entry) => (
              <div
                key={entry.id}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 ${
                  selectedEntry?.id === entry.id ? 'bg-blue-50 border-blue-500' : ''
                }`}
                onClick={() => setSelectedEntry(entry)}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 mb-1 text-sm break-words">
                      {entry.originalText}
                    </div>
                    <div className="text-green-600 text-xs break-words">
                      {entry.translatedText}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span 
                      className={`px-2 py-1 rounded text-xs font-medium text-white capitalize ${getDifficultyColor(entry.difficulty)}`}
                    >
                      {entry.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">
                      {entry.reviewCount} reviews
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayAudio(entry.id, entry.translatedText, entry.targetLanguage);
                    }}
                    className="p-1 bg-transparent border-none cursor-pointer text-gray-500 rounded transition-all duration-200 hover:text-gray-700 hover:bg-gray-100"
                    title="Play pronunciation"
                  >
                    {playingEntryId === entry.id ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkReviewed(entry.id);
                    }}
                    className="p-1 bg-transparent border-none cursor-pointer text-gray-500 rounded transition-all duration-200 hover:text-green-600 hover:bg-green-50"
                    title="Mark as reviewed"
                  >
                    <CheckIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveEntry(entry.id);
                    }}
                    className="p-1 bg-transparent border-none cursor-pointer text-gray-500 rounded transition-all duration-200 hover:text-red-600 hover:bg-red-50"
                    title="Remove from vocabulary"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedEntry && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Details</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">Original:</span>
                <span className="ml-2 text-gray-800">{selectedEntry.originalText}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Translation:</span>
                <span className="ml-2 text-gray-800">{selectedEntry.translatedText}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Languages:</span>
                <span className="ml-2 text-gray-800">
                  {getLanguageName(selectedEntry.sourceLanguage)} → {getLanguageName(selectedEntry.targetLanguage)}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Tone:</span>
                <span className="ml-2 text-gray-800 capitalize">{selectedEntry.tone}</span>
              </div>
              {selectedEntry.notes && (
                <div>
                  <span className="font-medium text-gray-600">Notes:</span>
                  <span className="ml-2 text-gray-800">{selectedEntry.notes}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-800">Example Sentences</h4>
              <div className="flex gap-2">
                {isExamplesGenerated ? <button
                    onClick={() => handleGenerateMoreExamples(selectedEntry)}
                    className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    disabled={isGeneratingMore}
                >
                  {isGeneratingMore ? <Loader className="w-3 h-3 animate-spin"/> : 'More Examples'}
                </button> : <button
                    onClick={() => handleGenerateContent(selectedEntry)}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    disabled={isGeneratingMore}
                >
                  {isGeneratingMore ? <Loader className="w-3 h-3 animate-spin" /> : 'Generate'}
                </button>}
              </div>
            </div>
            {isExamplesGenerated ? (
              <div className="space-y-2">
                {selectedEntry?.exampleSentences?.map((sentence, index) => (
                  <div key={index} className="p-2 bg-white rounded border text-sm">
                    {sentence}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No example sentences yet. Click "Generate" to create some.</p>
            )}
          </div>

          <div className="flex gap-2">
            <select
              value={selectedEntry.difficulty}
              onChange={(e) => onUpdateEntry(selectedEntry.id, { difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
              className="flex-1 p-2 border border-gray-300 rounded text-sm"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <button
              onClick={() => onMarkReviewed(selectedEntry.id)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
            >
              Mark Reviewed
            </button>
          </div>
        </div>
      )}
    </div>
  );
};