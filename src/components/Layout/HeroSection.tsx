import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Heart, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const HeroSection: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollIndicator(false);
      } else {
        setShowScrollIndicator(true);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="relative text-center py-12 px-4 mb-8 bg-white rounded-xl shadow-sm">
      <h1 className="text-4xl font-bold text-purple-600 mb-4">Focus, Your Way</h1>
      
      <p className="text-xl text-gray-700 mb-8">
        Tired of productivity apps that treat you like a robot?
        BrainBounce Flow is designed for ADHD minds; flexible, forgiving, and actually helpful.
        No pressure. No shame. Just small wins, dopamine-friendly design, and structure that bends with you.
      </p>

      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="space-y-2">
          <Brain className="w-8 h-8 text-purple-500 mx-auto" />
          <h3 className="font-semibold text-gray-800">Built for Neurodivergence</h3>
          <p className="text-gray-600">Works with your brain, not against it</p>
        </div>

        <div className="space-y-2">
          <Sparkles className="w-8 h-8 text-purple-500 mx-auto" />
          <h3 className="font-semibold text-gray-800">Gentle Tools</h3>
          <p className="text-gray-600">Zero guilt. Zero overwhelm.</p>
        </div>

        <div className="space-y-2">
          <Heart className="w-8 h-8 text-purple-500 mx-auto" />
          <h3 className="font-semibold text-gray-800">Beautifully Minimal</h3>
          <p className="text-gray-600">Designed to calm and support</p>
        </div>
      </div>

      <AnimatePresence>
        {isMobile && showScrollIndicator && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 10 }}
              exit={{ opacity: 0 }}
              transition={{ 
                repeat: Infinity, 
                duration: 2.5,
                ease: "easeInOut"
              }}
            >
              <ChevronDown className="w-8 h-8 text-purple-500" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};