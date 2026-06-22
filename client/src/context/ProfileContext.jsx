import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [loading, setLoading] = useState(() => !!localStorage.getItem('expensemate_token'));

  // Fetch profiles list from DB
  const fetchProfiles = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/profiles');
      if (res.data.success) {
        setProfiles(res.data.data);
        
        // Recover last active profile selection from localStorage
        const storedProfileId = localStorage.getItem('expensemate_active_profile_id');
        const match = res.data.data.find(p => p._id === storedProfileId);
        
        if (match) {
          setActiveProfile(match);
        } else if (res.data.data.length > 0) {
          setActiveProfile(res.data.data[0]);
          localStorage.setItem('expensemate_active_profile_id', res.data.data[0]._id);
        } else {
          setActiveProfile(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch profiles:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfiles();
    } else {
      setLoading(false);
    }
  }, [user, fetchProfiles]);

  // Switch between profiles
  const selectProfile = (profile) => {
    setActiveProfile(profile);
    localStorage.setItem('expensemate_active_profile_id', profile._id);
    showToast(`Switched profile to "${profile.name}"`, 'info', 2000);
  };

  // Add profile
  const addProfile = async (name, avatar, color, monthlyBudget) => {
    if (profiles.length >= 5) {
      showToast('Limit reached: A maximum of 5 profiles is allowed.', 'warning');
      return false;
    }
    try {
      const res = await api.post('/profiles', { name, avatar, color, monthlyBudget });
      if (res.data.success) {
        setProfiles(prev => [...prev, res.data.data]);
        showToast(`Profile "${name}" created successfully.`, 'success');
        
        // Auto-select if first profile
        if (profiles.length === 0) {
          selectProfile(res.data.data);
        }
        return true;
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create profile.', 'error');
      return false;
    }
  };

  // Update profile
  const updateProfile = async (id, fields) => {
    try {
      const res = await api.patch(`/profiles/${id}`, fields);
      if (res.data.success) {
        setProfiles(prev => prev.map(p => p._id === id ? res.data.data : p));
        showToast('Profile settings updated.', 'success');
        
        // Sync active profile state if updated
        if (activeProfile && activeProfile._id === id) {
          setActiveProfile(res.data.data);
        }
        return true;
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
      return false;
    }
  };

  // Delete profile
  const deleteProfile = async (id) => {
    try {
      const res = await api.delete(`/profiles/${id}`);
      if (res.data.success) {
        setProfiles(prev => prev.filter(p => p._id !== id));
        showToast('Profile and transactions deleted successfully.', 'success');
        
        // Select another active profile if active was deleted
        const remaining = profiles.filter(p => p._id !== id);
        if (activeProfile && activeProfile._id === id) {
          if (remaining.length > 0) {
            selectProfile(remaining[0]);
          } else {
            setActiveProfile(null);
            localStorage.removeItem('expensemate_active_profile_id');
          }
        }
        return true;
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete profile.', 'error');
      return false;
    }
  };

  return (
    <ProfileContext.Provider value={{
      profiles,
      activeProfile,
      loading,
      fetchProfiles,
      selectProfile,
      addProfile,
      updateProfile,
      deleteProfile
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfiles = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfiles must be used within a ProfileProvider');
  }
  return context;
};
