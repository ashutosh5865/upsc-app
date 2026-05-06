import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, collectionGroup, query, where, orderBy } from 'firebase/firestore';
import { format, subDays } from 'date-fns';
import Countdown from '../components/Dashboard/Countdown';
import SubjectCard from '../components/Dashboard/SubjectCard';
import ProgressRing from '../components/Dashboard/ProgressRing';
import StreakCounter from '../components/Dashboard/StreakCounter';

const Dashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState({ 
    syllabus: 0, 
    r1: 0, r2: 0, r3: 0, r4: 0,
    globalAccuracy: 0 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listen for Subject Cards
    const unsubSubs = onSnapshot(collection(db, "subjects"), (snap) => {
      setSubjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 2. Dynamic Streak Calculation (from study_plan history)
    const qHistory = query(
      collection(db, "study_plan"), 
      where("status", "==", "completed"),
      orderBy("completion_date", "desc")
    );

    const unsubStreak = onSnapshot(qHistory, (snap) => {
      const completedTasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const uniqueDates = [...new Set(completedTasks.map(t => 
        format(t.completion_date.toDate(), 'yyyy-MM-dd')
      ))];
      
      let currentStreak = 0;
      let checkDate = new Date();
      
      const hasTaskToday = uniqueDates.includes(format(checkDate, 'yyyy-MM-dd'));
      const hasTaskYesterday = uniqueDates.includes(format(subDays(checkDate, 1), 'yyyy-MM-dd'));

      if (hasTaskToday || hasTaskYesterday) {
        if (!hasTaskToday) checkDate = subDays(checkDate, 1);
        while (uniqueDates.includes(format(checkDate, 'yyyy-MM-dd'))) {
          currentStreak++;
          checkDate = subDays(checkDate, 1);
        }
      }
      setStreak(currentStreak);
    });

    // 3. Aggregate Global Metrics (Syllabus & Revisions) - Original Logic
    const unsubTopics = onSnapshot(collectionGroup(db, "subtopics"), (snap) => {
      const allSubtopics = snap.docs.map(doc => doc.data());
      const total = allSubtopics.length;
      
      let globalAttempted = 0;
      let globalCorrect = 0;

      if (total > 0) {
        const calcProgress = (field, subField = null) => {
          const count = allSubtopics.filter(s => subField ? s[field]?.[subField] : s[field]).length;
          return parseFloat(((count / total) * 100).toFixed(2));
        };

        allSubtopics.forEach(s => {
          globalAttempted += (s.mcq_pyq_stats?.attempted || 0);
          globalCorrect += (s.mcq_pyq_stats?.correct || 0);
        });

        const efficiency = globalAttempted > 0 
          ? parseFloat(((globalCorrect / globalAttempted) * 100).toFixed(1)) 
          : 0;

        setStats({
          syllabus: calcProgress('reading_done'),
          r1: calcProgress('revisions', 'r1'),
          r2: calcProgress('revisions', 'r2'),
          r3: calcProgress('revisions', 'r3'),
          r4: calcProgress('revisions', 'r4'),
          globalAccuracy: efficiency
        });
      }
      setLoading(false);
    });

    return () => { unsubSubs(); unsubStreak(); unsubTopics(); };
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center text-blue-500 font-black animate-pulse">SYNCING COMMAND CENTER...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-6">
      <header className="pt-6">
        <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">Control Room</h1>
        <p className="text-slate-500 font-medium ml-1 uppercase tracking-widest text-[10px]">
          Precision tracking for Ashutosh Panda
        </p>
      </header>

      {/* Row 1: Primary Stats & Countdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Countdown targetDate="2027-05-30" />
        <ProgressRing percentage={stats.syllabus} label="Overall Syllabus" color="#3b82f6" />
        
        {/* Requirement 1: Dynamic Streak */}
        <StreakCounter count={streak} />
        
        <div className="bg-[#1e293b]/40 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl flex flex-col justify-center">
           <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Efficiency</p>
           <div className="flex items-baseline gap-1">
             <p className="text-3xl font-black text-emerald-400 mt-1">{stats.globalAccuracy}%</p>
           </div>
           <p className="text-slate-500 text-xs mt-1 italic">Based on aggregate accuracy</p>
        </div>
      </div>

      {/* Row 2: Global Revision Progress */}
      <div>
        <h2 className="text-xs font-black text-slate-500 mb-6 uppercase tracking-[0.3em] flex items-center gap-3">
          Global Revision Layers
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <ProgressRing percentage={stats.r1} label="Revision 1" color="#2dd4bf" small />
          <ProgressRing percentage={stats.r2} label="Revision 2" color="#10b981" small />
          <ProgressRing percentage={stats.r3} label="Revision 3" color="#f59e0b" small />
          <ProgressRing percentage={stats.r4} label="Revision 4" color="#ef4444" small />
        </div>
      </div>

      {/* Row 3: Subject Breakdown */}
      <div className="pt-4">
        <h2 className="text-xs font-black text-slate-500 mb-6 uppercase tracking-[0.3em] flex items-center gap-3">
          Subject Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {subjects.map(subject => <SubjectCard key={subject.id} subject={subject} />)}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;