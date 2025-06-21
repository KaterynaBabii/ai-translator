export interface IconProps {
  className?: string;
}

export interface Language {
  code: string;
  name: string;
}

export interface Tone {
  code: string;
  name: string;
  description: string;
}

export interface ConversationEntry {
  id: string;
  timestamp: number;
  sourceLanguage: string;
  targetLanguage: string;
  originalText: string;
  translatedText: string;
  tone: string;
  context?: string;
}

export interface VocabularyEntry {
  id: string;
  timestamp: number;
  sourceLanguage: string;
  targetLanguage: string;
  originalText: string;
  translatedText: string;
  tone: string;
  notes?: string;
  exampleSentences?: string[];
  lastReviewed?: number;
  reviewCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SlangDetectionResult {
  hasSlang: boolean;
  slangTerms: string[];
  suggestions: string[];
  context: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface TranslationRequest {
  inputText: string;
  sourceLanguage: string;
  targetLanguage: string;
  tone: string;
  conversationContext?: string;
}

export interface ImageTranslationResult {
  originalText: string;
  translatedText: string;
}

export interface VocabularySaveEntry {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  tone: string;
  notes?: string;
}

export interface UseTranslationReturn {
  translatedText: string;
  isTranslating: boolean;
  error: string;
  setError: (error: string) => void;
  handleTranslate: (
    inputText: string, 
    sourceLanguage: string, 
    targetLanguage: string,
    tone: string,
    conversationContext?: string
  ) => Promise<string | null>;
  setTranslatedText: (text: string) => void;
}

export interface UseConversationHistoryReturn {
  conversationHistory: ConversationEntry[];
  addToHistory: (entry: Omit<ConversationEntry, 'id' | 'timestamp'>) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  getContextForTranslation: (sourceLanguage: string, targetLanguage: string, tone: string, currentText: string) => string;
  getSimilarTranslations: (text: string, sourceLanguage: string, targetLanguage: string, tone: string) => ConversationEntry[];
}

export interface UseVocabularyReturn {
  vocabulary: VocabularyEntry[];
  addToVocabulary: (entry: Omit<VocabularyEntry, 'id' | 'timestamp' | 'reviewCount' | 'difficulty'>) => void;
  removeFromVocabulary: (id: string) => void;
  updateVocabularyEntry: (id: string, updates: Partial<VocabularyEntry>) => void;
  clearVocabulary: () => void;
  markAsReviewed: (id: string) => void;
  generateLearningContent: (entry: VocabularyEntry) => Promise<void>;
  getVocabularyByLanguage: (sourceLanguage: string, targetLanguage: string) => VocabularyEntry[];
  getVocabularyByDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => VocabularyEntry[];
  getVocabularyForReview: () => VocabularyEntry[];
}

export interface UseLanguageDetectionReturn {
  isDetecting: boolean;
  detectedLanguage: string | null;
  detectInputLanguage: (text: string) => Promise<string>;
  resetDetection: () => void;
}

export interface UseLanguageSwapReturn {
  sourceLanguage: string;
  targetLanguage: string;
  setSourceLanguage: (language: string) => void;
  setTargetLanguage: (language: string) => void;
  swapLanguages: (inputText: string, translatedText: string, setInputText: (text: string) => void, setTranslatedText: (text: string) => void) => void;
}

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  startListening: (onTranscript: (transcript: string) => void) => void;
  error: string;
  setError: (error: string) => void;
  detectedVoiceLanguage: string | null;
}

export interface UseImageProcessingReturn {
  isProcessing: boolean;
  extractedText: string;
  imageFile: File | null;
  error: string;
  setError: (error: string) => void;
  extractText: (file: File) => Promise<void>;
  translateImage: (
    file: File,
    sourceLanguage: string,
    targetLanguage: string,
    tone: string,
    conversationContext?: string
  ) => Promise<ImageTranslationResult>;
  clearImage: () => void;
  setExtractedText: (text: string) => void;
}

export interface UseSlangDetectionReturn {
  isAnalyzing: boolean;
  detectionResult: SlangDetectionResult | null;
  analyzeText: (text: string, sourceLanguage: string) => Promise<SlangDetectionResult>;
  clearAnalysis: () => void;
}

export interface ConversationHistoryProps {
  history: ConversationEntry[];
  onClearHistory: () => void;
  onUseTranslation: (entry: ConversationEntry) => void;
  onRemoveFromHistory: (id: string) => void;
  sourceLanguage: string;
  targetLanguage: string;
  currentTone: string;
  isSidebar?: boolean;
}

export interface VocabularySidebarProps {
  vocabulary: VocabularyEntry[];
  onUpdateEntry: (id: string, updates: Partial<VocabularyEntry>) => void;
  onRemoveEntry: (id: string) => void;
  onMarkReviewed: (id: string) => void;
  onGenerateContent: (entry: VocabularyEntry) => Promise<void>;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface VocabularyReviewProps {
  vocabulary: VocabularyEntry[];
  onUpdateEntry: (id: string, updates: Partial<VocabularyEntry>) => void;
  onRemoveEntry: (id: string) => void;
  onMarkReviewed: (id: string) => void;
  onGenerateContent: (entry: VocabularyEntry) => Promise<void>;
  onClose: () => void;
}

export interface SaveToVocabularyButtonProps {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  tone: string;
  onSave: (entry: VocabularySaveEntry) => void;
  isSaved: boolean;
  onRemove?: (id: string) => void;
  entryId?: string;
}

export interface SlangDetectionDisplayProps {
  detectionResult: SlangDetectionResult | null;
  isAnalyzing: boolean;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onClear: () => void;
  selectedFile: File | null;
  isProcessing: boolean;
  error: string;
}

export type InputMode = 'text' | 'image' | 'article';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface VocabularyItem {
  word: string;
  translation: string;
  explanation: string;
  exampleSource: string;
  exampleTarget: string;
}

export interface ArticleLearningProps {
  sourceLanguage: string;
  targetLanguage: string;
  selectedTone: string;
  languages: Language[];
  tones: Tone[];
  onSaveToVocabulary: (entry: VocabularySaveEntry) => void;
  onAddToHistory: (entry: Omit<ConversationEntry, 'id' | 'timestamp'>) => void;
} 