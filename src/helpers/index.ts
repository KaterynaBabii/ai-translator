import { GoogleGenerativeAI } from '@google/generative-ai';
import { LANGUAGES, TONES, API_ENDPOINTS, ERROR_MESSAGES, UI_CONSTANTS } from '../constants';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: API_ENDPOINTS.GEMINI_MODEL });

export const generateExampleSentences = async (
  wordOrPhrase: string,
  language: string,
  existingExamples: string[] = [],
  tone: string = 'neutral'
): Promise<string[]> => {
  try {
    const languageName = LANGUAGES.find(lang => lang.code === language)?.name || language;
    const toneDescription = TONES.find(t => t.code === tone)?.description || 'Standard';
    
    const prompt = `Generate ${UI_CONSTANTS.MAX_EXAMPLE_SENTENCES} practical example sentences using the word/phrase "${wordOrPhrase}" in ${languageName} with a ${tone} tone (${toneDescription}).
                    
                    IMPORTANT REQUIREMENTS:
                    1. **Tone consistency**: All examples should maintain the ${tone} tone (${toneDescription})
                    2. **Include diverse language styles**: Make sure examples include:
                       - Slang words or phrases (casual, trendy expressions)
                       - Idiomatic expressions (cultural sayings and metaphors)
                       - Cultural references (local customs, traditions, or popular culture)
                       - Informal language (everyday, conversational speech)
                    
                    3. **Context variety**: Use different contexts and situations:
                       - Casual conversations with friends
                       - Professional settings
                       - Social media or texting
                       - Family interactions
                       - Cultural celebrations or events
                    
                    4. **Natural usage**: Make sentences sound natural and authentic to ${languageName} speakers
                    
                    5. **Avoid repetition**: ${existingExamples.length > 0 ? `Avoid repeating these existing examples: ${existingExamples.join(', ')}` : ''}
                    
                    6. **Language level**: Include both simple and more complex usage patterns
                    
                    Return only the ${UI_CONSTANTS.MAX_EXAMPLE_SENTENCES} example sentences, one per line, without numbering or additional text.
                    Each sentence should demonstrate different aspects of how "${wordOrPhrase}" can be used naturally in ${languageName} with a ${tone} tone.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const examplesText = response.text();

    return examplesText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.match(/^\d+\./))
        .slice(0, UI_CONSTANTS.MAX_EXAMPLE_SENTENCES);
  } catch (error) {
    console.error('Example generation error:', error);
    throw new Error(ERROR_MESSAGES.EXAMPLE_GENERATION_FAILED);
  }
};

export const detectLanguage = async (text: string): Promise<string> => {
  try {
    const prompt = `Detect the language of this text and respond with only the language code from this list:
                    ${LANGUAGES.map(lang => `${lang.code} - ${lang.name}`).join('\n')}
                    Text: "${text}" Respond with only the language code (e.g., "en", "es", "fr", etc.).`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const detectedLanguage = response.text().trim().toLowerCase();
    
    const isValidLanguage = LANGUAGES.some(lang => lang.code === detectedLanguage);

    return isValidLanguage ? detectedLanguage : 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en';
  }
};

export const extractTextFromImage = async (imageFile: File): Promise<string> => {
  try {
    const base64Image = await fileToBase64(imageFile);
    
    const prompt = `Extract all text from this image. Return only the extracted text, maintaining the original formatting and structure.
                    If there are multiple text elements, separate them with line breaks. Do not add any explanations or additional text.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Image.split(',')[1]
        }
      }
    ]);
    
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error(ERROR_MESSAGES.IMAGE_PROCESSING_FAILED);
  }
};

export const translateImageText = async (
  imageFile: File,
  sourceLanguage: string,
  targetLanguage: string,
  tone: string = 'neutral',
  conversationContext?: string
): Promise<{ originalText: string; translatedText: string }> => {
  try {
    const base64Image = await fileToBase64(imageFile);
    
    const toneDescription = TONES.find(t => t.code === tone)?.description || 'Standard translation';
    
    let prompt = `Extract all text from this image and translate it 
                        from ${LANGUAGES.find(lang => lang.code === sourceLanguage)?.name}
                        to ${LANGUAGES.find(lang => lang.code === targetLanguage)?.name} 
                        using a ${tone} tone (${toneDescription}).
                        IMPORTANT: Pay special attention to slang, idioms, and colloquial expressions. Translate them naturally and contextually, not literally. 
                        If the text contains:
                            - Slang words or phrases
                            - Idiomatic expressions
                            - Cultural references
                            - Informal language
                        Translate them to their natural equivalent in the target language, maintaining the same level of formality and cultural appropriateness.
                        Please provide the result in this exact format:
                        ORIGINAL: [extracted text here]
                        TRANSLATION: [translated text here]
                        Maintain the original formatting and structure in the translation.`;

    if (conversationContext) {
      prompt = `${conversationContext} ${prompt} Please maintain consistency with the previous translations in this conversation.`;
    }

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Image.split(',')[1]
        }
      }
    ]);
    
    const response = result.response;
    const resultText = response.text();
    
    const originalMatch = resultText.match(/ORIGINAL:\s*([\s\S]*?)(?=TRANSLATION:|$)/);
    const translationMatch = resultText.match(/TRANSLATION:\s*([\s\S]*?)$/);
    
    const originalText = originalMatch ? originalMatch[1].trim() : resultText;
    const translatedText = translationMatch ? translationMatch[1].trim() : resultText;
    
    return { originalText, translatedText };
  } catch (error) {
    console.error('Image translation error:', error);
    throw new Error(ERROR_MESSAGES.IMAGE_PROCESSING_FAILED);
  }
};

export const translateText = async (
  inputText: string,
  sourceLanguage: string,
  targetLanguage: string,
  tone: string = 'neutral',
  conversationContext?: string
): Promise<string> => {
  try {
    const toneDescription = TONES.find(t => t.code === tone)?.description || 'Standard translation';
    
    let prompt = `Translate this text 
                        from ${LANGUAGES.find(lang => lang.code === sourceLanguage)?.name} 
                        to ${LANGUAGES.find(lang => lang.code === targetLanguage)?.name} 
                        using a ${tone} tone (${toneDescription}).
                        IMPORTANT TRANSLATION GUIDELINES:
                        1. **Slang & Colloquialisms**: Detect and translate slang words, informal expressions, and colloquial language naturally. 
                            Don't translate them literally - find the equivalent natural expression in the target language.
                        2. **Idioms & Expressions**: Identify idiomatic expressions and translate them to their cultural equivalent in the target language,
                            not word-for-word.
                        3. **Cultural Context**: Consider cultural differences and adapt expressions appropriately for the target culture.
                        4. **Formality Level**: Match the formality level of the original text while respecting the selected tone.
                        5. **Context Awareness**: Consider the context and meaning, not just individual words.
                        Examples of what to handle:
                            - "What's up?" → Natural greeting equivalent
                            - "It's raining cats and dogs" → Cultural equivalent idiom
                            - "That's cool" → Appropriate casual expression
                            - "Break a leg" → Cultural equivalent for good luck
                            - "Piece of cake" → Natural equivalent for "easy"
                        Text to translate: "${inputText}" Provide only the translation, no explanations or additional text.`;

    if (conversationContext) {
      prompt = `${conversationContext} ${prompt} Please maintain consistency with the previous translations in this conversation.`;
    }

    const result = await model.generateContent(prompt);
    const response = result.response;
    const translation = response.text();
    
    return translation.trim();
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error(ERROR_MESSAGES.TRANSLATION_FAILED);
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export { LANGUAGES, TONES };

export const analyzeArticleForVocabulary = async (
  articleText: string,
  sourceLanguage: string,
  targetLanguage: string,
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced',
  tone: string = 'neutral'
): Promise<Array<{
  word: string;
  translation: string;
  explanation: string;
  exampleSource: string;
  exampleTarget: string;
}>> => {
  try {
    const sourceLanguageName = LANGUAGES.find(lang => lang.code === sourceLanguage)?.name || sourceLanguage;
    const targetLanguageName = LANGUAGES.find(lang => lang.code === targetLanguage)?.name || targetLanguage;
    const toneDescription = TONES.find(t => t.code === tone)?.description || 'Standard';
    
    const prompt = `Analyze the following article text written in ${sourceLanguageName} and help a ${difficultyLevel} learner study ${targetLanguageName} using real content.
                
                Here's what to do:
                
                1. Analyze the following article text written in ${sourceLanguageName}.
                2. Identify 10 useful vocabulary words or phrases that are:
                   - Common or essential for understanding the article
                   - Appropriate for ${difficultyLevel.toUpperCase()} learners
                   - Useful for everyday communication
                3. For each word or phrase, provide:
                   - The word/phrase in ${sourceLanguageName}
                   - Its translation in ${targetLanguageName} (using ${tone} tone: ${toneDescription})
                   - A simple explanation or definition in ${targetLanguageName}
                   - One example sentence in the source language (${sourceLanguageName})
                   - Its translated version in the target language (${targetLanguageName})
                
                IMPORTANT REQUIREMENTS:
                - Focus on practical, commonly used vocabulary
                - Ensure translations are natural and contextually appropriate
                - Provide clear, simple explanations suitable for ${difficultyLevel} learners
                - Include diverse types of vocabulary (nouns, verbs, adjectives, phrases)
                - Make sure examples are relevant to the article context
                - Use ${tone} tone consistently in translations
                
                The article text is:
                """
                ${articleText}
                """
                
                Please provide the result in this exact JSON format:
                [
                  {
                    "word": "original word/phrase",
                    "translation": "translated word/phrase",
                    "explanation": "simple explanation",
                    "exampleSource": "example sentence in source language",
                    "exampleTarget": "example sentence in target language"
                  }
                ]
                
                Return only the JSON array, no additional text, markdown formatting, or explanations.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let resultText = response.text();
    
    resultText = resultText.trim();
    
    if (resultText.startsWith('```json')) {
      resultText = resultText.replace(/^```json\s*/, '');
    }
    if (resultText.startsWith('```')) {
      resultText = resultText.replace(/^```\s*/, '');
    }
    if (resultText.endsWith('```')) {
      resultText = resultText.replace(/\s*```$/, '');
    }
    
    try {
      const vocabularyItems = JSON.parse(resultText);
      if (Array.isArray(vocabularyItems) && vocabularyItems.length > 0) {
        return vocabularyItems.slice(0, 10);
      }
    } catch (parseError) {
      console.error('Failed to parse vocabulary JSON:', parseError);
      console.log('Raw response text:', resultText);
    }
    
    const lines = resultText.split('\n').filter(line => line.trim());
    const items: Array<{
      word: string;
      translation: string;
      explanation: string;
      exampleSource: string;
      exampleTarget: string;
    }> = [];
    
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const line = lines[i];
      if (line.includes('→') || line.includes('-')) {
        const parts = line.split(/[→-]/).map(part => part.trim());
        if (parts.length >= 2) {
          items.push({
            word: parts[0] || `Vocabulary ${i + 1}`,
            translation: parts[1] || '',
            explanation: parts[2] || 'Useful vocabulary from the article',
            exampleSource: parts[3] || 'Example sentence',
            exampleTarget: parts[4] || 'Translated example',
          });
        }
      }
    }
    
    return items.length > 0 ? items : [
      {
        word: 'Sample vocabulary',
        translation: 'Sample translation',
        explanation: 'This is a sample vocabulary item from the article analysis.',
        exampleSource: 'This is an example sentence.',
        exampleTarget: 'This is the translated example sentence.',
      }
    ];
  } catch (error) {
    console.error('Article analysis error:', error);
    throw new Error('Failed to analyze article for vocabulary');
  }
};

export const fetchArticleContent = async (url: string): Promise<string> => {
  try {
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const response = await fetch(proxyUrl + encodeURIComponent(url));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.contents) {
      throw new Error('No content found in the response');
    }
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');
    
    const scripts = doc.querySelectorAll('script, style, nav, header, footer, aside');
    scripts.forEach(el => el.remove());
    
    let content = '';
    
    const selectors = [
      'article',
      '[role="main"]',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.content',
      '.main-content',
      '#content',
      '#main',
      '.article',
      '.post',
      '.entry'
    ];
    
    for (const selector of selectors) {
      const element = doc.querySelector(selector);
      if (element && element.textContent && element.textContent.trim().length > 200) {
        content = element.textContent;
        break;
      }
    }
    
    if (!content) {
      const body = doc.querySelector('body');
      if (body) {
        const nonContentSelectors = [
          'nav', 'header', 'footer', 'aside', '.sidebar', '.navigation',
          '.menu', '.breadcrumb', '.pagination', '.comments', '.advertisement',
          '.ads', '.social-share', '.related-posts'
        ];
        
        nonContentSelectors.forEach(selector => {
          const elements = body.querySelectorAll(selector);
          elements.forEach(el => el.remove());
        });
        
        content = body.textContent || '';
      }
    }
    
    if (content) {
      content = content
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();
      
      if (content.length > 8000) {
        content = content.substring(0, 8000) + '...';
      }
      
      return content;
    }
    
    throw new Error('Could not extract article content from the URL');
  } catch (error) {
    console.error('Article fetching error:', error);
    
    try {
      const prompt = `Extract the main article content from this URL: ${url}
            Please fetch the webpage and return only the main article text content, removing navigation, ads, and other non-content elements.
            Return only the clean article text, no HTML tags or additional formatting.`;
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      const extractedContent = response.text().trim();
      
      if (extractedContent && extractedContent.length > 100) {
        return extractedContent;
      }
    } catch (geminiError) {
      console.error('Gemini fallback failed:', geminiError);
    }
    
    throw new Error('Failed to fetch article content. Please check the URL and try again.');
  }
}; 