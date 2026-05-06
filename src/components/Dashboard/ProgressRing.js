import React from 'react';

const ProgressRing = ({ percentage, label, color = "#3b82f6", small = false }) => {
  const radius = small ? 60 : 85;
  const stroke = small ? 6 : 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`bg-[#1e293b]/30 border border-slate-800/50 backdrop-blur-md rounded-[2.5rem] flex flex-col items-center justify-center relative shadow-2xl transition-transform hover:scale-105 duration-500 ${small ? 'p-6' : 'p-8'}`}>
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle stroke="#0f172a" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
        <circle
          stroke={color}
          fill="transparent"
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
          strokeWidth={stroke}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`${small ? 'text-lg' : 'text-3xl'} font-black text-white tracking-tighter`}>{percentage}%</span>
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1 text-center">{label}</span>
      </div>
    </div>
  );
};

export default ProgressRing;