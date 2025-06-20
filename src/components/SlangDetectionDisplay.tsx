import React from 'react';

interface SlangDetectionResult {
  hasSlang: boolean;
  slangTerms: string[];
  suggestions: string[];
  context: string;
}

interface SlangDetectionDisplayProps {
  detectionResult: SlangDetectionResult | null;
  isAnalyzing: boolean;
}

const SlangDetectionDisplay: React.FC<SlangDetectionDisplayProps> = ({
  detectionResult,
  isAnalyzing,
}) => {
  if (isAnalyzing) {
    return (
      <div className="slang-detection-analyzing">
        <div className="analyzing-spinner"></div>
        <span>Analyzing for slang and idioms...</span>
      </div>
    );
  }

  if (!detectionResult || !detectionResult.hasSlang) {
    return null;
  }

  return (
    <div className="slang-detection-result">
      <div className="slang-header">
        <span className="slang-icon">💬</span>
        <span className="slang-title">Slang & Idioms Detected</span>
      </div>
      
      <div className="slang-content">
        <div className="slang-terms">
          <strong>Detected terms:</strong>
          <div className="terms-list">
            {detectionResult.slangTerms.map((term, index) => (
              <span key={index} className="slang-term">
                {term}
              </span>
            ))}
          </div>
        </div>
        
        {detectionResult.suggestions.length > 0 && (
          <div className="slang-suggestions">
            <strong>Translation tips:</strong>
            <ul className="suggestions-list">
              {detectionResult.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="slang-note">
          <span className="note-icon">💡</span>
          <span>These will be translated naturally, not literally</span>
        </div>
      </div>
    </div>
  );
};

export default SlangDetectionDisplay; 