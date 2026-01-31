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
            { data: settingsData },
            { data: qData },
            { data: tskData },
            { data: vData },
            { data: dData },
            { data: notesData },
            { data: rData },
            { data: ipData },
            { data: epData },
            { data: snData }
        ] = await Promise.all([
            supabase.from('user_settings').select('*').single(),
            supabase.from('questions').select('*').order('created_at', { ascending: true }),
            supabase.from('tsk_applications').select('*').order('created_at', { ascending: false }),
            supabase.from('vocab').select('*').order('created_at', { ascending: true }),
            supabase.from('documents').select('*').order('created_at', { ascending: true }),
            supabase.from('doc_notes').select('*').single(),
            supabase.from('roadmap_steps').select('*').order('order_index', { ascending: true }),
            supabase.from('interview_points').select('*').order('created_at', { ascending: true }),
            supabase.from('emergency_phrases').select('*').order('created_at', { ascending: true }),
            supabase.from('study_notes').select('*').order('created_at', { ascending: true })
        ]);

        // Load user settings
        if (settingsData) {
            setUserName(settingsData.user_name || 'Jati');
            setTargetDate(settingsData.target_date || 'Q4 2025');
            setCertStatus(settingsData.cert_status || 'JFT-A2 Lulus');
        }

        // Load doc notes
        if (notesData) {
            setDocNotes(notesData.content || '');
        }

        // Load questions
        if (qData) {
            setQuestions(qData.map((q: any) => ({
                id: q.id,
                category: q.category,
                question: q.question,
                answerJapanese: q.answer_japanese,
                answerRomaji: q.answer_romaji,
                answerIndo: q.answer_indo,
                mastered: q.mastered,
                timeLimit: q.time_limit
            })));
        }

        // Load TSK applications
        if (tskData) {
            setTskList(tskData.map((t: any) => ({
                id: t.id,
                name: t.name,
                status: t.status,
                salary: t.salary,
                rounds: t.rounds || [],
                notes: t.notes,
                retro: t.retro
            })));
        }

        // Load vocab
        if (vData) {
            setVocabList(vData.map((v: any) => ({
                id: v.id,
                word: v.word,
                meaning: v.meaning,
                category: v.category
            })));
        }

        // Load documents
        if (dData) {
            setChecklist(dData.map((d: any) => ({
                id: d.id,
                label: d.label,
                isDone: d.is_done,
                fileUrl: d.file_url,
                fileName: d.file_name
            })));
        }

        // Load roadmap
        if (rData) {
            setRoadmapSteps(rData.map((r: any) => ({
                id: r.id,
                label: r.label,
                status: r.status
            })));
        }

        // Load interview points
        if (ipData) {
            setInterviewPoints(ipData);
        }

        // Load emergency phrases
        if (epData) {
            setEmergencyPhrases(epData);
        }

        // Load study notes
        if (snData) {
            setStudyNotes(snData);
        }

    } catch (error) {
        console.error("Gagal load data:", error);
    } finally {
        setIsSyncing(false);
    }
};

// ========================================
// LOAD DATA AWAL (useEffect yang BENAR)
// ========================================
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
