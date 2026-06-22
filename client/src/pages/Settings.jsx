import React, { useState } from 'react';
import { useProfiles } from '../context/ProfileContext';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2, Edit2, Check, User, Briefcase, Flame, Sparkles, DollarSign, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const { profiles, activeProfile, addProfile, updateProfile, deleteProfile, selectProfile } = useProfiles();
  const { showToast } = useToast();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Field States
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('Briefcase');
  const [color, setColor] = useState('#4F46E5'); // Default Indigo
  const [monthlyBudget, setMonthlyBudget] = useState('');

  // Icon options
  const avatarOptions = [
    { value: 'Briefcase', label: 'Work & Career' },
    { value: 'User', label: 'Personal Living' },
    { value: 'Flame', label: 'Club / Travel' },
    { value: 'Sparkles', label: 'Project / Hobbies' },
    { value: 'DollarSign', label: 'Salary / Wage' }
  ];

  // Color options
  const colorOptions = [
    { value: '#4F46E5', name: 'Indigo' },
    { value: '#06B6D4', name: 'Cyan' },
    { value: '#10B981', name: 'Emerald' },
    { value: '#EC4899', name: 'Pink' },
    { value: '#F59E0B', name: 'Amber' }
  ];

  // Safe Lucide icon rendering utility
  const getAvatarComponent = (name, className = "w-5 h-5") => {
    switch (name) {
      case 'Briefcase': return <Briefcase className={className} />;
      case 'User': return <User className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'DollarSign': return <DollarSign className={className} />;
      default: return <User className={className} />;
    }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    if (!name) return;

    if (profiles.length >= 5) {
      showToast('Profile limit exceeded: You can only have up to 5 profiles.', 'warning');
      return;
    }

    const success = await addProfile(
      name,
      avatar,
      color,
      monthlyBudget ? parseFloat(monthlyBudget) : 0
    );

    if (success) {
      setShowAddForm(false);
      resetForm();
    }
  };

  const handleStartEdit = (profile) => {
    setEditingId(profile._id);
    setName(profile.name);
    setAvatar(profile.avatar);
    setColor(profile.color);
    setMonthlyBudget(profile.monthlyBudget.toString());
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name || !editingId) return;

    const success = await updateProfile(editingId, {
      name,
      avatar,
      color,
      monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : 0
    });

    if (success) {
      setEditingId(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setName('');
    setAvatar('Briefcase');
    setColor('#4F46E5');
    setMonthlyBudget('');
  };

  const handleDeleteProfile = (id, pName) => {
    if (window.confirm(`Warning: Deleting profile "${pName}" will wipe ALL its transactions, incomes, and goals. Continue?`)) {
      deleteProfile(id);
    }
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 w-full max-w-4xl mx-auto z-10 relative">
      <div className="glow-blob top-10 right-10 scale-75" />

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Profile Settings</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Configure multiple profiles ({profiles.length}/5) and customize monthly budget limits
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mt-4">
        {/* 1. Profiles CRUD listing panel (2/3 width) */}
        <div className="flex flex-col gap-4 md:col-span-2">
          <div className="glass-card p-6 rounded-3xl border border-white/5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-300">Active Account Profiles</h3>
              {!showAddForm && !editingId && profiles.length < 5 && (
                <button
                  onClick={() => { resetForm(); setShowAddForm(true); }}
                  className="btn-primary text-xs font-semibold py-1.5 px-3 flex items-center gap-1.5 shadow-glow"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Profile</span>
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {profiles.map((profile) => (
                <div
                  key={profile._id}
                  className={`p-4 rounded-2xl flex items-center justify-between transition-all border ${
                    activeProfile && activeProfile._id === profile._id
                      ? 'bg-slate-900/60 border-indigo-500/20 shadow-glow shadow-indigo-500/2'
                      : 'bg-slate-900/20 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => selectProfile(profile)}
                      style={{ backgroundColor: profile.color }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg relative cursor-pointer"
                    >
                      {getAvatarComponent(profile.avatar)}
                      {activeProfile && activeProfile._id === profile._id && (
                        <div className="absolute -top-1 -right-1 bg-indigo-500 border border-slate-950 rounded-full p-0.5">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-200">{profile.name}</span>
                        {profile.monthlyBudget > 0 && (
                          <span className="text-[10px] font-semibold text-slate-400">
                            Budget: ${profile.monthlyBudget}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Click icon to set as active</p>
                    </div>
                  </div>

                  {editingId !== profile._id && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(profile)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-indigo-400 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProfile(profile._id, profile.name)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Add / Edit Profile Form drawer (1/3 width) */}
        <div className="md:col-span-1">
          <AnimatePresence>
            {(showAddForm || editingId) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500" />
                
                <h3 className="text-sm font-bold text-slate-200 mb-5">
                  {editingId ? 'Edit Profile Settings' : 'Create Budget Profile'}
                </h3>

                <form onSubmit={editingId ? handleUpdateProfile : handleCreateProfile} className="flex flex-col gap-4">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">Profile Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Personal Account"
                      required
                      maxLength="15"
                      className="glass-input text-xs py-2"
                    />
                  </div>

                  {/* Monthly Budget */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">Monthly Budget Limit ($)</label>
                    <input
                      type="number"
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(e.target.value)}
                      placeholder="e.g. 500 (0 for unlimited)"
                      min="0"
                      className="glass-input text-xs py-2"
                    />
                  </div>

                  {/* Icon Option selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">Avatar Profile Icon</label>
                    <div className="grid grid-cols-5 gap-2">
                      {avatarOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setAvatar(opt.value)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                            avatar === opt.value
                              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                              : 'bg-slate-900/50 border-white/5 text-slate-400 hover:text-slate-200'
                          }`}
                          title={opt.label}
                        >
                          {getAvatarComponent(opt.value, "w-4 h-4")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color option selectors */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">Color Palette Theme</label>
                    <div className="flex gap-2">
                      {colorOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setColor(opt.value)}
                          style={{ backgroundColor: opt.value }}
                          className={`w-6 h-6 rounded-full transition-transform ${
                            color === opt.value ? 'scale-110 border-2 border-white' : 'opacity-70 hover:opacity-100'
                          }`}
                          title={opt.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 justify-end mt-4">
                    <button
                      type="button"
                      onClick={() => { setShowAddForm(false); setEditingId(null); resetForm(); }}
                      className="btn-glass text-[10px] font-bold py-2 px-3"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary text-[10px] font-bold py-2 px-4 shadow-glow"
                    >
                      {editingId ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
