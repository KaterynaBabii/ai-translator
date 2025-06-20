import React, { useRef, useState, useCallback } from 'react';
import { ImageIcon, XIcon } from './icons';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onClear: () => void;
  selectedFile: File | null;
  isProcessing: boolean;
  error: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
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
    <div className="image-upload-container">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
      
      {!selectedFile ? (
        <div
          className={`image-upload-area ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <ImageIcon className="upload-icon" />
          <div className="upload-text">
            <p>Click to upload or drag and drop</p>
            <p className="upload-hint">Supports JPG, PNG, GIF (max 10MB)</p>
          </div>
        </div>
      ) : (
        <div className="image-preview-container">
          <div className="image-preview">
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Preview"
              className="preview-image"
            />
            <div className="image-info">
              <p className="file-name">{selectedFile.name}</p>
              <p className="file-size">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={onClear}
              className="clear-image-button"
              title="Remove image"
              disabled={isProcessing}
            >
              <XIcon />
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="image-error">{error}</div>
      )}
      
      {isProcessing && (
        <div className="processing-overlay">
          <div className="processing-spinner"></div>
          <p>Processing image...</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 