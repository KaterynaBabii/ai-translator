import React from 'react';

interface InputModeSelectorProps {
  inputMode: 'text' | 'image' | 'article';
  handleInputModeChange: (mode: 'text' | 'image' | 'article') => void;
}

export const InputModeSelector: React.FC<InputModeSelectorProps> = ({
  inputMode,
  handleInputModeChange,
}) => {
  return (
    <div className="flex gap-2 mb-6">
      <button
        className={`flex-1 py-3 px-4 bg-transparent border border-gray-300 rounded-lg text-sm cursor-pointer transition-all duration-200 ${
          inputMode === 'text' 
            ? 'bg-blue-600 border-blue-600 ' 
            : 'text-gray-500 hover:bg-gray-50 hover:border-gray-400'
        }`}
        onClick={() => handleInputModeChange('text')}
      >
        Text Input
      </button>
      <button
        className={`flex-1 py-3 px-4 bg-transparent border border-gray-300 rounded-lg text-sm cursor-pointer transition-all duration-200 ${
          inputMode === 'image' 
            ? 'bg-blue-600 border-blue-600 e' 
            : 'text-gray-500 hover:bg-gray-50 hover:border-gray-400'
        }`}
        onClick={() => handleInputModeChange('image')}
      >
        Image Upload
      </button>
      <button
        className={`flex-1 py-3 px-4 bg-transparent border border-gray-300 rounded-lg text-sm cursor-pointer transition-all duration-200 ${
          inputMode === 'article' 
            ? 'bg-blue-600 border-blue-600 ' 
            : 'text-gray-500 hover:bg-gray-50 hover:border-gray-400'
        }`}
        onClick={() => handleInputModeChange('article')}
      >
        Article Learning
      </button>
    </div>
  );
}; 