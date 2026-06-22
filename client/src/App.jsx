import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';

// Import Layout & Page components
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ExpenseManager from './pages/ExpenseManager';
import IncomeTracker from './pages/IncomeTracker';
import SavingsGoals from './pages/SavingsGoals';
import OcrScanner from './pages/OcrScanner';
import AiCenter from './pages/AiCenter';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import TripSplitter from './pages/TripSplitter';
import AiChatBot from './components/AiChatBot';

import { AnimatePresence, motion } from 'framer-motion';

// Protected Route Guard helper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('expensemate_token');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B11] text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-400">Loading ExpenseMate...</span>
        </div>
      </div>
    );
  }

  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Route wrapper with page entry animations
const AnimatedPageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

// Master App Layout manager
const AppLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B11] text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-400">Loading ExpenseMate...</span>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col md:flex-row relative">
        <Sidebar />
        <main className="flex-grow min-h-[90vh] md:h-screen md:overflow-y-auto w-full">
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><AnimatedPageWrapper><Dashboard /></AnimatedPageWrapper></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><AnimatedPageWrapper><ExpenseManager /></AnimatedPageWrapper></ProtectedRoute>} />
            <Route path="/incomes" element={<ProtectedRoute><AnimatedPageWrapper><IncomeTracker /></AnimatedPageWrapper></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><AnimatedPageWrapper><SavingsGoals /></AnimatedPageWrapper></ProtectedRoute>} />
            <Route path="/scanner" element={<ProtectedRoute><AnimatedPageWrapper><OcrScanner /></AnimatedPageWrapper></ProtectedRoute>} />
            <Route path="/recommendations" element={<ProtectedRoute><AnimatedPageWrapper><AiCenter /></AnimatedPageWrapper></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AnimatedPageWrapper><Settings /></AnimatedPageWrapper></ProtectedRoute>} />
            <Route path="/trips" element={<ProtectedRoute><AnimatedPageWrapper><TripSplitter /></AnimatedPageWrapper></ProtectedRoute>} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <AiChatBot />
      </div>
    );
  }

  // Pure Unauthenticated Routes (Landing / Login / Register)
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ProfileProvider>
            <AppLayout />
          </ProfileProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
