
'use client';

import { useState, useRef, useCallback } from 'react';

interface FileUploadZoneProps {
  onFileUpload: (file: File) => void;
  acceptedTypes?: string[];
  maxFileSize?: number;
  seniorMode?: boolean;
}

export default function FileUploadZone({ 
  onFileUpload, 
  acceptedTypes = ['.csv', '.xlsx', '.xls'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  seniorMode = false 
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type not supported. Please upload ${acceptedTypes.join(', ')} files only.`;
    }
    
    if (file.size > maxFileSize) {
      return `File size too large. Maximum size is ${Math.round(maxFileSize / (1024 * 1024))}MB.`;
    }
    
    return null;
  };

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      // Store file locally for offline usage
      const fileData = await file.arrayBuffer();
      localStorage.setItem('uploadedFile', JSON.stringify({
        name: file.name,
        type: file.type,
        size: file.size,
        data: Array.from(new Uint8Array(fileData))
      }));

      setUploadProgress(100);
      setTimeout(() => {
        onFileUpload(file);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (err) {
      setError('Failed to process file. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onFileUpload, acceptedTypes, maxFileSize]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }
          ${seniorMode ? 'p-12 text-lg' : ''}
          ${isUploading ? 'pointer-events-none' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
        />

        <div className="flex flex-col items-center space-y-4">
          <div className={`${seniorMode ? 'w-16 h-16' : 'w-12 h-12'} flex items-center justify-center`}>
            {isUploading ? (
              <i className="ri-loader-4-line text-4xl text-blue-600 animate-spin"></i>
            ) : (
              <i className="ri-upload-cloud-2-line text-4xl text-gray-400"></i>
            )}
          </div>

          <div className="space-y-2">
            <p className={`font-semibold text-gray-700 dark:text-gray-300 ${seniorMode ? 'text-xl' : 'text-lg'}`}>
              {isUploading ? 'Processing file...' : 'Drop your data file here'}
            </p>
            <p className={`text-gray-500 dark:text-gray-400 ${seniorMode ? 'text-lg' : 'text-sm'}`}>
              or click to browse files
            </p>
            <p className={`text-gray-400 dark:text-gray-500 ${seniorMode ? 'text-base' : 'text-xs'}`}>
              Supports: {acceptedTypes.join(', ')} (max {Math.round(maxFileSize / (1024 * 1024))}MB)
            </p>
          </div>
        </div>

        {isUploading && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
              {uploadProgress}% complete
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-error-warning-line text-red-600 dark:text-red-400"></i>
            </div>
            <p className={`text-red-700 dark:text-red-400 ${seniorMode ? 'text-lg' : 'text-sm'}`}>
              {error}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
