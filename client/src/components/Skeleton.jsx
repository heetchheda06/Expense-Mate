import React from 'react';

export const CardSkeleton = () => (
  <div className="glass-card p-6 rounded-2xl animate-pulse flex flex-col gap-3">
    <div className="w-1/3 h-4 bg-white/10 rounded" />
    <div className="w-2/3 h-8 bg-white/10 rounded" />
    <div className="w-1/2 h-3 bg-white/10 rounded" />
  </div>
);

export const ChartSkeleton = () => (
  <div className="glass-card p-6 rounded-2xl animate-pulse flex flex-col gap-4 h-80 justify-end">
    <div className="w-1/4 h-5 bg-white/10 rounded self-start" />
    <div className="flex items-end justify-between gap-4 h-48 px-4">
      <div className="w-8 h-20 bg-white/10 rounded" />
      <div className="w-8 h-40 bg-white/10 rounded" />
      <div className="w-8 h-32 bg-white/10 rounded" />
      <div className="w-8 h-12 bg-white/10 rounded" />
      <div className="w-8 h-36 bg-white/10 rounded" />
      <div className="w-8 h-24 bg-white/10 rounded" />
    </div>
  </div>
);

export const ListSkeleton = () => (
  <div className="flex flex-col gap-3">
    {[1, 2, 3].map((n) => (
      <div key={n} className="glass-card p-4 rounded-xl flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10" />
          <div className="flex flex-col gap-2">
            <div className="w-24 h-4 bg-white/10 rounded" />
            <div className="w-16 h-3 bg-white/10 rounded" />
          </div>
        </div>
        <div className="w-12 h-6 bg-white/10 rounded" />
      </div>
    ))}
  </div>
);
