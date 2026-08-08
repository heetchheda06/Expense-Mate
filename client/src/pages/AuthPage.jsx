import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, Loader, KeyRound, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthPage = () => {
  const { login, register, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // mode can be 'login' | 'register' | 'forgot'
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Auto redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Sync mode with URL queries (e.g. ?mode=register)
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setAuthMode('register');
    } else {
      setAuthMode('login');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (authMode === 'forgot') {
      if (!email || !password) {
        showToast('Please provide your email and new password', 'warning');
        return;
      }
      if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'warning');
        return;
      }
      if (password !== confirmPassword) {
        showToast('Passwords do not match', 'warning');
        return;
      }

      setLoading(true);
      try {
        const res = await api.post('/auth/forgot-password', { email, newPassword: password });
        if (res.data.success) {
          showToast(res.data.message || 'Password reset successfully!', 'success');
          setAuthMode('login');
          setPassword('');
          setConfirmPassword('');
        }
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to reset password', 'error');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email || !password || (authMode === 'register' && !name)) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    setLoading(true);
    let success = false;
    if (authMode === 'register') {
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
            {authMode === 'register' ? 'Create Account' : authMode === 'forgot' ? 'Reset Password' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-slate-400 mt-2 font-medium">
            {authMode === 'register' 
              ? 'Sign up to launch your ExpenseMate journey' 
              : authMode === 'forgot'
              ? 'Enter your email and set a new password for your account'
              : 'Sign in to access your ExpenseMate dashboard'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {authMode === 'register' && (
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
            <div className="flex justify-between items-center pr-1">
              <label className="text-xs font-semibold text-slate-300 pl-1">
                {authMode === 'forgot' ? 'New Password' : 'Password'}
              </label>
              {authMode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('forgot');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot Password?
                </button>
              )}
            </div>
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

          {authMode === 'forgot' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 pl-1">Confirm New Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full glass-input pl-10 pr-10 text-sm font-medium"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2 font-bold py-3 text-sm"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <span>
                {authMode === 'register' 
                  ? 'Sign Up' 
                  : authMode === 'forgot'
                  ? 'Reset & Update Password'
                  : 'Sign In'}
              </span>
            )}
          </button>
        </form>

        {/* Footer State toggle */}
        <div className="text-center mt-6 text-xs font-medium">
          {authMode === 'forgot' ? (
            <button
              onClick={() => setAuthMode('login')}
              className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </button>
          ) : (
            <>
              <span className="text-slate-400">
                {authMode === 'register' ? 'Already have an account? ' : "Don't have an account? "}
              </span>
              <button
                onClick={() => {
                  setAuthMode(authMode === 'register' ? 'login' : 'register');
                  setName('');
                  setEmail('');
                  setPassword('');
                }}
                className="text-indigo-400 hover:text-indigo-300 font-bold underline transition-colors"
              >
                {authMode === 'register' ? 'Sign In' : 'Register Here'}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
