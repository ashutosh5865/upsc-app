import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const NotesDrawer = ({ isOpen, onClose, path, title }) => {
  const [notes, setNotes] = useState("");
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState("");

  useEffect(() => {
    if (isOpen) {
      const fetchDetails = async () => {
        const docRef = doc(db, ...path);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setNotes(docSnap.data().notes || "");
          setLinks(docSnap.data().links || []);
        }
      };
      fetchDetails();
    }
  }, [isOpen, path]);

  const handleSave = async () => {
    const docRef = doc(db, ...path);
    await updateDoc(docRef, { 
      notes: notes,
      links: links 
    });
    onClose();
  };

  const addLink = () => {
    if (newLink.trim()) {
      setLinks([...links, newLink]);
      setNewLink("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Drawer Content */}
      <div className="relative w-full max-w-md bg-slate-900 h-full shadow-2xl border-l border-slate-700 p-8 flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
        </div>

        {/* Links Section (Requirement 10) */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">Resources & Links</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newLink} 
              onChange={(e) => setNewLink(e.target.value)}
              placeholder="Paste URL (Google Docs, YouTube...)"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <button onClick={addLink} className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-xl font-bold">+</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {links.map((link, i) => (
              <a key={i} href={link} target="_blank" rel="noreferrer" className="text-xs bg-slate-800 text-blue-300 px-3 py-1 rounded-full border border-blue-900/50 hover:bg-blue-900/20">
                Link {i + 1}
              </a>
            ))}
          </div>
        </div>

        {/* Notes Section (Requirement 11) */}
        <div className="flex-1 flex flex-col space-y-3">
          <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Personal Notes</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Summarize key points or add mnemonics..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 hover:scale-[1.02] transition-transform"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default NotesDrawer;