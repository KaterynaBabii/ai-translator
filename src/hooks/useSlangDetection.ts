import { useState, useCallback } from 'react';

interface SlangDetectionResult {
  hasSlang: boolean;
  slangTerms: string[];
  suggestions: string[];
  context: string;
}

interface UseSlangDetectionReturn {
  isAnalyzing: boolean;
  detectionResult: SlangDetectionResult | null;
  analyzeText: (text: string, sourceLanguage: string) => Promise<SlangDetectionResult>;
  clearAnalysis: () => void;
}

// Common slang and idiom patterns for different languages
const SLANG_PATTERNS = {
  en: [
    // Common English slang
    /\b(what's up|sup|hey|yo|cool|awesome|sick|lit|fire|bae|fam|bro|dude|guy|buddy)\b/gi,
    // Idioms
    /\b(break a leg|piece of cake|hit the nail on the head|let the cat out of the bag|pull someone's leg)\b/gi,
    // Informal expressions
    /\b(gonna|wanna|gotta|lemme|kinda|sorta|y'all|ain't)\b/gi,
    // Modern slang
    /\b(slay|tea|shade|thirsty|salty|extra|basic|woke|canceled|flex|clout)\b/gi,
  ],
  es: [
    // Spanish slang
    /\b(¿qué tal\?|¿qué onda\?|chido|padre|guey|wey|tío|tía|colega|pana|chevere|bacán)\b/gi,
    // Spanish idioms
    /\b(estar en las nubes|dar en el clavo|ser pan comido|meter la pata|estar como una cabra)\b/gi,
  ],
  fr: [
    // French slang
    /\b(salut|coucou|sympa|cool|super|génial|chouette|truc|machin|bidule|kiffer|grave)\b/gi,
    // French idioms
    /\b(avoir le cafard|être dans la lune|casser les pieds|avoir un chat dans la gorge|être comme un poisson dans l'eau)\b/gi,
  ],
  de: [
    // German slang
    /\b(hey|cool|super|geil|krass|mega|voll|echt|total|hammer|spitze|klasse)\b/gi,
    // German idioms
    /\b(die Nase voll haben|ins Gras beißen|den Nagel auf den Kopf treffen|wie ein Fisch im Wasser sein)\b/gi,
  ],
  it: [
    // Italian slang
    /\b(ciao|bella|figo|forte|grande|mitico|fantastico|stupendo|che bello|che figata)\b/gi,
    // Italian idioms
    /\b(essere nelle nuvole|colpire nel segno|essere un gioco da ragazzi|fare una gaffe)\b/gi,
  ],
  pt: [
    // Portuguese slang
    /\b(oi|e aí|beleza|legal|massa|da hora|mano|cara|tipo|tipo assim|sacanagem)\b/gi,
    // Portuguese idioms
    /\b(estar nas nuvens|dar no alvo|ser moleza|meter os pés pelas mãos)\b/gi,
  ],
  ukr: [
    // Ukrainian slang
    /\b(привіт|салют|круто|супер|класно|файно|здорово|вау|ого|ну|ну і|типу)\b/gi,
    // Ukrainian idioms
    /\b(бути в хмарах|потрапити в точку|бути як риба у воді|наступити на граблі)\b/gi,
  ],
  ja: [
    // Japanese slang
    /\b(やあ|よっ|すげー|やばい|マジ|超|めっちゃ|ガチ|ウケる|キモい|ダサい)\b/gi,
    // Japanese idioms
    /\b(雲の上にいる|的を射る|朝飯前|足を踏む)\b/gi,
  ],
  ko: [
    // Korean slang
    /\b(안녕|야|와|대박|쩐다|미쳤다|개|진짜|너무|완전|사랑해|헐)\b/gi,
    // Korean idioms
    /\b(구름 위에 있다|정확히 맞추다|식은 죽 먹기|발을 밟다)\b/gi,
  ],
  zh: [
    // Chinese slang
    /\b(嗨|嘿|哇|太棒了|厉害|牛逼|酷|帅|好|不错|可以|还行)\b/gi,
    // Chinese idioms
    /\b(心不在焉|一针见血|小菜一碟|弄巧成拙)\b/gi,
  ],
  th: [
    // Thai slang
    /\b(สวัสดี|เฮ้|ว้าว|เจ๋ง|สุดยอด|ดี|ไม่เลว|โอเค|ได้|ไม่เป็นไร|สบาย|ชิว)\b/gi,
    // Thai idioms
    /\b(อยู่บนเมฆ|ตีถูกจุด|ง่ายเหมือนปอกกล้วย|เหยียบพลาด)\b/gi,
    // Thai informal expressions
    /\b(อ่ะ|อะ|เนอะ|แหละ|สิ|น่ะ|เหรอ|หรอ|อ่ะ|อะ|เนอะ)\b/gi,
  ],
};

export const useSlangDetection = (): UseSlangDetectionReturn => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<SlangDetectionResult | null>(null);

  const analyzeText = useCallback(async (text: string, sourceLanguage: string): Promise<SlangDetectionResult> => {
    if (!text.trim()) {
      return {
        hasSlang: false,
        slangTerms: [],
        suggestions: [],
        context: '',
      };
    }

    setIsAnalyzing(true);

    try {
      // Get patterns for the source language
      const patterns = SLANG_PATTERNS[sourceLanguage as keyof typeof SLANG_PATTERNS] || [];
      
      const slangTerms: string[] = [];
      const suggestions: string[] = [];

      // Check for slang patterns
      patterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
          slangTerms.push(...matches);
        }
      });

      // Generate context based on detected slang
      let context = '';
      if (slangTerms.length > 0) {
        context = `This text contains ${slangTerms.length} slang or idiomatic expression${slangTerms.length > 1 ? 's' : ''}: ${slangTerms.join(', ')}. Please translate these naturally and contextually, not literally.`;
        
        // Add specific suggestions based on detected terms
        slangTerms.forEach(term => {
          const lowerTerm = term.toLowerCase();
          if (lowerTerm.includes('what') && lowerTerm.includes('up')) {
            suggestions.push('Consider translating "What\'s up?" as a natural greeting equivalent');
          } else if (lowerTerm.includes('cool')) {
            suggestions.push('Translate "cool" as an appropriate casual expression in the target language');
          } else if (lowerTerm.includes('break') && lowerTerm.includes('leg')) {
            suggestions.push('Translate "break a leg" as a cultural equivalent for good luck');
          } else if (lowerTerm.includes('piece') && lowerTerm.includes('cake')) {
            suggestions.push('Translate "piece of cake" as a natural equivalent for "easy"');
          }
        });
      }

      const result: SlangDetectionResult = {
        hasSlang: slangTerms.length > 0,
        slangTerms,
        suggestions,
        context,
      };

      setDetectionResult(result);
      return result;
    } catch (error) {
      console.error('Slang detection error:', error);
      return {
        hasSlang: false,
        slangTerms: [],
        suggestions: [],
        context: '',
      };
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setDetectionResult(null);
  }, []);

  return {
    isAnalyzing,
    detectionResult,
    analyzeText,
    clearAnalysis,
  };
}; 