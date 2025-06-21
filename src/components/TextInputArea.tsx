import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { SlangDetectionDisplay } from './SlangDetectionDisplay';
import { SlangDetectionResult } from '../types';

interface TextInputAreaProps {
  inputText: string;
  setInputText: (text: string) => void;
  isListening: boolean;
  handleStartListening: () => void;
  slangDetectionResult: SlangDetectionResult | null;
  isSlangAnalyzing: boolean;
}

export const TextInputArea: React.FC<TextInputAreaProps> = ({
  inputText,
  setInputText,
  isListening,
  handleStartListening,
  slangDetectionResult,
  isSlangAnalyzing,
}) => {
  return (
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
  );
}; 