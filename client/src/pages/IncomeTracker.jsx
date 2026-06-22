import React, { useState, useEffect, useCallback } from 'react';
import { useProfiles } from '../context/ProfileContext';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';
import api from '../services/api';
import { Plus, Trash2, ArrowUpRight, DollarSign, Calendar, Landmark, Briefcase, Gift, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const IncomeTracker = () => {
  const { activeProfile } = useProfiles();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [incomes, setIncomes] = useState([]);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const fetchIncomes = useCallback(async () => {
    if (!activeProfile) return;
    setLoading(true);
    try {
      const res = await api.get(`/profiles/${activeProfile._id}/incomes`);
      if (res.data.success) {
        setIncomes(res.data.data);
      }
    } catch (err) {
      showToast('Failed to fetch incomes', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeProfile, showToast]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!source || !amount) {
      showToast('Source and amount are required', 'warning');
      return;
    }

    try {
      const res = await api.post(`/profiles/${activeProfile._id}/incomes`, {
        source,
        amount: parseFloat(amount),
        date,
        notes
      });
      if (res.data.success) {
        showToast('Income logged successfully!', 'success');
        setIncomes(prev => [res.data.data, ...prev]);
        closeModal();
      }
    } catch (err) {
      showToast('Failed to add income', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this income record?')) return;
    try {
      const res = await api.delete(`/profiles/${activeProfile._id}/incomes/${id}`);
      if (res.data.success) {
        showToast('Income entry deleted', 'success');
        setIncomes(prev => prev.filter(inc => inc._id !== id));
      }
    } catch (err) {
      showToast('Deletion failed', 'error');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSource('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  // Safe icon helper based on source name keywords
  const getSourceIcon = (src) => {
    const s = src.toLowerCase();
    if (s.includes('job') || s.includes('work') || s.includes('salary') || s.includes('wage')) {
      return <Briefcase className="w-5 h-5 text-indigo-400" />;
    }
    if (s.includes('parent') || s.includes('allowance') || s.includes('family')) {
      return <Landmark className="w-5 h-5 text-cyan-400" />;
    }
    if (s.includes('scholarship') || s.includes('grant') || s.includes('award')) {
      return <Gift className="w-5 h-5 text-emerald-400" />;
    }
    return <Layers className="w-5 h-5 text-slate-400" />;
  };

  if (!activeProfile) {
    return (
      <div className="p-6 text-center text-slate-400 font-semibold max-w-lg mx-auto">
        Please configure a budget profile in settings first!
      </div>
    );
  }

  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto z-10 relative">
      <div className="glow-blob top-10 right-10 scale-75" />

      {/* Header controls banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Income Tracker</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">Manage and track your funding sources</p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary text-xs font-semibold py-2.5 px-4 flex items-center gap-2 shadow-glow self-start sm:self-auto"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Log Income</span>
        </button>
      </div>

      {/* Income Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-32 border border-white/5 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <h2 className="text-2xl font-black">₹{totalIncome.toFixed(2)}</h2>
            <p className="text-[10px] text-slate-500 font-semibold mt-1">Life-to-date registered income stream</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/5 md:col-span-2 flex items-center justify-between">
          <div className="max-w-md">
            <h4 className="text-sm font-bold text-slate-300">Smart Cashflow Insight</h4>
            <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">
              "Ensuring a balanced cash flow is key. Make sure your monthly incomes match or exceed your average monthly expenses to maintain financial peace of mind."
            </p>
          </div>
        </div>
      </div>

      {/* Incomes List panel */}
      <div className="glass-card p-6 rounded-2xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-300 mb-4">Logged Income Entries</h3>
        
        {loading ? (
          <ListSkeleton />
        ) : incomes.length === 0 ? (
          <div className="text-center py-10 text-xs font-semibold text-slate-500">
            No income entries recorded yet. Click "Log Income" to add salary or other income details!
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {incomes.map((inc) => (
              <div 
                key={inc._id} 
                className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    {getSourceIcon(inc.source)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100">{inc.source}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(inc.date).toLocaleDateString()}
                      {inc.notes && <span className="text-slate-500 font-medium">| {inc.notes}</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-black text-emerald-400">+₹{inc.amount.toFixed(2)}</span>
                  <button 
                    onClick={() => handleDelete(inc._id)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/25 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Income Drawer Modal */}
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
              <h2 className="text-2xl font-black mb-6">Log Income stream</h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Source */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Income Source</label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="e.g. Monthly Salary"
                    required
                    className="glass-input text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Amount */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">Amount Received (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="250.00"
                      required
                      className="glass-input text-sm"
                    />
                  </div>
                  {/* Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">Date Received</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="glass-input text-sm"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Notes (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Paid bi-weekly"
                    className="glass-input text-sm"
                  />
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
                    Save Record
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

export default IncomeTracker;
