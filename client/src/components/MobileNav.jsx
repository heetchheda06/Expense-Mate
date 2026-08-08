import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingDown, 
  ScanBarcode, 
  BrainCircuit, 
  Settings 
} from 'lucide-react';

const MobileNav = () => {
  const items = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/expenses", label: "Expenses", icon: TrendingDown },
    { to: "/scanner", label: "OCR Scan", icon: ScanBarcode },
    { to: "/recommendations", label: "AI Recs", icon: BrainCircuit },
    { to: "/settings", label: "Settings", icon: Settings }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-white/10 bg-[#080B11]/90 backdrop-blur-xl px-2 py-2 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'text-indigo-400 font-extrabold scale-105 bg-indigo-500/10 border border-indigo-500/20 shadow-glow'
                    : 'text-slate-400 hover:text-slate-200 font-medium'
                }`
              }
            >
              <IconComponent className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
