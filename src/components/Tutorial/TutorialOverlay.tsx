import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../Auth/AuthProvider';

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

interface TutorialOverlayProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ forceShow = false, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const { user } = useAuth();

  // Handle forceShow prop changes - this is the key fix
  useEffect(() => {
    console.log('🎓 TutorialOverlay forceShow effect triggered:', { forceShow, showTutorial });
    
    if (forceShow) {
      console.log('🎓 Tutorial forced to show via prop');
      setShowTutorial(true);
      setCurrentStep(0);
    } else if (!forceShow && showTutorial) {
      // If forceShow becomes false, hide tutorial
      setShowTutorial(false);
    }
  }, [forceShow]);

  // Auto-show tutorial for new users (only when not forced)
  useEffect(() => {
    if (!forceShow && user && !showTutorial) {
      const tutorialKey = `hasSeenTutorial_${user.uid}`;
      const hasSeenTutorial = localStorage.getItem(tutorialKey);
      
      if (!hasSeenTutorial) {
        // Check if this is a new user (account created recently)
        const accountAge = Date.now() - new Date(user.metadata.creationTime || 0).getTime();
        const isNewUser = accountAge < 10 * 60 * 1000; // 10 minutes
        
        if (isNewUser) {
          console.log('🎓 Showing tutorial for new user');
          setShowTutorial(true);
        }
      }
    }
  }, [user, forceShow, showTutorial]);

  const handleComplete = () => {
    console.log('🎓 Tutorial completed');
    
    if (user && !forceShow) {
      const tutorialKey = `hasSeenTutorial_${user.uid}`;
      localStorage.setItem(tutorialKey, 'true');
      console.log('🎓 Tutorial marked as seen for user');
    }
    
    setShowTutorial(false);
    setCurrentStep(0);
    
    if (onComplete) {
      console.log('🎓 Calling onComplete callback');
      onComplete();
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    console.log('🎓 Tutorial closed via X button');
    handleComplete();
  };

  console.log('🎓 TutorialOverlay render:', { showTutorial, forceShow, currentStep });

  if (!showTutorial) {
    console.log('🎓 Tutorial not showing - returning null');
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]"
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
              onClick={handleClose}
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
                onClick={handlePrevious}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                disabled={currentStep === 0}
              >
                Previous
              </button>
              
              <button
                onClick={handleNext}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  currentStep < steps.length - 1
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};