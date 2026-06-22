import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { CardSkeleton, ListSkeleton } from '../components/Skeleton';
import api from '../services/api';
import { 
  Plus, Trash2, Edit2, ArrowLeft, Users, PiggyBank, DollarSign, Calendar, MapPin, 
  ChevronRight, BrainCircuit, Download, Printer, Info, CreditCard, PieChart, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Doughnut, Line } from 'react-chartjs-2';

const TripSplitter = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState([]);
  const [activeTripId, setActiveTripId] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [tripSummary, setTripSummary] = useState(null);
  const [aiInsights, setAiInsights] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Tabs: 'dashboard', 'members', 'contributions', 'expenses', 'settlements', 'ai'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Trip Form Modal
  const [showTripModal, setShowTripModal] = useState(false);
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');

  // Member Form
  const [memberName, setMemberName] = useState('');
  const [memberContact, setMemberContact] = useState('');
  const [memberCount, setMemberCount] = useState(1);
  const [initialContribution, setInitialContribution] = useState('');
  const [editingMemberId, setEditingMemberId] = useState(null);

  // Contribution Form
  const [contribMemberName, setContribMemberName] = useState('');
  const [contribAmount, setContribAmount] = useState('');
  const [contribDate, setContribDate] = useState(new Date().toISOString().split('T')[0]);

  // Expense Form
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Travel');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expensePaidBy, setExpensePaidBy] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseNotes, setExpenseNotes] = useState('');
  const [editingExpenseId, setEditingExpenseId] = useState(null);

  const categories = ['Travel', 'Food', 'Hotel', 'Fuel', 'Shopping', 'Activities', 'Miscellaneous'];

  const categoryColors = {
    Travel: '#F59E0B',
    Food: '#EC4899',
    Hotel: '#06B6D4',
    Fuel: '#10B981',
    Shopping: '#8B5CF6',
    Activities: '#4F46E5',
    Miscellaneous: '#64748B'
  };

  // Fetch all trips
  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/trips');
      if (res.data.success) {
        setTrips(res.data.data);
      }
    } catch (err) {
      showToast('Failed to fetch trips', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // Fetch active trip details
  const fetchTripDetails = useCallback(async (tripId) => {
    try {
      const [tripRes, summaryRes] = await Promise.all([
        api.get(`/trips/${tripId}`),
        api.get(`/trips/${tripId}/summary`)
      ]);

      if (tripRes.data.success) {
        setActiveTrip(tripRes.data.data);
      }
      if (summaryRes.data.success) {
        setTripSummary(summaryRes.data.data);
      }
    } catch (err) {
      showToast('Failed to fetch trip details', 'error');
    }
  }, [showToast]);

  const selectTrip = (tripId) => {
    setActiveTripId(tripId);
    setActiveTab('dashboard');
    setAiInsights('');
    fetchTripDetails(tripId);
  };

  const closeActiveTrip = () => {
    setActiveTripId(null);
    setActiveTrip(null);
    setTripSummary(null);
    setAiInsights('');
    fetchTrips();
  };

  // Create Trip
  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!tripName || !destination || !startDate || !endDate) {
      showToast('All fields are required', 'warning');
      return;
    }

    try {
      const res = await api.post('/trips/create', {
        name: tripName,
        destination,
        startDate,
        endDate,
        description
      });
      if (res.data.success) {
        showToast('Trip created successfully!', 'success');
        setTrips([res.data.data, ...trips]);
        setShowTripModal(false);
        // Reset form
        setTripName('');
        setDestination('');
        setStartDate('');
        setEndDate('');
        setDescription('');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating trip', 'error');
    }
  };

  // Delete Trip
  const handleDeleteTrip = async (tripId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this trip and all its records?')) return;

    try {
      const res = await api.delete(`/trips/${tripId}`);
      if (res.data.success) {
        showToast('Trip deleted successfully', 'success');
        setTrips(trips.filter(t => t._id !== tripId));
        if (activeTripId === tripId) {
          closeActiveTrip();
        }
      }
    } catch (err) {
      showToast('Error deleting trip', 'error');
    }
  };

  // Start editing member
  const startEditMember = (m) => {
    setEditingMemberId(m._id);
    setMemberName(m.name);
    setMemberContact(m.contact || '');
    setMemberCount(m.memberCount || 1);
  };

  // Save Member (Add / Edit)
  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!memberName) {
      showToast('Member name is required', 'warning');
      return;
    }

    try {
      if (editingMemberId) {
        // Edit Mode
        const res = await api.patch(`/trips/${activeTripId}/member/${editingMemberId}`, {
          name: memberName,
          contact: memberContact,
          memberCount: parseInt(memberCount) || 1
        });
        if (res.data.success) {
          showToast('Member updated successfully!', 'success');
          setEditingMemberId(null);
          setMemberName('');
          setMemberContact('');
          setMemberCount(1);
          setInitialContribution('');
          fetchTripDetails(activeTripId);
        }
      } else {
        // Add Mode
        const res = await api.post(`/trips/${activeTripId}/member`, {
          name: memberName,
          contact: memberContact,
          memberCount: parseInt(memberCount) || 1
        });
        if (res.data.success) {
          showToast('Member added successfully!', 'success');

          // Log initial contribution if specified
          if (initialContribution && parseFloat(initialContribution) > 0) {
            try {
              await api.post(`/trips/${activeTripId}/contribution`, {
                memberName: memberName,
                amount: parseFloat(initialContribution),
                date: new Date().toISOString().split('T')[0]
              });
            } catch (contribErr) {
              console.error('Failed to log initial contribution:', contribErr);
            }
          }

          setMemberName('');
          setMemberContact('');
          setMemberCount(1);
          setInitialContribution('');
          fetchTripDetails(activeTripId);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving member', 'error');
    }
  };

  // Delete Member
  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Deleting this member will also remove their contributions and expenses. Proceed?')) return;
    try {
      const res = await api.delete(`/trips/${activeTripId}/member/${memberId}`);
      if (res.data.success) {
        showToast('Member deleted successfully', 'success');
        fetchTripDetails(activeTripId);
      }
    } catch (err) {
      showToast('Error deleting member', 'error');
    }
  };

  // Add Contribution
  const handleAddContribution = async (e) => {
    e.preventDefault();
    if (!contribMemberName || !contribAmount) {
      showToast('Contributor and amount are required', 'warning');
      return;
    }

    try {
      const res = await api.post(`/trips/${activeTripId}/contribution`, {
        memberName: contribMemberName,
        amount: parseFloat(contribAmount),
        date: contribDate
      });
      if (res.data.success) {
        showToast('Contribution added successfully!', 'success');
        fetchTripDetails(activeTripId);
        setContribMemberName('');
        setContribAmount('');
        setContribDate(new Date().toISOString().split('T')[0]);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error adding contribution', 'error');
    }
  };

  // Delete Contribution
  const handleDeleteContribution = async (contribId) => {
    if (!window.confirm('Delete this contribution record?')) return;
    try {
      const res = await api.delete(`/trips/${activeTripId}/contribution/${contribId}`);
      if (res.data.success) {
        showToast('Contribution deleted', 'success');
        fetchTripDetails(activeTripId);
      }
    } catch (err) {
      showToast('Error deleting contribution', 'error');
    }
  };

  // Start editing expense
  const startEditExpense = (exp) => {
    setEditingExpenseId(exp._id);
    setExpenseTitle(exp.title);
    setExpenseCategory(exp.category);
    setExpenseAmount(exp.amount.toString());
    setExpensePaidBy(exp.paidBy);
    setExpenseDate(exp.date ? new Date(exp.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setExpenseNotes(exp.notes || '');
  };

  // Save Expense (Add / Edit)
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount || !expensePaidBy) {
      showToast('Title, amount, and paid by are required', 'warning');
      return;
    }

    try {
      if (editingExpenseId) {
        // Edit Mode
        const res = await api.patch(`/trips/${activeTripId}/expense/${editingExpenseId}`, {
          title: expenseTitle,
          category: expenseCategory,
          amount: parseFloat(expenseAmount),
          paidBy: expensePaidBy,
          date: expenseDate,
          notes: expenseNotes
        });
        if (res.data.success) {
          showToast('Expense updated successfully!', 'success');
          setEditingExpenseId(null);
          setExpenseTitle('');
          setExpenseCategory('Travel');
          setExpenseAmount('');
          setExpensePaidBy('');
          setExpenseDate(new Date().toISOString().split('T')[0]);
          setExpenseNotes('');
          fetchTripDetails(activeTripId);
        }
      } else {
        // Add Mode
        const res = await api.post(`/trips/${activeTripId}/expense`, {
          title: expenseTitle,
          category: expenseCategory,
          amount: parseFloat(expenseAmount),
          paidBy: expensePaidBy,
          date: expenseDate,
          notes: expenseNotes
        });
        if (res.data.success) {
          showToast('Expense recorded successfully!', 'success');
          setExpenseTitle('');
          setExpenseCategory('Travel');
          setExpenseAmount('');
          setExpensePaidBy('');
          setExpenseDate(new Date().toISOString().split('T')[0]);
          setExpenseNotes('');
          fetchTripDetails(activeTripId);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving expense', 'error');
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense record?')) return;
    try {
      const res = await api.delete(`/trips/${activeTripId}/expense/${expenseId}`);
      if (res.data.success) {
        showToast('Expense deleted', 'success');
        fetchTripDetails(activeTripId);
      }
    } catch (err) {
      showToast('Error deleting expense', 'error');
    }
  };

  // Fetch AI Insights
  const fetchAiInsights = async () => {
    setAiLoading(true);
    try {
      const res = await api.get(`/trips/${activeTripId}/ai-insights`);
      if (res.data.success) {
        setAiInsights(res.data.insights);
      }
    } catch (err) {
      showToast('Failed to fetch AI insights', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = (type) => {
    if (!activeTrip || !tripSummary) return;

    let headers = [];
    let rows = [];
    let filename = `trip_${type}_${activeTrip.name}.csv`;

    if (type === 'expenses') {
      headers = ['Title,Amount,Category,PaidBy,Date,Notes'];
      rows = activeTrip.expenses.map(e => [
        `"${e.title.replace(/"/g, '""')}"`,
        e.amount,
        `"${e.category}"`,
        `"${e.paidBy}"`,
        new Date(e.date).toLocaleDateString(),
        `"${(e.notes || '').replace(/"/g, '""')}"`
      ].join(','));
    } else if (type === 'contributions') {
      headers = ['MemberName,Amount,Date'];
      rows = activeTrip.contributions.map(c => [
        `"${c.memberName}"`,
        c.amount,
        new Date(c.date).toLocaleDateString()
      ].join(','));
    } else if (type === 'settlements') {
      headers = ['From,To,Amount'];
      rows = tripSummary.settlements.map(s => [
        `"${s.from}"`,
        `"${s.to}"`,
        s.amount
      ].join(','));
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} CSV Exported!`, 'success');
  };

  // Trigger Print dialog
  const handlePrintPDF = () => {
    window.print();
  };

  // Calculate categories distribution for pie chart
  const getChartData = () => {
    if (!activeTrip || activeTrip.expenses.length === 0) return { labels: [], datasets: [] };

    const totals = {};
    categories.forEach(c => { totals[c] = 0; });
    activeTrip.expenses.forEach(e => {
      if (totals[e.category] !== undefined) {
        totals[e.category] += e.amount;
      }
    });

    const activeCats = categories.filter(c => totals[c] > 0);
    const dataValues = activeCats.map(c => totals[c]);
    const bgColors = activeCats.map(c => categoryColors[c]);

    return {
      labels: activeCats,
      datasets: [
        {
          data: dataValues,
          backgroundColor: bgColors,
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          hoverOffset: 4
        }
      ]
    };
  };

  const chartData = getChartData();
  const hasChartData = chartData.datasets && chartData.datasets.length > 0 && chartData.datasets[0].data.length > 0;

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto z-10 relative">
      <div className="glow-blob top-10 right-10 scale-75" />

      {/* -------------------- VIEW 1: TRIPS LIST VIEW -------------------- */}
      {!activeTripId && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 w-full"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Trip Expense Splitter</h1>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                Collaborate and split trip costs with classmates and friends.
              </p>
            </div>
            <button
              onClick={() => setShowTripModal(true)}
              className="btn-primary text-xs font-semibold py-2.5 px-4 flex items-center gap-2 shadow-glow"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Create New Trip</span>
            </button>
          </div>

          {/* List of trips */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CardSkeleton /><CardSkeleton /><CardSkeleton />
            </div>
          ) : trips.length === 0 ? (
            <div className="glass-card p-10 rounded-3xl text-center flex flex-col items-center max-w-lg mx-auto border border-white/5 relative">
              <MapPin className="w-10 h-10 text-indigo-400 mb-4" />
              <h3 className="text-lg font-bold text-slate-200">No Trips Created Yet</h3>
              <p className="text-xs text-slate-400 font-semibold mt-2 mb-6">
                Planning a group trip? Create a trip to easily manage collected cash, log group bills, and compute settlements.
              </p>
              <button
                onClick={() => setShowTripModal(true)}
                className="btn-glass text-xs font-semibold py-2 px-4 border border-indigo-500/30"
              >
                + Start First Trip
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <div
                  key={trip._id}
                  onClick={() => selectTrip(trip._id)}
                  className="glass-card p-6 rounded-3xl border border-white/5 hover:border-indigo-500/20 transition-all cursor-pointer flex flex-col justify-between h-48 group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">{trip.name}</h3>
                      <span className="text-[10px] text-indigo-300 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full mt-2 inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {trip.destination}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteTrip(trip._id, e)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>
                        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold border-t border-white/5 pt-3.5 mt-2">
                      <span>{trip.members.length} Members</span>
                      <span className="flex items-center gap-1 text-slate-400 group-hover:text-indigo-400 transition-colors">
                        Manage Trip <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* -------------------- VIEW 2: TRIP DETAILS VIEW -------------------- */}
      {activeTripId && activeTrip && tripSummary && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col gap-6 w-full"
        >
          {/* Header Back & Details banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
            <div className="flex items-start gap-4">
              <button
                onClick={closeActiveTrip}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all mt-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{activeTrip.name}</h1>
                <div className="flex flex-wrap gap-2.5 mt-2 items-center">
                  <span className="text-[10px] text-indigo-300 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {activeTrip.destination}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {new Date(activeTrip.startDate).toLocaleDateString()} - {new Date(activeTrip.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick exports */}
            <div className="flex items-center gap-2 flex-wrap">
              <button 
                onClick={() => handleExportCSV('expenses')}
                className="btn-glass text-[10px] font-bold py-2 px-3 flex items-center gap-1.5 border border-white/5"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>
              <button 
                onClick={handlePrintPDF}
                className="btn-glass text-[10px] font-bold py-2 px-3 flex items-center gap-1.5 border border-white/5"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400" />
                <span>Print PDF</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation tabs */}
          <div className="flex border-b border-white/5 overflow-x-auto gap-2.5 no-scrollbar">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: PieChart },
              { id: 'members', label: 'Members & Kitty', icon: Users },
              { id: 'expenses', label: 'Expenses', icon: DollarSign },
              { id: 'settlements', label: 'Settlements', icon: CreditCard },
              { id: 'ai', label: 'AI Insights', icon: BrainCircuit }
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Contents */}
          <div className="w-full">
            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                {/* KPI cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Collection */}
                  <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between h-28">
                    <div className="flex justify-between items-center text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <span>Total Collection</span>
                      <PiggyBank className="w-4.5 h-4.5 text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-100">₹{tripSummary.totalContributions.toFixed(2)}</h2>
                      <span className="text-[9px] text-slate-500 font-bold block mt-1">Sum of pre-paid cash</span>
                    </div>
                  </div>

                  {/* Total Expenses */}
                  <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between h-28">
                    <div className="flex justify-between items-center text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <span>Total Expenses</span>
                      <DollarSign className="w-4.5 h-4.5 text-rose-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-100">₹{tripSummary.totalExpenses.toFixed(2)}</h2>
                      <span className="text-[9px] text-slate-500 font-bold block mt-1">Logged trip spending</span>
                    </div>
                  </div>

                  {/* Remaining Balance */}
                  <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between h-28">
                    <div className="flex justify-between items-center text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <span>Remaining Balance</span>
                      <CreditCard className="w-4.5 h-4.5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className={`text-2xl font-black ${tripSummary.remainingCommonCash < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        ₹{tripSummary.remainingCommonCash.toFixed(2)}
                      </h2>
                      <span className="text-[9px] text-slate-500 font-bold block mt-1">Contributions kitty balance</span>
                    </div>
                  </div>

                  {/* Per Person Share */}
                  <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between h-28">
                    <div className="flex justify-between items-center text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <span>Per Person Share</span>
                      <Users className="w-4.5 h-4.5 text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-100">₹{tripSummary.perPersonShare.toFixed(2)}</h2>
                      <span className="text-[9px] text-slate-500 font-bold block mt-1">
                        Expected share per person (Total: {tripSummary.totalPeopleCount || activeTrip.members.length} people)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dashboard charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Category Pie Chart */}
                  <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col gap-4 lg:col-span-1">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <PieChart className="w-4 h-4 text-indigo-400" />
                      Category Breakdown
                    </h3>
                    <div className="relative h-56 flex items-center justify-center">
                      {activeTrip.expenses.length === 0 ? (
                        <p className="text-xs text-slate-500 font-bold">No expenses recorded yet</p>
                      ) : (
                        <Doughnut
                          data={chartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                display: true,
                                position: 'bottom',
                                labels: { color: '#94a3b8', font: { family: 'Outfit', size: 10 }, padding: 10 }
                              }
                            },
                            cutout: '60%'
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Category Breakdown Table */}
                  <div className="glass-card p-6 rounded-2xl border border-white/5 lg:col-span-2 flex flex-col gap-4">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      Expense Categories Breakdown
                    </h3>
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-slate-400 pb-2">
                            <th className="py-2">Category</th>
                            <th className="py-2 text-right">Sum Amount</th>
                            <th className="py-2 text-right">Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map(cat => {
                            const catAmt = activeTrip.expenses
                              .filter(e => e.category === cat)
                              .reduce((sum, e) => sum + e.amount, 0);

                            const percentage = tripSummary.totalExpenses > 0 ? (catAmt / tripSummary.totalExpenses) * 100 : 0;

                            if (catAmt === 0) return null;

                            return (
                              <tr key={cat} className="border-b border-white/5">
                                <td className="py-2.5 font-bold flex items-center gap-2">
                                  <span style={{ backgroundColor: categoryColors[cat] }} className="w-2.5 h-2.5 rounded-full" />
                                  <span>{cat}</span>
                                </td>
                                <td className="py-2.5 text-right font-semibold text-slate-100">₹{catAmt.toFixed(2)}</td>
                                <td className="py-2.5 text-right font-semibold text-indigo-300">{percentage.toFixed(0)}%</td>
                              </tr>
                            );
                          })}
                          {activeTrip.expenses.length === 0 && (
                            <tr>
                              <td colSpan="3" className="py-8 text-center text-slate-500 font-semibold">No expenses logged yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="glass-card p-6 rounded-2xl border border-white/5">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Recent Trip Transactions</h3>
                  <div className="flex flex-col gap-2.5">
                    {activeTrip.expenses.slice(-3).reverse().map((exp, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/5">
                        <div className="flex items-center gap-3">
                          <span style={{ backgroundColor: categoryColors[exp.category] }} className="w-2.5 h-2.5 rounded-full flex-shrink-0" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-200">{exp.title}</h4>
                            <p className="text-[10px] text-slate-500 font-semibold">Paid by {exp.paidBy} on {new Date(exp.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-rose-400">-₹{exp.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    {activeTrip.contributions.slice(-3).reverse().map((c, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-200">Contribution from {c.memberName}</h4>
                            <p className="text-[10px] text-slate-500 font-semibold">Collected on {new Date(c.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-400">+₹{c.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    {activeTrip.expenses.length === 0 && activeTrip.contributions.length === 0 && (
                      <div className="text-center py-6 text-xs text-slate-500 font-semibold">No recent activity. Get started by adding members!</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: MEMBERS & CONTRIBUTIONS */}
            {activeTab === 'members' && (
              <div className="flex flex-col gap-8 w-full">
                {/* Row 1: Add Participant & Participant List */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  {/* Form */}
                  <div className="glass-card p-6 rounded-2xl border border-white/5 h-fit lg:col-span-1">
                    <h3 className="text-sm font-bold text-slate-200 mb-4">
                      {editingMemberId ? 'Edit Participant' : 'Add Participant'}
                    </h3>
                    <form onSubmit={handleSaveMember} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                        <input
                          type="text"
                          value={memberName}
                          onChange={(e) => setMemberName(e.target.value)}
                          placeholder="e.g. Heet"
                          required
                          className="glass-input text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Number (Optional)</label>
                        <input
                          type="text"
                          value={memberContact}
                          onChange={(e) => setMemberContact(e.target.value)}
                          placeholder="e.g. +91 9876543210"
                          className="glass-input text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Group / Unit Size</label>
                        <select
                          value={memberCount}
                          onChange={(e) => setMemberCount(parseInt(e.target.value))}
                          className="glass-input text-xs appearance-none"
                        >
                          <option value="1">Solo Person (1)</option>
                          <option value="2">2 People</option>
                          <option value="3">3 People</option>
                          <option value="4">4 People</option>
                          <option value="5">5 People</option>
                          <option value="6">6 People</option>
                          <option value="7">7 People</option>
                          <option value="8">8 People</option>
                          <option value="9">9 People</option>
                          <option value="10">10 People</option>
                        </select>
                        <span className="text-[9px] text-slate-500 font-semibold pl-1">
                          Select more than 1 if this participant is the head of a family/group. Costs will be split proportionally.
                        </span>
                      </div>
                      {!editingMemberId && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Initial Kitty Contribution (Optional, ₹)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={initialContribution}
                            onChange={(e) => setInitialContribution(e.target.value)}
                            placeholder="e.g. 5000"
                            className="glass-input text-xs"
                          />
                        </div>
                      )}
                      <button type="submit" className="btn-primary text-xs font-bold py-2 px-4 shadow-glow mt-2">
                        {editingMemberId ? 'Update Participant' : 'Add to Trip'}
                      </button>
                      {editingMemberId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMemberId(null);
                            setMemberName('');
                            setMemberContact('');
                            setMemberCount(1);
                            setInitialContribution('');
                          }}
                          className="btn-glass text-xs font-bold py-2 px-4 mt-1"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </form>
                  </div>

                  {/* Table */}
                  <div className="glass-card p-6 rounded-2xl border border-white/5 lg:col-span-2">
                    <h3 className="text-sm font-bold text-slate-200 mb-4">Participant List</h3>
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left text-xs md:text-sm">
                        <thead>
                          <tr className="border-b border-white/5 text-slate-400 font-bold">
                            <th className="pb-3 pl-2">Name</th>
                            <th className="pb-3 text-center">Group Size</th>
                            <th className="pb-3 text-right">Contributed</th>
                            <th className="pb-3 hidden sm:table-cell">Contact</th>
                            <th className="pb-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeTrip.members.map((m) => {
                            const totalContributed = activeTrip.contributions
                              .filter(c => c.memberName === m.name)
                              .reduce((sum, c) => sum + c.amount, 0);
                            return (
                              <tr key={m._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                <td className="py-3 font-semibold text-slate-100 pl-2">{m.name}</td>
                                <td className="py-3 text-center text-indigo-300 font-bold">
                                  {m.memberCount || 1} { (m.memberCount || 1) === 1 ? 'person' : 'people' }
                                </td>
                                <td className="py-3 text-right font-black text-emerald-400">₹{totalContributed.toFixed(2)}</td>
                                <td className="py-3 text-slate-400 font-medium hidden sm:table-cell">{m.contact || '-'}</td>
                                <td className="py-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => startEditMember(m)}
                                      className="p-1.5 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-colors"
                                      title="Edit Participant"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteMember(m._id)}
                                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                                      title="Delete Participant"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {activeTrip.members.length === 0 && (
                            <tr>
                              <td colSpan="5" className="py-8 text-center text-slate-500 font-semibold">No participants added to this trip yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>

                {/* Divider */}
                <div className="border-t border-white/5 my-4" />

                {/* Row 2: Log Cash Contribution & Contributions Ledger */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  {/* Form */}
                  <div className="glass-card p-6 rounded-2xl border border-white/5 h-fit lg:col-span-1">
                    <h3 className="text-sm font-bold text-slate-200 mb-4">Log Additional Cash Contribution</h3>
                    <form onSubmit={handleAddContribution} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contributor</label>
                        <select
                          value={contribMemberName}
                          onChange={(e) => setContribMemberName(e.target.value)}
                          required
                          className="glass-input text-xs appearance-none"
                        >
                          <option value="">Choose member...</option>
                          {activeTrip.members.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount Contributed (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={contribAmount}
                          onChange={(e) => setContribAmount(e.target.value)}
                          placeholder="5000"
                          required
                          className="glass-input text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date Collected</label>
                        <input
                          type="date"
                          value={contribDate}
                          onChange={(e) => setContribDate(e.target.value)}
                          required
                          className="glass-input text-xs"
                        />
                      </div>
                      <button type="submit" className="btn-primary text-xs font-bold py-2 px-4 shadow-glow mt-2">
                        Record Contribution
                      </button>
                    </form>
                  </div>

                  {/* Table */}
                  <div className="glass-card p-6 rounded-2xl border border-white/5 lg:col-span-2">
                    <h3 className="text-sm font-bold text-slate-200 mb-4">Contributions Ledger</h3>
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left text-xs md:text-sm">
                        <thead>
                          <tr className="border-b border-white/5 text-slate-400 font-bold">
                            <th className="pb-3 pl-2">Participant</th>
                            <th className="pb-3">Date</th>
                            <th className="pb-3 text-right">Amount</th>
                            <th className="pb-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeTrip.contributions.map((c) => (
                            <tr key={c._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                              <td className="py-3 font-semibold text-slate-100 pl-2">{c.memberName}</td>
                              <td className="py-3 text-slate-400 font-medium">{new Date(c.date).toLocaleDateString()}</td>
                              <td className="py-3 text-right font-black text-emerald-400">+₹{c.amount.toFixed(2)}</td>
                              <td className="py-3 text-center">
                                <button
                                  onClick={() => handleDeleteContribution(c._id)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {activeTrip.contributions.length === 0 && (
                            <tr>
                              <td colSpan="4" className="py-8 text-center text-slate-500 font-semibold">No contributions logged yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* TAB: EXPENSES */}
            {activeTab === 'expenses' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <div className="glass-card p-6 rounded-2xl border border-white/5 h-fit lg:col-span-1">
                  <h3 className="text-sm font-bold text-slate-200 mb-4">{editingExpenseId ? 'Edit Trip Expense' : 'Record Trip Expense'}</h3>
                  <form onSubmit={handleSaveExpense} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expense Title</label>
                      <input
                        type="text"
                        value={expenseTitle}
                        onChange={(e) => setExpenseTitle(e.target.value)}
                        placeholder="e.g. Hotel Booking"
                        required
                        className="glass-input text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</label>
                      <select
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value)}
                        className="glass-input text-xs appearance-none"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        placeholder="8000"
                        required
                        className="glass-input text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Paid By</label>
                      <select
                        value={expensePaidBy}
                        onChange={(e) => setExpensePaidBy(e.target.value)}
                        required
                        className="glass-input text-xs appearance-none"
                      >
                        <option value="">Choose payer...</option>
                        <option value="Common Cash">Common Cash (from Kitty)</option>
                        {activeTrip.members.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date Paid</label>
                      <input
                        type="date"
                        value={expenseDate}
                        onChange={(e) => setExpenseDate(e.target.value)}
                        required
                        className="glass-input text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notes (Optional)</label>
                      <textarea
                        value={expenseNotes}
                        onChange={(e) => setExpenseNotes(e.target.value)}
                        placeholder="Details..."
                        rows="2"
                        className="glass-input text-xs resize-none"
                      />
                    </div>
                    <button type="submit" className="btn-primary text-xs font-bold py-2 px-4 shadow-glow mt-2">
                      {editingExpenseId ? 'Update Expense' : 'Record Expense'}
                    </button>
                    {editingExpenseId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingExpenseId(null);
                          setExpenseTitle('');
                          setExpenseCategory('Travel');
                          setExpenseAmount('');
                          setExpensePaidBy('');
                          setExpenseDate(new Date().toISOString().split('T')[0]);
                          setExpenseNotes('');
                        }}
                        className="btn-glass text-xs font-bold py-2 px-4 mt-1"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </form>
                </div>

                {/* Table */}
                <div className="glass-card p-6 rounded-2xl border border-white/5 lg:col-span-2">
                  <h3 className="text-sm font-bold text-slate-200 mb-4">Trip Expenses Ledger</h3>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-xs md:text-sm">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-400 font-bold">
                          <th className="pb-3 pl-2">Title</th>
                          <th className="pb-3">Category</th>
                          <th className="pb-3">Paid By</th>
                          <th className="pb-3 text-right">Amount</th>
                          <th className="pb-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeTrip.expenses.map((exp) => (
                          <tr key={exp._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                            <td className="py-3 font-semibold text-slate-100 pl-2">
                              <div>
                                <span className="block font-bold">{exp.title}</span>
                                <span className="text-[9px] text-slate-500">{new Date(exp.date).toLocaleDateString()}</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <span style={{ backgroundColor: categoryColors[exp.category] + '20', color: categoryColors[exp.category] }} className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-white/5">
                                {exp.category}
                              </span>
                            </td>
                            <td className="py-3 text-slate-300 font-semibold">{exp.paidBy}</td>
                            <td className="py-3 text-right font-black text-rose-400">-₹{exp.amount.toFixed(2)}</td>
                            <td className="py-3 text-center flex items-center justify-center gap-2">
                              <button
                                onClick={() => startEditExpense(exp)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-colors"
                                title="Edit Expense"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(exp._id)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                                title="Delete Expense"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {activeTrip.expenses.length === 0 && (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-slate-500 font-semibold">No expenses logged yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: SETTLEMENTS */}
            {activeTab === 'settlements' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Balance Sheet Table */}
                  <div className="glass-card p-6 rounded-2xl border border-white/5">
                    <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                      <Info className="w-4.5 h-4.5 text-cyan-400" />
                      Individual Balances Sheet
                    </h3>
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-slate-400 font-bold">
                            <th className="pb-3 pl-2">Participant</th>
                            <th className="pb-3 text-center">Group Size</th>
                            <th className="pb-3 text-right">Expected Share</th>
                            <th className="pb-3 text-right">Contributed</th>
                            <th className="pb-3 text-right">Paid Directly</th>
                            <th className="pb-3 text-right">Net Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeTrip.members.map((m) => {
                            // Sum contribution
                            const contributed = activeTrip.contributions
                              .filter(c => c.memberName === m.name)
                              .reduce((sum, c) => sum + c.amount, 0);

                            // Sum direct paid
                            const paidDirectly = activeTrip.expenses
                              .filter(e => e.paidBy === m.name)
                              .reduce((sum, e) => sum + e.amount, 0);

                            const netBalance = tripSummary.balances[m.name] || 0;
                            const mCount = m.memberCount || 1;
                            const expectedShare = tripSummary.perPersonShare * mCount;

                            return (
                              <tr key={m._id} className="border-b border-white/5">
                                <td className="py-3 font-semibold text-slate-200 pl-2">{m.name}</td>
                                <td className="py-3 text-center text-slate-400">{mCount} {mCount === 1 ? 'person' : 'people'}</td>
                                <td className="py-3 text-right text-slate-400">₹{expectedShare.toFixed(2)}</td>
                                <td className="py-3 text-right text-slate-400">₹{contributed.toFixed(2)}</td>
                                <td className="py-3 text-right text-slate-400">₹{paidDirectly.toFixed(2)}</td>
                                <td className={`py-3 text-right font-black ${
                                  netBalance > 0.01 ? 'text-emerald-400' :
                                  netBalance < -0.01 ? 'text-rose-400' : 'text-slate-500'
                                }`}>
                                  {netBalance > 0.01 ? '+' : ''}₹{netBalance.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                          {activeTrip.members.length === 0 && (
                            <tr>
                              <td colSpan="4" className="py-6 text-center text-slate-500 font-semibold">No participants yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Settlements Recommendations */}
                  <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                        <CreditCard className="w-4.5 h-4.5 text-indigo-400" />
                        Settlement Summary Plan
                      </h3>
                      <div className="flex flex-col gap-3">
                        {tripSummary.settlements.map((s, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex justify-between items-center">
                            <span className="text-xs text-slate-300 font-medium">
                              <span className="font-bold text-slate-200">{s.from}</span> pays{' '}
                              <span className="font-bold text-slate-200">{s.to}</span>
                            </span>
                            <span className="text-sm font-black text-indigo-400">₹{s.amount.toFixed(2)}</span>
                          </div>
                        ))}
                        {tripSummary.settlements.length === 0 && (
                          <div className="text-center py-10 text-xs font-semibold text-slate-500">
                            All expenses are perfectly settled! No transactions required.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4 mt-6 flex justify-end gap-2.5">
                      <button
                        onClick={() => handleExportCSV('settlements')}
                        className="btn-glass text-[10px] font-bold py-2 px-3 border border-white/5 flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Export Settlement CSV</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: AI INSIGHTS */}
            {activeTab === 'ai' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 md:p-8 rounded-3xl border border-white/5">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-bold text-slate-200">Trip Advisory Insights</h3>
                  </div>
                  <button
                    onClick={fetchAiInsights}
                    disabled={aiLoading || activeTrip.expenses.length === 0}
                    className="btn-primary text-xs font-semibold py-2 px-4 shadow-glow flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {aiLoading ? 'Analyzing...' : 'Generate Insights'}
                  </button>
                </div>

                {aiLoading ? (
                  <div className="py-12 flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-slate-400 font-bold">Analyzing trip ledger data...</span>
                  </div>
                ) : aiInsights ? (
                  <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/10 text-slate-300 font-medium text-xs md:text-sm leading-relaxed prose prose-invert max-w-none">
                    {aiInsights.split('\n').map((line, idx) => (
                      <p key={idx} className={line.trim().startsWith('-') || line.trim().startsWith('*') ? 'pl-4 -indent-4 my-1.5' : 'my-2'}>
                        {line}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-500 text-xs font-semibold">
                    {activeTrip.expenses.length === 0 
                      ? "Log some trip expenses to activate the AI advisory engine!"
                      : "Click 'Generate Insights' to request a budget analysis of this trip."}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* -------------------- PRINT-ONLY PDF REPORT TEMPLATE -------------------- */}
      {activeTrip && tripSummary && (
        <div className="hidden print:block absolute inset-0 bg-white text-slate-900 p-8 z-[99999]">
          <div className="border-b-4 border-slate-950 pb-4 mb-6">
            <h1 className="text-3xl font-black uppercase tracking-tight">ExpenseMate Trip Splitter Report</h1>
            <p className="text-sm font-semibold text-slate-600 mt-1">Trip Name: {activeTrip.name} // Destination: {activeTrip.destination}</p>
            <p className="text-sm font-semibold text-slate-600">Dates: {new Date(activeTrip.startDate).toLocaleDateString()} - {new Date(activeTrip.endDate).toLocaleDateString()}</p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6 text-center">
            <div className="border border-slate-300 p-3 rounded">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Collections</span>
              <span className="text-lg font-black">₹{tripSummary.totalContributions.toFixed(2)}</span>
            </div>
            <div className="border border-slate-300 p-3 rounded">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Expenses</span>
              <span className="text-lg font-black">₹{tripSummary.totalExpenses.toFixed(2)}</span>
            </div>
            <div className="border border-slate-300 p-3 rounded">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Kitty Balance</span>
              <span className="text-lg font-black">₹{tripSummary.remainingCommonCash.toFixed(2)}</span>
            </div>
            <div className="border border-slate-300 p-3 rounded">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Per Person Share ({tripSummary.totalPeopleCount || activeTrip.members.length} people)</span>
              <span className="text-lg font-black">₹{tripSummary.perPersonShare.toFixed(2)}</span>
            </div>
          </div>

          {/* Members Table */}
          <div className="mb-6">
            <h3 className="text-xs uppercase font-extrabold text-slate-800 border-b border-slate-400 pb-1 mb-2">Participant List ({activeTrip.members.length})</h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-1">Name</th>
                  <th className="py-1">Group Size</th>
                  <th className="py-1">Contact</th>
                </tr>
              </thead>
              <tbody>
                {activeTrip.members.map(m => (
                  <tr key={m._id} className="border-b border-slate-100">
                    <td className="py-1.5 font-bold">{m.name}</td>
                    <td className="py-1.5">{m.memberCount || 1} person/people</td>
                    <td className="py-1.5">{m.contact || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expenses Table */}
          <div className="mb-6">
            <h3 className="text-xs uppercase font-extrabold text-slate-800 border-b border-slate-400 pb-1 mb-2">Trip Expenses</h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-1">Title</th>
                  <th className="py-1">Category</th>
                  <th className="py-1">Paid By</th>
                  <th className="py-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {activeTrip.expenses.map(e => (
                  <tr key={e._id} className="border-b border-slate-100">
                    <td className="py-1.5 font-semibold">{e.title}</td>
                    <td className="py-1.5">{e.category}</td>
                    <td className="py-1.5">{e.paidBy}</td>
                    <td className="py-1.5 text-right font-bold">₹{e.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Settlements Table */}
          <div className="mb-6">
            <h3 className="text-xs uppercase font-extrabold text-slate-800 border-b border-slate-400 pb-1 mb-2">Settlement Summary</h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-1">From (Ower)</th>
                  <th className="py-1">To (Creditor)</th>
                  <th className="py-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {tripSummary.settlements.map((s, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-1.5 font-bold">{s.from}</td>
                    <td className="py-1.5 font-bold">{s.to}</td>
                    <td className="py-1.5 text-right font-black">₹{s.amount.toFixed(2)}</td>
                  </tr>
                ))}
                {tripSummary.settlements.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-3 text-center text-slate-500">All expenses are fully settled.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------- TRIP FORM MODAL -------------------- */}
      <AnimatePresence>
        {showTripModal && (
          <div className="fixed inset-0 flex items-center justify-center p-5 z-[999] overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTripModal(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg glass-card p-6 md:p-8 rounded-3xl relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-black mb-6">Create New Trip</h2>
              <form onSubmit={handleCreateTrip} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Trip Name</label>
                  <input
                    type="text"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    placeholder="e.g. Goa Trip 2026"
                    required
                    className="glass-input text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Destination</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Goa, India"
                    required
                    className="glass-input text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="glass-input text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="glass-input text-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Description (Optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description about the trip..."
                    rows="3"
                    className="glass-input text-sm resize-none"
                  />
                </div>
                <div className="flex items-center gap-3 justify-end mt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowTripModal(false)}
                    className="btn-glass text-xs font-semibold py-2.5 px-4"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary text-xs font-semibold py-2.5 px-6 shadow-glow"
                  >
                    Create Trip
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

export default TripSplitter;
