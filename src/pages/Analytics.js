import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, collectionGroup, onSnapshot, getDocs } from 'firebase/firestore';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  ComposedChart, Area, CartesianGrid, Legend, Cell 
} from 'recharts';

const Analytics = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Create a Lookup Map for Subject Names
      const subjectsSnap = await getDocs(collection(db, "subjects"));
      const nameMap = {};
      subjectsSnap.forEach(doc => {
        nameMap[doc.id] = doc.data().name;
      });

      // 2. Listen to performance data
      const unsub = onSnapshot(collectionGroup(db, "subtopics"), (snap) => {
        const subjectStats = {};

        snap.docs.forEach(doc => {
          const pathSegments = doc.ref.path.split('/');
          const subjectId = pathSegments[1]; 
          const sData = doc.data();

          // Use the name from our map instead of the ID
          const subjectName = nameMap[subjectId] || "Unknown Subject";

          if (!subjectStats[subjectName]) {
            subjectStats[subjectName] = { 
              name: subjectName, 
              attempted: 0, 
              correct: 0, 
              mainsScore: 0, 
              mainsEntries: 0 
            };
          }

          subjectStats[subjectName].attempted += (sData.mcq_pyq_stats?.attempted || 0);
          subjectStats[subjectName].correct += (sData.mcq_pyq_stats?.correct || 0);
          
          if (sData.mains_marks > 0) {
            subjectStats[subjectName].mainsScore += sData.mains_marks;
            subjectStats[subjectName].mainsEntries += 1;
          }
        });

        const formatted = Object.values(subjectStats).map(s => ({
          subject: s.name.length > 12 ? s.name.substring(0, 10) + '..' : s.name,
          accuracy: s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0,
          mainsAvg: s.mainsEntries > 0 ? parseFloat((s.mainsScore / s.mainsEntries).toFixed(1)) : 0,
          attempted: s.attempted
        }));

        setData(formatted);
        setLoading(false);
      });

      return unsub;
    };

    const unsubscribePromise = fetchData();
    return () => {
      unsubscribePromise.then(unsub => unsub && unsub());
    };
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f172a] border border-slate-700 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
          <p className="text-white font-black mb-2 uppercase tracking-tighter">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs font-bold" style={{ color: entry.color }}>
              {entry.name}: {entry.value}{entry.name === 'Accuracy %' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-blue-500 font-black animate-pulse uppercase tracking-[0.3em]">Mapping Subject Data...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 px-6">
      <header className="pt-6">
        <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">Performance Lab</h1>
        <p className="text-slate-500 font-medium ml-1">Analyzing accuracy for {data.length} subjects</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div className="bg-[#111827]/40 border border-slate-800/50 p-1 rounded-[3rem] backdrop-blur-xl shadow-2xl">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8 text-center">MCQ Mastery vs Volume</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="subject" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                <Area type="monotone" dataKey="attempted" fill="#1e293b" stroke="#334155" name="Total Questions" />
                <Bar dataKey="accuracy" name="Accuracy %" radius={[6, 6, 0, 0]} barSize={30}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.accuracy > 70 ? '#10b981' : '#3b82f6'} />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#111827]/40 border border-slate-800/50 p-8 rounded-[3rem] backdrop-blur-xl shadow-2xl">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8 text-center">Mains Prep Balance</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                <Radar
                  name="Mains Score (Avg)"
                  dataKey="mainsAvg"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.5}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.map(item => (
          <div key={item.subject} className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-blue-500/30 transition-all group">
            <h4 className="text-white font-black uppercase text-xs mb-4 truncate group-hover:text-blue-400 transition-colors">{item.subject}</h4>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Accuracy</p>
                <p className="text-xl font-black text-blue-400">{item.accuracy}%</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Mains Avg</p>
                <p className="text-xl font-black text-emerald-400">{item.mainsAvg}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;