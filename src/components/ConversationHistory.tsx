import React, { useMemo } from 'react';
import { TrashIcon, EyeIcon, XIcon } from './icons';

interface ConversationEntry {
  id: string;
  timestamp: number;
  sourceLanguage: string;
  targetLanguage: string;
  originalText: string;
  translatedText: string;
  tone: string;
  context?: string;
}

interface ConversationHistoryProps {
  history: ConversationEntry[];
  onClearHistory: () => void;
  onUseTranslation: (entry: ConversationEntry) => void;
  onRemoveFromHistory: (id: string) => void;
  sourceLanguage: string;
  targetLanguage: string;
  currentTone: string;
  isSidebar?: boolean;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = React.memo(({
  history,
  onClearHistory,
  onUseTranslation,
  onRemoveFromHistory,
  sourceLanguage,
  targetLanguage,
  currentTone,
  isSidebar = false,
}) => {
  // Show all history entries, not filtered by current language/tone
  const displayHistory = useMemo(() => {
    return history.slice(0, isSidebar ? 15 : 10); // Show more entries in sidebar
  }, [history, isSidebar]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getToneDisplayName = (toneCode: string) => {
    const toneMap: { [key: string]: string } = {
      'neutral': 'Neutral',
      'formal': 'Formal',
      'casual': 'Casual',
      'technical': 'Technical'
    };
    return toneMap[toneCode] || toneCode;
  };

  const getLanguageName = (code: string) => {
    const languageMap: { [key: string]: string } = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ukr': 'Ukrainian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'th': 'Thai'
    };
    return languageMap[code] || code;
  };

  const isCurrentLanguagePair = (entry: ConversationEntry) => {
    return entry.sourceLanguage === sourceLanguage && 
           entry.targetLanguage === targetLanguage && 
           entry.tone === currentTone;
  };

  return (
    <div className={`conversation-history ${isSidebar ? 'sidebar' : ''}`}>
      <div className="history-header">
        <h3>Recent Translations ({history.length})</h3>
        <button
          onClick={onClearHistory}
          className="clear-history-button"
          title="Clear conversation history"
        >
          <TrashIcon />
        </button>
      </div>
      
      <div className="history-list">
        {displayHistory.length === 0 ? (
          <div className="empty-history">
            <p>No translations yet</p>
            <p className="empty-hint">Your translation history will appear here</p>
          </div>
        ) : (
          displayHistory.map((entry) => (
            <div key={entry.id} className={`history-item ${isCurrentLanguagePair(entry) ? 'current-language-pair' : ''}`}>
              <div className="history-content">
                <div className="history-text">
                  <div className="language-pair">
                    <span className="language-badge source">
                      {getLanguageName(entry.sourceLanguage)}
                    </span>
                    <span className="language-arrow">→</span>
                    <span className="language-badge target">
                      {getLanguageName(entry.targetLanguage)}
                    </span>
                    <span className="tone-badge">
                      {getToneDisplayName(entry.tone)}
                    </span>
                  </div>
                  <div className="original-text">
                    <strong>Original:</strong> {entry.originalText}
                  </div>
                  <div className="translated-text">
                    <strong>Translation:</strong> {entry.translatedText}
                  </div>
                </div>
                <div className="history-actions">
                  <button
                    onClick={() => onUseTranslation(entry)}
                    className="use-translation-button"
                    title="Use this translation as input"
                  >
                    <EyeIcon />
                  </button>
                  <button
                    onClick={() => onRemoveFromHistory(entry.id)}
                    className="remove-item-button"
                    title="Remove this translation"
                  >
                    <XIcon />
                  </button>
                  <div className="history-time">
                    <span className="time">{formatTime(entry.timestamp)}</span>
                    <span className="date">{formatDate(entry.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

ConversationHistory.displayName = 'ConversationHistory';

export default ConversationHistory; 