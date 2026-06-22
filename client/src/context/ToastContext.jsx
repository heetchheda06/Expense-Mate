import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Dynamic Toast Drawer */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              layout
              className="pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl glass-card border border-white/10 shadow-2xl relative overflow-hidden"
            >
              {/* Colored Glow Sidebar indicator */}
              <div 
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  toast.type === 'success' ? 'bg-emerald-500' :
                  toast.type === 'warning' ? 'bg-amber-500' :
                  toast.type === 'error' ? 'bg-rose-500' : 'bg-indigo-500'
                }`}
              />

              <div className="flex items-center gap-3 pl-1">
                {toast.type === 'success' && <CheckCircle className="text-emerald-500 w-5 h-5 flex-shrink-0" />}
                {toast.type === 'warning' && <AlertTriangle className="text-amber-500 w-5 h-5 flex-shrink-0" />}
                {toast.type === 'error' && <AlertCircle className="text-rose-500 w-5 h-5 flex-shrink-0" />}
                {toast.type === 'info' && <Info className="text-indigo-500 w-5 h-5 flex-shrink-0" />}

                <span className="text-sm font-medium text-slate-100">{toast.message}</span>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
