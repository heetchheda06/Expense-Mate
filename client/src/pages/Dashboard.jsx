import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfiles } from '../context/ProfileContext';
import { CardSkeleton, ChartSkeleton } from '../components/Skeleton';
import { CategoryDoughnutChart, SpendingTrendChart } from '../charts/CustomCharts';
import api from '../services/api';
import { 
  ArrowUpRight, ArrowDownRight, Wallet, Target, Sparkles, AlertTriangle, 
  Scan, BrainCircuit, PlusCircle, Calendar, Infinity, Filter, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, DollarSign, Search, ArrowRight, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper utilities for date management
const getCurrentMonthKey = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const getPreviousMonthKey = (monthKey) => {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 2, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const getNextMonthKey = (monthKey) => {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const formatMonthLabel = (monthKey) => {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const Dashboard = () => {
  const { activeProfile, loading: profilesLoading } = useProfiles();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [goals, setGoals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Period / Month Selector State
  // mode: 'current' | 'previous' | 'custom' | 'lifetime'
  const [periodMode, setPeriodMode] = useState('current');
  const [selectedMonthKey, setSelectedMonthKey] = useState(getCurrentMonthKey());
  const [customMonthInput, setCustomMonthInput] = useState(getCurrentMonthKey());

  const currentMonthKey = useMemo(() => getCurrentMonthKey(), []);
  const previousMonthKey = useMemo(() => getPreviousMonthKey(currentMonthKey), [currentMonthKey]);

  // Determine active month key based on mode
  const activeMonthKey = useMemo(() => {
    if (periodMode === 'current') return currentMonthKey;
    if (periodMode === 'previous') return previousMonthKey;
    if (periodMode === 'custom') return customMonthInput;
    return null; // lifetime
  }, [periodMode, currentMonthKey, previousMonthKey, customMonthInput]);

  // Fetch financial records filtered by the selected period
  const fetchDashboardData = useCallback(async () => {
    if (!activeProfile) return;
    setLoading(true);
    try {
      let params = {};
      if (periodMode === 'lifetime') {
        params.range = 'lifetime';
      } else if (activeMonthKey) {
        params.month = activeMonthKey;
      }

      const [expRes, incRes, goalRes] = await Promise.all([
        api.get(`/profiles/${activeProfile._id}/expenses`, { params }),
        api.get(`/profiles/${activeProfile._id}/incomes`, { params }),
        api.get(`/profiles/${activeProfile._id}/goals`)
      ]);

      if (expRes.data.success) setExpenses(expRes.data.data);
      if (incRes.data.success) setIncomes(incRes.data.data);
      if (goalRes.data.success) setGoals(goalRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err.message);
    } finally {
      setLoading(false);
    }
  }, [activeProfile, periodMode, activeMonthKey]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle stepping backward/forward in months
  const handleStepMonth = (direction) => {
    const baseKey = activeMonthKey || currentMonthKey;
    const newKey = direction === 'prev' ? getPreviousMonthKey(baseKey) : getNextMonthKey(baseKey);
    setCustomMonthInput(newKey);
    setPeriodMode('custom');
  };

  // Filter local search for quick dashboard transaction table
  const filteredExpenses = useMemo(() => {
    if (!searchQuery) return expenses;
    return expenses.filter(e => 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [expenses, searchQuery]);

  if (profilesLoading) {
    return (
      <div className="p-6 flex flex-col gap-6 w-full max-w-7xl mx-auto">
        <div className="h-10 w-48 bg-white/10 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  // Handle case where user has NO profiles created yet
  if (!activeProfile) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[80vh] w-full max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-10 rounded-3xl text-center flex flex-col items-center max-w-lg border border-white/10 relative shadow-2xl"
        >
          <div className="glow-blob -top-20 -left-20 scale-50" />
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 shadow-glow">
            <Wallet className="w-8 h-8" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">Set Up Your First Profile</h2>
          <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">
            Welcome to ExpenseMate! To start tracking your expenses, incomes, and savings goals, create a budget profile first.
          </p>
          <button 
            onClick={() => navigate('/settings')}
            className="btn-primary text-sm font-semibold px-8 py-3 w-full sm:w-auto shadow-glow"
          >
            Create Profile Now
          </button>
        </motion.div>
      </div>
    );
  }

  // Compute metrics for selected period
  const totalSpentPeriod = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalIncomePeriod = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const netSavingsPeriod = totalIncomePeriod - totalSpentPeriod;
  
  const budget = activeProfile.monthlyBudget || 0;
  const budgetRatio = budget > 0 ? (totalSpentPeriod / budget) : 0;

  // Compile savings status
  const totalTargetSavings = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrentSavings = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const savingsProgressRatio = totalTargetSavings > 0 ? (totalCurrentSavings / totalTargetSavings) : 0;

  // Human-readable title of active scope
  const activeScopeName = periodMode === 'lifetime'
    ? 'Lifetime (All Time)'
    : formatMonthLabel(activeMonthKey);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto z-10 relative"
    >
      {/* Decorative background glows */}
      <div className="glow-blob top-10 right-10 scale-75" />
      <div className="glow-blob bottom-10 left-10 scale-75" />

      {/* 1. Header Welcome Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Profile: {activeProfile.name}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Financial Dashboard
          </h1>
        </div>
        
        {/* Action controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button 
            onClick={() => navigate('/scanner')}
            className="btn-glass text-xs font-semibold py-2 px-3.5 flex items-center gap-2 border border-white/5 hover:border-indigo-500/25 transition-all"
          >
            <Scan className="w-4 h-4 text-indigo-400" />
            <span>OCR Bill Scan</span>
          </button>
          <button 
            onClick={() => navigate('/recommendations')}
            className="btn-glass text-xs font-semibold py-2 px-3.5 flex items-center gap-2 border border-white/5 hover:border-cyan-500/25 transition-all"
          >
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
            <span>AI Advice</span>
          </button>
          <button 
            onClick={() => navigate('/expenses')}
            className="btn-primary text-xs font-semibold py-2.5 px-4 flex items-center gap-2 shadow-glow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* 2. PROMINENT DYNAMIC MONTH & PERIOD SELECTOR BAR */}
      <div className="glass-card p-4 rounded-3xl border border-white/10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-2xl bg-slate-900/60 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />

        {/* Left: Active Scope Indicator & Month Step Buttons */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0 shadow-glow">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Active Dashboard Scope
            </div>
            <div className="text-base font-extrabold text-white flex items-center gap-2 mt-0.5">
              <span>{activeScopeName}</span>
              {periodMode === 'current' && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Current Month
                </span>
              )}
            </div>
          </div>

          {/* Stepper controls */}
          <div className="flex items-center gap-1 ml-2 border-l border-white/10 pl-3">
            <button
              onClick={() => handleStepMonth('prev')}
              title="Previous Month"
              className="w-8 h-8 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-indigo-600 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleStepMonth('next')}
              title="Next Month"
              className="w-8 h-8 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-indigo-600 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Pill Tab Switches */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* This Month */}
          <button
            onClick={() => {
              setPeriodMode('current');
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 border ${
              periodMode === 'current'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-glow shadow-indigo-500/30 scale-105'
                : 'bg-slate-900/80 text-slate-400 border-white/5 hover:text-white hover:border-white/20'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>This Month ({formatMonthLabel(currentMonthKey).split(' ')[0]})</span>
          </button>

          {/* Last Month */}
          <button
            onClick={() => {
              setPeriodMode('previous');
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 border ${
              periodMode === 'previous'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-glow shadow-indigo-500/30 scale-105'
                : 'bg-slate-900/80 text-slate-400 border-white/5 hover:text-white hover:border-white/20'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Last Month ({formatMonthLabel(previousMonthKey).split(' ')[0]})</span>
          </button>

          {/* Custom Month Picker */}
          <div className="relative flex items-center">
            <button
              onClick={() => setPeriodMode('custom')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 border ${
                periodMode === 'custom'
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-glow shadow-indigo-500/30 scale-105'
                  : 'bg-slate-900/80 text-slate-400 border-white/5 hover:text-white hover:border-white/20'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Select Month</span>
            </button>
            <input
              type="month"
              value={customMonthInput}
              onChange={(e) => {
                setCustomMonthInput(e.target.value);
                setPeriodMode('custom');
              }}
              className="ml-2 glass-input text-xs py-1.5 px-3 font-bold rounded-2xl border border-indigo-500/40 text-slate-100 bg-slate-900"
            />
          </div>

          {/* Lifetime View */}
          <button
            onClick={() => setPeriodMode('lifetime')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 border ${
              periodMode === 'lifetime'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-glow shadow-indigo-500/30 scale-105'
                : 'bg-slate-900/80 text-slate-400 border-white/5 hover:text-white hover:border-white/20'
            }`}
          >
            <Infinity className="w-4 h-4" />
            <span>Lifetime</span>
          </button>
        </div>
      </div>

      {/* 3. New Month / Empty Period Reset Notification Card */}
      {expenses.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 flex-shrink-0 shadow-glow">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-100">
                Fresh Monthly Reset for {activeScopeName}
              </h3>
              <p className="text-xs font-medium text-slate-400 mt-1">
                No expense transactions logged for this selected cycle yet. Total spent is cleanly set to ₹0.00.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                setPeriodMode('previous');
              }}
              className="btn-glass text-xs font-bold py-2 px-4 border border-white/10"
            >
              View Last Month History
            </button>
            <button
              onClick={() => navigate('/expenses')}
              className="btn-primary text-xs font-bold py-2 px-4 shadow-glow flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add First Expense</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Budget Overdraft Warning Alerts */}
      {budget > 0 && budgetRatio >= 0.8 && periodMode !== 'lifetime' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex items-start gap-3.5 p-4 rounded-2xl border ${
            budgetRatio >= 1.0 
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' 
              : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
          }`}
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">
              {budgetRatio >= 1.0 ? 'Dangerous Budget Overdraft!' : 'Approaching Budget Limit Alert'}
            </h4>
            <p className="text-xs font-medium opacity-85 mt-1">
              {budgetRatio >= 1.0 
                ? `You have exceeded your monthly budget of ₹${budget} by ₹${(totalSpentPeriod - budget).toFixed(2)} (${Math.round(budgetRatio * 100)}% spent). Review non-essential purchases.`
                : `Caution: You have utilized ${Math.round(budgetRatio * 100)}% (₹${totalSpentPeriod.toFixed(2)}) of your ₹${budget} monthly budget limit.`}
            </p>
          </div>
        </motion.div>
      )}

      {/* 4. Dynamic KPI Cards Grid (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Expenses */}
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between border border-white/5 relative overflow-hidden group hover:border-rose-500/30 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              {periodMode === 'lifetime' ? 'Lifetime Expenses' : 'Month Expenses'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-white tracking-tight">₹{totalSpentPeriod.toFixed(2)}</h2>
            {budget > 0 && periodMode !== 'lifetime' ? (
              <div className="flex flex-col gap-1.5 mt-3">
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${Math.min(100, budgetRatio * 100)}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${budgetRatio >= 1.0 ? 'bg-rose-500' : budgetRatio >= 0.8 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                  <span>{Math.round(budgetRatio * 100)}% of monthly budget</span>
                  <span>Limit: ₹{budget}</span>
                </div>
              </div>
            ) : (
              <span className="text-[10px] font-semibold text-slate-500 mt-3 block">
                {periodMode === 'lifetime' ? 'Sum of all historical transactions' : 'No budget set for profile'}
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Income */}
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              {periodMode === 'lifetime' ? 'Lifetime Income' : 'Month Income'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-white tracking-tight">₹{totalIncomePeriod.toFixed(2)}</h2>
            <p className="text-[10px] font-semibold text-slate-500 mt-3">
              Salary, investments & other earnings
            </p>
          </div>
        </div>

        {/* Card 3: Net Cashflow */}
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between border border-white/5 relative overflow-hidden group hover:border-indigo-500/30 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Net Cashflow</span>
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-transform ${
              netSavingsPeriod >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              {netSavingsPeriod >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-4">
            <h2 className={`text-3xl font-black tracking-tight ${netSavingsPeriod >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netSavingsPeriod >= 0 ? '+' : ''}₹{netSavingsPeriod.toFixed(2)}
            </h2>
            <p className="text-[10px] font-semibold text-slate-500 mt-3">
              Income minus expenses in period
            </p>
          </div>
        </div>

        {/* Card 4: Savings Progress */}
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between border border-white/5 relative overflow-hidden group hover:border-cyan-500/30 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Goal Savings</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-white tracking-tight">₹{totalCurrentSavings.toFixed(2)}</h2>
            {totalTargetSavings > 0 ? (
              <div className="flex flex-col gap-1.5 mt-3">
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${Math.min(100, savingsProgressRatio * 100)}%` }}
                    className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                  <span>{Math.round(savingsProgressRatio * 100)}% target achieved</span>
                  <span>Target: ₹{totalTargetSavings}</span>
                </div>
              </div>
            ) : (
              <span className="text-[10px] font-semibold text-slate-500 mt-3 block">No active goals configured</span>
            )}
          </div>
        </div>
      </div>

      {/* 5. Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doughnut Chart */}
        <div className="glass-card p-6 rounded-3xl flex flex-col gap-4 border border-white/5 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Category Distribution</span>
            </h3>
            <span className="text-[10px] font-extrabold text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              {activeScopeName}
            </span>
          </div>
          {loading ? (
            <div className="h-64 bg-white/5 animate-pulse rounded-2xl" />
          ) : expenses.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs font-semibold gap-2 border border-dashed border-white/5 rounded-2xl">
              <Calendar className="w-8 h-8 text-slate-600 opacity-50" />
              <span>No expense records logged for {activeScopeName}</span>
            </div>
          ) : (
            <CategoryDoughnutChart expenses={expenses} />
          )}
        </div>

        {/* Line Chart */}
        <div className="glass-card p-6 rounded-3xl flex flex-col gap-4 border border-white/5 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Spending Trend</span>
            </h3>
            <span className="text-[10px] font-extrabold text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              {activeScopeName}
            </span>
          </div>
          {loading ? (
            <div className="h-64 bg-white/5 animate-pulse rounded-2xl" />
          ) : expenses.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs font-semibold gap-2 border border-dashed border-white/5 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-slate-600 opacity-50" />
              <span>No trend line available for {activeScopeName}</span>
            </div>
          ) : (
            <SpendingTrendChart expenses={expenses} />
          )}
        </div>
      </div>

      {/* 6. Dynamic Transactions Feed & Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Table (2/3 width) */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 lg:col-span-2 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  Transactions ({activeScopeName})
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  Showing {filteredExpenses.length} transaction entries
                </p>
              </div>

              {/* Local Search input */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search title/category..."
                    className="glass-input pl-8 text-xs py-1.5 w-36 sm:w-48 rounded-xl"
                  />
                </div>
                <button 
                  onClick={() => navigate('/expenses')}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>See All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col gap-2">
                <div className="h-12 bg-white/5 animate-pulse rounded-xl" />
                <div className="h-12 bg-white/5 animate-pulse rounded-xl" />
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center py-10 text-xs font-semibold text-slate-500 border border-dashed border-white/5 rounded-2xl">
                No matching transactions recorded for {activeScopeName}.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {filteredExpenses.slice(0, 5).map((exp) => (
                  <div key={exp._id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-300">
                        {exp.category}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200 line-clamp-1">{exp.title}</h4>
                        <p className="text-[10px] text-slate-500 font-semibold">{new Date(exp.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-rose-400">-₹{exp.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/5 mt-5 pt-3 flex justify-between items-center text-[10px] font-bold text-slate-400">
            <span>Total Logged in Scope: ₹{totalSpentPeriod.toFixed(2)}</span>
            <button
              onClick={() => navigate('/expenses')}
              className="text-indigo-400 hover:underline"
            >
              Open Full Expense Manager →
            </button>
          </div>
        </div>

        {/* Quick Tips & Active Profile Details (1/3 width) */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase mb-3">
              <BrainCircuit className="w-4 h-4" />
              <span>Smart Financial Insight</span>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-xs font-medium text-slate-300 leading-relaxed shadow-inner">
              "Switching between monthly scopes and Lifetime views gives you an instant radar on spending trends. Monitor your month-over-month cashflow to optimize your long-term savings goals!"
            </div>
          </div>

          <div className="border-t border-white/5 mt-6 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div 
                style={{ backgroundColor: activeProfile.color }}
                className="w-4 h-4 rounded-full shadow-glow"
              />
              <div>
                <div className="text-xs font-extrabold text-slate-200">{activeProfile.name}</div>
                <div className="text-[10px] font-semibold text-slate-500">
                  Budget: {activeProfile.monthlyBudget ? `₹${activeProfile.monthlyBudget}` : 'No Limit'}
                </div>
              </div>
            </div>
            <button 
              onClick={() => navigate('/settings')}
              className="text-[10px] uppercase font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20"
            >
              Configure
            </button>
          </div>
        </div>
      </div>

    </motion.div>
  );
};

export default Dashboard;
