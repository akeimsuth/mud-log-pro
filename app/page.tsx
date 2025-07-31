
'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';

export default function Home() {
  const [recentFiles] = useState([
    { name: 'Well-A-Section-1.csv', date: '2024-01-15', size: '2.3 MB', status: 'processed' },
    { name: 'Well-B-Section-2.xlsx', date: '2024-01-14', size: '1.8 MB', status: 'exported' },
    { name: 'Well-C-Section-1.csv', date: '2024-01-13', size: '3.1 MB', status: 'corrected' }
  ]);

  const [systemStats] = useState({
    filesProcessed: 247,
    wellsLogged: 18,
    dataPoints: 125000,
    uptime: '99.8%'
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 sm:p-8 text-white mb-6 sm:mb-8">
          <div className="max-w-4xl">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              Mudlogging Data Automation Platform
            </h1>
            <p className="text-blue-100 text-base sm:text-lg mb-6 max-w-2xl">
              Streamline your mudlogging workflow with automated drift correction, LAS export, and intuitive data management designed for rig-site operations.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Link 
                href="/upload" 
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap cursor-pointer text-center"
              >
                Upload Data
              </Link>
              <Link 
                href="/correction" 
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors whitespace-nowrap cursor-pointer text-center"
              >
                View Corrections
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <i className="ri-file-chart-line text-blue-600 text-lg sm:text-xl"></i>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{systemStats.filesProcessed}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Files Processed</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <i className="ri-oil-line text-green-600 text-lg sm:text-xl"></i>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{systemStats.wellsLogged}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Wells Logged</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <i className="ri-database-line text-purple-600 text-lg sm:text-xl"></i>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{systemStats.dataPoints.toLocaleString()}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Data Points</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <i className="ri-pulse-line text-orange-600 text-lg sm:text-xl"></i>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{systemStats.uptime}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">System Uptime</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Quick Actions</h2>
            <div className="space-y-3 sm:space-y-4">
              <Link 
                href="/upload" 
                className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-upload-line text-blue-600 text-lg sm:text-xl"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Upload New Data</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Import CSV or Excel files for processing</p>
                </div>
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <i className="ri-arrow-right-line text-gray-400"></i>
                </div>
              </Link>

              <Link 
                href="/correction" 
                className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-line-chart-line text-green-600 text-lg sm:text-xl"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Review Corrections</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">View and adjust drift corrections</p>
                </div>
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <i className="ri-arrow-right-line text-gray-400"></i>
                </div>
              </Link>

              <Link 
                href="/export" 
                className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-download-line text-purple-600 text-lg sm:text-xl"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Export LAS Files</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Generate standardized output files</p>
                </div>
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <i className="ri-arrow-right-line text-gray-400"></i>
                </div>
              </Link>

              <Link 
                href="/settings" 
                className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-settings-line text-orange-600 text-lg sm:text-xl"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Configure Settings</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Customize profiles and templates</p>
                </div>
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <i className="ri-arrow-right-line text-gray-400"></i>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Files */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Recent Files</h2>
              <Link 
                href="/upload" 
                className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {recentFiles.map((file, index) => (
                <div key={index} className="flex items-center space-x-3 sm:space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-file-excel-line text-green-600 text-sm sm:text-base"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate text-sm sm:text-base">{file.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{file.date} • {file.size}</p>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      file.status === 'processed' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                        : file.status === 'exported'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {file.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-6 sm:mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">System Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
              <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Processing Engine: Online</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
              <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Data Storage: Available</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
              <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">API Connection: Limited</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
