import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check } from 'lucide-react';

interface ReminderPopupProps {
  title: string;
  onClose: () => void;
}

export const ReminderPopup: React.FC<ReminderPopupProps> = ({ title, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-4 right-4 bg-white rounded-xl shadow-xl p-6 max-w-sm w-full z-50 border-l-4 border-purple-500"
      >
        <div className="flex items-start gap-4">
          <motion.div 
            initial={{ rotate: -45 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="bg-purple-100 p-3 rounded-xl"
          >
            <Bell className="w-6 h-6 text-purple-600" />
          </motion.div>
          <div className="flex-grow">
            <h3 className="font-semibold text-gray-900 text-lg">Reminder!</h3>
            <p className="text-gray-600 mt-2">{title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
          >
            <Check className="w-4 h-4" />
            Complete
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};