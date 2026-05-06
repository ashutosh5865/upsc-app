import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { 
  collection, query, where, orderBy, limit, 
  onSnapshot, doc, updateDoc, Timestamp, getCountFromServer 
} from 'firebase/firestore';
import { format, differenceInDays } from 'date-fns';

const Today = () => {
  const [currentTask, setCurrentTask] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [progress, setProgress] = useState({ completed: 0, total: 280 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Live Listen for Current Objective
    const qTask = query(
      collection(db, "study_plan"),
      where("status", "==", "pending"),
      orderBy("queue_order", "asc"),
      limit(1)
    );

    const unsubTask = onSnapshot(qTask, (snap) => {
      if (!snap.empty) {
        setCurrentTask({ id: snap.docs[0].id, ...snap.docs[0].data() });
      }
      setLoading(false);
    });

    // 2. Automated Revision Engine (7, 15, 45, 60 day logic)
    const qRev = query(collection(db, "study_plan"), where("status", "==", "completed"));
    const unsubRev = onSnapshot(qRev, (snap) => {
      const today = new Date();
      const dueRevisions = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(task => {
          if (!task.completion_date) return false;
          const diff = differenceInDays(today, task.completion_date.toDate());
          return [7, 15, 45, 60].includes(diff);
        });
      setRevisions(dueRevisions);
      
      // Update global progress count
      setProgress(prev => ({ ...prev, completed: snap.size }));
    });

    return () => { unsubTask(); unsubRev(); };
  }, []);

  const handleComplete = async (taskId) => {
    const ref = doc(db, "study_plan", taskId);
    await updateDoc(ref, {
      status: "completed",
      completion_date: Timestamp.now()
    });
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-blue-500 font-black animate-pulse">INITIATING MISSION PARAMETERS...</div>;

  const progressPercent = Math.round((progress.completed / progress.total) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-6">
      {/* Dynamic Header & Progress */}
      <header className="pt-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">Command Center</h1>
            <p className="text-slate-500 font-bold ml-1 uppercase tracking-widest text-[10px]">Current Date: {format(new Date(), 'dd MMMM yyyy')}</p>
          </div>
          <div className="text-right">
             <p className="text-slate-500 text-[10px] font-black uppercase mb-1">Global Completion</p>
             <p className="text-2xl font-black text-blue-500 tracking-tighter">{progressPercent}%</p>
          </div>
        </div>
        
        {/* Progress Bar[cite: 2] */}
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.5)]" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
           <p className="text-slate-600 text-[9px] font-bold uppercase">Day 1: Polity Launch</p>
           <p className="text-slate-600 text-[9px] font-bold uppercase">Day 280: Syllabus Clearance</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-4">
             <h2 className="text-xs font-black text-blue-500 uppercase tracking-[0.3em]">Next Unit in Queue</h2>
             <div className="h-px flex-1 bg-slate-800" />
          </div>

          {currentTask ? (
            <div className="bg-[#0f172a]/60 border border-slate-800 p-10 rounded-[3.5rem] shadow-2xl backdrop-blur-xl relative group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <span className="text-[10rem] font-black text-white italic leading-none">#{currentTask.queue_order}</span>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-blue-600/20 text-blue-400 text-[10px] font-black px-4 py-1.5 rounded-full border border-blue-500/20 uppercase tracking-widest">
                    {currentTask.subject}
                  </span>
                  <span className="bg-slate-800 text-slate-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                    1 HR Current Affairs
                  </span>
                </div>

                <h3 className="text-4xl font-black text-white mb-8 uppercase tracking-tight leading-none">{currentTask.topic_name}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                  {currentTask.subtopics.map((sub, i) => (
                    <div key={i} className="flex items-start gap-3 text-slate-300 font-medium bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 hover:border-blue-500/30 transition-colors">
                      <div className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                      <span className="text-sm">{sub}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 mb-10">
                  <div className="flex-1 bg-emerald-500/5 p-5 rounded-3xl border border-emerald-500/10 text-center">
                    <p className="text-slate-500 text-[9px] font-black uppercase mb-1">MCQ Mastery</p>
                    <p className="text-2xl font-black text-emerald-400">15 Qs</p>
                  </div>
                  <div className="flex-1 bg-cyan-500/5 p-5 rounded-3xl border border-cyan-500/10 text-center">
                    <p className="text-slate-500 text-[9px] font-black uppercase mb-1">Mains Draft</p>
                    <p className="text-2xl font-black text-cyan-400">1 Answer</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleComplete(currentTask.id)}
                  className="w-full py-6 bg-white text-slate-900 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] active:scale-95"
                >
                  Confirm Unit Completion
                </button>
              </div>
            </div>
          ) : (
            <div className="p-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-[4rem] text-center">
               <p className="text-slate-500 font-black italic uppercase tracking-widest">Syllabus Deployment Complete. Well done, aspirant.</p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-4">
             <h2 className="text-xs font-black text-rose-500 uppercase tracking-[0.3em]">Revision Protocol</h2>
             <div className="h-px flex-1 bg-slate-800" />
          </div>
          
          <div className="space-y-4">
            {revisions.length > 0 ? revisions.map(rev => (
              <div key={rev.id} className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-[2.5rem] hover:bg-rose-500/10 transition-all group">
                <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">{rev.subject}</p>
                <h4 className="text-white font-bold text-base mt-1 group-hover:text-rose-200 transition-colors">{rev.topic_name}</h4>
                <div className="mt-4 flex items-center gap-2">
                   <div className="px-2 py-1 bg-rose-500 text-white text-[8px] font-black rounded uppercase">Active Cycle</div>
                </div>
              </div>
            )) : (
              <div className="p-10 border border-dashed border-slate-800 rounded-[2.5rem] text-center bg-slate-900/10">
                <p className="text-slate-600 text-xs font-black uppercase tracking-tighter italic">No Scheduled Revisions Today</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Today;