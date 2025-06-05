import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, Settings } from 'lucide-react';

export const FocusTimer: React.FC = () => {
  const [workTime, setWorkTime] = useState(25 * 60); // Default 25 minutes
  const [breakTime, setBreakTime] = useState(5 * 60); // Default 5 minutes
  const [timeLeft, setTimeLeft] = useState(workTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});

      if (isBreak) {
        setTimeLeft(workTime);
        setIsBreak(false);
      } else {
        setTimeLeft(breakTime);
        setIsBreak(true);
        setIsRunning(true); // Auto-start break
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, workTime, breakTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const reset = () => {
    setTimeLeft(isBreak ? breakTime : workTime);
    setIsRunning(false);
  };

  const progress = ((isBreak ? breakTime : workTime) - timeLeft) / (isBreak ? breakTime : workTime) * 100;
  const circumference = 2 * Math.PI * 88;

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${isBreak ? 'bg-green-50' : ''}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Timer className={`w-5 h-5 ${isBreak ? 'text-green-500' : 'text-purple-500'}`} />
          {isBreak ? 'Break Timer' : 'Focus Timer'}
        </h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-gray-600 hover:text-purple-600 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {showSettings && (
        <div className="mb-6 space-y-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Work Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={Math.floor(workTime / 60)}
              onChange={(e) => {
                const newTime = Math.max(1, Math.min(60, parseInt(e.target.value))) * 60;
                setWorkTime(newTime);
                if (!isBreak) setTimeLeft(newTime);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Break Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={Math.floor(breakTime / 60)}
              onChange={(e) => {
                const newTime = Math.max(1, Math.min(30, parseInt(e.target.value))) * 60;
                setBreakTime(newTime);
                if (isBreak) setTimeLeft(newTime);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      )}

      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            strokeWidth="8"
            className="stroke-current text-gray-200"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * progress) / 100}
            className={`stroke-current ${isBreak ? 'text-green-500' : 'text-purple-500'}`}
            initial={false}
            animate={{
              strokeDashoffset: circumference - (circumference * progress) / 100
            }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-gray-800">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`p-3 rounded-full ${
            isRunning
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : `${isBreak ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`
          }`}
        >
          {isRunning ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>
        <button
          onClick={reset}
          className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      <p className="text-center mt-4 text-sm text-gray-600">
        {isBreak ? 'Time for a break!' : 'Stay focused on your task'}
      </p>
    </div>
  );
};