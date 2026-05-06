import React from 'react';

const SubjectCard = ({ subject }) => {
  const layers = [
    { label: 'Syllabus', key: 'overall_progress', color: 'from-blue-600 to-blue-400', shadow: 'shadow-blue-900/40' },
    { label: 'Revision 1', key: 'r1_progress', color: 'from-teal-500 to-teal-300', shadow: 'shadow-teal-900/40' },
    { label: 'Revision 2', key: 'r2_progress', color: 'from-emerald-500 to-emerald-300', shadow: 'shadow-emerald-900/40' },
    { label: 'Revision 3', key: 'r3_progress', color: 'from-amber-500 to-amber-300', shadow: 'shadow-amber-900/40' },
    { label: 'Revision 4', key: 'r4_progress', color: 'from-rose-500 to-rose-300', shadow: 'shadow-rose-900/40' },
  ];

  return (
    <div className="bg-[#111827]/60 border border-slate-800 p-8 rounded-[3rem] backdrop-blur-xl shadow-2xl space-y-6 group hover:border-slate-700 transition-all duration-500">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <h3 className="text-2xl font-black text-white tracking-tighter uppercase group-hover:text-blue-400 transition-colors">
          {subject.name}
        </h3>
      </div>
      
      <div className="space-y-5">
        {layers.map((layer) => (
          <div key={layer.label}>
            <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] mb-2">
              <span className="text-slate-500">{layer.label}</span>
              <span className="text-slate-300">{(subject[layer.key] || 0).toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
              <div 
                className={`bg-gradient-to-r ${layer.color} h-full transition-all duration-1000 ease-out ${layer.shadow} shadow-lg`} 
                style={{ width: `${subject[layer.key] || 0}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectCard;