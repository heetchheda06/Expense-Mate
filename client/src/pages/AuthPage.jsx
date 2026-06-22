import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthPage = () => {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Auto redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Sync mode with URL queries (e.g. ?mode=register)
  useEffect(() => {
    const mode = searchParams.get('mode');
    setIsRegister(mode === 'register');
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      return;
    }

    setLoading(true);
    let success = false;
    if (isRegister) {
      success = await register(name, email, password);
    } else {
      success = await login(email, password);
    }
    
    setLoading(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex items-center justify-center p-5 relative overflow-hidden">
      {/* Glow blobs */}
      <div className="glow-blob top-10 left-10 scale-125" />
      <div className="glow-blob -bottom-20 -right-20 scale-125" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass-card p-8 rounded-3xl relative z-10 shadow-2xl border border-white/10"
      >
        {/* Glowing border accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-t-3xl" />

        {/* Brand name */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase mb-4 tracking-wider shadow-glow">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Secure Core Authentication</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-slate-400 mt-2 font-medium">
            {isRegister ? 'Sign up to launch your ExpenseMate journey' : 'Sign in to access your ExpenseMate dashboard'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 pl-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Smith"
                  required
                  className="w-full glass-input pl-10 text-sm font-medium"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 pl-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@college.edu"
                required
                className="w-full glass-input pl-10 text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 pl-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full glass-input pl-10 pr-10 text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2 font-bold py-3 text-sm"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <span>{isRegister ? 'Sign Up' : 'Sign In'}</span>
            )}
          </button>
        </form>

        {/* Footer State toggle */}
        <div className="text-center mt-6 text-xs font-medium">
          <span className="text-slate-400">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          </span>
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setName('');
              setEmail('');
              setPassword('');
            }}
            className="text-indigo-400 hover:text-indigo-300 font-bold underline transition-colors"
          >
            {isRegister ? 'Sign In' : 'Register Here'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
