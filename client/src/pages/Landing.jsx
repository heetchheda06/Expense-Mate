import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, ScanBarcode, Target, BrainCircuit, ShieldAlert, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Decorative Gradient Glow Blobs */}
      <div className="glow-blob top-10 left-10 scale-125" />
      <div className="glow-blob -bottom-20 -right-20 scale-125" />

      {/* Floating Header */}
      <nav className="w-full flex items-center justify-between px-6 md:px-16 py-5 border-b border-white/5 z-20 bg-slate-950/30 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            ExpenseMate
          </span>
          <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            v1.0
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/login?mode=register" className="btn-primary text-xs py-2 px-4 shadow-glow">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-6 py-20 z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-glow"
        >
          <Sparkles className="w-4.5 h-4.5" />
          <span>Smart AI-Powered Budget & Expense Tracker</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-7xl font-extrabold tracking-tight leading-none mb-6"
        >
          Take Control of Your <br className="hidden md:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Personal Finances
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-base md:text-lg text-slate-400 max-w-2xl mb-10 font-medium"
        >
          Track spending, manage multiple budget profiles, scan receipts with OCR, set custom savings goals, and unlock AI-powered budget recommendations tailored to your lifestyle.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link to="/login?mode=register" className="btn-primary text-sm py-3 px-8 flex items-center justify-center gap-2 group shadow-lg">
            <span>Start Tracking Now</span>
            <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/login" className="btn-glass text-sm py-3 px-8 flex items-center justify-center">
            View Live Demo
          </Link>
        </motion.div>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-24 text-left">
          <div className="glass-card glass-card-hover p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-4 text-indigo-400">
              <ScanBarcode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">OCR Bill Scanner</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              Upload grocery or dining receipt photos and let our client-side Tesseract scanner automatically fill in your expense entries in seconds.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 mb-4 text-cyan-400">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">AI Rec Center</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              Get personalized saving blueprints and budgeting audits. Works offline with dynamic heuristics, or online using OpenAI.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-4 text-emerald-400">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Savings Blueprint</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              Define target goals (e.g., Summer Trip or New Tech) and visualize completion statuses with intuitive, glowing trackers.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 border-t border-white/5 z-10 bg-slate-950/20 text-xs text-slate-500 font-medium">
        &copy; {new Date().getFullYear()} ExpenseMate Platform. All rights reserved. Deployed Securely.
      </footer>
    </div>
  );
};

export default Landing;
