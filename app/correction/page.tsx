
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

interface DataPoint {
  depth: number;
  rawValue: number;
  correctedValue: number;
  isOutlier: boolean;
  manualOverride?: boolean;
  timestamp?: string;
  confidence?: number;
  deviation?: number;
  flaggedForReview?: boolean;
  reviewNote?: string;
}

export default function CorrectionPage() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [showRaw, setShowRaw] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagNote, setFlagNote] = useState('');
  const [history, setHistory] = useState<DataPoint[][]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const generateMockData = () => {
      const mockData: DataPoint[] = [];
      for (let i = 0; i < 100; i++) {
        const depth = 1000 + i * 10;
        const rawValue = 20 + Math.sin(i * 0.1) * 5 + Math.random() * 3;
        const drift = i * 0.02; 
        const correctedValue = rawValue - drift;
        const isOutlier = Math.random() > 0.95; 
        const timestamp = new Date(Date.now() - (100 - i) * 60000).toISOString();

        mockData.push({
          depth,
          rawValue: isOutlier ? rawValue * 1.5 : rawValue,
          correctedValue: isOutlier ? correctedValue : correctedValue,
          isOutlier,
          timestamp,
          confidence: Math.random() * 0.3 + 0.7, 
          deviation: isOutlier ? Math.abs(rawValue * 0.3) : Math.abs(rawValue * 0.05),
          flaggedForReview: false,
          reviewNote: ''
        });
      }
      return mockData;
    };

    setTimeout(() => {
      const mockData = generateMockData();
      setData(mockData);
      setHistory([mockData]);
      setIsProcessing(false);
    }, 2000);
  }, []);

  const handleManualOverride = (index: number, newValue: number) => {
    const newData = [...data];
    newData[index] = {
      ...newData[index],
      correctedValue: newValue,
      manualOverride: true
    };

    setData(newData);
    setHistory([...history, newData]);
    setCurrentStep(currentStep + 1);
  };

  const handleFlagForReview = (point: DataPoint, note: string = '') => {
    const pointIndex = data.findIndex(p => p.depth === point.depth);
    if (pointIndex !== -1) {
      const newData = [...data];
      newData[pointIndex] = {
        ...newData[pointIndex],
        flaggedForReview: true,
        reviewNote: note
      };

      setData(newData);
      setHistory([...history, newData]);
      setCurrentStep(currentStep + 1);

      if (selectedPoint && selectedPoint.depth === point.depth) {
        setSelectedPoint({...selectedPoint, flaggedForReview: true, reviewNote: note});
      }
    }
  };

  const undoLastChange = () => {
    if (currentStep > 0) {
      const previousData = history[currentStep - 1];
      setData(previousData);
      setCurrentStep(currentStep - 1);
    }
  };

  const redoChange = () => {
    if (currentStep < history.length - 1) {
      const nextData = history[currentStep + 1];
      setData(nextData);
      setCurrentStep(currentStep + 1);
    }
  };

  const showPointDetails = (point: DataPoint) => {
    setSelectedPoint(point);
    setShowDetailsModal(true);
  };

  const openFlagModal = (point: DataPoint) => {
    setSelectedPoint(point);
    setFlagNote('');
    setShowFlagModal(true);
  };

  const submitFlagForReview = () => {
    if (selectedPoint) {
      handleFlagForReview(selectedPoint, flagNote);
      setShowFlagModal(false);
      setShowDetailsModal(false);
      setFlagNote('');
    }
  };

  const getCorrectionReason = (point: DataPoint) => {
    if (point.isOutlier) {
      return `Outlier detected: Value deviates ${point.deviation?.toFixed(2)} units from expected range`;
    } else if (point.rawValue !== point.correctedValue) {
      return `Drift correction applied: Adjusted for gradual sensor drift`;
    } else {
      return 'No correction needed: Value within acceptable parameters';
    }
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.9) return { level: 'High', color: 'text-green-600' };
    if (confidence >= 0.7) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-red-600' };
  };

  const outlierCount = data.filter(point => point.isOutlier).length;
  const manualOverrideCount = data.filter(point => point.manualOverride).length;
  const flaggedCount = data.filter(point => point.flaggedForReview).length;

  const chartData = data.map(point => ({
    depth: point.depth,
    raw: point.rawValue,
    corrected: point.correctedValue,
    isOutlier: point.isOutlier
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Drift Correction Preview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Review automated corrections and make manual adjustments as needed
          </p>
        </div>

        {isProcessing ? (
          <div className="flex items-center justify-center py-16 sm:py-20">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <i className="ri-loader-4-line text-3xl sm:text-4xl text-blue-600 animate-spin"></i>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Processing Drift Corrections
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Analyzing data patterns and applying corrections...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Control Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Correction Controls
                </h2>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <button
                    onClick={undoLastChange}
                    disabled={currentStep === 0}
                    className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer text-sm"
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-arrow-go-back-line"></i>
                    </div>
                    <span>Undo</span>
                  </button>
                  <button
                    onClick={redoChange}
                    disabled={currentStep === history.length - 1}
                    className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer text-sm"
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-arrow-go-forward-line"></i>
                    </div>
                    <span>Redo</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <i className="ri-database-line text-blue-600 text-sm sm:text-base"></i>
                    </div>
                    <div>
                      <p className="text-lg sm:text-2xl font-bold text-blue-900 dark:text-blue-200">{data.length}</p>
                      <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm">Data Points</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                      <i className="ri-error-warning-line text-yellow-600 text-sm sm:text-base"></i>
                    </div>
                    <div>
                      <p className="text-lg sm:text-2xl font-bold text-yellow-900 dark:text-yellow-200">{outlierCount}</p>
                      <p className="text-yellow-700 dark:text-yellow-300 text-xs sm:text-sm">Outliers</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <i className="ri-hand-coin-line text-green-600 text-sm sm:text-base"></i>
                    </div>
                    <div>
                      <p className="text-lg sm:text-2xl font-bold text-green-900 dark:text-green-200">{manualOverrideCount}</p>
                      <p className="text-green-700 dark:text-green-300 text-xs sm:text-sm">Manual Edits</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                      <i className="ri-flag-line text-orange-600 text-sm sm:text-base"></i>
                    </div>
                    <div>
                      <p className="text-lg sm:text-2xl font-bold text-orange-900 dark:text-orange-200">{flaggedCount}</p>
                      <p className="text-orange-700 dark:text-orange-300 text-xs sm:text-sm">Flagged</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 sm:p-4 rounded-lg col-span-2 lg:col-span-1">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <i className="ri-shield-check-line text-purple-600 text-sm sm:text-base"></i>
                    </div>
                    <div>
                      <p className="text-lg sm:text-2xl font-bold text-purple-900 dark:text-purple-200">
                        {Math.round(((data.length - outlierCount) / data.length) * 100)}%
                      </p>
                      <p className="text-purple-700 dark:text-purple-300 text-xs sm:text-sm">Quality Score</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <button
                    onClick={() => setShowRaw(!showRaw)}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer text-sm ${
                      showRaw
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-eye-line"></i>
                    </div>
                    <span>{showRaw ? 'Hide Raw Data' : 'Show Raw Data'}</span>
                  </button>
                </div>

                <Link
                  href="/export"
                  className="flex items-center space-x-2 px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer text-sm sm:text-base"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-download-line"></i>
                  </div>
                  <span>Proceed to Export</span>
                </Link>
              </div>
            </div>

            {/* Chart Visualization */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Data Visualization
              </h2>

              <div className="h-64 sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis 
                      dataKey="depth" 
                      stroke="#6b7280"
                      fontSize={10}
                    />
                    <YAxis stroke="#6b7280" fontSize={10} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f9fafb',
                        fontSize: '12px'
                      }}
                    />
                    <Legend />
                    {showRaw && (
                      <Line 
                        type="monotone" 
                        dataKey="raw" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 2 }}
                        name="Raw Data"
                      />
                    )}
                    <Line 
                      type="monotone" 
                      dataKey="corrected" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 2 }}
                      name="Corrected Data"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Data Table with Manual Override */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Detailed Data Review
                </h2>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Click on values to make manual adjustments
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Depth (ft)
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Raw Value
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Corrected Value
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.slice(0, 20).map((point, index) => (
                      <tr key={index} className={`${point.flaggedForReview ? 'bg-orange-50 dark:bg-orange-900/10' : point.isOutlier ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {point.depth}
                        </td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {point.rawValue.toFixed(2)}
                        </td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                          <input
                            type="number"
                            value={point.correctedValue.toFixed(2)}
                            onChange={(e) => handleManualOverride(index, parseFloat(e.target.value))}
                            className={`text-xs sm:text-sm px-2 py-1 rounded border ${
                              point.manualOverride
                                ? 'border-green-300 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-200'
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            step="0.01"
                          />
                        </td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                            {point.flaggedForReview && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                <div className="w-3 h-3 flex items-center justify-center mr-1">
                                  <i className="ri-flag-line text-xs"></i>
                                </div>
                                Flagged
                              </span>
                            )}
                            {point.isOutlier && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                <div className="w-3 h-3 flex items-center justify-center mr-1">
                                  <i className="ri-error-warning-line text-xs"></i>
                                </div>
                                Outlier
                              </span>
                            )}
                            {point.manualOverride && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                <div className="w-3 h-3 flex items-center justify-center mr-1">
                                  <i className="ri-hand-coin-line text-xs"></i>
                                </div>
                                Manual
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          <button
                            onClick={() => showPointDetails(point)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 cursor-pointer whitespace-nowrap"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
                Showing first 20 of {data.length} data points
              </div>
            </div>
          </>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedPoint && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Data Point Details - {selectedPoint.depth} ft
                  </h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Depth
                      </label>
                      <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedPoint.depth} ft
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Timestamp
                      </label>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {selectedPoint.timestamp ? new Date(selectedPoint.timestamp).toLocaleString() : 'N/A'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Data Confidence
                      </label>
                      <div className={`text-xs sm:text-sm font-medium ${getConfidenceLevel(selectedPoint.confidence || 0).color}`}>
                        {getConfidenceLevel(selectedPoint.confidence || 0).level} ({((selectedPoint.confidence || 0) * 100).toFixed(1)}%)
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Raw Value
                      </label>
                      <div className="text-base sm:text-lg text-gray-900 dark:text-white">
                        {selectedPoint.rawValue.toFixed(3)} ppm
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Corrected Value
                      </label>
                      <div className={`text-base sm:text-lg font-semibold ${
                        selectedPoint.manualOverride ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        {selectedPoint.correctedValue.toFixed(3)} ppm
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Deviation
                      </label>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        ±{(selectedPoint.deviation || 0).toFixed(3)} ppm
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Status */}
                {selectedPoint.flaggedForReview && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center mt-0.5">
                        <i className="ri-flag-line text-orange-600 text-sm"></i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-orange-800 dark:text-orange-200 text-sm sm:text-base mb-1 sm:mb-2">
                          Flagged for Review
                        </h4>
                        {selectedPoint.reviewNote && (
                          <p className="text-orange-700 dark:text-orange-300 text-xs sm:text-sm">
                            Note: {selectedPoint.reviewNote}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Correction Analysis */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">
                    Correction Analysis
                  </h4>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center mt-0.5">
                        <i className={`text-sm ${
                          selectedPoint.isOutlier ? 'ri-error-warning-line text-red-500' :
                          selectedPoint.manualOverride ? 'ri-hand-coin-line text-green-500' :
                          'ri-check-line text-blue-500'
                        }`}></i>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                          {selectedPoint.isOutlier ? 'Outlier Detection' :
                           selectedPoint.manualOverride ? 'Manual Override' :
                           'Automated Correction'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {getCorrectionReason(selectedPoint)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center mt-0.5">
                        <i className="ri-calculator-line text-blue-500 text-sm"></i>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                          Correction Applied
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {selectedPoint.rawValue !== selectedPoint.correctedValue 
                            ? `${(selectedPoint.rawValue - selectedPoint.correctedValue).toFixed(3)} ppm ${selectedPoint.rawValue > selectedPoint.correctedValue ? 'reduction' : 'increase'}`
                            : 'No correction applied'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                  <div className={`text-center p-2 sm:p-3 rounded-lg border ${
                    selectedPoint.isOutlier 
                      ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                      : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                  }`}>
                    <div className={`text-base sm:text-lg font-bold ${
                      selectedPoint.isOutlier ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {selectedPoint.isOutlier ? '!' : '✓'}
                    </div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                      Outlier Status
                    </div>
                  </div>

                  <div className={`text-center p-2 sm:p-3 rounded-lg border ${
                    selectedPoint.manualOverride 
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                      : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                  }`}>
                    <div className={`text-base sm:text-lg font-bold ${
                      selectedPoint.manualOverride ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {selectedPoint.manualOverride ? '✏' : '○'}
                    </div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                      Manual Edit
                    </div>
                  </div>

                  <div className={`text-center p-2 sm:p-3 rounded-lg border ${
                    selectedPoint.flaggedForReview 
                      ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
                      : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                  }`}>
                    <div className={`text-base sm:text-lg font-bold ${
                      selectedPoint.flaggedForReview ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {selectedPoint.flaggedForReview ? '🚩' : '○'}
                    </div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                      Flagged
                    </div>
                  </div>

                  <div className={`text-center p-2 sm:p-3 rounded-lg border ${
                    (selectedPoint.confidence || 0) >= 0.8 
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                      : (selectedPoint.confidence || 0) >= 0.6
                      ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                      : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                  }`}>
                    <div className={`text-base sm:text-lg font-bold ${
                      (selectedPoint.confidence || 0) >= 0.8 ? 'text-green-600 dark:text-green-400' :
                      (selectedPoint.confidence || 0) >= 0.6 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {Math.round((selectedPoint.confidence || 0) * 100)}%
                    </div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                      Confidence
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 sm:mb-3 text-sm sm:text-base">
                    Quick Actions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => {
                        const newValue = prompt(`Enter new value for depth ${selectedPoint.depth} ft:`, selectedPoint.correctedValue.toString());
                        if (newValue && !isNaN(parseFloat(newValue))) {
                          const pointIndex = data.findIndex(p => p.depth === selectedPoint.depth);
                          if (pointIndex !== -1) {
                            handleManualOverride(pointIndex, parseFloat(newValue));
                            setSelectedPoint({...selectedPoint, correctedValue: parseFloat(newValue), manualOverride: true});
                          }
                        }
                      }}
                      className="px-2 sm:px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm whitespace-nowrap cursor-pointer"
                    >
                      Override Value
                    </button>
                    <button 
                      onClick={() => openFlagModal(selectedPoint)}
                      disabled={selectedPoint.flaggedForReview}
                      className="px-2 sm:px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-xs sm:text-sm whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {selectedPoint.flaggedForReview ? 'Already Flagged' : 'Flag for Review'}
                    </button>
                    <button className="px-2 sm:px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs sm:text-sm whitespace-nowrap cursor-pointer">
                      Add Note
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex space-x-2 sm:space-x-3 justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 sm:px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap cursor-pointer text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Flag for Review Modal */}
        {showFlagModal && selectedPoint && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Flag for Review
                  </h3>
                  <button
                    onClick={() => setShowFlagModal(false)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                      <i className="ri-flag-line text-orange-600"></i>
                    </div>
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200 text-sm sm:text-base">
                      Data Point: {selectedPoint.depth} ft
                    </h4>
                  </div>
                  <p className="text-orange-700 dark:text-orange-300 text-xs sm:text-sm">
                    This data point will be marked for manual review and quality control.
                  </p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Review Note (Optional)
                  </label>
                  <textarea
                    value={flagNote}
                    onChange={(e) => setFlagNote(e.target.value)}
                    placeholder="Add a note explaining why this point needs review..."
                    rows={3}
                    maxLength={200}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {flagNote.length}/200 characters
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-4 h-4 flex items-center justify-center mt-0.5">
                      <i className="ri-information-line text-blue-600 text-sm"></i>
                    </div>
                    <p className="text-blue-800 dark:text-blue-300 text-xs sm:text-sm">
                      Flagged data points can be reviewed in batch during quality control or addressed individually before export.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex space-x-2 sm:space-x-3 justify-end">
                <button
                  onClick={() => setShowFlagModal(false)}
                  className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={submitFlagForReview}
                  className="px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap cursor-pointer text-sm"
                >
                  Flag for Review
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
