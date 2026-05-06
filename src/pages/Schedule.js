import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { db } from '../services/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { addDays, format, isSameDay } from 'date-fns';
import 'react-calendar/dist/Calendar.css';

const Schedule = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all pending tasks to project them forward
    const q = query(
      collection(db, "study_plan"),
      where("status", "==", "pending"),
      orderBy("queue_order", "asc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const pendingTasks = snap.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        // Project the date based on queue position
        projectedDate: addDays(new Date(), index) 
      }));
      setTasks(pendingTasks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Find tasks matching the clicked calendar date
  const tasksForSelectedDate = tasks.filter(t => isSameDay(t.projectedDate, selectedDate));

  if (loading) return <div className="p-10 text-blue-500 font-black italic">CALCULATING PROJECTIONS...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-6 pt-10">
      <header>
        <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">Strategic Timeline</h1>
        <p className="text-slate-500 font-medium ml-1">Predictive 280-day syllabus trajectory</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Dark Themed Calendar Container */}
        <div className="lg:col-span-2 bg-[#0f172a]/60 border border-slate-800 p-6 rounded-[3rem] shadow-2xl backdrop-blur-xl">
          <style>{`
            .react-calendar { background: transparent; border: none; font-family: inherit; width: 100%; color: white; }
            .react-calendar__tile--now { background: #1e293b !important; border-radius: 12px; }
            .react-calendar__tile--active { background: #3b82f6 !important; border-radius: 12px; color: white !important; }
            .react-calendar__navigation button { color: white; font-weight: 900; text-transform: uppercase; }
            .react-calendar__month-view__weekdays__weekday { color: #64748b; font-size: 10px; font-weight: 900; text-transform: uppercase; }
            .react-calendar__tile:hover { background: #1e293b; border-radius: 12px; }
          `}</style>
          <Calendar 
            onChange={setSelectedDate} 
            value={selectedDate}
            tileContent={({ date }) => {
              const hasTask = tasks.some(t => isSameDay(t.projectedDate, date));
              return hasTask ? <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mx-auto mt-1 shadow-[0_0_8px_#3b82f6]"></div> : null;
            }}
          />
        </div>

        {/* Selected Date Task List */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800">
            <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">
              Agenda: {format(selectedDate, 'dd MMM yyyy')}
            </h2>
            
            {tasksForSelectedDate.length > 0 ? tasksForSelectedDate.map(task => (
              <div key={task.id} className="space-y-4">
                <span className="inline-block bg-blue-600/20 text-blue-400 text-[8px] font-black px-3 py-1 rounded-full border border-blue-500/20 uppercase">
                  {task.subject}
                </span>
                <h3 className="text-xl font-bold text-white leading-tight">{task.topic_name}</h3>
                <div className="space-y-2">
                  {task.subtopics.map((s, i) => (
                    <p key={i} className="text-slate-400 text-xs flex items-center gap-2">
                      <div className="w-1 h-1 bg-slate-600 rounded-full" /> {s}
                    </p>
                  ))}
                </div>
              </div>
            )) : (
              <p className="text-slate-600 text-xs font-bold italic py-10 text-center">No projected tasks for this date.</p>
            )}
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-[2.5rem]">
             <p className="text-[9px] font-black text-emerald-500 uppercase mb-1">Queue Health</p>
             <p className="text-white text-xs font-medium">Your schedule automatically shifts if you complete tasks faster or slower than planned.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;