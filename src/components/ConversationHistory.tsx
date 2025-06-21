import React, { useMemo } from 'react';
import { EyeIcon, XIcon, TrashIcon } from 'lucide-react';
import { ConversationEntry, ConversationHistoryProps } from '../types';
import { LANGUAGES, TONE_DISPLAY_NAMES } from '../constants';

export const ConversationHistory: React.FC<ConversationHistoryProps> = React.memo(({
  history,
  onClearHistory,
  onUseTranslation,
  onRemoveFromHistory,
  sourceLanguage,
  targetLanguage,
  currentTone,
  isSidebar = false,
}) => {
  const displayHistory = useMemo(() => {
    return history.slice(0, isSidebar ? 15 : 10);
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
    return TONE_DISPLAY_NAMES[toneCode as keyof typeof TONE_DISPLAY_NAMES] || toneCode;
  };

  const getLanguageName = (code: string) => {
    return LANGUAGES.find(lang => lang.code === code)?.name || code;
  };

  const isCurrentLanguagePair = (entry: ConversationEntry) => {
    return entry.sourceLanguage === sourceLanguage && 
           entry.targetLanguage === targetLanguage && 
           entry.tone === currentTone;
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-full ${isSidebar ? 'h-full' : ''}`}>
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 m-0">Recent Translations ({history.length})</h3>
        <button
          onClick={onClearHistory}
          className="p-2 bg-transparent border-none rounded-md cursor-pointer text-gray-500 hover:bg-gray-100 hover:text-red-600 transition-all duration-200 flex items-center justify-center"
          title="Clear conversation history"
        >
          <TrashIcon />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {displayHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center text-gray-500">
            <p className="text-sm m-1">No translations yet</p>
            <p className="text-xs text-gray-400 m-1">Your translation history will appear here</p>
          </div>
        ) : (
          displayHistory.map((entry) => (
            <div 
              key={entry.id} 
              className={`bg-white border border-gray-200 rounded-lg mb-3 transition-all duration-200 cursor-pointer hover:border-gray-300 hover:shadow-sm ${
                isCurrentLanguagePair(entry) ? 'border-blue-500 bg-blue-50' : ''
              }`}
            >
              <div className="p-3">
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2 py-1 rounded text-xs font-medium uppercase tracking-wide bg-blue-100 text-blue-800">
                      {getLanguageName(entry.sourceLanguage)}
                    </span>
                    <span className="text-gray-500 font-medium">→</span>
                    <span className="px-2 py-1 rounded text-xs font-medium uppercase tracking-wide bg-green-100 text-green-800">
                      {getLanguageName(entry.targetLanguage)}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium capitalize bg-purple-100 text-purple-700">
                      {getToneDisplayName(entry.tone)}
                    </span>
                  </div>
                  <div className="mb-1 text-sm leading-relaxed text-gray-500">
                    <strong className="text-gray-700 font-semibold">Original:</strong> {entry.originalText}
                  </div>
                  <div className="mb-1 text-sm leading-relaxed text-gray-800">
                    <strong className="text-gray-700 font-semibold">Translation:</strong> {entry.translatedText}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUseTranslation(entry)}
                      className="p-1.5 bg-transparent border-none rounded cursor-pointer text-green-600 hover:bg-green-50 hover:text-green-700 transition-all duration-200 flex items-center justify-center"
                      title="Use this translation as input"
                    >
                      <EyeIcon />
                    </button>
                    <button
                      onClick={() => onRemoveFromHistory(entry.id)}
                      className="p-1.5 bg-transparent border-none rounded cursor-pointer text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 flex items-center justify-center"
                      title="Remove this translation"
                    >
                      <XIcon />
                    </button>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-xs text-gray-500 font-medium">{formatTime(entry.timestamp)}</span>
                    <span className="text-xs text-gray-400">{formatDate(entry.timestamp)}</span>
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
