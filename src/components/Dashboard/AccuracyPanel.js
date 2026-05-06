import React from 'react';

const AccuracyPanel = ({ subjects }) => {
  // Aggregate stats across all subjects
  const totalAttempted = 1250; // Mock data until we plug real aggregation logic
  const totalCorrect = 980;
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between col-span-2">
      <div className="space-y-1">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">MCQ Performance</p>
        <div className="text-4xl font-black text-white">{accuracy}%</div>
        <p className="text-emerald-400 text-sm font-medium">Avg. Accuracy</p>
      </div>
      
      <div className="flex gap-8 border-l border-slate-800 pl-8">
        <div className="text-center">
          <p className="text-slate-500 text-[10px] font-bold uppercase">Attempted</p>
          <p className="text-xl font-bold text-slate-200">{totalAttempted}</p>
        </div>
        <div className="text-center">
          <p className="text-slate-500 text-[10px] font-bold uppercase">Correct</p>
          <p className="text-xl font-bold text-emerald-400">{totalCorrect}</p>
        </div>
      </div>
    </div>
  );
};

export default AccuracyPanel;