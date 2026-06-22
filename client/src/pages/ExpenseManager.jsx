import React, { useState, useEffect, useCallback } from 'react';
import { useProfiles } from '../context/ProfileContext';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';
import api from '../services/api';
import {
  Plus, Search, Filter, Calendar, Edit2, Trash2, X, Download, Printer, Tag, CalendarClock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ExpenseManager = () => {
  const { activeProfile } = useProfiles();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);

  // Filter & Search States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [range, setRange] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [formCategory, setFormCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState('none');

  const categories = [
    'Food',
    'Transport',
    'Education',
    'Shopping',
    'Health',
    'Bills',
    'EMI',
    'Investments',
    'Entertainment',
    'Miscellaneous',
    'Grocery'
  ];

  // Fetch expenses with active filter state
  const fetchExpenses = useCallback(async () => {
    if (!activeProfile) return;
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (range) params.range = range;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get(`/profiles/${activeProfile._id}/expenses`, { params });
      if (res.data.success) {
        setExpenses(res.data.data);
      }
    } catch (err) {
      showToast('Failed to fetch transactions', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeProfile, search, category, range, startDate, endDate, showToast]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Handle OCR Pre-population if redirected with state
  useEffect(() => {
    const ocrData = localStorage.getItem('expensemate_ocr_prefill');
    if (ocrData) {
      try {
        const parsed = JSON.parse(ocrData);
        setTitle(parsed.merchant || '');
        setAmount(parsed.amount || '');
        if (parsed.date) {
          setDate(new Date(parsed.date).toISOString().split('T')[0]);
        }
        showToast('Receipt details pre-filled!', 'info');
        setShowModal(true);
      } catch (e) {
        console.error(e);
      } finally {
        localStorage.removeItem('expensemate_ocr_prefill');
      }
    }
  }, [showToast]);

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount || !formCategory) {
      showToast('Title, amount, and category are required', 'warning');
      return;
    }

    const payload = {
      title,
      amount: parseFloat(amount),
      category: formCategory,
      date,
      notes,
      tags,
      isRecurring,
      recurringInterval
    };

    try {
      if (isEdit) {
        const res = await api.patch(`/profiles/${activeProfile._id}/expenses/${editId}`, payload);
        if (res.data.success) {
          showToast('Expense updated successfully!', 'success');
          fetchExpenses();
        }
      } else {
        const res = await api.post(`/profiles/${activeProfile._id}/expenses`, payload);
        if (res.data.success) {
          showToast('Expense added successfully!', 'success');
          fetchExpenses();
        }
      }
      closeFormModal();
    } catch (err) {
      showToast(err.response?.data?.message || 'Transaction save error', 'error');
    }
  };

  // Open Form modal for editing
  const openEditModal = (exp) => {
    setIsEdit(true);
    setEditId(exp._id);
    setTitle(exp.title);
    setAmount(exp.amount.toString());
    setFormCategory(exp.category);
    setDate(new Date(exp.date).toISOString().split('T')[0]);
    setNotes(exp.notes);
    setTags(exp.tags || []);
    setIsRecurring(exp.isRecurring || false);
    setRecurringInterval(exp.recurringInterval || 'none');
    setShowModal(true);
  };

  const closeFormModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setEditId(null);
    setTitle('');
    setAmount('');
    setFormCategory('Food');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setTags([]);
    setTagInput('');
    setIsRecurring(false);
    setRecurringInterval('none');
  };

  // Delete transaction
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction log?')) return;
    try {
      const res = await api.delete(`/profiles/${activeProfile._id}/expenses/${id}`);
      if (res.data.success) {
        showToast('Expense deleted successfully', 'success');
        setExpenses(prev => prev.filter(e => e._id !== id));
      }
    } catch (err) {
      showToast('Deletion failed', 'error');
    }
  };

  // Tag helper utilities
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tToRemove) => {
    setTags(tags.filter(t => t !== tToRemove));
  };

  // Export reports to CSV file
  const handleExportCSV = () => {
    if (expenses.length === 0) {
      showToast('No transaction history to export', 'warning');
      return;
    }
    const headers = ['Title,Amount,Category,Date,Notes,Tags,IsRecurring,Interval'];
    const rows = expenses.map(e => [
      `"${e.title.replace(/"/g, '""')}"`,
      e.amount,
      `"${e.category}"`,
      new Date(e.date).toLocaleDateString(),
      `"${(e.notes || '').replace(/"/g, '""')}"`,
      `"${(e.tags || []).join(';')}"`,
      e.isRecurring,
      e.recurringInterval
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `expense_report_${activeProfile.name}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV Report Downloaded!', 'success');
  };

  // Custom PDF Print layout trigger
  const handlePrintPDF = () => {
    window.print();
  };

  if (!activeProfile) {
    return (
      <div className="p-6 text-center text-slate-400 font-semibold max-w-lg mx-auto">
        Please configure a budget profile in settings first!
      </div>
    );
  }

  const totalFilteredExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto z-10 relative">
      <div className="glow-blob top-10 right-10 scale-75" />

      {/* Header controls banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Expense Manager</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Total logged: <span className="text-indigo-400">₹{totalFilteredExpense.toFixed(2)}</span> ({expenses.length} transactions)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="btn-glass text-xs font-semibold py-2.5 px-3.5 flex items-center gap-2 border border-white/5"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={handlePrintPDF}
            className="btn-glass text-xs font-semibold py-2.5 px-3.5 flex items-center gap-2 border border-white/5"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Print Report</span>
          </button>
          <button
            onClick={() => { closeFormModal(); setShowModal(true); }}
            className="btn-primary text-xs font-semibold py-2.5 px-4 flex items-center gap-2 shadow-glow"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filters Board panel */}
      <div className="glass-card p-5 rounded-2xl border border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
        {/* Search */}
        <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-2 lg:col-span-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Search Text</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. Shopping"
              className="w-full glass-input pl-9 text-xs py-2"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</label>
          <div className="relative">
            <Filter className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full glass-input pl-9 text-xs py-2 appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Date presets */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Range Presets</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <select
              value={range}
              onChange={(e) => { setRange(e.target.value); setStartDate(''); setEndDate(''); }}
              className="w-full glass-input pl-9 text-xs py-2 appearance-none"
            >
              <option value="">All Time</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>
          </div>
        </div>

        {/* Custom Start Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setRange(''); }}
            className="w-full glass-input text-xs py-2"
          />
        </div>

        {/* Custom End Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setRange(''); }}
            className="w-full glass-input text-xs py-2"
          />
        </div>
      </div>

      {/* Main Expense Table list */}
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-6"><ListSkeleton /></div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16 text-xs font-semibold text-slate-500 flex flex-col items-center gap-3">
            <span>No expense transactions logged for this active configuration.</span>
            <button
              onClick={() => { setSearch(''); setCategory(''); setRange(''); setStartDate(''); setEndDate(''); }}
              className="text-indigo-400 underline hover:text-indigo-300"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-left text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-900/60 border-b border-white/5 text-slate-400 font-bold">
                  <th className="p-4">Transaction Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 hidden md:table-cell">Tags / Notes</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="p-4 font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-100">{exp.title}</span>
                        {exp.isRecurring && (
                          <div className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            <CalendarClock className="w-2.5 h-2.5" />
                            <span>{exp.recurringInterval}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-900 text-slate-300 font-semibold border border-white/5">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-medium">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex flex-col gap-1 max-w-xs">
                        <p className="text-[11px] text-slate-400 font-medium line-clamp-1 italic">{exp.notes || 'No notes'}</p>
                        {exp.tags && exp.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {exp.tags.map((t, idx) => (
                              <span key={idx} className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-white/5 flex items-center gap-0.5">
                                <Tag className="w-2.5 h-2.5" />
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right font-black text-rose-400">-₹{exp.amount.toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2.5">
                        <button
                          onClick={() => openEditModal(exp)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(exp._id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Report View (only visible when print utility is called) */}
      <div className="hidden print:block absolute inset-0 bg-white text-slate-900 p-8 z-[9999]">
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <h1 className="text-3xl font-extrabold uppercase">ExpenseMate Ledger Report</h1>
          <p className="text-sm font-semibold text-slate-600 mt-1">Profile: {activeProfile.name} // Generated: {new Date().toLocaleDateString()}</p>
          <p className="text-sm font-semibold text-slate-600">Total Spending Summary: ₹{totalFilteredExpense.toFixed(2)}</p>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-400 font-bold">
              <th className="py-2">Item title</th>
              <th className="py-2">Category</th>
              <th className="py-2">Date</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp._id} className="border-b border-slate-200">
                <td className="py-2 font-semibold">{exp.title}</td>
                <td className="py-2">{exp.category}</td>
                <td className="py-2">{new Date(exp.date).toLocaleDateString()}</td>
                <td className="py-2 text-right font-bold">₹{exp.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Expense Drawer Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center p-5 z-[999] overflow-hidden">
            {/* Modal backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeFormModal}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            {/* Modal card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg glass-card p-6 md:p-8 rounded-3xl relative z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={closeFormModal}
                className="absolute right-4 top-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-black mb-6">{isEdit ? 'Edit Expense Record' : 'Add New Expense'}</h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">Transaction Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Internet Bill"
                      required
                      className="glass-input text-sm"
                    />
                  </div>
                  {/* Amount */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">Spent Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="45.99"
                      required
                      className="glass-input text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">Spending Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="glass-input text-sm appearance-none"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {/* Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">Transaction Date</label>
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
                  <label className="text-xs font-semibold text-slate-300">Notes / Narrative</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter item description or location..."
                    rows="2.5"
                    className="glass-input text-sm resize-none"
                  />
                </div>

                {/* Tags */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Tags (Press Enter or Comma to add)</label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="e.g. household, utilities"
                    className="glass-input text-sm"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {tags.map((t, idx) => (
                      <span key={idx} className="text-xs bg-brand-primary/20 border border-brand-primary/30 text-indigo-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5">
                        <span>{t}</span>
                        <button type="button" onClick={() => handleRemoveTag(t)} className="hover:text-rose-400 font-extrabold text-[10px]">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recurring Options */}
                <div className="border-t border-white/5 pt-4 mt-1 flex flex-col gap-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="w-4 h-4 accent-indigo-500 rounded bg-slate-900 border-white/10"
                    />
                    <span className="text-xs font-semibold text-slate-300">Automate as a Recurring Expense</span>
                  </label>

                  {isRecurring && (
                    <div className="flex flex-col gap-1.5 animate-in fade-in-50 slide-in-from-top-1.5 duration-150">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">Recurring Interval</label>
                      <select
                        value={recurringInterval}
                        onChange={(e) => setRecurringInterval(e.target.value)}
                        className="glass-input text-sm appearance-none"
                      >
                        <option value="none">Choose interval...</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Submit buttons */}
                <div className="flex items-center gap-3 justify-end mt-4">
                  <button
                    type="button"
                    onClick={closeFormModal}
                    className="btn-glass text-xs font-semibold py-2.5 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-xs font-semibold py-2.5 px-6 shadow-glow"
                  >
                    {isEdit ? 'Update Expense' : 'Create Record'}
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

export default ExpenseManager;
