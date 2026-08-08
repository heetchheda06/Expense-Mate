import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfiles } from '../context/ProfileContext';
import { CardSkeleton, ChartSkeleton } from '../components/Skeleton';
import { CategoryDoughnutChart, SpendingTrendChart } from '../charts/CustomCharts';
import api from '../services/api';
import { 
  ArrowUpRight, ArrowDownRight, Wallet, Target, Sparkles, AlertTriangle, 
  Scan, BrainCircuit, PlusCircle, Calendar, Infinity, Filter, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

const getCurrentMonthString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const formatMonthLabel = (monthStr) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
};

const Dashboard = () => {
  const { activeProfile, loading: profilesLoading } = useProfiles();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [goals, setGoals] = useState([]);

  // Period / Month Selector State
  // mode: 'current' | 'custom' | 'lifetime'
  const [periodMode, setPeriodMode] = useState('current');
  const [customMonth, setCustomMonth] = useState(getCurrentMonthString());

  // Fetch financial records filtered by the selected period
  const fetchDashboardData = useCallback(async () => {
    if (!activeProfile) return;
    setLoading(true);
    try {
      let params = {};
      if (periodMode === 'current') {
        params.month = getCurrentMonthString();
      } else if (periodMode === 'custom') {
        params.month = customMonth;
      } else if (periodMode === 'lifetime') {
        params.range = 'lifetime';
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
  }, [activeProfile, periodMode, customMonth]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (profilesLoading) {
    return (
      <div className="p-6 flex flex-col gap-6 w-full max-w-7xl mx-auto">
        <div className="h-10 w-48 bg-white/10 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
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
          className="glass-card p-10 rounded-3xl text-center flex flex-col items-center max-w-lg border border-white/10 relative"
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
  
  const budget = activeProfile.monthlyBudget || 0;
  const budgetRatio = budget > 0 ? (totalSpentPeriod / budget) : 0;

  // Compile savings status
  const totalTargetSavings = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrentSavings = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const savingsProgressRatio = totalTargetSavings > 0 ? (totalCurrentSavings / totalTargetSavings) : 0;

  // Label for active period scope
  const activePeriodTitle = periodMode === 'current'
    ? `Current Month (${formatMonthLabel(getCurrentMonthString())})`
    : periodMode === 'custom'
    ? formatMonthLabel(customMonth)
    : 'Lifetime / All Time';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto z-10 relative"
    >
      {/* Decorative glows */}
      <div className="glow-blob top-10 right-10 scale-75" />

      {/* Header welcome banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Profile Tracker Active</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Financial Dashboard
          </h1>
        </div>
        
        {/* Quick action buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button 
            onClick={() => navigate('/scanner')}
            className="btn-glass text-xs font-semibold py-2 px-3 flex items-center gap-2 border border-white/5 hover:border-indigo-500/25"
          >
            <Scan className="w-4 h-4 text-indigo-400" />
            <span>OCR Bill Scan</span>
          </button>
          <button 
            onClick={() => navigate('/recommendations')}
            className="btn-glass text-xs font-semibold py-2 px-3 flex items-center gap-2 border border-white/5 hover:border-cyan-500/25"
          >
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
            <span>AI Advice</span>
          </button>
          <button 
            onClick={() => navigate('/expenses')}
            className="btn-primary text-xs font-semibold py-2.5 px-4 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Job 1: Month / Period Filter Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span>Dashboard Scope:</span>
          <span className="text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
            {activePeriodTitle}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* Current Month Button */}
          <button
            onClick={() => setPeriodMode('current')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              periodMode === 'current'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-glow shadow-indigo-500/30'
                : 'bg-slate-900/50 text-slate-400 border-white/5 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Current Month</span>
          </button>

          {/* Select Specific Month Picker */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPeriodMode('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                periodMode === 'custom'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-glow shadow-indigo-500/30'
                  : 'bg-slate-900/50 text-slate-400 border-white/5 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Select Month</span>
            </button>
            {periodMode === 'custom' && (
              <input
                type="month"
                value={customMonth}
                onChange={(e) => {
                  setCustomMonth(e.target.value);
                  setPeriodMode('custom');
                }}
                className="glass-input text-xs py-1 px-2.5 font-bold rounded-xl border border-indigo-500/40 text-slate-100 bg-slate-900/90"
              />
            )}
          </div>

          {/* Lifetime View Button */}
          <button
            onClick={() => setPeriodMode('lifetime')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              periodMode === 'lifetime'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-glow shadow-indigo-500/30'
                : 'bg-slate-900/50 text-slate-400 border-white/5 hover:text-slate-200'
            }`}
          >
            <Infinity className="w-3.5 h-3.5" />
            <span>Lifetime</span>
          </button>
        </div>
      </div>

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

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Month / Selected Period Spending Card */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-36 border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {periodMode === 'lifetime' ? 'Lifetime Expenses' : 'Month Expenses'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <h2 className="text-2xl font-black">₹{totalSpentPeriod.toFixed(2)}</h2>
            {budget > 0 && periodMode !== 'lifetime' ? (
              <div className="flex flex-col gap-1 mt-2">
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${Math.min(100, budgetRatio * 100)}%` }}
                    className={`h-full rounded-full ${budgetRatio >= 1.0 ? 'bg-rose-500' : budgetRatio >= 0.8 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-semibold text-slate-500">
                  <span>{Math.round(budgetRatio * 100)}% of monthly budget</span>
                  <span>Limit: ₹{budget}</span>
                </div>
              </div>
            ) : (
              <span className="text-[10px] font-semibold text-slate-500 mt-2 block">
                {periodMode === 'lifetime' ? 'Total spent across all records' : 'No budget limit active'}
              </span>
            )}
          </div>
        </div>

        {/* Total Incomes Card */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-36 border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {periodMode === 'lifetime' ? 'Lifetime Income' : 'Month Income'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <h2 className="text-2xl font-black">₹{totalIncomePeriod.toFixed(2)}</h2>
            <p className="text-[10px] font-semibold text-slate-500 mt-2">
              {periodMode === 'lifetime' ? 'Cumulative income recorded' : 'Income earned in selected period'}
            </p>
          </div>
        </div>

        {/* Savings Goals progress summary Card */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-36 border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saved Balance</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <h2 className="text-2xl font-black">₹{totalCurrentSavings.toFixed(2)}</h2>
            {totalTargetSavings > 0 ? (
              <div className="flex flex-col gap-1 mt-2">
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${Math.min(100, savingsProgressRatio * 100)}%` }}
                    className="h-full rounded-full bg-cyan-500"
                  />
                </div>
                <div className="flex justify-between text-[9px] font-semibold text-slate-500">
                  <span>{Math.round(savingsProgressRatio * 100)}% target achieved</span>
                  <span>Target: ₹{totalTargetSavings}</span>
                </div>
              </div>
            ) : (
              <span className="text-[10px] font-semibold text-slate-500 mt-2 block">No active goals configured</span>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doughnut Chart */}
        <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 border border-white/5">
          <h3 className="text-sm font-bold text-slate-300">Category Spending Distribution</h3>
          {loading ? (
            <div className="h-60 bg-white/5 animate-pulse rounded-xl" />
          ) : expenses.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-slate-500 text-xs font-semibold">
              No expense records found for {activePeriodTitle}.
            </div>
          ) : (
            <CategoryDoughnutChart expenses={expenses} />
          )}
        </div>

        {/* Line Chart */}
        <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 border border-white/5">
          <h3 className="text-sm font-bold text-slate-300">Spending Trend ({activePeriodTitle})</h3>
          {loading ? (
            <div className="h-60 bg-white/5 animate-pulse rounded-xl" />
          ) : expenses.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-slate-500 text-xs font-semibold">
              No trend data available for {activePeriodTitle}.
            </div>
          ) : (
            <SpendingTrendChart expenses={expenses} />
          )}
        </div>
      </div>

      {/* Recent Activity Table and Quick Info panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity feed (2/3 width) */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-300">
              Transactions ({activePeriodTitle})
            </h3>
            <button 
              onClick={() => navigate('/expenses')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              See All
            </button>
          </div>
          {loading ? (
            <div className="flex flex-col gap-2">
              <div className="h-10 bg-white/5 animate-pulse rounded" />
              <div className="h-10 bg-white/5 animate-pulse rounded" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8 text-xs font-semibold text-slate-500">
              No transactions recorded for {activePeriodTitle}. Add an expense or scan a receipt!
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {expenses.slice(0, 5).map((exp) => (
                <div key={exp._id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-300">
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

        {/* Quick Tips and Active Profile details (1/3 width) */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-300 mb-4">Financial Insight</h3>
            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs font-medium text-slate-300 leading-relaxed">
              "Selecting custom months or Lifetime view allows you to compare seasonal spending habits and evaluate your true long-term budget efficiency!"
            </div>
          </div>
          <div className="border-t border-white/5 mt-4 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                style={{ backgroundColor: activeProfile.color }}
                className="w-3.5 h-3.5 rounded-full"
              />
              <span className="text-xs font-bold text-slate-400">Active: {activeProfile.name}</span>
            </div>
            <button 
              onClick={() => navigate('/settings')}
              className="text-[10px] uppercase font-bold text-slate-500 hover:text-indigo-400 transition-colors"
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
