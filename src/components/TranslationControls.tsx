import React from 'react';
import { Loader } from 'lucide-react';

interface TranslationControlsProps {
  handleTranslateWithContext: () => void;
  isTranslating: boolean;
  isImageProcessing: boolean;
  inputText: string;
  imageFile: File | null;
  error: string;
}

export const TranslationControls: React.FC<TranslationControlsProps> = ({
  handleTranslateWithContext,
  isTranslating,
  isImageProcessing,
  inputText,
  imageFile,
  error,
}) => {
  return (
    <>
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

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
    </>
  );
}; 