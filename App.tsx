
import React, { useState, useEffect } from 'react';
import { Lock, LayoutDashboard, FileSearch, Briefcase, BookOpen, Settings, LogOut, Menu, X, ArrowRight, BrainCircuit, RotateCw } from 'lucide-react';
import Dashboard from './pages/Dashboard.tsx';
import DocumentHub from './pages/DocumentHub.tsx';
import TSKTracker from './pages/TSKTracker.tsx';
import StudyMode from './pages/StudyMode.tsx';
import VocabHub from './pages/VocabHub.tsx';
import Management from './pages/Management.tsx';

const APP_LOGO = "https://raw.githubusercontent.com/jati-work/jati-mensetsu/main/images/jati-mensetsu-logo.png";

const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('kaigo_logged') === 'true');
    const [userName, setUserName] = useState(() => localStorage.getItem('kaigo_user') || 'Jati');
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('kaigo_active_tab') || 'dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // State untuk deteksi orientasi
    const [isPortrait, setIsPortrait] = useState(false);

    useEffect(() => {
        const checkOrientation = () => {
            const isMobileOrTablet = window.innerWidth < 1024;
            const isVertical = window.innerHeight > window.innerWidth;
            setIsPortrait(isMobileOrTablet && isVertical);
        };

        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        return () => window.removeEventListener('resize', checkOrientation);
    }, []);

    // --- HELPER UNTUK LOADING DATA AMAN ---
    const getSafeData = (key: string, defaultValue: any) => {
        try {
            const saved = localStorage.getItem(key);
            if (!saved) return defaultValue;
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    };

    // --- SHARED STATES ---
    const [questions, setQuestions] = useState(() => getSafeData('kaigo_questions', [
        { id: 1, category: "Perkenalan Diri", question: "Jikoshoukai, onegaishimasu", answerJapanese: "はじめまして。私はジャティです。", answerRomaji: "Hajimemashite. Watashi wa Jati desu.", answerIndo: "Perkenalkan, nama saya Jati.", mastered: false, timeLimit: 30 }
    ]));

    const [tskList, setTskList] = useState(() => getSafeData('kaigo_tsk', []));
    const [checklist, setChecklist] = useState(() => getSafeData('kaigo_checklist', [
        {"id":1,"label":"Sertifikat JFT-A2","isDone":true, "fileUrl": null},
        {"id":2,"label":"Paspor","isDone":false, "fileUrl": null}
    ]));
    const [vocabList, setVocabList] = useState(() => getSafeData('kaigo_vocab', []));
    const [roadmapSteps, setRoadmapSteps] = useState(() => getSafeData('kaigo_roadmap', [
        {"id":1,"label":"Latihan Bahasa","status":"done"},
        {"id":2,"label":"Ujian JFT","status":"ongoing"}
    ]));

    const [docNotes, setDocNotes] = useState(() => localStorage.getItem('kaigo_doc_notes') || '');
    const [targetDate, setTargetDate] = useState(() => localStorage.getItem('kaigo_target') || 'Q4 2025');
    const [certStatus, setCertStatus] = useState(() => localStorage.getItem('kaigo_cert') || 'JFT-A2 Lulus');
    const [interviewPoints, setInterviewPoints] = useState(() => getSafeData('kaigo_points', ["1. JIKOSHOUKAI + TANYA JAWAB", "2. EGAO (MIMIK WAJAH)", "3. TAIDO (SIKAP)"]));
    const [emergencyPhrases, setEmergencyPhrases] = useState(() => getSafeData('kaigo_emergency', ["すみません、ゆっくり　おねがいします。", "もういちど　おねがいします。"]));
    const [studyNotes, setStudyNotes] = useState(() => getSafeData('kaigo_study_notes', ["Jaga intonasi suara", "Tersenyum saat masuk ruangan"]));

    useEffect(() => {
        localStorage.setItem('kaigo_logged', isLoggedIn.toString());
        localStorage.setItem('kaigo_user', userName);
        localStorage.setItem('kaigo_active_tab', activeTab);
        localStorage.setItem('kaigo_questions', JSON.stringify(questions));
        localStorage.setItem('kaigo_tsk', JSON.stringify(tskList));
        localStorage.setItem('kaigo_checklist', JSON.stringify(checklist));
        localStorage.setItem('kaigo_vocab', JSON.stringify(vocabList));
        localStorage.setItem('kaigo_roadmap', JSON.stringify(roadmapSteps));
        localStorage.setItem('kaigo_points', JSON.stringify(interviewPoints));
        localStorage.setItem('kaigo_emergency', JSON.stringify(emergencyPhrases));
        localStorage.setItem('kaigo_study_notes', JSON.stringify(studyNotes));
        localStorage.setItem('kaigo_target', targetDate);
        localStorage.setItem('kaigo_cert', certStatus);
        localStorage.setItem('kaigo_doc_notes', docNotes);
    }, [isLoggedIn, userName, activeTab, questions, tskList, checklist, vocabList, roadmapSteps, interviewPoints, emergencyPhrases, studyNotes, targetDate, certStatus, docNotes]);

    // Layar Blokir Orientasi
    if (isPortrait) {
        return (
            <div className="h-screen w-full fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-12 text-center space-y-8 fade-in">
                <div className="w-32 h-32 bg-indigo-50 rounded-[40px] flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-100">
                    <RotateCw size={64} className="animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter">MOHON PUTAR LAYAR 🎌</h1>
                    <p className="text-gray-400 font-bold text-sm leading-relaxed max-w-xs mx-auto">
                        Aplikasi Jati Mensetsu butuh layar lebar (Landscape) agar Jati nyaman belajarnya. Silakan miringkan Tablet/HP-mu sekarang.
                    </p>
                </div>
                <div className="pt-4">
                    <span className="px-6 py-3 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest">Wajib Mode Horizontal</span>
                </div>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-white p-6 relative overflow-hidden">
                <div className="bg-white max-w-sm w-full p-12 rounded-[56px] shadow-2xl border border-gray-100 text-center space-y-10 fade-in z-10">
                    <div className="w-28 h-28 bg-white border border-gray-100 rounded-[35px] mx-auto flex items-center justify-center overflow-hidden shadow-xl">
                        <img src={APP_LOGO} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">JATI MENSETSU</h1>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Portal Persiapan Mensetsu</p>
                    </div>
                    <div className="space-y-4">
                        <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-3xl py-5 px-8 text-gray-900 font-bold outline-none text-center focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="Siapa namamu?" />
                        <button onClick={() => setIsLoggedIn(true)} className="w-full py-5 bg-indigo-600 text-white rounded-[32px] font-black text-lg shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3">MASUK <ArrowRight size={20} /></button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-white fade-in overflow-hidden relative">
            <aside className={`fixed lg:relative inset-y-0 left-0 w-72 bg-white h-full flex flex-col border-r border-gray-100 z-[60] transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-indigo-600 font-black text-2xl tracking-tighter uppercase">JATI MENSETSU</h2>
                        <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}><X /></button>
                    </div>
                </div>
                <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scroll">
                    {[
                        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                        { id: 'docs', icon: FileSearch, label: 'Document Hub' },
                        { id: 'tsk', icon: Briefcase, label: 'TSK Tracker' },
                        { id: 'vocab', icon: BrainCircuit, label: 'Vocab Hub' },
                        { id: 'mensetsu', icon: BookOpen, label: 'Study Mode' },
                        { id: 'manage', icon: Settings, label: 'Database' }
                    ].map((item) => (
                        <div key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} className={`flex items-center gap-4 p-5 rounded-3xl font-bold cursor-pointer transition-all ${activeTab === item.id ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}>
                            <item.icon size={22} /><span className="text-sm">{item.label}</span>
                        </div>
                    ))}
                </nav>
                <div className="p-6"><button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center gap-4 p-5 bg-rose-50 text-rose-500 rounded-3xl font-black text-sm hover:bg-rose-100 transition-colors"><LogOut size={20} /><span>Log Out</span></button></div>
            </aside>

            <main className="flex-1 h-full overflow-y-auto custom-scroll p-6 lg:p-16 max-w-6xl mx-auto relative pt-24 lg:pt-16">
                <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 z-[55] flex items-center px-6">
                   <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg active:scale-95 transition-all">
                        <Menu size={24} />
                    </button>
                    <div className="flex-1"></div>
                </div>

                {activeTab === 'dashboard' && <Dashboard userName={userName} roadmapSteps={roadmapSteps} setRoadmapSteps={setRoadmapSteps} targetDate={targetDate} setTargetDate={setTargetDate} certStatus={certStatus} setCertStatus={setCertStatus} tskList={tskList} />}
                {activeTab === 'docs' && <DocumentHub checklist={checklist} setChecklist={setChecklist} docNotes={docNotes} setDocNotes={setDocNotes} />}
                {activeTab === 'tsk' && <TSKTracker tskList={tskList} setTskList={setTskList} />}
                {activeTab === 'vocab' && <VocabHub vocabList={vocabList} setVocabList={setVocabList} />}
                {activeTab === 'mensetsu' && <StudyMode questions={questions} setQuestions={setQuestions} interviewPoints={interviewPoints} setInterviewPoints={setInterviewPoints} emergencyPhrases={emergencyPhrases} setEmergencyPhrases={setEmergencyPhrases} studyNotes={studyNotes} setStudyNotes={setStudyNotes} />}
                {activeTab === 'manage' && <Management questions={questions} setQuestions={setQuestions} />}
            </main>
        </div>
    );
};

export default App;
