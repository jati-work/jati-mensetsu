import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileSearch, Briefcase, BookOpen, Settings, LogOut, X, Menu, BrainCircuit, RotateCw } from 'lucide-react';
import { supabase } from './supabase.ts';
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import DocumentHub from './pages/DocumentHub.tsx';
import TSKTracker from './pages/TSKTracker.tsx';
import StudyMode from './pages/StudyMode.tsx';
import VocabHub from './pages/VocabHub.tsx';
import Management from './pages/Management.tsx';

const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('kaigo_logged') === 'true');
    const [userName, setUserName] = useState(() => localStorage.getItem('kaigo_user') || 'Jati');
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('kaigo_active_tab') || 'dashboard');
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);
    const [isPortrait, setIsPortrait] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- SHARED STATES ---
    const [questions, setQuestions] = useState([]);
    const [tskList, setTskList] = useState([]);
    const [checklist, setChecklist] = useState([]);
    const [vocabList, setVocabList] = useState([]);
    const [roadmapSteps, setRoadmapSteps] = useState([]);
    const [docNotes, setDocNotes] = useState('');
    const [targetDate, setTargetDate] = useState('Q4 2025');
    const [certStatus, setCertStatus] = useState('JFT-A2 Lulus');
    const [interviewPoints, setInterviewPoints] = useState([]);
    const [emergencyPhrases, setEmergencyPhrases] = useState([]);
    const [studyNotes, setStudyNotes] = useState([]);

    // Deteksi Orientasi
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

    // Cek konfigurasi Supabase
    useEffect(() => {
        const url = (import.meta.env.VITE_SUPABASE_URL || '');
        setIsSupabaseConfigured(url.includes('supabase.co'));
    }, []);

    // Load data awal - TANPA AUTH CHECK
    const loadAllData = async () => {
        if (!isSupabaseConfigured) return;
        setIsSyncing(true);
        try {
            const [
                { data: profiles },
                { data: qData },
                { data: tskData },
                { data: vData },
                { data: dData },
                { data: rData }
            ] = await Promise.all([
                supabase.from('profiles').select('*').limit(1),
                supabase.from('questions').select('*'),
                supabase.from('tsk_pipeline').select('*'),
                supabase.from('vocab').select('*'),
                supabase.from('documents').select('*'),
                supabase.from('roadmap').select('*')
            ]);

            if (profiles && profiles.length > 0) {
                const profile = profiles[0];
                setUserName(profile.user_name || 'Jati');
                setTargetDate(profile.target_date || 'Q4 2025');
                setCertStatus(profile.cert_status || 'JFT-A2 Lulus');
                setDocNotes(profile.doc_notes || '');
                setInterviewPoints(profile.interview_points || []);
                setEmergencyPhrases(profile.emergency_phrases || []);
                setStudyNotes(profile.study_notes || []);
            }

            if (qData) setQuestions(qData);
            if (tskData) setTskList(tskData);
            if (vData) setVocabList(vData);
            if (dData) setChecklist(dData);
            if (rData) setRoadmapSteps(rData);

        } catch (error) {
            console.error("Gagal load data:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    // Auto-sync data - TANPA AUTH CHECK
    useEffect(() => {
        if (!isLoggedIn || !isSupabaseConfigured) return;
        
        const syncTimer = setTimeout(async () => {
            setIsSyncing(true);
            try {
                // Cek apakah sudah ada profile
                const { data: existingProfiles } = await supabase
                    .from('profiles')
                    .select('id')
                    .limit(1);

                if (existingProfiles && existingProfiles.length > 0) {
                    // Update existing profile
                    await supabase.from('profiles')
                        .update({
                            user_name: userName,
                            target_date: targetDate,
                            cert_status: certStatus,
                            doc_notes: docNotes,
                            interview_points: interviewPoints,
                            emergency_phrases: emergencyPhrases,
                            study_notes: studyNotes
                        })
                        .eq('id', existingProfiles[0].id);
                } else {
                    // Insert new profile
                    await supabase.from('profiles').insert({
                        user_name: userName,
                        target_date: targetDate,
                        cert_status: certStatus,
                        doc_notes: docNotes,
                        interview_points: interviewPoints,
                        emergency_phrases: emergencyPhrases,
                        study_notes: studyNotes
                    });
                }
            } catch (err) {
                console.error("Sync Error:", err);
            } finally {
                setIsSyncing(false);
            }
        }, 3000);

        return () => clearTimeout(syncTimer);
    }, [userName, targetDate, certStatus, docNotes, interviewPoints, emergencyPhrases, studyNotes, isLoggedIn, isSupabaseConfigured]);

    useEffect(() => {
        if (isLoggedIn) {
            loadAllData();
        }
    }, [isLoggedIn, isSupabaseConfigured]);

    const handleLogin = (name: string) => {
        setUserName(name);
        setIsLoggedIn(true);
        localStorage.setItem('kaigo_logged', 'true');
        localStorage.setItem('kaigo_user', name);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('kaigo_logged');
    };

    // Layar Proteksi Portrait
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

    // Tampilkan Login Page
    if (!isLoggedIn) {
        return <Login onLogin={handleLogin} isSupabaseConfigured={isSupabaseConfigured} />;
    }

    // Main App
    return (
        <div className="flex h-screen w-full bg-white fade-in overflow-hidden relative">
            {/* Sidebar */}
            <aside className={`fixed lg:relative inset-y-0 left-0 w-72 bg-white h-full flex flex-col border-r border-gray-100 z-[70] transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-10 flex items-center justify-between">
                    <h2 className="text-indigo-600 font-black text-2xl tracking-tighter uppercase">JATI MENSETSU</h2>
                    <button className="lg:hidden p-2 text-gray-400" onClick={() => setIsSidebarOpen(false)}><X size={24}/></button>
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
                        <div 
                            key={item.id} 
                            onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} 
                            className={`flex items-center gap-4 p-5 rounded-3xl font-bold cursor-pointer transition-all ${activeTab === item.id ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            <item.icon size={22} /><span className="text-sm">{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div className="p-6">
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 p-5 bg-rose-50/50 text-rose-500 rounded-3xl font-black text-xs hover:bg-rose-100 transition-colors shadow-sm">
                        <LogOut size={18} /><span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-indigo-900/20 backdrop-blur-sm z-[65] lg:hidden fade-in" 
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto custom-scroll p-6 lg:p-16 max-w-6xl mx-auto relative pt-32 lg:pt-16">
                <div className="lg:hidden fixed top-0 left-0 w-full h-24 bg-white/80 backdrop-blur-md z-[60] flex items-center px-10">
                    <button 
                        onClick={() => setIsSidebarOpen(true)} 
                        className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 active:scale-90 transition-all flex items-center justify-center"
                    >
                        <Menu size={24} />
                    </button>
                </div>

                <div className="fade-in">
                    {activeTab === 'dashboard' && <Dashboard userName={userName} roadmapSteps={roadmapSteps} setRoadmapSteps={setRoadmapSteps} targetDate={targetDate} setTargetDate={setTargetDate} certStatus={certStatus} setCertStatus={setCertStatus} tskList={tskList} />}
                    {activeTab === 'docs' && <DocumentHub checklist={checklist} setChecklist={setChecklist} docNotes={docNotes} setDocNotes={setDocNotes} />}
                    {activeTab === 'tsk' && <TSKTracker tskList={tskList} setTskList={setTskList} />}
                    {activeTab === 'vocab' && <VocabHub vocabList={vocabList} setVocabList={setVocabList} />}
                    {activeTab === 'mensetsu' && <StudyMode questions={questions} setQuestions={setQuestions} interviewPoints={interviewPoints} setInterviewPoints={setInterviewPoints} emergencyPhrases={emergencyPhrases} setEmergencyPhrases={setEmergencyPhrases} studyNotes={studyNotes} setStudyNotes={setStudyNotes} />}
                    {activeTab === 'manage' && <Management questions={questions} setQuestions={setQuestions} />}
                </div>
            </main>
        </div>
    );
};

export default App;
