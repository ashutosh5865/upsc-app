import React, { useState, useEffect } from 'react';

const Countdown = ({ targetDate }) => {
  const [days, setDays] = useState(0);

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(targetDate) - new Date();
      setDays(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))));
    };
    calculate();
    const timer = setInterval(calculate, 1000 * 60 * 60); // Update hourly
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
      <div className="relative z-10">
        <p className="text-blue-100 text-xs font-bold uppercase tracking-[0.2em] mb-1">Days to Prelims</p>
        <div className="text-7xl font-black text-white flex items-baseline gap-2">
          {days}
          <span className="text-xl font-light text-blue-200">DAYS</span>
        </div>
      </div>
      {/* Decorative background circle */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
    </div>
  );
};

export default Countdown;