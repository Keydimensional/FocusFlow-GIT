import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, X, Wifi, WifiOff } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'success';
  duration?: number;
}

interface ToastNotificationProps {
  onToastHandler: (handler: (message: string, type: 'error' | 'warning' | 'success') => void) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ onToastHandler }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const addToast = (message: string, type: 'error' | 'warning' | 'success') => {
      const id = Date.now().toString();
      const duration = type === 'success' ? 3000 : type === 'warning' ? 5000 : 7000;
      
      const newToast: Toast = { id, message, type, duration };
      
      setToasts(prev => [...prev, newToast]);
      
      // Auto-remove toast after duration
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
    };

    onToastHandler(addToast);
  }, [onToastHandler]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
      default:
        return <WifiOff className="w-5 h-5 text-red-600" />;
    }
  };

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`p-4 rounded-lg border shadow-lg ${getToastStyles(toast.type)}`}
          >
            <div className="flex items-start gap-3">
              {getToastIcon(toast.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-relaxed">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};