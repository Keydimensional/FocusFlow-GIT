import React, { useState } from 'react';
import { SunMedium, Settings } from 'lucide-react';
import { SettingsModal } from '../Settings/SettingsModal';
import { HeroSection } from './HeroSection';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center">
            <SunMedium className="h-6 w-6 text-yellow-500 mr-2" />
            <h1 className="text-xl font-semibold text-gray-800">BrainBounce Flow</h1>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <HeroSection />
        {children}
      </main>
      <footer className="text-center text-sm text-gray-600 py-4">
        <p>Optimised for your wellbeing</p>
      </footer>

      <button
        onClick={() => setShowSettings(true)}
        className="fixed bottom-6 right-6 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 text-gray-600 hover:text-purple-600"
      >
        <Settings className="w-6 h-6" />
      </button>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
};