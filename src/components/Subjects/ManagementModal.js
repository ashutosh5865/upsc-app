import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, doc, addDoc, updateDoc } from 'firebase/firestore';
import { useProgressUpdater } from '../../hooks/useProgressUpdater';

const ManagementModal = ({ isOpen, onClose, type, parentPath, currentData }) => {
  const [name, setName] = useState("");
  const { refreshSubjectProgress } = useProgressUpdater();

  useEffect(() => {
    setName(currentData ? currentData.name : "");
  }, [currentData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const subjectId = parentPath[1]; // Extract subject ID from path[cite: 1]

      if (currentData) {
        const finalRef = type === 'subject' 
          ? doc(db, 'subjects', currentData.id) 
          : doc(db, ...parentPath, type + 's', currentData.id);
        await updateDoc(finalRef, { name });
      } else {
        const targetColl = type === 'subject' 
          ? collection(db, 'subjects') 
          : collection(db, ...parentPath, type + 's');
        
        await addDoc(targetColl, { 
          name, 
          ...(type === 'subtopic' ? { reading_done: false, revisions: { r1: false, r2: false, r3: false, r4: false } } : {}),
          ...(type === 'topic' ? { pyq_done: false, is_mastered: false } : {})
        });
      }
      
      // Force progress update if we modified topics/subtopics[cite: 1]
      if (subjectId) await refreshSubjectProgress(subjectId);
      
      onClose();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>
      <form onSubmit={handleSubmit} className="relative bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] w-full max-w-sm">
        <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-6">
          {currentData ? 'Edit' : 'Add'} {type}
        </h2>
        <input 
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`Enter ${type} name...`}
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 mb-6"
        />
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-800">CANCEL</button>
          <button type="submit" className="flex-1 px-6 py-4 rounded-2xl font-bold bg-blue-600 text-white hover:bg-blue-500">CONFIRM</button>
        </div>
      </form>
    </div>
  );
};

export default ManagementModal;