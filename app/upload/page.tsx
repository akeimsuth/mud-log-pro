
'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import FileUploadZone from '@/components/ui/FileUploadZone';
import Link from 'next/link';

interface FileInfo {
  name: string;
  size: number;
  type: string;
  data?: any[];
  preview?: any;
}

export default function UploadPage() {
  const [uploadedFile, setUploadedFile] = useState<FileInfo | null>(null);
  const [validationStatus, setValidationStatus] = useState<'validating' | 'valid' | 'invalid' | null>(null);
  const [schemaPreview, setSchemaPreview] = useState<any>(null);
  const [seniorMode, setSeniorMode] = useState(false);

  const handleFileUpload = async (file: File) => {
    setValidationStatus('validating');
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        let data: any[] = [];
        let preview: any = {};

        if (file.name.endsWith('.csv')) {
          // Simple CSV parsing
          const lines = content.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          data = lines.slice(1, 6).map(line => {
            const values = line.split(',');
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index]?.trim() || '';
            });
            return row;
          });
          
          preview = {
            headers,
            sampleRows: data,
            totalRows: lines.length - 1,
            columns: headers.length
          };
        }

        // Validate file structure
        const requiredColumns = ['depth', 'time', 'gas'];
        const hasRequiredColumns = requiredColumns.every(col => 
          preview.headers?.some((h: string) => h.toLowerCase().includes(col.toLowerCase()))
        );

        setUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          data,
          preview
        });

        setSchemaPreview(preview);
        setValidationStatus(hasRequiredColumns ? 'valid' : 'invalid');
      };
      
      reader.readAsText(file);
    } catch (error) {
      setValidationStatus('invalid');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Data Upload
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your mudlogging data files for processing and drift correction
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Zone */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Upload Data File
              </h2>
              <FileUploadZone 
                onFileUpload={handleFileUpload}
                seniorMode={seniorMode}
              />
            </div>

            {/* Upload Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">
                Upload Guidelines
              </h3>
              <ul className="space-y-2 text-blue-800 dark:text-blue-300">
                <li className="flex items-start space-x-2">
                  <div className="w-4 h-4 flex items-center justify-center mt-0.5">
                    <i className="ri-check-line text-sm"></i>
                  </div>
                  <span>Ensure your file contains depth, time, and gas measurement columns</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-4 h-4 flex items-center justify-center mt-0.5">
                    <i className="ri-check-line text-sm"></i>
                  </div>
                  <span>CSV files should use comma separation with headers in the first row</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-4 h-4 flex items-center justify-center mt-0.5">
                    <i className="ri-check-line text-sm"></i>
                  </div>
                  <span>Excel files (.xlsx/.xls) are supported with data in the first sheet</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-4 h-4 flex items-center justify-center mt-0.5">
                    <i className="ri-check-line text-sm"></i>
                  </div>
                  <span>Maximum file size is 10MB for optimal performance</span>
                </li>
              </ul>
            </div>

            {/* Voice Instructions */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 flex items-center justify-center">
                  <i className="ri-mic-line text-gray-600 dark:text-gray-400 text-lg"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Voice Assistant
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Use voice commands to help with file operations
              </p>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors whitespace-nowrap cursor-pointer">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-mic-line"></i>
                </div>
                <span>Start Voice Assistant</span>
              </button>
            </div>
          </div>

          {/* File Preview and Validation */}
          <div className="space-y-6">
            {uploadedFile && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  File Information
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <i className="ri-file-excel-line text-blue-600 text-xl"></i>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(uploadedFile.size)} • {uploadedFile.type}
                      </p>
                    </div>
                  </div>

                  {/* Validation Status */}
                  <div className={`p-4 rounded-lg flex items-center space-x-3 ${
                    validationStatus === 'validating' 
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                      : validationStatus === 'valid'
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : validationStatus === 'invalid'
                      ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      : 'bg-gray-50 dark:bg-gray-700'
                  }`}>
                    <div className="w-6 h-6 flex items-center justify-center">
                      {validationStatus === 'validating' && (
                        <i className="ri-loader-4-line text-yellow-600 animate-spin"></i>
                      )}
                      {validationStatus === 'valid' && (
                        <i className="ri-check-line text-green-600"></i>
                      )}
                      {validationStatus === 'invalid' && (
                        <i className="ri-close-line text-red-600"></i>
                      )}
                    </div>
                    <div>
                      <p className={`font-semibold ${
                        validationStatus === 'validating' ? 'text-yellow-800 dark:text-yellow-200'
                        : validationStatus === 'valid' ? 'text-green-800 dark:text-green-200'
                        : validationStatus === 'invalid' ? 'text-red-800 dark:text-red-200'
                        : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {validationStatus === 'validating' && 'Validating file structure...'}
                        {validationStatus === 'valid' && 'File validation successful'}
                        {validationStatus === 'invalid' && 'File validation failed'}
                      </p>
                      {validationStatus !== 'validating' && (
                        <p className={`text-sm ${
                          validationStatus === 'valid' ? 'text-green-700 dark:text-green-300'
                          : 'text-red-700 dark:text-red-300'
                        }`}>
                          {validationStatus === 'valid' 
                            ? 'Required columns detected. Ready for processing.'
                            : 'Missing required columns (depth, time, gas). Please check your file format.'
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {schemaPreview && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Data Schema Preview
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="font-semibold text-gray-700 dark:text-gray-300">Total Rows</p>
                      <p className="text-gray-900 dark:text-white text-lg">{schemaPreview.totalRows}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="font-semibold text-gray-700 dark:text-gray-300">Columns</p>
                      <p className="text-gray-900 dark:text-white text-lg">{schemaPreview.columns}</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Column Headers</p>
                    <div className="flex flex-wrap gap-2">
                      {schemaPreview.headers?.map((header: string, index: number) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                        >
                          {header}
                        </span>
                      ))}
                    </div>
                  </div>

                  {schemaPreview.sampleRows && schemaPreview.sampleRows.length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Sample Data</p>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700">
                              {schemaPreview.headers?.slice(0, 4).map((header: string, index: number) => (
                                <th key={index} className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {schemaPreview.sampleRows.slice(0, 3).map((row: any, rowIndex: number) => (
                              <tr key={rowIndex} className="border-t border-gray-200 dark:border-gray-600">
                                {schemaPreview.headers?.slice(0, 4).map((header: string, colIndex: number) => (
                                  <td key={colIndex} className="px-3 py-2 text-gray-900 dark:text-white">
                                    {row[header] || '-'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {validationStatus === 'valid' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Next Steps
                </h2>
                <div className="space-y-3">
                  <Link 
                    href="/correction" 
                    className="w-full flex items-center justify-between p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 flex items-center justify-center">
                        <i className="ri-line-chart-line"></i>
                      </div>
                      <span className="font-semibold">Proceed to Drift Correction</span>
                    </div>
                    <div className="w-6 h-6 flex items-center justify-center">
                      <i className="ri-arrow-right-line"></i>
                    </div>
                  </Link>
                  
                  <button className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 flex items-center justify-center">
                        <i className="ri-save-line"></i>
                      </div>
                      <span className="font-semibold">Save for Later Processing</span>
                    </div>
                    <div className="w-6 h-6 flex items-center justify-center">
                      <i className="ri-arrow-right-line"></i>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
