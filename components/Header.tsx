
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const [seniorMode, setSeniorMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const toggleSeniorMode = () => {
    setSeniorMode(!seniorMode);
    document.documentElement.classList.toggle('senior-mode');
  };

  return (
    <header className={`bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 ${seniorMode ? 'text-xl' : ''}`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <i className="ri-oil-line text-2xl text-blue-600"></i>
              </div>
              <h1 className="font-pacifico text-xl text-gray-900 dark:text-white">MudLog Pro</h1>
            </Link>
            
            <nav className="flex space-x-6">
              <Link href="/" className={`text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap ${seniorMode ? 'px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg' : ''}`}>
                Dashboard
              </Link>
              <Link href="/upload" className={`text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap ${seniorMode ? 'px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg' : ''}`}>
                Data Upload
              </Link>
              <Link href="/correction" className={`text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap ${seniorMode ? 'px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg' : ''}`}>
                Drift Correction
              </Link>
              <Link href="/export" className={`text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap ${seniorMode ? 'px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg' : ''}`}>
                LAS Export
              </Link>
              <Link href="/settings" className={`text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap ${seniorMode ? 'px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg' : ''}`}>
                Settings
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleSeniorMode}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${seniorMode ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'} hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-user-heart-line text-sm"></i>
              </div>
              <span className="text-sm font-medium">Senior Mode</span>
            </button>

            <button 
              onClick={toggleDarkMode}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap cursor-pointer"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={darkMode ? 'ri-sun-line' : 'ri-moon-line'}></i>
              </div>
              <span className="text-sm font-medium">{darkMode ? 'Light' : 'Dark'}</span>
            </button>

            <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
