import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Target, 
  Timer, 
  Heart, 
  Gamepad2, 
  Bell, 
  BarChart3, 
  List,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const features = [
  {
    id: 'daily-focus',
    icon: Target,
    title: 'Daily Focus Setting',
    shortTitle: 'Focus',
    description: 'Start each day by setting one meaningful intention. No overwhelming lists, just clarity on what matters most.',
    color: 'purple',
    benefits: ['Reduces decision fatigue', 'Builds momentum', 'Celebrates single-tasking']
  },
  {
    id: 'focus-timer',
    icon: Timer,
    title: 'Flexible Focus Timer',
    shortTitle: 'Timer',
    description: 'Customisable work and break periods that adapt to your natural rhythms. No rigid 25-minute rules here.',
    color: 'blue',
    benefits: ['Respects your attention span', 'Optional focus lock mode', 'Gentle completion alerts']
  },
  {
    id: 'mood-tracking',
    icon: Heart,
    title: 'Gentle Mood Tracking',
    shortTitle: 'Mood',
    description: 'Simple daily check-ins that help you spot patterns without judgment. Your feelings are valid data.',
    color: 'pink',
    benefits: ['Builds self-awareness', 'Tracks emotional patterns', 'No guilt or pressure']
  },
  {
    id: 'habit-games',
    icon: Gamepad2,
    title: 'Habit-Building Games',
    shortTitle: 'Games',
    description: 'Turn daily habits into fun mini-games. Memory challenges, reaction tests, and puzzles make consistency enjoyable.',
    color: 'green',
    benefits: ['Dopamine-driven motivation', 'Reduces habit resistance', 'Celebrates small wins']
  },
  {
    id: 'brain-dump',
    icon: Brain,
    title: 'Brain Dump Space',
    shortTitle: 'Brain',
    description: 'A safe place to capture racing thoughts, random ideas, and mental clutter. Clear your mind to focus better.',
    color: 'orange',
    benefits: ['Reduces mental overwhelm', 'Captures fleeting thoughts', 'Frees up working memory']
  },
  {
    id: 'smart-reminders',
    icon: Bell,
    title: 'Neurodiverse-Friendly Reminders',
    shortTitle: 'Alerts',
    description: 'Gentle nudges that work with your brain, not against it. Customisable sounds and timing that actually help.',
    color: 'indigo',
    benefits: ['Reduces time blindness', 'Prevents task switching', 'Supports working memory']
  },
  {
    id: 'progress-tracking',
    icon: BarChart3,
    title: 'Visual Progress Tracking',
    shortTitle: 'Stats',
    description: 'See your growth through beautiful charts and streak counters. Progress over perfection, always.',
    color: 'teal',
    benefits: ['Motivates continuation', 'Shows long-term patterns', 'Celebrates consistency']
  },
  {
    id: 'flexible-lists',
    icon: List,
    title: 'Flexible Task Lists',
    shortTitle: 'Lists',
    description: 'Create lists that work for you. No rigid structures, just simple organisation that adapts to your needs.',
    color: 'red',
    benefits: ['Reduces executive load', 'Supports working memory', 'Flexible organisation']
  }
];

const colorClasses = {
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    icon: 'text-purple-600',
    button: 'bg-purple-600 hover:bg-purple-700'
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700'
  },
  pink: {
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-700',
    icon: 'text-pink-600',
    button: 'bg-pink-600 hover:bg-pink-700'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    icon: 'text-green-600',
    button: 'bg-green-600 hover:bg-green-700'
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    icon: 'text-orange-600',
    button: 'bg-orange-600 hover:bg-orange-700'
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    icon: 'text-indigo-600',
    button: 'bg-indigo-600 hover:bg-indigo-700'
  },
  teal: {
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-700',
    icon: 'text-teal-600',
    button: 'bg-teal-600 hover:bg-teal-700'
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: 'text-red-600',
    button: 'bg-red-600 hover:bg-red-700'
  }
};

export const FeatureShowcase: React.FC = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance features every 4 seconds
  React.useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextFeature = () => {
    setIsAutoPlaying(false);
    setCurrentFeature(prev => (prev + 1) % features.length);
  };

  const prevFeature = () => {
    setIsAutoPlaying(false);
    setCurrentFeature(prev => (prev - 1 + features.length) % features.length);
  };

  const selectFeature = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentFeature(index);
  };

  const feature = features[currentFeature];
  const IconComponent = feature.icon;
  const colors = colorClasses[feature.color as keyof typeof colorClasses];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          Explore BrainBounce Features
        </h2>
        <p className="text-gray-600 text-sm">
          Interactive showcase of tools designed specifically for neurodiverse minds
        </p>
      </div>

      {/* Feature Navigation Dots */}
      <div className="flex justify-center gap-2 mb-6">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => selectFeature(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentFeature 
                ? 'bg-purple-600 scale-125' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`View feature ${index + 1}`}
          />
        ))}
      </div>

      {/* Main Feature Display */}
      <div className="relative min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFeature}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={`${colors.bg} ${colors.border} border-2 rounded-lg p-6`}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-3 bg-white rounded-lg shadow-sm`}>
                <IconComponent className={`w-8 h-8 ${colors.icon}`} />
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-semibold ${colors.text} mb-2`}>
                  {feature.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className={`font-medium ${colors.text} text-sm mb-2`}>
                Why this helps neurodiverse brains:
              </h4>
              {feature.benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <div className={`w-2 h-2 rounded-full ${colors.button.split(' ')[0]}`} />
                  <span className="text-gray-600 text-sm">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prevFeature}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow text-gray-600 hover:text-purple-600"
          aria-label="Previous feature"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={nextFeature}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow text-gray-600 hover:text-purple-600"
          aria-label="Next feature"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Feature Grid for Quick Access */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">
          Quick Feature Overview
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {features.map((feat, index) => {
            const FeatIcon = feat.icon;
            const featColors = colorClasses[feat.color as keyof typeof colorClasses];
            return (
              <button
                key={feat.id}
                onClick={() => selectFeature(index)}
                className={`p-2 sm:p-3 rounded-lg transition-all duration-200 ${
                  index === currentFeature 
                    ? `${featColors.bg} ${featColors.border} border-2 scale-105` 
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
                title={feat.title}
              >
                <FeatIcon className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto ${
                  index === currentFeature ? featColors.icon : 'text-gray-500'
                }`} />
                <span className={`text-xs mt-1 block leading-tight ${
                  index === currentFeature ? featColors.text : 'text-gray-600'
                }`}>
                  <span className="sm:hidden">{feat.shortTitle}</span>
                  <span className="hidden sm:inline">{feat.title.split(' ')[0]}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Auto-play indicator */}
      <div className="mt-4 text-center">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          {isAutoPlaying ? '⏸️ Pause auto-advance' : '▶️ Resume auto-advance'}
        </button>
      </div>
    </div>
  );
};