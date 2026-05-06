import React from 'react';

const StreakCounter = ({ count = 5 }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-xl relative overflow-hidden group">
      <div className="relative z-10">
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Consistency Streak</p>
        <div className="text-5xl font-black text-white flex items-center gap-2 mt-1">
          {count} <span className="text-2xl text-orange-500 animate-pulse">🔥</span>
        </div>
        <p className="text-slate-400 text-xs mt-2 font-medium">Keep it up, Ashutosh!</p>
      </div>
      <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-orange-500/10 to-transparent group-hover:from-orange-500/20 transition-all"></div>
    </div>
  );
};

export default StreakCounter;