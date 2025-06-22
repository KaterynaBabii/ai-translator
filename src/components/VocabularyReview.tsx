import React, { useState, useMemo, useEffect } from 'react';
import { PlayIcon, TrashIcon, CheckIcon, Loader, XIcon, PauseIcon, BookIcon } from 'lucide-react';

import { speakText } from '../utils/speechSynthesis';
import { VocabularyEntry, VocabularyReviewProps } from '../types';
import { UI_CONSTANTS } from '../constants';

export const VocabularyReview: React.FC<VocabularyReviewProps> = ({
  vocabulary,
  onUpdateEntry,
  onRemoveEntry,
  onMarkReviewed,
  onGenerateContent,
  onClose,
}) => {
  const [selectedEntry, setSelectedEntry] = useState<VocabularyEntry | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard' | 'review'>('all');

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
          const oneDay = 24 * 60 * 60 * 1000;
          return !entry.lastReviewed || (now - entry.lastReviewed) > oneDay;
        });
      default:
        return vocabulary;
    }
  }, [vocabulary, filter]);

  const handlePlayAudio = (text: string, language: string) => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    speakText(text, language).finally(() => {
      setIsPlaying(false);
    });
  };

  const handleGenerateContent = async (entry: VocabularyEntry) => {
    try {
      await onGenerateContent(entry);
    } catch (error) {
      console.error('Failed to generate content:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getLanguageName = (code: string) => {
    const languageMap: { [key: string]: string } = {
      'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
      'it': 'Italian', 'pt': 'Portuguese', 'ukr': 'Ukrainian', 'ja': 'Japanese',
      'ko': 'Korean', 'zh': 'Chinese', 'th': 'Thai'
    };
    return languageMap[code] || code;
  };

  return (
    <div className="vocabulary-review-overlay">
      <div className="vocabulary-review-modal">
        <div className="review-header">
          <h2>My Vocabulary ({vocabulary.length} words)</h2>
          <button onClick={onClose} className="close-review-button">
            <XIcon />
          </button>
        </div>

        <div className="review-content">
          <div className="review-sidebar">
            <div className="filter-controls">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="filter-select"
              >
                <option value="all">All Words</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="review">Need Review</option>
              </select>
            </div>

            <div className="vocabulary-list">
              {filteredVocabulary.length === 0 ? (
                <div className="empty-vocabulary">
                  <p>No vocabulary items found</p>
                  <p className="empty-hint">Save words from translations to see them here</p>
                </div>
              ) : (
                filteredVocabulary.map((entry) => (
                  <div
                    key={entry.id}
                    className={`vocabulary-item ${selectedEntry?.id === entry.id ? 'selected' : ''}`}
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <div className="item-main">
                      <div className="item-text">
                        <div className="original-word">{entry.originalText}</div>
                        <div className="translation-word">{entry.translatedText}</div>
                      </div>
                      <div className="item-meta">
                        <span 
                          className="difficulty-badge"
                          style={{ backgroundColor: getDifficultyColor(entry.difficulty) }}
                        >
                          {entry.difficulty}
                        </span>
                        <span className="review-count">
                          {entry.reviewCount} reviews
                        </span>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayAudio(entry.originalText, entry.sourceLanguage);
                        }}
                        className="play-button"
                        title="Play pronunciation"
                      >
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="review-detail">
            {selectedEntry ? (
              <div className="entry-detail">
                <div className="detail-header">
                  <div className="word-display">
                    <div className="original-display">
                      <h3>{selectedEntry.originalText}</h3>
                      <button
                        onClick={() => handlePlayAudio(selectedEntry.originalText, selectedEntry.sourceLanguage)}
                        className="play-word-button"
                        title="Play pronunciation"
                      >
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                      </button>
                    </div>
                    <div className="translation-display">
                      <h4>{selectedEntry.translatedText}</h4>
                      <button
                        onClick={() => handlePlayAudio(selectedEntry.translatedText, selectedEntry.targetLanguage)}
                        className="play-word-button"
                        title="Play pronunciation"
                      >
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="detail-meta">
                    <div className="language-pair">
                      {getLanguageName(selectedEntry.sourceLanguage)} → {getLanguageName(selectedEntry.targetLanguage)}
                    </div>
                    <div className="difficulty-control">
                      <label>Difficulty:</label>
                      <select
                        value={selectedEntry.difficulty}
                        onChange={(e) => onUpdateEntry(selectedEntry.id, { difficulty: e.target.value as any })}
                        className="difficulty-select"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                </div>

                {selectedEntry.notes && (
                  <div className="notes-section">
                    <h5>Notes:</h5>
                    <p>{selectedEntry.notes}</p>
                  </div>
                )}

                <div className="learning-content">
                  {selectedEntry.exampleSentences && selectedEntry.exampleSentences.length > 0 ? (
                    <div className="examples-section">
                      <h5>Example Sentences:</h5>
                      <ul>
                        {selectedEntry.exampleSentences.map((sentence, index) => (
                          <li key={index}>{sentence}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGenerateContent(selectedEntry)}
                      className="generate-content-button"
                    >
                      <Loader />
                      Generate Examples
                    </button>
                  )}
                </div>

                <div className="detail-actions">
                  <button
                    onClick={() => onMarkReviewed(selectedEntry.id)}
                    className="mark-reviewed-button"
                  >
                    <CheckIcon />
                    Mark as Reviewed
                  </button>
                  <button
                    onClick={() => onRemoveEntry(selectedEntry.id)}
                    className="remove-entry-button"
                  >
                    <TrashIcon />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <BookIcon />
                <p>Select a word to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};