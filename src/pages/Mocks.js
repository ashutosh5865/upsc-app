import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Mocks = () => {
    const [allTests, setAllTests] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', type: 'Sectional', subject: 'Indian Polity', score: '', correct: '', incorrect: ''
    });

    useEffect(() => {
        const q = query(collection(db, "mock_tests"), orderBy("date", "asc"));
        const unsub = onSnapshot(q, (snap) => {
            setAllTests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, []);

    // --- FILTERING LOGIC ---
    const filteredTests = useMemo(() => {
        if (selectedSubject === 'All') return allTests;
        return allTests.filter(t => t.subject === selectedSubject);
    }, [allTests, selectedSubject]);

    const avgScore = filteredTests.length
        ? (filteredTests.reduce((acc, t) => acc + Number(t.score), 0) / filteredTests.length).toFixed(1)
        : 0;

    // Get unique subjects for the filter dropdown
    const subjectsList = ['All', ...new Set(allTests.map(t => t.subject))];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "mock_tests"), {
                ...formData,
                score: Number(formData.score),
                correct: Number(formData.correct),
                incorrect: Number(formData.incorrect),
                date: Timestamp.now()
            });
            setShowModal(false);
            setFormData({ name: '', type: 'Sectional', subject: 'Indian Polity', score: '', correct: '', incorrect: '' });
        } catch (err) {
            console.error("Error adding test: ", err);
        }
    };

    return (
        <div className="relative min-h-screen">
            <div className={`space-y-10 pb-20 ${showModal ? 'blur-md pointer-events-none' : ''} transition-all`}>

                {/* Header with Filter Controls */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">Test Analytics</h1>
                        <div className="flex items-center gap-4 mt-2">
                            <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase">Filter by Subject:</p>
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="bg-slate-900 border border-slate-800 text-blue-400 text-[10px] font-black uppercase px-4 py-1.5 rounded-full outline-none cursor-pointer hover:border-blue-500 transition-colors"
                            >
                                {subjectsList.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                    >
                        Log New Test
                    </button>
                </header>

                {/* Dashboard Grid (uses filteredTests) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-8 rounded-[3rem] h-80">
                        <h3 className="text-blue-500 font-black uppercase text-[10px] tracking-[0.2em] mb-6">
                            {selectedSubject === 'All' ? 'Global' : selectedSubject} Trajectory
                        </h3>
                        <ResponsiveContainer width="100%" height="90%">
                            <LineChart data={filteredTests}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" hide />
                                <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }}
                                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                                />
                                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[3rem] flex flex-col justify-center items-center text-center">
                        <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest mb-2">
                            {selectedSubject === 'All' ? 'Overall' : selectedSubject} Avg
                        </p>
                        <p className="text-7xl font-black text-white italic tracking-tighter">{avgScore}</p>
                        <div className="mt-6">
                            <span className="bg-blue-500/10 text-blue-500 text-[10px] font-black px-4 py-2 rounded-full border border-blue-500/20 uppercase tracking-widest">
                                {filteredTests.length} Tests Logged
                            </span>
                        </div>
                    </div>
                </div>

                {/* Test History Table (uses filteredTests) */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800/30">
                            <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                <th className="p-6">Test Name</th>
                                <th className="p-6">Type</th>
                                <th className="p-6">Subject</th>
                                <th className="p-6">Score</th>
                                <th className="p-6">Accuracy</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredTests.length > 0 ? filteredTests.map(test => (
                                <tr key={test.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-6 text-white font-bold">{test.name}</td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${test.type === 'FLT' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {test.type}
                                        </span>
                                    </td>
                                    <td className="p-6 text-slate-400 font-bold text-xs uppercase">{test.subject}</td>
                                    <td className="p-6 text-white font-black">{test.score}</td>
                                    <td className="p-6 font-black text-emerald-400">
                                        {test.correct && test.incorrect ? Math.round((test.correct / (test.correct + test.incorrect)) * 100) : 0}%
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center text-slate-600 font-bold italic uppercase tracking-widest">No matching results found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- FORM MODAL (Unchanged) --- */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-md">
                    <div className="bg-[#0f172a] border border-slate-800 w-full max-w-lg rounded-[3rem] p-12 shadow-2xl">
                        <h2 className="text-3xl font-black text-white uppercase italic mb-8 tracking-tighter">Record Result</h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-500 uppercase ml-2 mb-1">Test Identity</p>
                                <input
                                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition-colors"
                                    placeholder="e.g. Modern History Sectional 01"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-500 uppercase ml-2 mb-1">Subject</p>
                                <select
                                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white outline-none appearance-none focus:border-blue-500 transition-colors"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Select Subject</option>

                                    {/* GS Paper 1 */}
                                    <optgroup label="General Studies I" className="bg-slate-900 text-slate-400">
                                        <option value="Modern History">Modern History</option>
                                        <option value="Art and Culture">Art and Culture</option>
                                        <option value="Ancient History">Ancient History</option>
                                        <option value="Medieval History">Medieval History</option>
                                        <option value="World History">World History</option>
                                        <option value="Physical Geography">Physical Geography</option>
                                        <option value="Indian Geography">Indian Geography</option>
                                        <option value="World Geography">World Geography</option>
                                        <option value="Indian Society">Indian Society</option>
                                    </optgroup>

                                    {/* GS Paper 2 */}
                                    <optgroup label="General Studies II" className="bg-slate-900 text-slate-400">
                                        <option value="Indian Polity">Indian Polity</option>
                                        <option value="Governance">Governance</option>
                                        <option value="Constitution">Constitution</option>
                                        <option value="Social Justice">Social Justice</option>
                                        <option value="International Relations">International Relations</option>
                                    </optgroup>

                                    {/* GS Paper 3 */}
                                    <optgroup label="General Studies III" className="bg-slate-900 text-slate-400">
                                        <option value="Economics">Economics</option>
                                        <option value="Agriculture">Agriculture</option>
                                        <option value="Infrastructure">Infrastructure</option>
                                        <option value="Science and Technology">Science and Technology</option>
                                        <option value="Environment & Ecology">Environment & Ecology</option>
                                        <option value="Bio-Diversity">Bio-Diversity</option>
                                        <option value="Disaster Management">Disaster Management</option>
                                        <option value="Internal Security">Internal Security</option>
                                    </optgroup>

                                    {/* GS Paper 4 & Others */}
                                    <optgroup label="Ethics & Aptitude" className="bg-slate-900 text-slate-400">
                                        <option value="Ethics">Ethics</option>
                                        <option value="Integrity">Integrity</option>
                                        <option value="Aptitude">Aptitude</option>
                                        <option value="CSAT - Quant">CSAT - Quant</option>
                                        <option value="CSAT - Reasoning">CSAT - Reasoning</option>
                                        <option value="CSAT - English">CSAT - English</option>
                                    </optgroup>

                                    <option value="Current Affairs">Current Affairs</option>
                                    <option value="Essay">Essay</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-500 uppercase ml-2 mb-1">Category</p>
                                    <select
                                        className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white outline-none appearance-none"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="Sectional">Sectional</option>
                                        <option value="FLT">FLT</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-500 uppercase ml-2 mb-1">Total Score</p>
                                    <input
                                        className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white outline-none"
                                        placeholder="0.00"
                                        type="number"
                                        step="0.01"
                                        value={formData.score}
                                        onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-emerald-500 uppercase ml-2 mb-1">Correct Qs</p>
                                    <input
                                        className="w-full bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl text-emerald-400 outline-none"
                                        placeholder="0"
                                        type="number"
                                        value={formData.correct}
                                        onChange={(e) => setFormData({ ...formData, correct: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-rose-500 uppercase ml-2 mb-1">Incorrect Qs</p>
                                    <input
                                        className="w-full bg-rose-500/5 border border-rose-500/20 p-4 rounded-2xl text-rose-400 outline-none"
                                        placeholder="0"
                                        type="number"
                                        value={formData.incorrect}
                                        onChange={(e) => setFormData({ ...formData, incorrect: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-5 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-700 transition-colors"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-blue-500 transition-all active:scale-95"
                                >
                                    Deploy Data
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Mocks;