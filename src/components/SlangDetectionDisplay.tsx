import React from 'react';
import { SlangDetectionDisplayProps } from '../types';

const SlangDetectionDisplay: React.FC<SlangDetectionDisplayProps> = ({
  detectionResult,
  isAnalyzing,
}) => {
  if (isAnalyzing) {
    return (
      <div className="flex items-center gap-2 mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-blue-700">Analyzing for slang and idioms...</span>
      </div>
    );
  }

  if (!detectionResult || !detectionResult.hasSlang) {
    return null;
  }

  return (
    <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">💬</span>
        <span className="font-medium text-yellow-800">Slang & Idioms Detected</span>
      </div>
      
      <div className="space-y-3">
        <div>
          <strong className="text-yellow-800">Detected terms:</strong>
          <div className="flex flex-wrap gap-2 mt-1">
            {detectionResult.slangTerms.map((term, index) => (
              <span key={index} className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-sm font-medium">
                {term}
              </span>
            ))}
          </div>
        </div>
        
        {detectionResult.suggestions.length > 0 && (
          <div>
            <strong className="text-yellow-800">Translation tips:</strong>
            <ul className="mt-1 ml-4 list-disc text-sm text-yellow-700">
              {detectionResult.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex items-center gap-2 pt-2 border-t border-yellow-200">
          <span className="text-lg">💡</span>
          <span className="text-sm text-yellow-700">These will be translated naturally, not literally</span>
        </div>
      </div>
    </div>
  );
};

export default SlangDetectionDisplay; 