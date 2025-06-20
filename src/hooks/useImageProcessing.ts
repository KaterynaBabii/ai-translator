import { useState, useCallback } from 'react';
import { extractTextFromImage, translateImageText } from '../helpers';
import { UseImageProcessingReturn, ImageTranslationResult } from '../types';
import { ERROR_MESSAGES } from '../constants';

export const useImageProcessing = (): UseImageProcessingReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const extractText = useCallback(async (file: File) => {
    if (!file) {
      setError('Please select an image file');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file size must be less than 10MB');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const text = await extractTextFromImage(file);
      setExtractedText(text);
      setImageFile(file);
    } catch (err) {
      setError(ERROR_MESSAGES.IMAGE_PROCESSING_FAILED);
      console.error('Text extraction error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const translateImage = useCallback(async (
    file: File,
    sourceLanguage: string,
    targetLanguage: string,
    tone: string,
    conversationContext?: string
  ): Promise<ImageTranslationResult> => {
    if (!file) {
      throw new Error('Please select an image file');
    }

    setIsProcessing(true);
    setError('');

    try {
      const result = await translateImageText(
        file,
        sourceLanguage,
        targetLanguage,
        tone,
        conversationContext
      );
      
      setExtractedText(result.originalText);
      setImageFile(file);
      
      return result;
    } catch (err) {
      setError(ERROR_MESSAGES.IMAGE_PROCESSING_FAILED);
      console.error('Image translation error:', err);
      throw new Error(ERROR_MESSAGES.IMAGE_PROCESSING_FAILED);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearImage = useCallback(() => {
    setImageFile(null);
    setExtractedText('');
    setError('');
  }, []);

  return {
    isProcessing,
    extractedText,
    imageFile,
    error,
    setError,
    extractText,
    translateImage,
    clearImage,
    setExtractedText,
  };
}; 