import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  const [showOptions, setShowOptions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    setError(null);
    setIsProcessing(false);
    setShowOptions(false);
    setIsDragOver(false);
    
    // Reset file inputs
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  }, []);

  // Cleanup on unmount or when disabled changes
  useEffect(() => {
    if (disabled) {
      cleanup();
    }
  }, [disabled, cleanup]);

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

  const handleFileSelect = useCallback(async (file: File) => {
    if (isProcessing) return; // Prevent multiple simultaneous uploads
    
    setIsProcessing(true);
    setError(null);
    
    try {
      if (validateFile(file)) {
        await onImageSelect(file);
        setShowOptions(false);
      }
    } catch (error) {
      console.error('File selection error:', error);
      setError('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [onImageSelect, maxSize, isProcessing]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileSelect(files[0]);
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

  const handleFileInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleCameraInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleUploadClick = useCallback(() => {
    if (!disabled && !isProcessing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled, isProcessing]);

  const handleCameraClick = useCallback(() => {
    if (!disabled && !isProcessing && cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  }, [disabled, isProcessing]);

  const handleRemove = useCallback(async () => {
    if (isProcessing) return; // Prevent removal during processing
    
    setIsProcessing(true);
    try {
      if (onImageRemove) {
        await onImageRemove();
      }
      cleanup();
    } catch (error) {
      console.error('Remove error:', error);
      setError('Failed to remove image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [onImageRemove, isProcessing, cleanup]);

  const handleMainClick = useCallback(() => {
    if (!disabled && !isProcessing) {
      setShowOptions(true);
    }
  }, [disabled, isProcessing]);

  const handleModalClose = useCallback(() => {
    if (!isProcessing) {
      setShowOptions(false);
    }
  }, [isProcessing]);

  return (
    <div className={`w-full ${className}`}>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isProcessing}
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraInputChange}
        className="hidden"
        disabled={disabled || isProcessing}
      />

      <AnimatePresence>
        {selectedFile ? (
          // Success Message
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">Photo uploaded successfully</p>
                  <p className="text-xs text-green-600">{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                </div>
              </div>
              <button
                onClick={handleRemove}
                disabled={isProcessing}
                className={`text-red-500 hover:text-red-700 text-sm font-medium transition-colors ${
                  isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isProcessing ? 'Removing...' : 'Remove'}
              </button>
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
            } ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleMainClick}
          >
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                {isProcessing ? (
                  <svg className="w-8 h-8 text-purple-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
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
                )}
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isProcessing ? 'Processing...' : isDragOver ? 'Drop your image here' : 'Add Product Image'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {isProcessing ? 'Please wait while we process your image' : 'Drag and drop an image, or click to choose upload method'}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supports: JPG, PNG, GIF (Max {maxSize}MB)
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Options Modal */}
      <AnimatePresence>
        {showOptions && !selectedFile && !isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleModalClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Choose Upload Method
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleUploadClick}
                  disabled={isProcessing}
                  className={`w-full flex items-center justify-center space-x-3 p-4 border border-gray-200 rounded-lg transition-all ${
                    isProcessing 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="font-medium text-gray-900">
                    {isProcessing ? 'Processing...' : 'Upload from Device'}
                  </span>
                </button>
                
                <button
                  onClick={handleCameraClick}
                  disabled={isProcessing}
                  className={`w-full flex items-center justify-center space-x-3 p-4 border border-gray-200 rounded-lg transition-all ${
                    isProcessing 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium text-gray-900">
                    {isProcessing ? 'Processing...' : 'Take Photo'}
                  </span>
                </button>
              </div>
              
              <button
                onClick={handleModalClose}
                disabled={isProcessing}
                className={`w-full mt-4 p-3 text-gray-500 font-medium ${
                  isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-700'
                }`}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
        >
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}; 