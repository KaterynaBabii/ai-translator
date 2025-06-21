import React from 'react';
import { ArrowRightLeft, Loader } from 'lucide-react';
import { DetectIcon } from './icons/DetectIcon';
import { Language } from '../types';

interface LanguageSelectorProps {
  sourceLanguage: string;
  targetLanguage: string;
  setSourceLanguage: (language: string) => void;
  setTargetLanguage: (language: string) => void;
  swapLanguages: () => void;
  autoDetectEnabled: boolean;
  setAutoDetectEnabled: (enabled: boolean) => void;
  autoUpdateVoiceLanguage: boolean;
  setAutoUpdateVoiceLanguage: (enabled: boolean) => void;
  isDetecting: boolean;
  handleManualDetect: () => void;
  detectedLanguage: string | null;
  detectedVoiceLanguage: string | null;
  getLanguageName: (code: string) => string;
  languages: Language[];
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  sourceLanguage,
  targetLanguage,
  setSourceLanguage,
  setTargetLanguage,
  swapLanguages,
  autoDetectEnabled,
  setAutoDetectEnabled,
  autoUpdateVoiceLanguage,
  setAutoUpdateVoiceLanguage,
  isDetecting,
  handleManualDetect,
  detectedLanguage,
  detectedVoiceLanguage,
  getLanguageName,
  languages,
}) => {
  return (
      <>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white min-w-[150px]"
            >
              {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
              ))}
            </select>
          </div>

          <button
              onClick={swapLanguages}
              className="p-3 bg-transparent border border-gray-300 rounded-lg cursor-pointer text-gray-500 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 transition-all duration-200 flex items-center justify-center"
              title="Swap languages"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>

          <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg text-sm bg-white min-w-[150px]"
          >
            {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
            ))}
          </select>
        </div>
        <div>
          {detectedVoiceLanguage && autoUpdateVoiceLanguage && (
              <div className="text-xs text-green-600 mt-1 font-medium">
                Voice: {getLanguageName(detectedVoiceLanguage)}
              </div>
          )}
          {detectedLanguage && autoDetectEnabled && (
              <div className="text-xs text-green-600 mt-1 font-medium">
                Detected: {getLanguageName(detectedLanguage)}
              </div>
          )}
        </div>
        <div className="flex gap-4 items-center mb-6 mt-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
                type="checkbox"
                checked={autoDetectEnabled}
                onChange={(e) => setAutoDetectEnabled(e.target.checked)}
                className="w-4 h-4"
            />
            <span>Auto-detect text</span>
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
                type="checkbox"
                checked={autoUpdateVoiceLanguage}
                onChange={(e) => setAutoUpdateVoiceLanguage(e.target.checked)}
                className="w-4 h-4"
            />
            <span>Auto-update voice</span>
          </label>

          <button
              onClick={handleManualDetect}
              disabled={isDetecting}
              className="p-2 bg-transparent border border-gray-300 rounded-md cursor-pointer text-gray-500 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              title="Manually detect language"
          >
            {isDetecting ? <Loader className="animate-spin w-4 h-4" /> : <DetectIcon className="w-4 h-4" />}
          </button>
        </div>
      </>

  );
}; 