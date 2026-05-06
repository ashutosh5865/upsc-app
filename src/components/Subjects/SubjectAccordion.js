import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import TopicCard from './TopicCard';

/**
 * SubjectAccordion Component
 * Handles the top-level Subject display, its overall progress bar,
 * and expands to show underlying Topics.
 */
const SubjectAccordion = ({ subject, openDrawer, openModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [topics, setTopics] = useState([]);

  // Fetch topics only when the accordion is expanded to optimize performance[cite: 1]
  useEffect(() => {
    if (isOpen) {
      const q = query(
        collection(db, "subjects", subject.id, "topics"), 
        orderBy("name")
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedTopics = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        setTopics(fetchedTopics);
      }, (error) => {
        console.error("Error fetching topics: ", error);
      });

      return () => unsubscribe();
    }
  }, [isOpen, subject.id]);

  // Ensure we use the exact field name from your Firestore migration[cite: 1]
  const progressPercentage = subject.overall_progress || 0;

  return (
    <div className={`border rounded-[2rem] overflow-hidden transition-all duration-500 ${
      isOpen 
      ? 'border-blue-500/40 bg-slate-800/20 ring-1 ring-blue-500/10' 
      : 'border-slate-800 bg-slate-900/40'
    }`}>
      
      {/* Subject Header Row */}
      <div className="w-full p-6 flex items-center justify-between group">
        <div 
          className="flex items-center gap-5 flex-1 cursor-pointer" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* Circular Icon with Subject Initial */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black border transition-all ${
            isOpen 
            ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
            : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            {subject.name ? subject.name.charAt(0) : '?'}
          </div>

          <div className="text-left flex-1">
            <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
              {subject.name}
            </h2>
            
            {/* Requirement 4: Visual Progress Tracker[cite: 1] */}
            <div className="flex items-center gap-3 mt-2 max-w-md">
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full transition-all duration-1000 ease-out" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <span className="text-[11px] font-black text-slate-400 w-8 text-right">
                {progressPercentage}%
              </span>
            </div>
          </div>
        </div>
        
        {/* Management Controls[cite: 1] */}
        <div className="flex items-center gap-3 pl-4">
          <button 
            onClick={() => openModal('topic', ['subjects', subject.id])}
            className="hidden md:block px-4 py-2 bg-slate-800 hover:bg-blue-600/20 text-slate-300 hover:text-blue-400 rounded-xl text-xs font-bold transition-all border border-slate-700"
          >
            + TOPIC
          </button>
          <button 
            onClick={() => openModal('subject', [], subject)}
            className="p-2 text-slate-600 hover:text-emerald-400 transition-colors"
            title="Edit Subject Name"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <div className={`transition-transform duration-300 pointer-events-none ${isOpen ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded Content: List of Topics[cite: 1] */}
      {isOpen && (
        <div className="px-6 pb-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-6"></div>
          
          {topics.length > 0 ? (
            topics.map(topic => (
              <TopicCard 
                key={topic.id} 
                topic={topic} 
                subjectId={subject.id} 
                openDrawer={openDrawer} 
                openModal={openModal}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600 text-sm italic">No topics found for this subject.</p>
              <button 
                onClick={() => openModal('topic', ['subjects', subject.id])}
                className="mt-4 text-blue-500 font-bold text-xs hover:underline"
              >
                Create your first topic
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubjectAccordion;