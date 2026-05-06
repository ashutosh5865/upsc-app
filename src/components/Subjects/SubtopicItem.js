import React from 'react';
import { db } from '../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useProgressUpdater } from '../../hooks/useProgressUpdater';

/**
 * SubtopicItem Component
 * Handles individual subtopic status, revision cycles, and performance metrics.
 */
const SubtopicItem = ({ sub, subjectId, topicId, onOpenDrawer, openModal }) => {
  const { refreshSubjectProgress } = useProgressUpdater();

  /**
   * Universal toggle handler for reading and revision status
   * Triggers the high-speed roll-up calculation for the parent subject.
   */
  const handleToggle = async (field, currentValue, isRevision = false, cycleNum = null) => {
    const ref = doc(db, "subjects", subjectId, "topics", topicId, "subtopics", sub.id);
    
    let updateData = {};
    if (isRevision) {
      updateData[`revisions.r${cycleNum}`] = !currentValue;
    } else {
      updateData[field] = !currentValue;
    }

    try {
      // Optimistic-like behavior: update DB and trigger roll-up immediately
      await updateDoc(ref, updateData);
      refreshSubjectProgress(subjectId); 
    } catch (e) {
      console.error("Failed to update subtopic status:", e);
    }
  };

  /**
   * Performance Metrics Handlers (Requirement 8 & 9)
   */
  const updateMcqStats = async (field, value) => {
    const val = parseInt(value) || 0;
    const ref = doc(db, "subjects", subjectId, "topics", topicId, "subtopics", sub.id);
    await updateDoc(ref, { [`mcq_pyq_stats.${field}`]: val });
  };

  const updateMainsMarks = async (value) => {
    const val = parseFloat(value) || 0;
    const ref = doc(db, "subjects", subjectId, "topics", topicId, "subtopics", sub.id);
    await updateDoc(ref, { mains_marks: val });
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#1e293b]/30 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group shadow-sm">
      
      {/* Top Row: Name, Status, and Revision Cycles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Requirement 5: Reading Checkbox */}
          <input 
            type="checkbox" 
            checked={sub.reading_done || false} 
            onChange={() => handleToggle('reading_done', sub.reading_done)}
            className="w-5 h-5 rounded-md border-slate-700 bg-slate-900 text-blue-500 cursor-pointer focus:ring-0"
          />
          <span className={`text-sm font-semibold tracking-tight transition-colors ${sub.reading_done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
            {sub.name}
          </span>
        </div>

        {/* Requirement 6: 4 Revision Cycles with Label */}
        <div className="flex items-center gap-3 bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-800/50">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Revision</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(num => (
              <button 
                key={num}
                onClick={() => handleToggle(null, sub.revisions?.[`r${num}`], true, num)}
                className={`w-3 h-3 rounded-full border transition-all duration-300 ${
                  sub.revisions?.[`r${num}`] 
                  ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.7)]' 
                  : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                }`}
                title={`Cycle ${num}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Analytics & Tools[cite: 1] */}
      <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-800/40">
        
        {/* Requirement 8: MCQ Tracker[cite: 1] */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">MCQs</span>
          <div className="flex bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
            <input 
              type="number" 
              placeholder="Att" 
              defaultValue={sub.mcq_pyq_stats?.attempted}
              onBlur={(e) => updateMcqStats('attempted', e.target.value)}
              className="w-10 bg-transparent text-[10px] p-1.5 text-white border-r border-slate-800 focus:outline-none placeholder:text-slate-700"
            />
            <input 
              type="number" 
              placeholder="Corr" 
              defaultValue={sub.mcq_pyq_stats?.correct}
              onBlur={(e) => updateMcqStats('correct', e.target.value)}
              className="w-10 bg-transparent text-[10px] p-1.5 text-emerald-400 focus:outline-none placeholder:text-slate-700"
            />
          </div>
        </div>

        {/* Requirement 9: Mains Tracker[cite: 1] */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Mains Marks</span>
          <input 
            type="number" 
            step="0.5"
            placeholder="0.0" 
            defaultValue={sub.mains_marks}
            onBlur={(e) => updateMainsMarks(e.target.value)}
            className="w-12 bg-slate-900 border border-slate-800 rounded-lg text-[10px] p-1.5 text-blue-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Action Buttons: Edit and Notes[cite: 1] */}
        <div className="flex items-center gap-2 ml-auto">
          <button 
            onClick={() => openModal('subtopic', ['subjects', subjectId, 'topics', topicId], sub)} 
            className="text-[9px] font-black text-slate-600 hover:text-white uppercase transition-colors"
          >
            Edit
          </button>
          
          {/* Requirement 10 & 11: Notes/Links Drawer[cite: 1] */}
          <button 
            onClick={onOpenDrawer}
            className={`p-2 rounded-xl transition-all ${
              sub.notes || (sub.links && sub.links.length > 0) 
              ? 'text-blue-400 bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
              : 'text-slate-600 hover:text-slate-300 bg-slate-800/40'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubtopicItem;