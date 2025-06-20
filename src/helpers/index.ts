import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

export const LANGUAGES = [
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

export const TONES = [
  { code: 'neutral', name: 'Neutral', description: 'Standard translation' },
  { code: 'formal', name: 'Formal', description: 'Professional and respectful' },
  { code: 'casual', name: 'Casual', description: 'Friendly and informal' },
  { code: 'technical', name: 'Technical', description: 'Precise and specialized' },
];

export const detectLanguage = async (text: string): Promise<string> => {
  try {
    const prompt = `Detect the language of this text and respond with only the language code from this list:
${LANGUAGES.map(lang => `${lang.code} - ${lang.name}`).join('\n')}

Text: "${text}"

Respond with only the language code (e.g., "en", "es", "fr", etc.).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const detectedLanguage = response.text().trim().toLowerCase();
    
    // Validate that the detected language is in our supported list
    const isValidLanguage = LANGUAGES.some(lang => lang.code === detectedLanguage);
    
    if (isValidLanguage) {
      return detectedLanguage;
    } else {
      // Default to English if detection fails
      return 'en';
    }
  } catch (error) {
    console.error('Language detection error:', error);
    // Default to English if detection fails
    return 'en';
  }
};

export const extractTextFromImage = async (imageFile: File): Promise<string> => {
  try {
    // Convert image file to base64
    const base64Image = await fileToBase64(imageFile);
    
    const prompt = `Extract all text from this image. Return only the extracted text, maintaining the original formatting and structure. If there are multiple text elements, separate them with line breaks. Do not add any explanations or additional text.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Image.split(',')[1] // Remove data URL prefix
        }
      }
    ]);
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error('Failed to extract text from image. Please try again.');
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
    // Convert image file to base64
    const base64Image = await fileToBase64(imageFile);
    
    const toneDescription = TONES.find(t => t.code === tone)?.description || 'Standard translation';
    
    let prompt = `Extract all text from this image and translate it from ${
      LANGUAGES.find(lang => lang.code === sourceLanguage)?.name
    } to ${
      LANGUAGES.find(lang => lang.code === targetLanguage)?.name
    } using a ${tone} tone (${toneDescription}).

IMPORTANT: Pay special attention to slang, idioms, and colloquial expressions. Translate them naturally and contextually, not literally. If the text contains:
- Slang words or phrases
- Idiomatic expressions
- Cultural references
- Informal language

Translate them to their natural equivalent in the target language, maintaining the same level of formality and cultural appropriateness.

Please provide the result in this exact format:
ORIGINAL: [extracted text here]
TRANSLATION: [translated text here]

Maintain the original formatting and structure in the translation.`;

    // Add conversation context if available
    if (conversationContext) {
      prompt = `${conversationContext}

${prompt}

Please maintain consistency with the previous translations in this conversation.`;
    }

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Image.split(',')[1] // Remove data URL prefix
        }
      }
    ]);
    
    const response = await result.response;
    const resultText = response.text();
    
    // Parse the response to extract original and translated text
    const originalMatch = resultText.match(/ORIGINAL:\s*([\s\S]*?)(?=TRANSLATION:|$)/);
    const translationMatch = resultText.match(/TRANSLATION:\s*([\s\S]*?)$/);
    
    const originalText = originalMatch ? originalMatch[1].trim() : resultText;
    const translatedText = translationMatch ? translationMatch[1].trim() : resultText;
    
    return { originalText, translatedText };
  } catch (error) {
    console.error('Image translation error:', error);
    throw new Error('Failed to translate image text. Please try again.');
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
    
    let prompt = `Translate this text from ${
      LANGUAGES.find(lang => lang.code === sourceLanguage)?.name
    } to ${
      LANGUAGES.find(lang => lang.code === targetLanguage)?.name
    } using a ${tone} tone (${toneDescription}).

IMPORTANT TRANSLATION GUIDELINES:
1. **Slang & Colloquialisms**: Detect and translate slang words, informal expressions, and colloquial language naturally. Don't translate them literally - find the equivalent natural expression in the target language.

2. **Idioms & Expressions**: Identify idiomatic expressions and translate them to their cultural equivalent in the target language, not word-for-word.

3. **Cultural Context**: Consider cultural differences and adapt expressions appropriately for the target culture.

4. **Formality Level**: Match the formality level of the original text while respecting the selected tone.

5. **Context Awareness**: Consider the context and meaning, not just individual words.

Examples of what to handle:
- "What's up?" → Natural greeting equivalent
- "It's raining cats and dogs" → Cultural equivalent idiom
- "That's cool" → Appropriate casual expression
- "Break a leg" → Cultural equivalent for good luck
- "Piece of cake" → Natural equivalent for "easy"

Text to translate: "${inputText}"

Provide only the translation, no explanations or additional text.`;

    // Add conversation context if available
    if (conversationContext) {
      prompt = `${conversationContext}

${prompt}

Please maintain consistency with the previous translations in this conversation.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translation = response.text();
    
    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Translation failed. Please try again.');
  }
};

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}; 