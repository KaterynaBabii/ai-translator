import { Language, Tone } from '../types';

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ukr', name: 'Ukrainian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'th', name: 'Thai' },
];

export const TONES: Tone[] = [
  { code: 'neutral', name: 'Neutral', description: 'Standard translation' },
  { code: 'formal', name: 'Formal', description: 'Professional and respectful' },
  { code: 'casual', name: 'Casual', description: 'Friendly and informal' },
  { code: 'technical', name: 'Technical', description: 'Precise and specialized' },
];

export const SPEECH_LANGUAGE_CODES = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  pt: 'pt-PT',
  ukr: 'uk-UA',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
  th: 'th-TH',
};

export const STORAGE_KEYS = {
  CONVERSATION_HISTORY: 'ai-translator-conversation-history',
  VOCABULARY: 'ai-translator-vocabulary',
} as const;

export const UI_CONSTANTS = {
  MAX_HISTORY_SIZE: 100,
  MAX_VOCABULARY_SIZE: 500,
  MAX_EXAMPLE_SENTENCES: 3,
  DEBOUNCE_DELAY: 500,
  REVIEW_INTERVAL: 24 * 60 * 60 * 1000,
} as const;

export const ERROR_MESSAGES = {
  TRANSLATION_FAILED: 'Translation failed. Please try again.',
  LANGUAGE_DETECTION_FAILED: 'Language detection failed. Please try again.',
  IMAGE_PROCESSING_FAILED: 'Failed to process image. Please try again.',
  EXAMPLE_GENERATION_FAILED: 'Failed to generate example sentences. Please try again.',
  SPEECH_RECOGNITION_FAILED: 'Speech recognition failed. Please try again.',
  SPEECH_RECOGNITION_NO_SPEECH: 'No speech detected. Please try speaking again.',
  SPEECH_RECOGNITION_MICROPHONE_DENIED: 'Microphone access denied. Please allow microphone access.',
  SPEECH_SYNTHESIS_FAILED: 'Speech synthesis failed. Please try again.',
} as const;

export const API_ENDPOINTS = {
  GEMINI_MODEL: 'gemini-2.5-flash-preview-04-17',
} as const;

export const SLANG_PATTERNS = {
  en: [
    /\b(what's up|sup|hey|yo|cool|awesome|sick|lit|fire|bae|fam|bro|dude|guy|buddy)\b/gi,
    /\b(break a leg|piece of cake|hit the nail on the head|let the cat out of the bag|pull someone's leg)\b/gi,
    /\b(gonna|wanna|gotta|lemme|kinda|sorta|y'all|ain't)\b/gi,
    /\b(slay|tea|shade|thirsty|salty|extra|basic|woke|canceled|flex|clout)\b/gi,
  ],
  es: [
    /\b(¿qué tal\?|¿qué onda\?|chido|padre|guey|wey|tío|tía|colega|pana|chevere|bacán)\b/gi,
    /\b(estar en las nubes|dar en el clavo|ser pan comido|meter la pata|estar como una cabra)\b/gi,
  ],
  fr: [
    /\b(salut|coucou|sympa|cool|super|génial|chouette|truc|machin|bidule|kiffer|grave)\b/gi,
    /\b(avoir le cafard|être dans la lune|casser les pieds|avoir un chat dans la gorge|être comme un poisson dans l'eau)\b/gi,
  ],
  de: [
    /\b(hey|cool|super|geil|krass|mega|voll|echt|total|hammer|spitze|klasse)\b/gi,
    /\b(die Nase voll haben|ins Gras beißen|den Nagel auf den Kopf treffen|wie ein Fisch im Wasser sein)\b/gi,
  ],
  it: [
    /\b(ciao|bella|figo|forte|grande|mitico|fantastico|stupendo|che bello|che figata)\b/gi,
    /\b(essere nelle nuvole|colpire nel segno|essere un gioco da ragazzi|fare una gaffe)\b/gi,
  ],
  pt: [
    /\b(oi|e aí|beleza|legal|massa|da hora|mano|cara|tipo|tipo assim|sacanagem)\b/gi,
    /\b(estar nas nuvens|dar no alvo|ser moleza|meter os pés pelas mãos)\b/gi,
  ],
  ukr: [
    /\b(привіт|салют|круто|супер|класно|файно|здорово|вау|ого|ну|ну і|типу)\b/gi,
    /\b(бути в хмарах|потрапити в точку|бути як риба у воді|наступити на граблі)\b/gi,
  ],
  ja: [
    /\b(やあ|よっ|すげー|やばい|マジ|超|めっちゃ|ガチ|ウケる|キモい|ダサい)\b/gi,
    /\b(雲の上にいる|的を射る|朝飯前|足を踏む)\b/gi,
  ],
  ko: [
    /\b(안녕|야|와|대박|쩐다|미쳤다|개|진짜|너무|완전|사랑해|헐)\b/gi,
    /\b(구름 위에 있다|정확히 맞추다|식은 죽 먹기|발을 밟다)\b/gi,
  ],
  zh: [
    /\b(嗨|嘿|哇|太棒了|厉害|牛逼|酷|帅|好|不错|可以|还行)\b/gi,
    /\b(心不在焉|一针见血|小菜一碟|弄巧成拙)\b/gi,
  ],
  th: [
    /\b(สวัสดี|เฮ้|ว้าว|เจ๋ง|สุดยอด|ดี|ไม่เลว|โอเค|ได้|ไม่เป็นไร|สบาย|ชิว)\b/gi,
    /\b(อยู่บนเมฆ|ตีถูกจุด|ง่ายเหมือนปอกกล้วย|เหยียบพลาด)\b/gi,
    /\b(อ่ะ|อะ|เนอะ|แหละ|สิ|น่ะ|เหรอ|หรอ|อ่ะ|อะ|เนอะ)\b/gi,
  ],
} as const;

export const TONE_DISPLAY_NAMES = {
  neutral: 'Neutral',
  formal: 'Formal',
  casual: 'Casual',
  technical: 'Technical',
} as const;

export const DIFFICULTY_LEVELS = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
} as const;

export const DIFFICULTY_COLORS = {
  easy: 'text-green-600',
  medium: 'text-yellow-600',
  hard: 'text-red-600',
} as const; 