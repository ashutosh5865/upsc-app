import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import SubjectAccordion from '../components/Subjects/SubjectAccordion';
import NotesDrawer from '../components/Subjects/NotesDrawer';
import ManagementModal from '../components/Subjects/ManagementModal';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for Notes/Links Drawer
  const [drawerData, setDrawerData] = useState({ isOpen: false, path: [], title: "" });
  
  // State for Add/Edit Modal
  const [modalData, setModalData] = useState({ isOpen: false, type: '', parentPath: [], currentData: null });

  useEffect(() => {
    const q = query(collection(db, "subjects"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSubjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openDrawer = (path, title) => setDrawerData({ isOpen: true, path, title });
  const openModal = (type, parentPath = [], currentData = null) => 
    setModalData({ isOpen: true, type, parentPath, currentData });

  if (loading) return <div className="p-10 text-blue-400 animate-pulse font-black">INITIALIZING SYLLABUS...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Syllabus Explorer</h1>
          <p className="text-slate-500 mt-2">Manage subjects, topics, and granular sub-topics.</p>
        </div>
        <button 
          onClick={() => openModal('subject')}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20"
        >
          + ADD SUBJECT
        </button>
      </header>

      <div className="grid gap-6">
        {subjects.map(subject => (
          <SubjectAccordion 
            key={subject.id} 
            subject={subject} 
            openDrawer={openDrawer} 
            openModal={openModal}
          />
        ))}
      </div>

      <NotesDrawer 
        {...drawerData} 
        onClose={() => setDrawerData({ ...drawerData, isOpen: false })} 
      />

      <ManagementModal 
        {...modalData} 
        onClose={() => setModalData({ ...modalData, isOpen: false })} 
      />
    </div>
  );
};

export default Subjects;