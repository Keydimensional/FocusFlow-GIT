import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, CheckCircle } from 'lucide-react';

interface ReloadPromptBannerProps {
  onConfirm: () => void;
}

const ReloadPromptBanner: React.FC<ReloadPromptBannerProps> = ({ onConfirm }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25,
          duration: 0.4
        }}
        className="fixed inset-0 flex items-center justify-center z-[100] p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white border-2 border-green-200 rounded-2xl px-8 py-6 shadow-2xl w-full max-w-md"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(34, 197, 94, 0.1)'
          }}
        >
          <div className="flex flex-col items-center text-center gap-4">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>
            
            <div>
              <motion.h3 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-bold text-gray-900 text-xl mb-2"
              >
                Signed Out Successfully! ✨
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 text-base"
              >
                Please refresh to complete the process
              </motion.p>
            </div>
            
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onConfirm}
              className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 text-base font-semibold shadow-lg w-full justify-center"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh Now
            </motion.button>
          </div>
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400/5 to-purple-400/5 pointer-events-none" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReloadPromptBanner;