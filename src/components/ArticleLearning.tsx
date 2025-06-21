import React, { useState, useCallback } from 'react';
import { BookOpen, Loader, Download, Eye, EyeOff, Link, FileText } from 'lucide-react';
import { Language, Tone } from '../types';

interface VocabularyItem {
  word: string;
  translation: string;
  explanation: string;
  exampleSource: string;
  exampleTarget: string;
}

interface ArticleLearningProps {
  sourceLanguage: string;
  targetLanguage: string;
  selectedTone: string;
  languages: Language[];
  tones: Tone[];
  onSaveToVocabulary: (entry: {
    originalText: string;
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
    tone: string;
    notes?: string;
  }) => void;
}

export const ArticleLearning: React.FC<ArticleLearningProps> = ({
  sourceLanguage,
  targetLanguage,
  selectedTone,
  languages,
  tones,
  onSaveToVocabulary,
}) => {
  const [articleText, setArticleText] = useState('');
  const [articleUrl, setArticleUrl] = useState('');
  const [inputMethod, setInputMethod] = useState<'text' | 'url'>('text');
  const [difficultyLevel, setDifficultyLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItem[]>([]);
  const [showExplanations, setShowExplanations] = useState(true);
  const [error, setError] = useState('');

  const handleFetchArticle = useCallback(async () => {
    if (!articleUrl.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setIsFetching(true);
    setError('');

    try {
      const { fetchArticleContent } = await import('../helpers');
      const content = await fetchArticleContent(articleUrl);
      setArticleText(content);
      setInputMethod('text');
    } catch (err) {
      console.error('Article fetching failed:', err);
      setError('Failed to fetch article from URL. Please check the URL and try again.');
    } finally {
      setIsFetching(false);
    }
  }, [articleUrl]);

  const handleAnalyzeArticle = useCallback(async () => {
    if (!articleText.trim()) {
      setError('Please enter article text to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const { analyzeArticleForVocabulary } = await import('../helpers');
      const items = await analyzeArticleForVocabulary(
        articleText,
        sourceLanguage,
        targetLanguage,
        difficultyLevel,
        selectedTone
      );

      setVocabularyItems(items);
    } catch (err) {
      console.error('Article analysis failed:', err);
      setError('Failed to analyze article. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [articleText, sourceLanguage, targetLanguage, difficultyLevel, selectedTone]);

  const handleSaveVocabularyItem = useCallback((item: VocabularyItem) => {
    onSaveToVocabulary({
      originalText: item.word,
      translatedText: item.translation,
      sourceLanguage,
      targetLanguage,
      tone: selectedTone,
      notes: `${item.explanation}\n\nExample: ${item.exampleSource}`,
    });
  }, [onSaveToVocabulary, sourceLanguage, targetLanguage, selectedTone]);

  const handleExportVocabulary = useCallback(() => {
    if (vocabularyItems.length === 0) return;

    const csvContent = [
      'Word/Phrase,Translation,Explanation,Example (Source),Example (Target)',
      ...vocabularyItems.map(item => 
        `"${item.word}","${item.translation}","${item.explanation}","${item.exampleSource}","${item.exampleTarget}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocabulary-${sourceLanguage}-${targetLanguage}-${difficultyLevel}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [vocabularyItems, sourceLanguage, targetLanguage, difficultyLevel]);

  const clearArticle = useCallback(() => {
    setArticleText('');
    setArticleUrl('');
    setVocabularyItems([]);
    setError('');
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="px-6 py-3 bg-blue-50 border-b border-blue-200 rounded-t-xl">
        <h3 className="text-lg font-semibold text-blue-800 m-0 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Article Learning
        </h3>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level:
          </label>
          <select
            value={difficultyLevel}
            onChange={(e) => setDifficultyLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Input Method:
          </label>
          <div className="flex gap-2 mb-4">
            <button
              className={`flex-1 py-3 px-4 bg-transparent border border-gray-300 rounded-lg text-sm cursor-pointer transition-all duration-200 ${
                inputMethod === 'text' 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'text-gray-500 hover:bg-gray-50 hover:border-gray-400'
              }`}
              onClick={() => setInputMethod('text')}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Paste Text
            </button>
            <button
              className={`flex-1 py-3 px-4 bg-transparent border border-gray-300 rounded-lg text-sm cursor-pointer transition-all duration-200 ${
                inputMethod === 'url' 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'text-gray-500 hover:bg-gray-50 hover:border-gray-400'
              }`}
              onClick={() => setInputMethod('url')}
            >
              <Link className="w-4 h-4 inline mr-2" />
              Article URL
            </button>
          </div>

          {inputMethod === 'text' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Text ({languages.find(lang => lang.code === sourceLanguage)?.name}):
              </label>
              <textarea
                value={articleText}
                onChange={(e) => setArticleText(e.target.value)}
                placeholder={`Paste your article text in ${languages.find(lang => lang.code === sourceLanguage)?.name} here...`}
                className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg text-base resize-y font-inherit focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article URL:
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={articleUrl}
                  onChange={(e) => setArticleUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="flex-1 p-3 border border-gray-300 rounded-lg text-base font-inherit focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                <button
                  onClick={handleFetchArticle}
                  disabled={isFetching || !articleUrl.trim()}
                  className="px-6 py-3 bg-green-600 text-white border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFetching ? (
                    <>
                      <Loader className="animate-spin w-4 h-4" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4" />
                      Fetch
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Supported: News articles, blog posts, and most web content
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={handleAnalyzeArticle}
            disabled={isAnalyzing || !articleText.trim() || !articleText}
            className="flex-1 p-3 bg-blue-600 text-white border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <Loader className="animate-spin w-5 h-5" />
                Analyzing...
              </>
            ) : (
              <>
                <BookOpen className="w-5 h-5" />
                Analyze Article
              </>
            )}
          </button>
          
          <button
            onClick={clearArticle}
            disabled={!articleText.trim() && !articleUrl.trim()}
            className="px-4 py-3 bg-gray-500 text-white border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {vocabularyItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-800 m-0">
                Vocabulary ({vocabularyItems.length} items)
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowExplanations(!showExplanations)}
                  className="p-2 bg-transparent border border-gray-300 rounded-md cursor-pointer text-gray-500 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 transition-all duration-200 flex items-center justify-center"
                  title={showExplanations ? 'Hide explanations' : 'Show explanations'}
                >
                  {showExplanations ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleExportVocabulary}
                  className="p-2 bg-transparent border border-gray-300 rounded-md cursor-pointer text-gray-500 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 transition-all duration-200 flex items-center justify-center"
                  title="Export to CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {vocabularyItems.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-lg text-gray-800">{item.word}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-semibold text-lg text-blue-600">{item.translation}</span>
                      </div>
                      
                      {showExplanations && (
                        <p className="text-sm text-gray-600 mb-3">{item.explanation}</p>
                      )}
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Example ({languages.find(lang => lang.code === sourceLanguage)?.name}):
                          </span>
                          <p className="text-sm text-gray-800 mt-1">{item.exampleSource}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Example ({languages.find(lang => lang.code === targetLanguage)?.name}):
                          </span>
                          <p className="text-sm text-gray-800 mt-1">{item.exampleTarget}</p>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleSaveVocabularyItem(item)}
                      className="ml-4 p-2 bg-green-100 text-green-700 border-none rounded-md cursor-pointer transition-all duration-200 hover:bg-green-200 flex items-center justify-center"
                      title="Save to vocabulary"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 