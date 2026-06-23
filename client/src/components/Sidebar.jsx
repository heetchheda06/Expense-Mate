import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfiles } from '../context/ProfileContext';
import { 
  LayoutDashboard, 
  TrendingDown, 
  TrendingUp, 
  Target, 
  Plane, 
  ScanBarcode, 
  BrainCircuit, 
  Settings, 
  User, 
  X, 
  Menu, 
  ChevronDown, 
  LogOut,
  GraduationCap,
  Flame,
  Sparkles,
  DollarSign,
  Briefcase
} from 'lucide-react';

const iconMap = {
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  Target,
  Plane,
  ScanBarcode,
  BrainCircuit,
  Settings,
  User,
  GraduationCap,
  Flame,
  Sparkles,
  DollarSign,
  Briefcase
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { profiles, activeProfile, selectProfile } = useProfiles();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Safe Lucide icon rendering utility
  const renderIcon = (name, className = "w-5 h-5") => {
    const IconComponent = iconMap[name] || User;
    return <IconComponent className={className} />;
  };

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { to: "/expenses", label: "Expenses", icon: "TrendingDown" },
    { to: "/incomes", label: "Income Tracker", icon: "TrendingUp" },
    { to: "/goals", label: "Savings Goals", icon: "Target" },
    { to: "/trips", label: "Trip Splitter", icon: "Plane" },
    { to: "/scanner", label: "OCR Bill Scanner", icon: "ScanBarcode" },
    { to: "/recommendations", label: "AI Rec Center", icon: "BrainCircuit" },
    { to: "/settings", label: "Profile Settings", icon: "Settings" }
  ];

  return (
    <>
      {/* Mobile Sticky Top Header */}
      <header className="md:hidden w-full flex items-center justify-between px-5 py-4 glass-card border-b border-white/5 z-40 sticky top-0">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            ExpenseMate
          </span>
          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            Beta
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Active profile dot indicators */}
          {activeProfile && (
            <div 
              style={{ backgroundColor: activeProfile.color }} 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
            >
              {activeProfile.name[0].toUpperCase()}
            </div>
          )}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-100 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar Layout container */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 glass-card border-r border-white/5 flex flex-col justify-between py-6 px-4 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:sticky md:h-screen`}
      >
        {/* Glow blob backgrounds inside sidebar */}
        <div className="glow-blob -top-20 -left-20 scale-50" />

        <div className="flex flex-col gap-6 z-10 w-full">
          {/* Logo banner */}
          <div className="hidden md:flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                ExpenseMate
              </span>
              <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AI
              </span>
            </div>
          </div>

          {/* Active Profile Quick Switcher */}
          {activeProfile && (
            <div className="relative mt-2">
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div 
                    style={{ backgroundColor: activeProfile.color }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/10"
                  >
                    {renderIcon(activeProfile.avatar, "w-5 h-5")}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100 line-clamp-1">{activeProfile.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">Active Profile</p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Profiles Dropdown list */}
              {showProfileDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-slate-950/95 border border-white/10 shadow-2xl z-50 backdrop-blur-xl animate-in fade-in-50 slide-in-from-top-3 duration-200">
                  <p className="text-[10px] uppercase font-bold text-slate-500 px-3 py-1">Swap Profile</p>
                  <div className="flex flex-col gap-1 mt-1 max-h-48 overflow-y-auto">
                    {profiles.map((p) => (
                      <button
                        key={p._id}
                        onClick={() => {
                          selectProfile(p);
                          setShowProfileDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                          p._id === activeProfile._id ? 'bg-white/5 text-slate-100' : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div 
                          style={{ backgroundColor: p.color }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                        >
                          {renderIcon(p.avatar, "w-4 h-4")}
                        </div>
                        <span className="text-xs font-semibold">{p.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-white/5 mt-2 pt-2">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate('/settings');
                      }}
                      className="w-full text-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 py-1"
                    >
                      + Manage Profiles
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Links navigation list */}
          <nav className="flex flex-col gap-1.5 mt-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all relative overflow-hidden ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-600/30 to-cyan-500/30 text-indigo-200 border-l-4 border-brand-primary shadow-glow shadow-indigo-500/5' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {renderIcon(link.icon, `w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`)}
                    <span>{link.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer session widgets */}
        <div className="flex flex-col gap-4 border-t border-white/5 pt-4 z-10">
          {user && (
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center font-bold text-indigo-300 text-sm">
                  {user.name[0].toUpperCase()}
                </div>
                <div className="leading-tight">
                  <h5 className="text-xs font-semibold text-slate-100 line-clamp-1">{user.name}</h5>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{user.email}</p>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border border-white/5 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 text-sm font-semibold transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}
    </>
  );
};

export default Sidebar;
