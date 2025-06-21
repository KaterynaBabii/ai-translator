import React, { useRef, useState, useCallback } from 'react';
import { ImageIcon, XIcon } from 'lucide-react';
import { ImageUploadProps } from '../types';

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  onClear,
  selectedFile,
  isProcessing,
  error,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  }, [onImageSelect]);

  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
      
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <div>
            <p className="text-gray-700 font-medium">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-500 mt-1">Supports JPG, PNG, GIF (max 10MB)</p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="relative">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3">
                <p className="font-medium truncate">{selectedFile.name}</p>
                <p className="text-sm opacity-90">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                onClick={onClear}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove image"
                disabled={isProcessing}
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
      
      {isProcessing && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center rounded-lg">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-gray-600">Processing image...</p>
        </div>
      )}
    </div>
  );
};