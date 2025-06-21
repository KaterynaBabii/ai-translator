import React from 'react';
import { Tone } from '../types';

interface ToneSelectorProps {
  selectedTone: string;
  setSelectedTone: (tone: string) => void;
  tones: Tone[];
}

export const ToneSelector: React.FC<ToneSelectorProps> = ({
  selectedTone,
  setSelectedTone,
  tones,
}) => {
  return (
    <div className="mb-6">
      <label htmlFor="tone-select" className="block text-sm font-medium text-gray-700 mb-2">
        Translation Tone:
      </label>
      <select
        id="tone-select"
        value={selectedTone}
        onChange={(e) => setSelectedTone(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white"
      >
        {tones.map((tone) => (
          <option key={tone.code} value={tone.code}>
            {tone.name} - {tone.description}
          </option>
        ))}
      </select>
    </div>
  );
}; 