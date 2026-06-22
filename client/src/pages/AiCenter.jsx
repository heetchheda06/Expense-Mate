import React, { useState, useEffect, useCallback } from 'react';
import { useProfiles } from '../context/ProfileContext';
import { useToast } from '../context/ToastContext';
import { CardSkeleton } from '../components/Skeleton';
import api from '../services/api';
import { BrainCircuit, Sparkles, TrendingUp, Target, AlertTriangle, Lightbulb, ShieldAlert, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const AiCenter = () => {
  const { activeProfile } = useProfiles();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const fetchRecommendations = useCallback(async () => {
    if (!activeProfile) return;
    setLoading(true);
    try {
      const res = await api.get(`/profiles/${activeProfile._id}/ai-recommendations`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      showToast('Failed to load AI recommendations', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeProfile, showToast]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  if (!activeProfile) {
    return (
      <div className="p-6 text-center text-slate-400 font-semibold max-w-lg mx-auto">
        Please configure a budget profile in settings first!
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 w-full max-w-4xl mx-auto z-10 relative">
      <div className="glow-blob top-10 right-10 scale-75" />

      {/* Header controls banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Smart Advisory Center</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">AI Recommendation Center</h1>
        </div>

        <button 
          onClick={fetchRecommendations}
          disabled={loading}
          className="btn-glass text-xs font-semibold py-2 px-4 border border-white/5 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Re-Analyze Finances'}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : !data ? (
        <div className="text-center py-16 text-xs font-semibold text-slate-500">
          Click "Re-Analyze Finances" to query the AI recommendations engine.
        </div>
      ) : (
        <div className="flex flex-col gap-6 mt-4">
          
          {/* Engine Source Badge */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-indigo-500/20 text-xs font-semibold self-start text-indigo-300">
            <Cpu className="w-4.5 h-4.5" />
            <span>Engine source: <span className="font-bold text-slate-200">{data.source}</span></span>
          </div>

          {/* 1. Monthly Budget Status card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-200">Budget Threshold Summary</h3>
            </div>
            
            <p className="text-sm text-slate-300 leading-relaxed font-medium mb-6">
              {data.budget.summary}
            </p>

            {data.budget.limit > 0 && (
              <div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                  <div 
                    style={{ width: `${Math.min(100, data.budget.ratio * 100)}%` }}
                    className={`h-full rounded-full ${
                      data.budget.alert === 'danger' ? 'bg-rose-500' :
                      data.budget.alert === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-2.5">
                  <span>Spent: ₹{data.budget.spent.toFixed(2)}</span>
                  <span>Limit: ₹{data.budget.limit.toFixed(2)}</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* 2. Top Spending Category deep advice card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 md:p-8 rounded-3xl border border-white/5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-200">Category Cost-Cutting Audit</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              {data.categoryAnalysis.advice}
            </p>
          </motion.div>

          {/* 3. Savings Goals Blueprint advice */}
          {data.savingsAnalysis && data.savingsAnalysis.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 md:p-8 rounded-3xl border border-white/5"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-200">Goal Savings Projections</h3>
              </div>
              <div className="flex flex-col gap-3">
                {data.savingsAnalysis.map((g, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{g.name}</h4>
                      <p className="text-xs text-slate-200 font-medium leading-relaxed">{g.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 4. Actionable Bullet Tips list */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-6 md:p-8 rounded-3xl border border-white/5"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-200">Personal Savings Blueprint Tips</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.recommendations.map((tip, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-300 font-bold flex items-center justify-center text-xs flex-shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed mt-0.5">{tip}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      )}
    </div>
  );
};

export default AiCenter;
