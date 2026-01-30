
import React, { useState, useEffect } from 'react';
import { Lock, LayoutDashboard, FileSearch, Briefcase, BookOpen, Settings, LogOut, X, Menu, ArrowRight, BrainCircuit, RotateCw, RefreshCw, CloudOff, Cloud, CheckCircle } from 'lucide-react';
import { supabase } from './supabase.ts';
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

    // Load data awal
    const loadAllData = async () => {
        if (!isSupabaseConfigured) return;
        setIsSyncing(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const [
                { data: profile },
                { data: qData },
                { data: tskData },
                { data: vData },
                { data: dData },
                { data: rData }
            ] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', user.id).single(),
                supabase.from('questions').select('*').eq('user_id', user.id),
                supabase.from('tsk_pipeline').select('*').eq('user_id', user.id),
                supabase.from('vocab').select('*').eq('user_id', user.id),
                supabase.from('documents').select('*').eq('user_id', user.id),
                supabase.from('roadmap').select('*').eq('user_id', user.id)
            ]);

            if (profile) {
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

    // Auto-sync data
    useEffect(() => {
        if (!isLoggedIn || !isSupabaseConfigured) return;
        
        const syncTimer = setTimeout(async () => {
            setIsSyncing(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setIsSyncing(false);
                    return;
                }

                await supabase.from('profiles').upsert({
                    id: user.id,
                    user_name: userName,
                    target_date: targetDate,
                    cert_status: certStatus,
                    doc_notes: docNotes,
                    interview_points: interviewPoints,
                    emergency_phrases: emergencyPhrases,
                    study_notes: studyNotes
                });
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

    const handleLogin = () => {
        setIsLoggedIn(true);
        localStorage.setItem('kaigo_logged', 'true');
        localStorage.setItem('kaigo_user', userName);
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

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-6 relative overflow-hidden">
                <div className="bg-white max-w-sm w-full p-10 md:p-14 rounded-[56px] shadow-2xl border border-gray-100 text-center space-y-10 fade-in z-10">
                    <div className="w-28 h-28 bg-white border border-gray-100 rounded-[35px] mx-auto flex items-center justify-center overflow-hidden shadow-xl">
                        <img src={APP_LOGO} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">JATI MENSETSU</h1>
                        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Portal Persiapan Kaigo</p>
                    </div>

                    <div className={`mx-auto flex items-center justify-center gap-2 px-4 py-2 rounded-full border w-fit ${isSupabaseConfigured ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                        {isSupabaseConfigured ? <Cloud size={14} className="text-emerald-500"/> : <CloudOff size={14} className="text-rose-400"/>}
                        <span className={`text-[9px] font-black uppercase tracking-tighter ${isSupabaseConfigured ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {isSupabaseConfigured ? 'Connected to Cloud' : 'Local Mode Only'}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <input 
                            type="text" 
                            value={userName} 
                            onChange={(e) => setUserName(e.target.value)} 
                            className="w-full bg-gray-50 border border-gray-200 rounded-3xl py-5 px-8 text-gray-900 font-bold outline-none text-center focus:ring-4 focus:ring-indigo-50 transition-all" 
                            placeholder="Siapa namamu?" 
                        />
                        <button 
                            onClick={handleLogin} 
                            className="w-full py-5 bg-indigo-600 text-white rounded-[32px] font-black text-lg shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            MASUK <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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

                {/* Footer Sidebar yang Bersih tanpa Indikator Cloud */}
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
                
                {/* Mobile Header Bar - Hanya Hamburger dengan Jarak yang Lega */}
                <div className="lg:hidden fixed top-0 left-0 w-full h-24 bg-white/80 backdrop-blur-md z-[60] flex items-center px-10">
                    <button 
                        onClick={() => setIsSidebarOpen(true)} 
                        className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 active:scale-90 transition-all flex items-center justify-center"
                    >
                        <Menu size={24} />
                    </button>
                    {/* Tulisan Jati Mensetsu di sini sudah dihapus */}
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
