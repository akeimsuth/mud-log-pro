
'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';

interface MetadataField {
  key: string;
  label: string;
  value: string;
  required: boolean;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
}

export default function ExportPage() {
  const [activeTab, setActiveTab] = useState<'metadata' | 'preview' | 'export'>('metadata');
  const [exportFormat, setExportFormat] = useState<'las' | 'csv' | 'xlsx'>('las');
  const [exportDestination, setExportDestination] = useState<'local' | 'api' | 'witsml'>('local');
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const [metadata, setMetadata] = useState<MetadataField[]>([
    { key: 'wellName', label: 'Well Name', value: 'ACME-001', required: true, type: 'text' },
    { key: 'fieldName', label: 'Field Name', value: 'North Field', required: true, type: 'text' },
    { key: 'company', label: 'Company', value: 'Acme Energy Corp', required: true, type: 'text' },
    { key: 'startDepth', label: 'Start Depth (ft)', value: '1000', required: true, type: 'number' },
    { key: 'endDepth', label: 'End Depth (ft)', value: '2000', required: true, type: 'number' },
    { key: 'stepSize', label: 'Step Size (ft)', value: '10', required: true, type: 'number' },
    { key: 'date', label: 'Log Date', value: '2024-01-15', required: true, type: 'date' },
    { key: 'units', label: 'Depth Units', value: 'FT', required: true, type: 'select', options: ['FT', 'M'] },
    { key: 'nullValue', label: 'Null Value', value: '-999.25', required: false, type: 'number' },
    { key: 'apiNumber', label: 'API Number', value: '12-345-67890', required: false, type: 'text' },
    { key: 'location', label: 'Location', value: 'Section 12, T1N, R2W', required: false, type: 'text' },
    { key: 'elevation', label: 'KB Elevation (ft)', value: '1250', required: false, type: 'number' }
  ]);

  const updateMetadata = (key: string, value: string) => {
    setMetadata(prev => prev.map(field => 
      field.key === key ? { ...field, value } : field
    ));
    validateMetadata();
  };

  const validateMetadata = () => {
    const warnings: string[] = [];
    const requiredFields = metadata.filter(field => field.required && !field.value.trim());
    
    if (requiredFields.length > 0) {
      warnings.push(`Missing required fields: ${requiredFields.map(f => f.label).join(', ')}`);
    }

    const startDepth = parseFloat(metadata.find(f => f.key === 'startDepth')?.value || '0');
    const endDepth = parseFloat(metadata.find(f => f.key === 'endDepth')?.value || '0');
    
    if (endDepth <= startDepth) {
      warnings.push('End depth must be greater than start depth');
    }

    setValidationWarnings(warnings);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulate export progress
    const progressInterval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Generate export data
      const exportData = generateExportData();
      
      if (exportDestination === 'local') {
        downloadFile(exportData, `${metadata.find(f => f.key === 'wellName')?.value || 'export'}.${exportFormat}`);
      } else if (exportDestination === 'api') {
        await uploadToAPI(exportData);
      } else if (exportDestination === 'witsml') {
        await uploadToWITSML(exportData);
      }

      setExportProgress(100);
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);
    } catch (error) {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const generateExportData = () => {
    if (exportFormat === 'las') {
      return generateLASFile();
    } else if (exportFormat === 'csv') {
      return generateCSVFile();
    } else {
      return generateExcelFile();
    }
  };

  const generateLASFile = () => {
    const wellName = metadata.find(f => f.key === 'wellName')?.value || '';
    const company = metadata.find(f => f.key === 'company')?.value || '';
    const date = metadata.find(f => f.key === 'date')?.value || '';
    const startDepth = metadata.find(f => f.key === 'startDepth')?.value || '';
    const endDepth = metadata.find(f => f.key === 'endDepth')?.value || '';
    const stepSize = metadata.find(f => f.key === 'stepSize')?.value || '';
    const nullValue = metadata.find(f => f.key === 'nullValue')?.value || '-999.25';

    return `~VERSION INFORMATION
VERS.                          2.0   : CWLS LOG ASCII STANDARD - VERSION 2.0
WRAP.                          NO    : ONE LINE PER DEPTH STEP

~WELL INFORMATION
STRT.FT              ${startDepth}           : START DEPTH
STOP.FT              ${endDepth}           : STOP DEPTH
STEP.FT              ${stepSize}           : STEP
NULL.                ${nullValue}           : NULL VALUE
COMP.                ${company}             : COMPANY
WELL.                ${wellName}            : WELL
FLD .                ${metadata.find(f => f.key === 'fieldName')?.value || ''} : FIELD
LOC .                ${metadata.find(f => f.key === 'location')?.value || ''} : LOCATION
DATE.                ${date}              : LOG DATE

~CURVE INFORMATION
DEPT.FT                       : DEPTH
GAS .PPM                      : TOTAL GAS
C1  .PPM                      : METHANE
C2  .PPM                      : ETHANE
C3  .PPM                      : PROPANE

~PARAMETER INFORMATION

~OTHER
Generated by MudLog Pro Automation Platform

~ASCII
`;
  };

  const generateCSVFile = () => {
    return 'DEPTH,GAS_TOTAL,METHANE,ETHANE,PROPANE\n1000,25.5,20.2,3.1,2.2\n1010,26.1,20.8,3.0,2.3\n';
  };

  const generateExcelFile = () => {
    return 'Excel file content would be generated here';
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const uploadToAPI = async (data: string) => {
    // Simulate API upload
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const uploadToWITSML = async (data: string) => {
    // Simulate WITSML upload
    await new Promise(resolve => setTimeout(resolve, 2500));
  };

  const previewContent = generateExportData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            LAS Export & Metadata
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure metadata and export your processed mudlogging data
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex">
              {[
                { id: 'metadata', label: 'Metadata', icon: 'ri-information-line' },
                { id: 'preview', label: 'Preview', icon: 'ri-eye-line' },
                { id: 'export', label: 'Export', icon: 'ri-download-line' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={tab.icon}></i>
                  </div>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Metadata Tab */}
        {activeTab === 'metadata' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Well Information
              </h2>
              <div className="space-y-4">
                {metadata.slice(0, 6).map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={field.value}
                        onChange={(e) => updateMetadata(field.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {field.options?.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={field.value}
                        onChange={(e) => updateMetadata(field.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Additional Parameters
              </h2>
              <div className="space-y-4">
                {metadata.slice(6).map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={field.value}
                        onChange={(e) => updateMetadata(field.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {field.options?.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={field.value}
                        onChange={(e) => updateMetadata(field.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Export Preview
              </h2>
              <div className="flex items-center space-x-4">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="las">LAS Format</option>
                  <option value="csv">CSV Format</option>
                  <option value="xlsx">Excel Format</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-auto max-h-96 whitespace-pre-wrap">
                {previewContent}
              </pre>
            </div>

            {validationWarnings.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                    <i className="ri-error-warning-line text-yellow-600"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      Validation Warnings
                    </h3>
                    <ul className="space-y-1">
                      {validationWarnings.map((warning, index) => (
                        <li key={index} className="text-yellow-700 dark:text-yellow-300 text-sm">
                          • {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Export Configuration
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Export Format
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'las', label: 'LAS 2.0 Format', description: 'Standard log format for well data' },
                      { value: 'csv', label: 'CSV Format', description: 'Comma-separated values' },
                      { value: 'xlsx', label: 'Excel Format', description: 'Microsoft Excel spreadsheet' }
                    ].map((format) => (
                      <label key={format.value} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="exportFormat"
                          value={format.value}
                          checked={exportFormat === format.value}
                          onChange={(e) => setExportFormat(e.target.value as any)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{format.label}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{format.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Export Destination
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'local', label: 'Local Download', description: 'Save file to your computer' },
                      { value: 'api', label: 'Solo Feed API', description: 'Upload to Solo Feed system' },
                      { value: 'witsml', label: 'WITSML Server', description: 'Send to WITSML data store' }
                    ].map((dest) => (
                      <label key={dest.value} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="exportDestination"
                          value={dest.value}
                          checked={exportDestination === dest.value}
                          onChange={(e) => setExportDestination(e.target.value as any)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{dest.label}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{dest.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Export Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Well Name:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metadata.find(f => f.key === 'wellName')?.value}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Export Format:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {exportFormat.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Destination:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {exportDestination === 'local' ? 'Local Download' 
                     : exportDestination === 'api' ? 'Solo Feed API'
                     : 'WITSML Server'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Depth Range:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metadata.find(f => f.key === 'startDepth')?.value} - {metadata.find(f => f.key === 'endDepth')?.value} ft
                  </span>
                </div>
              </div>

              {isExporting ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center py-4">
                    <div className="w-8 h-8 flex items-center justify-center mr-3">
                      <i className="ri-loader-4-line text-2xl text-blue-600 animate-spin"></i>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Exporting...</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    {exportProgress}% complete
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleExport}
                  disabled={validationWarnings.length > 0}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-download-line"></i>
                  </div>
                  <span>Export Data</span>
                </button>
              )}

              <div className="mt-4 text-center">
                <Link 
                  href="/" 
                  className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer whitespace-nowrap"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
