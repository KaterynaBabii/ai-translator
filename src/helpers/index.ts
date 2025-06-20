import { GoogleGenerativeAI } from '@google/generative-ai';
import { LANGUAGES, TONES, API_ENDPOINTS, ERROR_MESSAGES, UI_CONSTANTS } from '../constants';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: API_ENDPOINTS.GEMINI_MODEL });

export const generateExampleSentences = async (
  wordOrPhrase: string,
  language: string,
  existingExamples: string[] = []
): Promise<string[]> => {
  try {
    const languageName = LANGUAGES.find(lang => lang.code === language)?.name || language;
    
    const prompt = `Generate ${UI_CONSTANTS.MAX_EXAMPLE_SENTENCES} practical example sentences using the word/phrase "${wordOrPhrase}" in ${languageName}.
                    
                    IMPORTANT REQUIREMENTS:
                    1. **Include diverse language styles**: Make sure examples include:
                       - Slang words or phrases (casual, trendy expressions)
                       - Idiomatic expressions (cultural sayings and metaphors)
                       - Cultural references (local customs, traditions, or popular culture)
                       - Informal language (everyday, conversational speech)
                    
                    2. **Context variety**: Use different contexts and situations:
                       - Casual conversations with friends
                       - Professional settings
                       - Social media or texting
                       - Family interactions
                       - Cultural celebrations or events
                    
                    3. **Natural usage**: Make sentences sound natural and authentic to ${languageName} speakers
                    
                    4. **Avoid repetition**: ${existingExamples.length > 0 ? `Avoid repeating these existing examples: ${existingExamples.join(', ')}` : ''}
                    
                    5. **Language level**: Include both simple and more complex usage patterns
                    
                    Return only the ${UI_CONSTANTS.MAX_EXAMPLE_SENTENCES} example sentences, one per line, without numbering or additional text.
                    Each sentence should demonstrate different aspects of how "${wordOrPhrase}" can be used naturally in ${languageName}.`;

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