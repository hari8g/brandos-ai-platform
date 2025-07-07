import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageRemove?: () => void;
  selectedFile?: File | null;
  previewUrl?: string | null;
  disabled?: boolean;
  className?: string;
  accept?: string;
  maxSize?: number; // in MB
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  onImageRemove,
  selectedFile,
  previewUrl,
  disabled = false,
  className = '',
  accept = 'image/*',
  maxSize = 10 // 10MB default
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return false;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const handleFileSelect = useCallback((file: File) => {
    if (validateFile(file)) {
      onImageSelect(file);
    }
  }, [onImageSelect, maxSize]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleRemove = useCallback(() => {
    if (onImageRemove) {
      onImageRemove();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onImageRemove]);

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      <AnimatePresence>
        {selectedFile ? (
          // Image Preview
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative group"
          >
            <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 hover:border-purple-300 transition-colors">
              <img
                src={previewUrl || URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={handleRemove}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          </motion.div>
        ) : (
          // Upload Area
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              isDragOver
                ? 'border-purple-400 bg-purple-50'
                : 'border-gray-300 hover:border-purple-300 hover:bg-gray-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
          >
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragOver ? 'Drop your image here' : 'Upload an image'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Drag and drop an image, or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supports: JPG, PNG, GIF (Max {maxSize}MB)
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}; 