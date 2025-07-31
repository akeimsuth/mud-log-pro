
'use client';

import { useState } from 'react';
import Header from '@/components/Header';

interface CorrectionProfile {
  id: string;
  name: string;
  description: string;
  parameters: {
    driftThreshold: number;
    outlierSensitivity: number;
    smoothingWindow: number;
  };
  isDefault: boolean;
}

interface LASTemplate {
  id: string;
  name: string;
  description: string;
  curves: Array<{
    name: string;
    unit: string;
    description: string;
    required: boolean;
  }>;
  isDefault: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profiles' | 'templates' | 'system' | 'voice'>('profiles');
  const [showNewProfileModal, setShowNewProfileModal] = useState(false);
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [showVoiceTestModal, setShowVoiceTestModal] = useState(false);
  const [showVoiceOutputModal, setShowVoiceOutputModal] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [isTestingOutput, setIsTestingOutput] = useState(false);
  const [voiceTestResult, setVoiceTestResult] = useState<string>('');
  const [outputTestResult, setOutputTestResult] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [newProfile, setNewProfile] = useState({
    name: '',
    description: '',
    driftThreshold: 0.05,
    outlierSensitivity: 2.0,
    smoothingWindow: 5,
  });

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    curves: [
      { name: 'DEPT', unit: 'FT', description: 'Depth', required: true },
      { name: 'GAS', unit: 'PPM', description: 'Total Gas', required: true },
    ],
  });

  const [correctionProfiles, setCorrectionProfiles] = useState<CorrectionProfile[]>([
    {
      id: '1',
      name: 'Standard Gas Correction',
      description: 'Default correction profile for gas measurements',
      parameters: {
        driftThreshold: 0.05,
        outlierSensitivity: 2.0,
        smoothingWindow: 5,
      },
      isDefault: true,
    },
    {
      id: '2',
      name: 'High Sensitivity',
      description: 'Enhanced correction for noisy environments',
      parameters: {
        driftThreshold: 0.02,
        outlierSensitivity: 1.5,
        smoothingWindow: 7,
      },
      isDefault: false,
    },
    {
      id: '3',
      name: 'Conservative',
      description: 'Minimal corrections for stable data',
      parameters: {
        driftThreshold: 0.1,
        outlierSensitivity: 3.0,
        smoothingWindow: 3,
      },
      isDefault: false,
    },
  ]);

  const [lasTemplates, setLasTemplates] = useState<LASTemplate[]>([
    {
      id: '1',
      name: 'Standard Mudlog',
      description: 'Standard curves for mudlogging operations',
      curves: [
        { name: 'DEPT', unit: 'FT', description: 'Depth', required: true },
        { name: 'GAS', unit: 'PPM', description: 'Total Gas', required: true },
        { name: 'C1', unit: 'PPM', description: 'Methane', required: false },
        { name: 'C2', unit: 'PPM', description: 'Ethane', required: false },
        { name: 'C3', unit: 'PPM', description: 'Propane', required: false },
      ],
      isDefault: true,
    },
    {
      id: '2',
      name: 'Extended Gas Analysis',
      description: 'Comprehensive gas component analysis',
      curves: [
        { name: 'DEPT', unit: 'FT', description: 'Depth', required: true },
        { name: 'GAS', unit: 'PPM', description: 'Total Gas', required: true },
        { name: 'C1', unit: 'PPM', description: 'Methane', required: true },
        { name: 'C2', unit: 'PPM', description: 'Ethane', required: true },
        { name: 'C3', unit: 'PPM', description: 'Propane', required: true },
        { name: 'IC4', unit: 'PPM', description: 'Iso-Butane', required: false },
        { name: 'NC4', unit: 'PPM', description: 'N-Butane', required: false },
        { name: 'IC5', unit: 'PPM', description: 'Iso-Pentane', required: false },
        { name: 'NC5', unit: 'PPM', description: 'N-Pentane', required: false },
      ],
      isDefault: false,
    },
  ]);

  const [systemSettings, setSystemSettings] = useState({
    autoSave: true,
    dataRetention: 90, // days
    exportPath: '/exports',
    apiEndpoint: 'https://api.solofeed.com/v1',
    witsmlUrl: 'https://witsml.company.com/store',
    maxFileSize: 10, // MB
    language: 'en',
    timezone: 'UTC',
    units: 'imperial' as 'imperial' | 'metric',
  });

  const [voiceSettings, setVoiceSettings] = useState({
    enabled: true,
    language: 'en-US',
    voice: 'female',
    speed: 1.0,
    confirmations: true,
    hotword: 'Hey MudLog',
  });

  const setDefaultProfile = (profileId: string) => {
    setCorrectionProfiles((prev) =>
      prev.map((profile) => ({ ...profile, isDefault: profile.id === profileId }))
    );
  };

  const setDefaultTemplate = (templateId: string) => {
    setLasTemplates((prev) =>
      prev.map((template) => ({ ...template, isDefault: template.id === templateId }))
    );
  };

  const updateSystemSetting = (key: string, value: any) => {
    setSystemSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateVoiceSetting = (key: string, value: any) => {
    setVoiceSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateProfile = () => {
    if (!newProfile.name.trim()) return;

    const profile: CorrectionProfile = {
      id: Date.now().toString(),
      name: newProfile.name,
      description: newProfile.description,
      parameters: {
        driftThreshold: newProfile.driftThreshold,
        outlierSensitivity: newProfile.outlierSensitivity,
        smoothingWindow: newProfile.smoothingWindow,
      },
      isDefault: false,
    };

    setCorrectionProfiles((prev) => [...prev, profile]);
    setShowNewProfileModal(false);
    setNewProfile({
      name: '',
      description: '',
      driftThreshold: 0.05,
      outlierSensitivity: 2.0,
      smoothingWindow: 5,
    });
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim()) return;

    const template: LASTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      description: newTemplate.description,
      curves: newTemplate.curves,
      isDefault: false,
    };

    setLasTemplates((prev) => [...prev, template]);
    setShowNewTemplateModal(false);
    setNewTemplate({
      name: '',
      description: '',
      curves: [
        { name: 'DEPT', unit: 'FT', description: 'Depth', required: true },
        { name: 'GAS', unit: 'PPM', description: 'Total Gas', required: true },
      ],
    });
  };

  const addCurveToTemplate = () => {
    setNewTemplate((prev) => ({
      ...prev,
      curves: [...prev.curves, { name: '', unit: '', description: '', required: false }],
    }));
  };

  const removeCurveFromTemplate = (index: number) => {
    setNewTemplate((prev) => ({
      ...prev,
      curves: prev.curves.filter((_, i) => i !== index),
    }));
  };

  const updateTemplateCurve = (index: number, field: string, value: any) => {
    setNewTemplate((prev) => ({
      ...prev,
      curves: prev.curves.map((curve, i) =>
        i === index ? { ...curve, [field]: value } : curve
      ),
    }));
  };

  const testVoiceRecognition = async () => {
    setShowVoiceTestModal(true);
    setIsTestingVoice(true);
    setVoiceTestResult('');
    try {
      if (!(window as any).webkitSpeechRecognition && !(window as any).SpeechRecognition) {
        setVoiceTestResult('Speech recognition not supported in this browser. Please use Chrome or Edge.');
        setIsTestingVoice(false);
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = voiceSettings.language;
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceTestResult('Listening... Try saying "Upload file" or "Show corrections"');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceTestResult(`Recognized: "${transcript}"`);

        const command = transcript.toLowerCase();
        if (command.includes('upload file')) {
          setVoiceTestResult(` Command recognized: "${transcript}" → Navigate to Upload Page`);
        } else if (command.includes('show corrections')) {
          setVoiceTestResult(` Command recognized: "${transcript}" → Navigate to Corrections Page`);
        } else if (command.includes('export data')) {
          setVoiceTestResult(` Command recognized: "${transcript}" → Start Export Process`);
        } else if (command.includes('senior mode')) {
          setVoiceTestResult(` Command recognized: "${transcript}" → Toggle Senior Mode`);
        } else {
          setVoiceTestResult(`Recognized: "${transcript}" (No matching command found)`);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setIsTestingVoice(false);
        if (event.error === 'no-speech') {
          setVoiceTestResult('No speech detected. Please try again and speak clearly.');
        } else if (event.error === 'not-allowed') {
          setVoiceTestResult('Microphone access denied. Please allow microphone permissions and try again.');
        } else {
          setVoiceTestResult(`Recognition error: ${event.error}. Please check your microphone and try again.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setIsTestingVoice(false);
      };

      recognition.start();

      setTimeout(() => {
        if (recognition) {
          recognition.stop();
        }
      }, 10000);
    } catch (error) {
      setIsTestingVoice(false);
      setVoiceTestResult('Error initializing voice recognition. Please check your browser settings.');
    }
  };

  const testVoiceOutput = async () => {
    setShowVoiceOutputModal(true);
    setIsTestingOutput(true);
    setOutputTestResult('');
    setIsSpeaking(false);

    try {
      if (!('speechSynthesis' in window)) {
        setOutputTestResult('Text-to-speech not supported in this browser. Please use Chrome, Edge, or Firefox.');
        setIsTestingOutput(false);
        return;
      }

      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      setOutputTestResult('Initializing voice output system...');

      // Get available voices
      const getVoices = () => {
        return new Promise<SpeechSynthesisVoice[]>((resolve) => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            resolve(voices);
          } else {
            window.speechSynthesis.addEventListener('voiceschanged', () => {
              resolve(window.speechSynthesis.getVoices());
            });
          }
        });
      };

      const voices = await getVoices();
      const selectedVoice = voices.find(
        (voice) =>
          (voiceSettings.voice === 'female' && voice.name.toLowerCase().includes('female')) ||
          (voiceSettings.voice === 'male' && voice.name.toLowerCase().includes('male')) ||
          voice.lang.startsWith(voiceSettings.language.substring(0, 2))
      ) || voices[0];

      if (!selectedVoice) {
        setOutputTestResult('No suitable voice found for the selected language.');
        setIsTestingOutput(false);
        return;
      }

      setOutputTestResult(`Voice system ready. Using: ${selectedVoice.name}`);

      // Test phrases related to mudlogging operations
      const testPhrases = [
        "MudLog Pro voice system is now active and ready for commands.",
        "Current gas reading is twenty-five point three parts per million at depth one thousand two hundred fifty feet.",
        "Drift correction has been applied to forty-seven data points. Three outliers detected and flagged.",
        "Export to LAS format completed successfully. File saved as Well-A-Section-1.las",
        "Voice assistant is functioning normally. All systems operational.",
      ];

      let currentPhrase = 0;

      const speakNextPhrase = () => {
        if (currentPhrase >= testPhrases.length) {
          setIsSpeaking(false);
          setOutputTestResult(` Voice output test completed successfully!\n\nTested ${testPhrases.length} phrases with voice: ${selectedVoice.name}\nSpeed: ${voiceSettings.speed}x\nLanguage: ${voiceSettings.language}`);
          setIsTestingOutput(false);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(testPhrases[currentPhrase]);
        utterance.voice = selectedVoice;
        utterance.rate = voiceSettings.speed;
        utterance.pitch = 1;
        utterance.volume = 0.8;

        setIsSpeaking(true);
        setOutputTestResult(` Speaking: "${testPhrases[currentPhrase]}"\n\nPhrase ${currentPhrase + 1} of ${testPhrases.length}\nVoice: ${selectedVoice.name}`);

        utterance.onend = () => {
          currentPhrase++;
          setTimeout(speakNextPhrase, 1000); // 1 second pause between phrases
        };

        utterance.onerror = (event) => {
          setIsSpeaking(false);
          setOutputTestResult(` Error during speech: ${event.error}\n\nPlease check your system audio settings and try again.`);
          setIsTestingOutput(false);
        };

        window.speechSynthesis.speak(utterance);
      };

      // Start speaking after a short delay
      setTimeout(speakNextPhrase, 1000);
    } catch (error) {
      setIsTestingOutput(false);
      setIsSpeaking(false);
      setOutputTestResult('Error initializing voice output. Please check your browser settings and system audio.');
    }
  };

  const stopVoiceOutput = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsTestingOutput(false);
    setOutputTestResult('Voice output test stopped by user.');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Settings & Templates
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Configure correction profiles, LAS templates, and system preferences
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6 sm:mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex overflow-x-auto">
              {[
                { id: 'profiles', label: 'Correction Profiles', icon: 'ri-line-chart-line' },
                { id: 'templates', label: 'LAS Templates', icon: 'ri-file-text-line' },
                { id: 'system', label: 'System Settings', icon: 'ri-settings-line' },
                { id: 'voice', label: 'Voice Assistant', icon: 'ri-mic-line' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer min-w-fit ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="w-5 h-5 sm:w-4 sm:h-4 flex items-center justify-center">
                    <i className={tab.icon}></i>
                  </div>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-xs font-medium">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {activeTab === 'profiles' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Drift Correction Profiles
                </h2>
                <button
                  onClick={() => setShowNewProfileModal(true)}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer text-sm"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-add-line"></i>
                  </div>
                  <span>New Profile</span>
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {correctionProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`p-4 sm:p-6 rounded-lg border-2 transition-colors ${
                      profile.isDefault
                        ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 space-y-3 sm:space-y-0">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{profile.name}</h3>
                          {profile.isDefault && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium rounded-full w-fit">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">{profile.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!profile.isDefault && (
                          <button
                            onClick={() => setDefaultProfile(profile.id)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs sm:text-sm cursor-pointer whitespace-nowrap"
                          >
                            Set as Default
                          </button>
                        )}
                        <button className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer">
                          <div className="w-5 h-5 flex items-center justify-center">
                            <i className="ri-edit-line"></i>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Drift Threshold
                        </label>
                        <input
                          type="number"
                          value={profile.parameters.driftThreshold}
                          className="w-full px-2 py-1 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          step="0.01"
                          min="0"
                          max="1"
                        />
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Outlier Sensitivity
                        </label>
                        <input
                          type="number"
                          value={profile.parameters.outlierSensitivity}
                          className="w-full px-2 py-1 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          step="0.1"
                          min="0.5"
                          max="5"
                        />
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Smoothing Window
                        </label>
                        <input
                          type="number"
                          value={profile.parameters.smoothingWindow}
                          className="w-full px-2 py-1 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          step="1"
                          min="1"
                          max="20"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  LAS Export Templates
                </h2>
                <button
                  onClick={() => setShowNewTemplateModal(true)}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer text-sm"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-add-line"></i>
                  </div>
                  <span>New Template</span>
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {lasTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 sm:p-6 rounded-lg border-2 transition-colors ${
                      template.isDefault
                        ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 space-y-3 sm:space-y-0">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{template.name}</h3>
                          {template.isDefault && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium rounded-full w-fit">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">{template.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!template.isDefault && (
                          <button
                            onClick={() => setDefaultTemplate(template.id)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs sm:text-sm cursor-pointer whitespace-nowrap"
                          >
                            Set as Default
                          </button>
                        )}
                        <button className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer">
                          <div className="w-5 h-5 flex items-center justify-center">
                            <i className="ri-edit-line"></i>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-white dark:bg-gray-800">
                            <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Curve Name
                            </th>
                            <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Unit
                            </th>
                            <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Required
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {template.curves.map((curve, index) => (
                            <tr key={index}>
                              <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                {curve.name}
                              </td>
                              <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                {curve.unit}
                              </td>
                              <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                {curve.description}
                              </td>
                              <td className="px-2 sm:px-3 py-2">
                                {curve.required ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    Required
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                    Optional
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                General Settings
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Auto-save
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Automatically save changes
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemSettings.autoSave}
                    onChange={(e) => updateSystemSetting('autoSave', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data Retention (days)
                  </label>
                  <input
                    type="number"
                    value={systemSettings.dataRetention}
                    onChange={(e) => updateSystemSetting('dataRetention', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    min="1"
                    max="365"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Export Path
                  </label>
                  <input
                    type="text"
                    value={systemSettings.exportPath}
                    onChange={(e) => updateSystemSetting('exportPath', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Maximum File Size (MB)
                  </label>
                  <input
                    type="number"
                    value={systemSettings.maxFileSize}
                    onChange={(e) => updateSystemSetting('maxFileSize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    min="1"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unit System
                  </label>
                  <select
                    value={systemSettings.units}
                    onChange={(e) => updateSystemSetting('units', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="imperial">Imperial (ft, ppm)</option>
                    <option value="metric">Metric (m, mg/L)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                API Configuration
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Solo Feed API Endpoint
                  </label>
                  <input
                    type="url"
                    value={systemSettings.apiEndpoint}
                    onChange={(e) => updateSystemSetting('apiEndpoint', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    WITSML Server URL
                  </label>
                  <input
                    type="url"
                    value={systemSettings.witsmlUrl}
                    onChange={(e) => updateSystemSetting('witsmlUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>

                <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer text-sm">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-check-line"></i>
                    </div>
                    <span>Test Connection</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Voice Assistant Configuration
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable Voice Assistant
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Allow voice commands and narration
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={voiceSettings.enabled}
                    onChange={(e) => updateVoiceSetting('enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Language
                  </label>
                  <select
                    value={voiceSettings.language}
                    onChange={(e) => updateVoiceSetting('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="es-ES">Spanish</option>
                    <option value="fr-FR">French</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Voice Type
                  </label>
                  <select
                    value={voiceSettings.voice}
                    onChange={(e) => updateVoiceSetting('voice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="female">Female Voice</option>
                    <option value="male">Male Voice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Speech Speed: {voiceSettings.speed}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={voiceSettings.speed}
                    onChange={(e) => updateVoiceSetting('speed', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Wake Word
                  </label>
                  <input
                    type="text"
                    value={voiceSettings.hotword}
                    onChange={(e) => updateVoiceSetting('hotword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Voice Confirmations
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Speak confirmations for actions
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={voiceSettings.confirmations}
                    onChange={(e) => updateVoiceSetting('confirmations', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">
                    Available Commands
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        "Upload file"
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        Open file dialog
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        "Show corrections"
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        Navigate to corrections page
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        "Export data"
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        Start export process
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        "Read outliers"
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        Narrate flagged data points
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        "Senior mode"
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        Toggle accessibility mode
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3 sm:mb-4 text-sm sm:text-base">
                    Test Voice Settings
                  </h3>
                  <p className="text-blue-800 dark:text-blue-300 text-xs sm:text-sm mb-3 sm:mb-4">
                    Test your voice configuration with sample phrases
                  </p>
                  <div className="space-y-2 sm:space-y-3">
                    <button
                      onClick={testVoiceOutput}
                      className="w-full flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer text-sm"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-play-line"></i>
                      </div>
                      <span>Test Voice Output</span>
                    </button>
                    <button
                      onClick={testVoiceRecognition}
                      className="w-full flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap cursor-pointer text-sm"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-mic-line"></i>
                      </div>
                      <span>Test Voice Recognition</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showNewProfileModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Create New Correction Profile
                  </h3>
                  <button
                    onClick={() => setShowNewProfileModal(false)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newProfile.name}
                    onChange={(e) =>
                      setNewProfile((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter profile name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newProfile.description}
                    onChange={(e) =>
                      setNewProfile((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Describe when to use this profile"
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {newProfile.description.length}/500 characters
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Drift Threshold
                    </label>
                    <input
                      type="number"
                      value={newProfile.driftThreshold}
                      onChange={(e) =>
                        setNewProfile((prev) => ({
                          ...prev,
                          driftThreshold: parseFloat(e.target.value),
                        }))
                      }
                      step="0.01"
                      min="0"
                      max="1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Sensitivity for detecting drift (0-1)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Outlier Sensitivity
                    </label>
                    <input
                      type="number"
                      value={newProfile.outlierSensitivity}
                      onChange={(e) =>
                        setNewProfile((prev) => ({
                          ...prev,
                          outlierSensitivity: parseFloat(e.target.value),
                        }))
                      }
                      step="0.1"
                      min="0.5"
                      max="5"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Standard deviations for outlier detection
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Smoothing Window
                    </label>
                    <input
                      type="number"
                      value={newProfile.smoothingWindow}
                      onChange={(e) =>
                        setNewProfile((prev) => ({
                          ...prev,
                          smoothingWindow: parseInt(e.target.value),
                        }))
                      }
                      step="1"
                      min="1"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Data points for smoothing average
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                      <i className="ri-information-line text-blue-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                        Parameter Guidelines
                      </h4>
                      <ul className="space-y-1 text-blue-800 dark:text-blue-300 text-sm">
                        <li>
                          • Lower drift threshold = more sensitive drift detection
                        </li>
                        <li>
                          • Lower outlier sensitivity = more aggressive outlier removal
                        </li>
                        <li>
                          • Larger smoothing window = smoother corrections
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex space-x-3 justify-end">
                <button
                  onClick={() => setShowNewProfileModal(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProfile}
                  disabled={!newProfile.name.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                >
                  Create Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {showNewTemplateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Create New LAS Template
                  </h3>
                  <button
                    onClick={() => setShowNewTemplateModal(false)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Template Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTemplate.name}
                      onChange={(e) =>
                        setNewTemplate((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Enter template name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newTemplate.description}
                      onChange={(e) =>
                        setNewTemplate((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Brief description of template usage"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Curve Configuration
                    </h4>
                    <button
                      onClick={addCurveToTemplate}
                      className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer text-sm"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-add-line"></i>
                      </div>
                      <span>Add Curve</span>
                    </button>
                  </div>

                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {newTemplate.curves.map((curve, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-3 items-end p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="col-span-3">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Curve Name
                          </label>
                          <input
                            type="text"
                            value={curve.name}
                            onChange={(e) => updateTemplateCurve(index, 'name', e.target.value)}
                            placeholder="e.g. C1, C2"
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Unit
                          </label>
                          <input
                            type="text"
                            value={curve.unit}
                            onChange={(e) => updateTemplateCurve(index, 'unit', e.target.value)}
                            placeholder="PPM, FT"
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="col-span-4">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={curve.description}
                            onChange={(e) => updateTemplateCurve(index, 'description', e.target.value)}
                            placeholder="Curve description"
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={curve.required}
                              onChange={(e) => updateTemplateCurve(index, 'required', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                            />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              Required
                            </span>
                          </label>
                        </div>
                        <div className="col-span-1">
                          <button
                            onClick={() => removeCurveFromTemplate(index)}
                            disabled={newTemplate.curves.length <= 2}
                            className="w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <i className="ri-delete-bin-line text-sm"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                      <i className="ri-information-line text-blue-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                        Template Guidelines
                      </h4>
                      <ul className="space-y-1 text-blue-800 dark:text-blue-300 text-sm">
                        <li>
                          • DEPT (Depth) and GAS (Total Gas) curves are recommended for all templates
                        </li>
                        <li>
                          • Use standard LAS curve names (C1, C2, C3, etc.) for gas components
                        </li>
                        <li>
                          • Required curves must be present in data files for successful export
                        </li>
                        <li>
                          • Optional curves will be included if available in the data
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex space-x-3 justify-end">
                <button
                  onClick={() => setShowNewTemplateModal(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTemplate}
                  disabled={
                    !newTemplate.name.trim() || newTemplate.curves.some((c) => !c.name.trim())
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                >
                  Create Template
                </button>
              </div>
            </div>
          </div>
        )}

        {showVoiceTestModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Voice Recognition Test
                  </h3>
                  <button
                    onClick={() => setShowVoiceTestModal(false)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="text-center">
                  <div
                    className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      isListening ? 'bg-red-100 dark:bg-red-900/20' : 'bg-blue-100 dark:bg-blue-900/20'
                    }`}
                  >
                    <i
                      className={`text-4xl ${
                        isListening ? 'ri-mic-line text-red-600 animate-pulse' : 'ri-mic-off-line text-blue-600'
                      }`}
                    ></i>
                  </div>

                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {isListening ? 'Listening...' : isTestingVoice ? 'Preparing...' : 'Voice Recognition Test'}
                  </h4>

                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {isListening
                      ? 'Speak clearly into your microphone'
                      : isTestingVoice
                      ? 'Initializing speech recognition...'
                      : 'Test voice recognition with sample phrases'}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[100px] flex items-center justify-center">
                  <p className="text-gray-700 dark:text-gray-300 text-center">
                    {voiceTestResult || 'Test results will appear here...'}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
                    Try These Commands:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-800 dark:text-blue-300">"Upload file"</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-800 dark:text-blue-300">"Show corrections"</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-800 dark:text-blue-300">"Export data"</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-800 dark:text-blue-300">"Senior mode"</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                      <i className="ri-information-line text-yellow-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                        Testing Tips:
                      </h4>
                      <ul className="space-y-1 text-yellow-700 dark:text-yellow-300 text-sm">
                        <li>• Ensure your browser allows microphone access</li>
                        <li>• Speak clearly and at normal volume</li>
                        <li>• Wait for the "Listening..." indicator before speaking</li>
                        <li>• Test works best in quiet environments</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex space-x-3 justify-end">
                <button
                  onClick={() => setShowVoiceTestModal(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Close
                </button>
                {!isTestingVoice && !isListening && (
                  <button
                    onClick={testVoiceRecognition}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Start Test
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {showVoiceOutputModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Voice Output Test
                  </h3>
                  <button
                    onClick={() => setShowVoiceOutputModal(false)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="text-center">
                  <div
                    className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      isSpeaking ? 'bg-green-100 dark:bg-green-900/20' : 'bg-blue-100 dark:bg-blue-900/20'
                    }`}
                  >
                    <i
                      className={`text-4xl ${
                        isSpeaking ? 'ri-volume-up-line text-green-600 animate-pulse' : 'ri-volume-mute-line text-blue-600'
                      }`}
                    ></i>
                  </div>

                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {isSpeaking ? 'Voice Output Active' : isTestingOutput ? 'Preparing Audio...' : 'Voice Output Test'}
                  </h4>

                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {isSpeaking
                      ? 'Listen to the voice output from your speakers'
                      : isTestingOutput
                      ? 'Initializing text-to-speech system...'
                      : 'Test voice output with sample mudlogging phrases'}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[120px] flex items-center justify-center">
                  <p className="text-gray-700 dark:text-gray-300 text-center whitespace-pre-line">
                    {outputTestResult || 'Test results will appear here...'}
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 dark:text-green-200 mb-3">
                    Test Phrases Include:
                  </h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                      <span className="text-green-800 dark:text-green-300">System status announcements</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                      <span className="text-green-800 dark:text-green-300">Gas measurement readings</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                      <span className="text-green-800 dark:text-green-300">Correction process updates</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                      <span className="text-green-800 dark:text-green-300">Export completion confirmations</span>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                      <i className="ri-volume-up-line text-orange-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                        Audio Test Tips:
                      </h4>
                      <ul className="space-y-1 text-orange-700 dark:text-orange-300 text-sm">
                        <li>• Ensure your system volume is at a comfortable level</li>
                        <li>• Check that audio output device is properly connected</li>
                        <li>• Test will speak 5 different phrases with pauses between</li>
                        <li>• You can stop the test at any time using the Stop button</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex space-x-3 justify-end">
                <button
                  onClick={() => setShowVoiceOutputModal(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Close
                </button>
                {isSpeaking && (
                  <button
                    onClick={stopVoiceOutput}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Stop Test
                  </button>
                )}
                {!isTestingOutput && !isSpeaking && (
                  <button
                    onClick={testVoiceOutput}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Start Test
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
