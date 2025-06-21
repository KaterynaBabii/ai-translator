import React, { useState } from 'react';
import {BookmarkIcon, BookmarkCheckIcon, CheckIcon, XIcon } from 'lucide-react';
import { SaveToVocabularyButtonProps } from '../types';

export const SaveToVocabularyButton: React.FC<SaveToVocabularyButtonProps> = ({
  originalText,
  translatedText,
  sourceLanguage,
  targetLanguage,
  tone,
  onSave,
  isSaved,
  onRemove,
  entryId,
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!originalText.trim() || !translatedText.trim()) return;

    setIsSaving(true);
    try {
      onSave({
        originalText: originalText.trim(),
        translatedText: translatedText.trim(),
        sourceLanguage,
        targetLanguage,
        tone,
        notes: notes.trim() || undefined,
      });
      setNotes('');
      setShowNotes(false);
    } catch (error) {
      console.error('Failed to save to vocabulary:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = () => {
    if (onRemove && entryId) {
      onRemove(entryId);
    }
  };

  if (isSaved) {
    return (
      <div className="flex items-center">
        <button
          onClick={handleRemove}
          className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm cursor-pointer transition-all duration-200 hover:bg-green-100 hover:border-green-300"
          title="Remove from vocabulary"
        >
          <BookmarkCheckIcon className="w-4 h-4" />
          <span>Saved</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {!showNotes ? (
        <button
          onClick={() => setShowNotes(true)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md text-sm cursor-pointer transition-all duration-200 hover:bg-gray-200 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Save to My Vocabulary"
          disabled={isSaving}
        >
          <BookmarkIcon className="w-4 h-4" />
          <span>Save to Vocabulary</span>
        </button>
      ) : (
        <div className="absolute top-full right-0 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-2">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h4 className="text-base font-semibold text-gray-800 m-0">Add to Vocabulary</h4>
            <button
              onClick={() => setShowNotes(false)}
              className="p-1 bg-transparent border-none text-gray-500 cursor-pointer rounded transition-all duration-200 hover:bg-gray-100 hover:text-gray-700"
              title="Cancel"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-4">
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <div className="mb-2 text-sm">
                <strong>Original:</strong> {originalText}
              </div>
              <div className="text-sm">
                <strong>Translation:</strong> {translatedText}
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="vocabulary-notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional):
              </label>
              <textarea
                id="vocabulary-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add usage examples, grammar tips, or personal notes..."
                rows={3}
                maxLength={500}
                className="w-full p-3 border border-gray-300 rounded-md text-sm resize-y min-h-[80px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {notes.length}/500
              </div>
            </div>
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowNotes(false)}
                className="px-4 py-2 bg-transparent border border-gray-300 rounded-md text-gray-700 text-sm cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white border-none rounded-md text-sm cursor-pointer transition-all duration-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

