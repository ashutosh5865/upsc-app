import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import SubtopicItem from './SubtopicItem';
import { useProgressUpdater } from '../../hooks/useProgressUpdater';

const TopicCard = ({ topic, subjectId, openDrawer, openModal }) => {
  const [isOpen, setIsOpen] = useState(false); 
  const [subtopics, setSubtopics] = useState([]);
  const { refreshSubjectProgress } = useProgressUpdater();

  useEffect(() => {
    const q = query(collection(db, "subjects", subjectId, "topics", topic.id, "subtopics"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubtopics(subs);
      
      // FIX: Changed 'allRead' to 'allSubsRead' to match variable definition
      const allSubsRead = subs.length > 0 && subs.every(s => s.reading_done);
      
      const shouldBeMastered = allSubsRead && (topic.pyq_done || false);

      if (topic.is_mastered !== shouldBeMastered) {
        updateDoc(doc(db, "subjects", subjectId, "topics", topic.id), {
          is_mastered: shouldBeMastered
        });
        // Update the top-level subject progress bar whenever mastery changes
        refreshSubjectProgress(subjectId);
      }
    });
    return () => unsubscribe();
  }, [subjectId, topic.id, topic.pyq_done, topic.is_mastered, refreshSubjectProgress]);

  const togglePYQ = async (e) => {
    e.stopPropagation();
    const ref = doc(db, "subjects", subjectId, "topics", topic.id);
    await updateDoc(ref, { pyq_done: !topic.pyq_done });
    // This will trigger the useEffect above to recalculate mastery and progress
  };

  return (
    <div className={`rounded-2xl border transition-all ${isOpen ? 'bg-slate-900/80 border-slate-700' : 'bg-slate-900/40 border-slate-800'}`}>
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${topic.is_mastered ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-700'}`}></div>
          <h4 className="text-slate-200 font-bold">{topic.name}</h4>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={(e) => { e.stopPropagation(); openModal('topic', ['subjects', subjectId], topic); }} className="text-[10px] text-slate-600 hover:text-blue-400 font-black uppercase transition-colors">Edit</button>
           <svg className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 pt-0 space-y-3 animate-in fade-in duration-300">
          <div className="flex justify-between items-center bg-slate-800/40 p-3 rounded-xl mb-2 border border-slate-800/50">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={topic.pyq_done || false} 
                onChange={togglePYQ}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0"
              />
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Topic PYQs Done</span>
            </label>
            <button 
              onClick={() => openModal('subtopic', ['subjects', subjectId, 'topics', topic.id])}
              className="text-[10px] text-blue-400 font-bold hover:text-blue-300 transition-colors"
            >
              + ADD SUBTOPIC
            </button>
          </div>
          {subtopics.length > 0 ? (
            subtopics.map(sub => (
              <SubtopicItem 
                key={sub.id} 
                sub={sub} 
                subjectId={subjectId} 
                topicId={topic.id}
                onOpenDrawer={() => openDrawer(['subjects', subjectId, 'topics', topic.id, 'subtopics', sub.id], sub.name)}
                openModal={openModal}
              />
            ))
          ) : (
            <p className="text-[10px] text-slate-600 italic text-center py-2">No sub-topics added.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TopicCard;