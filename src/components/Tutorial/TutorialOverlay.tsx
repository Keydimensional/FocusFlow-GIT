import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  {
    title: 'Welcome to BrainBounce! 🌟',
    content: 'Your personal productivity companion designed specifically for ADHD minds. Let\'s explore the key features that will help you stay organised and focused.',
  },
  {
    title: 'Daily Focus & Brain Dump 🎯',
    content: 'Start your day by setting a main focus, then use the Brain Dump feature to clear your mind of any distracting thoughts or tasks. It\'s like a digital notepad for your brain!',
  },
  {
    title: 'Customisable Focus Timer ⏱️',
    content: 'Use the Focus Timer for structured work sessions. You can customise both work and break durations to match your optimal focus patterns.',
  },
  {
    title: 'Mood Tracking & Habits 📈',
    content: 'Track your daily mood and build healthy habits through fun mini-games. Watch your progress grow with visual streaks and achievements!',
  },
  {
    title: 'Smart Reminders & Goals 🎯',
    content: 'Set reminders for important tasks and break down bigger goals into manageable steps. Everything is designed to help you stay on track without feeling overwhelmed.',
  },
  {
    title: 'Make It Your Own! 🎨',
    content: 'Click the settings button in the bottom right corner to customise your dashboard. You can show/hide widgets and drag them to reorder - create the perfect layout that works best for you!',
  }
];

export const TutorialOverlay: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (hasSeenTutorial) {
      setShowTutorial(false);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setShowTutorial(false);
  };

  if (!showTutorial) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
        >
          <div className="flex justify-between items-center mb-6">
            <motion.h2
              key={currentStep}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl font-bold text-purple-600"
            >
              {steps[currentStep].title}
            </motion.h2>
            <button
              onClick={handleComplete}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <motion.p
            key={`content-${currentStep}`}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-gray-600 mb-8 leading-relaxed"
          >
            {steps[currentStep].content}
          </motion.p>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    index === currentStep ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                disabled={currentStep === 0}
              >
                Previous
              </button>
              
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};