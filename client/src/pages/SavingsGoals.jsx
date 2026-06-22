import React, { useState, useEffect, useCallback } from 'react';
import { useProfiles } from '../context/ProfileContext';
import { useToast } from '../context/ToastContext';
import { CardSkeleton } from '../components/Skeleton';
import api from '../services/api';
import { Plus, Trash2, Calendar, Target, Award, PlusCircle, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SavingsGoals = () => {
  const { activeProfile } = useProfiles();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState([]);

  // Goal Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState('#10B981'); // Default Green

  // Top Up Modal States
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpGoal, setTopUpGoal] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState('');

  const fetchGoals = useCallback(async () => {
    if (!activeProfile) return;
    setLoading(true);
    try {
      const res = await api.get(`/profiles/${activeProfile._id}/goals`);
      if (res.data.success) {
        setGoals(res.data.data);
      }
    } catch (err) {
      showToast('Failed to fetch savings targets', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeProfile, showToast]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !targetAmount || !deadline) {
      showToast('Name, target, and deadline are required', 'warning');
      return;
    }

    try {
      const res = await api.post(`/profiles/${activeProfile._id}/goals`, {
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount || 0),
        deadline,
        color
      });
      if (res.data.success) {
        showToast(`Goal "${name}" added successfully!`, 'success');
        setGoals(prev => [...prev, res.data.data]);
        closeModal();
      }
    } catch (err) {
      showToast('Failed to add savings goal', 'error');
    }
  };

  const handleTopUpSubmit = async (e) => {
    e.preventDefault();
    if (!topUpAmount || !topUpGoal) return;

    const newAmount = topUpGoal.currentAmount + parseFloat(topUpAmount);
    if (newAmount > topUpGoal.targetAmount) {
      showToast('Saved progress cannot exceed target amount!', 'warning');
      return;
    }

    try {
      const res = await api.patch(`/profiles/${activeProfile._id}/goals/${topUpGoal._id}`, {
        currentAmount: newAmount
      });
      if (res.data.success) {
        showToast(`Added ₹${topUpAmount} savings to "${topUpGoal.name}"!`, 'success');
        setGoals(prev => prev.map(g => g._id === topUpGoal._id ? res.data.data : g));
        closeTopUp();
      }
    } catch (err) {
      showToast('Top up failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this savings goal?')) return;
    try {
      const res = await api.delete(`/profiles/${activeProfile._id}/goals/${id}`);
      if (res.data.success) {
        showToast('Savings goal deleted successfully', 'success');
        setGoals(prev => prev.filter(g => g._id !== id));
      }
    } catch (err) {
      showToast('Deletion failed', 'error');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setDeadline('');
    setColor('#10B981');
  };

  const closeTopUp = () => {
    setShowTopUp(false);
    setTopUpGoal(null);
    setTopUpAmount('');
  };

  // Color options for Goal Cards
  const colors = [
    { value: '#10B981', name: 'Green' },
    { value: '#4F46E5', name: 'Indigo' },
    { value: '#06B6D4', name: 'Cyan' },
    { value: '#EC4899', name: 'Pink' },
    { value: '#F59E0B', name: 'Amber' }
  ];

  if (!activeProfile) {
    return (
      <div className="p-6 text-center text-slate-400 font-semibold max-w-lg mx-auto">
        Please configure a budget profile in settings first!
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto z-10 relative">
      <div className="glow-blob top-10 right-10 scale-75" />

      {/* Header controls banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Savings Goals</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">Set, track, and complete your financial milestones</p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary text-xs font-semibold py-2.5 px-4 flex items-center gap-2 shadow-glow self-start sm:self-auto"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Goals Display Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : goals.length === 0 ? (
        <div className="glass-card p-10 rounded-2xl text-center py-16 text-xs font-semibold text-slate-500 max-w-xl mx-auto border border-white/5 w-full">
          No active savings targets configured. Start a goal today (e.g. Vacation Trip, New Laptop fund)!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const ratio = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) : 0;
            const percentage = Math.round(ratio * 100);
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

            // Compute remaining days to target date
            const today = new Date();
            const deadlineDate = new Date(goal.deadline);
            const diffTime = deadlineDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return (
              <motion.div 
                key={goal._id} 
                layout
                className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-64 relative overflow-hidden"
              >
                {/* Header indicators */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span 
                      style={{ color: goal.color, backgroundColor: `${goal.color}15`, borderColor: `${goal.color}30` }}
                      className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border"
                    >
                      {percentage === 100 ? 'Completed 🎉' : `${percentage}% Saved`}
                    </span>
                    <button 
                      onClick={() => handleDelete(goal._id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-lg font-black text-slate-100 line-clamp-1">{goal.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-slate-100">₹{goal.currentAmount.toFixed(2)}</span>
                    <span className="text-xs text-slate-400 font-semibold">/ ₹{goal.targetAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="my-4">
                  <div className="w-full h-2.5 bg-slate-900/60 rounded-full border border-white/5 overflow-hidden">
                    <div 
                      style={{ width: `${Math.min(100, percentage)}%`, backgroundColor: goal.color }}
                      className="h-full rounded-full"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                    <span>
                      {diffDays > 0 ? `${diffDays} days left` : diffDays === 0 ? 'Due today' : 'Overdue'}
                    </span>
                  </div>
                </div>

                {/* Top Up launcher */}
                <div className="flex gap-2">
                  {percentage < 100 ? (
                    <button
                      onClick={() => { setTopUpGoal(goal); setShowTopUp(true); }}
                      className="btn-glass text-[11px] font-bold py-2 w-full flex items-center justify-center gap-1.5 border border-white/5"
                    >
                      <Coins className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Add Progress</span>
                    </button>
                  ) : (
                    <div className="w-full py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center font-bold text-[11px] flex items-center justify-center gap-1.5">
                      <Award className="w-4 h-4" />
                      <span>Goal Achieved!</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Goal creation modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center p-5 z-[999] overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md glass-card p-6 md:p-8 rounded-3xl relative z-10"
            >
              <h2 className="text-2xl font-black mb-6">New Savings Goal</h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Goal Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vacation Flight"
                    required
                    className="glass-input text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Target */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">Target Goal (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      placeholder="600.00"
                      required
                      className="glass-input text-sm"
                    />
                  </div>
                  {/* Initial savings */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">Current Savings (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(e.target.value)}
                      placeholder="e.g. 50.00"
                      className="glass-input text-sm"
                    />
                  </div>
                </div>

                {/* Deadline */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Target Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                    className="glass-input text-sm"
                  />
                </div>

                {/* Theme Color selectors */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Milestone theme color</label>
                  <div className="flex gap-2">
                    {colors.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColor(c.value)}
                        style={{ backgroundColor: c.value }}
                        className={`w-7 h-7 rounded-full transition-transform ${
                          color === c.value ? 'scale-110 border-2 border-white ring-2 ring-indigo-500' : 'opacity-70 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 justify-end mt-4">
                  <button 
                    type="button" 
                    onClick={closeModal} 
                    className="btn-glass text-xs font-semibold py-2.5 px-4"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary text-xs font-semibold py-2.5 px-6 shadow-glow"
                  >
                    Create Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top up modal */}
      <AnimatePresence>
        {showTopUp && topUpGoal && (
          <div className="fixed inset-0 flex items-center justify-center p-5 z-[999] overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeTopUp}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm glass-card p-6 md:p-8 rounded-3xl relative z-10"
            >
              <h2 className="text-xl font-black mb-4">Add Savings Progress</h2>
              <p className="text-xs text-slate-400 font-semibold mb-6">
                Goal: <span className="text-slate-200">"{topUpGoal.name}"</span> | Remaining: <span className="text-indigo-400">₹{(topUpGoal.targetAmount - topUpGoal.currentAmount).toFixed(2)}</span>
              </p>

              <form onSubmit={handleTopUpSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Amount Saved (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="25.00"
                    required
                    autoFocus
                    className="glass-input text-sm"
                  />
                </div>

                <div className="flex items-center gap-3 justify-end mt-2">
                  <button 
                    type="button" 
                    onClick={closeTopUp} 
                    className="btn-glass text-xs font-semibold py-2.5 px-4"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary text-xs font-semibold py-2.5 px-6 shadow-glow"
                  >
                    Add Savings
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SavingsGoals;
