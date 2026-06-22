import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex items-center justify-center p-5 relative overflow-hidden">
      {/* Decorative glows */}
      <div className="glow-blob top-10 left-10 scale-125" />
      <div className="glow-blob -bottom-20 -right-20 scale-125" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card p-8 rounded-3xl text-center relative z-10 border border-white/10"
      >
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-6 shadow-glow">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <h1 className="text-6xl font-black bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent leading-none">
          404
        </h1>
        <h2 className="text-xl font-bold mt-4 text-slate-200">Requested page not found</h2>
        <p className="text-xs text-slate-400 font-semibold mt-2.5 leading-relaxed">
          The link you followed might be broken, or the page may have been removed. Let's get you back on track!
        </p>

        <Link
          to="/dashboard"
          className="btn-primary w-full flex items-center justify-center gap-2 mt-8 font-bold py-3 text-xs shadow-glow"
        >
          <Home className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
