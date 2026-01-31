
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';
import { GoogleGenAI } from "@google/genai";
import { Volume2, Mic, Square as SquareIcon, Sparkles, ChevronRight, ChevronLeft, Timer, Shuffle, Coffee, UserCircle2, UserCircle, RotateCcw, Target, AlertCircle, PlusCircle, Trash2, StickyNote, Eye, EyeOff, CheckCircle2, Layers } from 'lucide-react';

interface Props {
    questions: any[];
    setQuestions: (val: any) => void;
    interviewPoints: string[];
    setInterviewPoints: (val: string[]) => void;
    emergencyPhrases: string[];
    setEmergencyPhrases: (val: string[]) => void;
    studyNotes: string[];
    setStudyNotes: (val: string[]) => void;
}

const StudyMode: React.FC<Props> = ({ questions, setQuestions, interviewPoints, setInterviewPoints, emergencyPhrases, setEmergencyPhrases, studyNotes, setStudyNotes }) => {
    // Selection States
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [currentIndex, setCurrentIndex] = useState(0);

    // Filter Logic
    const filteredQuestions = useMemo(() => {
        return selectedCategory === 'Semua' 
            ? questions 
            : questions.filter(q => q.category === selectedCategory);
    }, [questions, selectedCategory]);

    const categories = useMemo(() => {
        const cats = Array.from(new Set(questions.map(q => q.category))).filter(Boolean);
        return ['Semua', ...cats];
    }, [questions]);

    // UI States
    const [showAnswer, setShowAnswer] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
    const [aiFeedback, setAiFeedback] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [showStrategy, setShowStrategy] = useState(false);
    
    // Feature States
    const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
    const [mode, setMode] = useState<'casual' | 'exam' | 'random'>('casual');
    const [timeLeft, setTimeLeft] = useState(30);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
    // Auto-save interview points
    const saveIP = setTimeout(async () => {
        if (interviewPoints.length > 0) {
            // Hapus semua data lama
            await supabase.from('interview_points').delete().neq('id', 0);
            // Insert data baru
            for (const point of interviewPoints) {
                await supabase.from('interview_points').insert({
                    point: point.point || point
                });
            }
        }
    }, 2000);
    return () => clearTimeout(saveIP);
}, [interviewPoints]);

useEffect(() => {
    // Auto-save emergency phrases
    const saveEP = setTimeout(async () => {
        if (emergencyPhrases.length > 0) {
            await supabase.from('emergency_phrases').delete().neq('id', 0);
            for (const phrase of emergencyPhrases) {
                await supabase.from('emergency_phrases').insert({
                    phrase: phrase.phrase || phrase,
                    translation: phrase.translation || ''
                });
            }
        }
    }, 2000);
    return () => clearTimeout(saveEP);
}, [emergencyPhrases]);

useEffect(() => {
    // Auto-save study notes
    const saveSN = setTimeout(async () => {
        if (studyNotes.length > 0) {
            await supabase.from('study_notes').delete().neq('id', 0);
            for (const note of studyNotes) {
                await supabase.from('study_notes').insert({
                    note: note.note || note
                });
            }
        }
    }, 2000);
    return () => clearTimeout(saveSN);
}, [studyNotes]);

    useEffect(() => {
        const loadVoices = () => {
            const allVoices = window.speechSynthesis.getVoices();
            const japaneseVoices = allVoices.filter(v => v.lang.startsWith('ja'));
            setAvailableVoices(japaneseVoices);
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    useEffect(() => {
        setCurrentIndex(0);
        resetSession();
    }, [selectedCategory]);

    useEffect(() => {
        let timer: any;
        if (isTimerRunning && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && isTimerRunning) {
            setIsTimerRunning(false);
            if (isRecording) stopRecordingProcess();
            setShowAnswer(true);
        }
        return () => clearInterval(timer);
    }, [isTimerRunning, timeLeft, isRecording]);

    const speak = (text: string) => {
        if (!text) return;
        if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.85;

        if (availableVoices.length > 0) {
            const femaleKeywords = ['female', 'ayumi', 'haruka', 'kyoko', 'mizuki', 'sayaka', 'nanako', 'google 日本語'];
            const maleKeywords = ['male', 'ichiro', 'otoya', 'keita', 'takumi', 'keisuke'];

            let selectedVoice = null;
            if (voiceGender === 'female') {
                selectedVoice = availableVoices.find(v => 
                    femaleKeywords.some(key => v.name.toLowerCase().includes(key))
                );
            } else {
                selectedVoice = availableVoices.find(v => 
                    maleKeywords.some(key => v.name.toLowerCase().includes(key))
                );
            }
            
            utterance.voice = selectedVoice || availableVoices[0];
        }
        
        window.speechSynthesis.speak(utterance);
    };

    const stopRecordingProcess = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        setIsTimerRunning(false);
    };

    const toggleRecording = async () => {
        if (isRecording) {
            stopRecordingProcess();
        } else {
            try {
                const currentQ = filteredQuestions[currentIndex];
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream);
                audioChunksRef.current = [];
                recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
                recorder.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                    setRecordedAudioUrl(URL.createObjectURL(audioBlob));
                };
                recorder.start();
                mediaRecorderRef.current = recorder;
                setIsRecording(true);
                setAiFeedback(null); // Clear old feedback when starting new recording
                if (mode === 'exam') { 
                    setTimeLeft(currentQ?.timeLimit || 30); 
                    setIsTimerRunning(true); 
                }
            } catch { alert("Microphone tidak diizinkan."); }
        }
    };

    const resetSession = () => {
        setShowAnswer(false);
        setRecordedAudioUrl(null);
        setAiFeedback(null);
        setIsTimerRunning(false);
        const currentQ = filteredQuestions[currentIndex];
        setTimeLeft(currentQ?.timeLimit || 30);
    };

    const nextQuestion = () => {
        if (filteredQuestions.length === 0) return;
        resetSession();
        if (mode === 'random') {
            setCurrentIndex(Math.floor(Math.random() * filteredQuestions.length));
        } else {
            setCurrentIndex((currentIndex + 1) % filteredQuestions.length);
        }
    };

    const prevQuestion = () => {
        if (filteredQuestions.length === 0) return;
        resetSession();
        setCurrentIndex((currentIndex - 1 + filteredQuestions.length) % filteredQuestions.length);
    };

    const analyzeAnswer = async () => {
        if (!audioChunksRef.current.length) return;
        setIsAnalyzing(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const reader = new FileReader();
            reader.readAsDataURL(new Blob(audioChunksRef.current));
            reader.onloadend = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: {
                        parts: [
                            { text: `Saya sedang latihan mensetsu Kaigo Jepang. Berikut adalah jawaban saya untuk pertanyaan: "${filteredQuestions[currentIndex].question}". Jawaban yang benar seharusnya: "${filteredQuestions[currentIndex].answerJapanese}". Tolong berikan evaluasi singkat (maks 3 kalimat) dalam Bahasa Indonesia tentang pengucapan atau ketepatan jawaban saya berdasarkan audio ini.` },
                            { inlineData: { mimeType: 'audio/wav', data: base64 } }
                        ]
                    }
                });
                setAiFeedback(response.text);
                setIsAnalyzing(false);
            };
        } catch (e) { 
            console.error(e);
            setAiFeedback("Gagal menganalisis. Pastikan API Key sudah benar di Vercel.");
            setIsAnalyzing(false); 
        }
    };

    const progressPercentage = filteredQuestions.length > 0 ? ((currentIndex + 1) / filteredQuestions.length) * 100 : 0;
    const currentQ = filteredQuestions[currentIndex];

const masteredQuestions = filteredQuestions.filter(q => q.mastered);
const notMasteredQuestions = filteredQuestions.filter(q => !q.mastered);
const masteredPercentage = filteredQuestions.length > 0 
    ? Math.round((masteredQuestions.length / filteredQuestions.length) * 100) 
    : 0;
    
    return (
        <div className="fade-in space-y-8 pb-20">
            <div className="flex justify-center">
                <button onClick={() => setShowStrategy(!showStrategy)} className={`px-10 py-4 rounded-full font-black flex items-center gap-3 transition-all ${showStrategy ? 'bg-[#f0c3e6] text-gray-900 border-4 border-white shadow-xl' : 'bg-white text-gray-400 border border-gray-100'}`}>
                    {showStrategy ? 'KEMBALI KE LATIHAN' : '💡 LIHAT STRATEGI INTERVIEW'}
                </button>
            </div>

            {showStrategy ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 slide-up">
                    <div className="bg-[#f0c3e6] p-8 rounded-[48px] shadow-lg border-4 border-white space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3"><Target size={20} /> POIN UTAMA</h3>
                        </div>
                        <div className="space-y-3">
                            {interviewPoints.map((point, i) => (
                                <div key={i} className="relative group">
                                    <div className="flex gap-3">
<textarea value={point} onChange={(e) => {
    const newPoints = [...interviewPoints];
    newPoints[i] = e.target.value;
    setInterviewPoints(newPoints);
}} placeholder="Poin penting..." className="flex-1 text-sm font-black text-gray-900 bg-white/20 p-4 rounded-xl border border-white/30 outline-none resize-none h-20" />
                                </div>
                                {/* Tombol delete */}
                                    <button 
                                        onClick={() => {
                                            const updated = interviewPoints.filter((_, idx) => idx !== i);
                                            setInterviewPoints(updated);
                                        }} 
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-rose-400 hover:bg-rose-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <button onClick={() => setInterviewPoints([...interviewPoints, ""])} className="w-full p-3 bg-white/40 rounded-xl flex justify-center"><PlusCircle size={20}/></button>
                        </div>
                    </div>

                    <div className="bg-[#f0c3e6] p-8 rounded-[48px] shadow-lg border-4 border-white space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3"><AlertCircle size={20} /> KATA DARURAT</h3>
                        </div>
                        <div className="space-y-3">
{emergencyPhrases.map((phrase, i) => (
    <div key={i} className="relative group">
        <div className="flex gap-3">
            <textarea value={phrase} onChange={(e) => {
                const newPhrases = [...emergencyPhrases];
                newPhrases[i] = e.target.value;
                setEmergencyPhrases(newPhrases);
            }} placeholder="Frasa penyelamat..." className="flex-1 text-sm font-black text-gray-900 bg-white/20 p-4 rounded-xl border border-white/30 outline-none resize-none h-20" />
        </div>
        
        {/* Tombol delete */}
        <button 
            onClick={() => {
                const updated = emergencyPhrases.filter((_, idx) => idx !== i);
                setEmergencyPhrases(updated);
            }} 
            className="absolute -top-2 -right-2 w-6 h-6 bg-rose-400 hover:bg-rose-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all opacity-0 group-hover:opacity-100"
        >
            ✕
        </button>
    </div>
))}
                            <button onClick={() => setEmergencyPhrases([...emergencyPhrases, ""])} className="w-full p-3 bg-white/40 rounded-xl flex justify-center"><PlusCircle size={20}/></button>
                        </div>
                    </div>

                    <div className="bg-[#f0c3e6] p-8 rounded-[48px] shadow-lg border-4 border-white space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3"><StickyNote size={20} /> CATATAN LAIN</h3>
                        </div>
                        <div className="space-y-3">
                            {studyNotes.map((note, i) => (
                                <div key={i} className="relative group">
                                    <div className="flex gap-3">
<textarea value={note} onChange={(e) => {
    const newNotes = [...studyNotes];
    newNotes[i] = e.target.value;
    setStudyNotes(newNotes);
}} placeholder="Catatan belajar..." className="flex-1 text-sm font-black text-gray-900 bg-white/20 p-4 rounded-xl border border-white/30 outline-none resize-none h-20" />
                                </div>
                                    
                                    {/* Tombol delete */}
        <button 
            onClick={() => {
                const updated = studyNotes.filter((_, idx) => idx !== i);
                setStudyNotes(updated);
            }} 
            className="absolute -top-2 -right-2 w-6 h-6 bg-rose-400 hover:bg-rose-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all opacity-0 group-hover:opacity-100"
        >
            ✕
        </button>
    </div>
    ))}
                            <button onClick={() => setStudyNotes([...studyNotes, ""])} className="w-full p-3 bg-white/40 rounded-xl flex justify-center"><PlusCircle size={20}/></button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
<div className="flex gap-2 overflow-x-auto pb-4 scroll-smooth">
    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
        <div className="p-2 text-indigo-400 bg-white rounded-xl shadow-sm"><Layers size={16}/></div>
        {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-indigo-400'}`}>
                {cat}
            </button>
        ))}
    </div>
</div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => setMode('casual')} className={`px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-xs transition-all ${mode === 'casual' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}><Coffee size={16} /> SANTAI</button>
                            <button onClick={() => { setMode('exam'); setTimeLeft(currentQ?.timeLimit || 30); }} className={`px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-xs transition-all ${mode === 'exam' ? 'bg-rose-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}><Timer size={16} /> UJIAN</button>
                            <button onClick={() => setMode('random')} className={`px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-xs transition-all ${mode === 'random' ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}><Shuffle size={16} /> ACAK</button>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-indigo-50 p-2 rounded-2xl border border-indigo-100">
                            <button onClick={() => setVoiceGender('female')} className={`p-2.5 rounded-xl transition-all ${voiceGender === 'female' ? 'bg-white shadow-sm text-indigo-600 scale-110' : 'text-gray-300 hover:text-indigo-400'}`} title="Suara Cewe">
                                <UserCircle size={22} />
                            </button>
                            <button onClick={() => setVoiceGender('male')} className={`p-2.5 rounded-xl transition-all ${voiceGender === 'male' ? 'bg-white shadow-sm text-indigo-600 scale-110' : 'text-gray-300 hover:text-indigo-400'}`} title="Suara Cowo">
                                <UserCircle2 size={22} />
                            </button>
                            <div className="w-[2px] h-6 bg-indigo-200 mx-1"></div>
                            <button onClick={() => speak(currentQ?.question)} className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 active:scale-95 transition-all" title="Dengar Soal">
                                <Volume2 size={22} />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-10 md:p-14 rounded-[64px] shadow-sm border border-gray-100 min-h-[550px] flex flex-col justify-between relative overflow-hidden slide-up">
                        {mode === 'exam' && (
                            <div className="absolute top-10 right-10 flex items-center gap-3 bg-rose-50 px-6 py-3 rounded-full border border-rose-100">
                                <Timer className={`text-rose-500 ${isTimerRunning ? 'animate-pulse' : ''}`} />
                                <span className={`font-black text-xl ${timeLeft <= 5 ? 'text-rose-600 animate-bounce' : 'text-rose-900'}`}>{timeLeft}s</span>
                            </div>
                        )}
                        
                        {currentQ ? (
                            <div className="space-y-10">
                                <span className="bg-indigo-50 text-indigo-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest">{currentQ.category}</span>
                                <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.2]">{currentQ.question}</h2>
                                {showAnswer && (
                                    <div className="bg-indigo-50 p-10 rounded-[48px] border border-indigo-100 space-y-4 slide-up">
                                        <div className="space-y-1">
                                            <p className="text-3xl font-black text-indigo-900">{currentQ.answer_japanese || currentQ.answerJapanese}</p>
                                            <p className="text-xs font-bold text-indigo-400 italic">"{currentQ.answer_romaji || currentQ.answerRomaji}"</p>
                                        </div>
                                        <p className="text-[11px] font-bold text-gray-400 italic mt-4 border-t border-indigo-100/50 pt-4">"{currentQ.answer_indo || currentQ.answerIndo}"</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <button onClick={toggleRecording} className={`py-8 rounded-[35px] font-black text-lg flex items-center justify-center gap-4 transition-all shadow-xl ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-gray-900 text-white hover:bg-black'}`}>
                                        {isRecording ? <SquareIcon size={24} /> : <Mic size={24} />} {isRecording ? "BERHENTI REKAM" : "MULAI REKAM JAWABAN"}
                                    </button>
                                    {recordedAudioUrl && !isRecording && (
                                        <button onClick={() => new Audio(recordedAudioUrl).play()} className="py-8 bg-indigo-50 text-indigo-600 rounded-[35px] font-black text-lg flex items-center justify-center gap-4 hover:bg-indigo-100 transition-all border-2 border-indigo-100 shadow-sm">
                                            <RotateCcw size={24} /> PUTAR SUARA SAYA
                                        </button>
                                    )}
                                </div>
                                {recordedAudioUrl && !isRecording && (
                                    <div className="bg-emerald-50 p-8 rounded-[40px] border border-emerald-100 space-y-4 slide-up">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-emerald-700 font-black flex items-center gap-2"><Sparkles size={18} /> Feedback Mentor AI</h4>
                                            <button onClick={analyzeAnswer} disabled={isAnalyzing} className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95">{isAnalyzing ? "Menganalisis..." : "DAPATKAN FEEDBACK"}</button>
                                        </div>
                                        {aiFeedback && <p className="text-emerald-900 font-bold text-sm leading-relaxed italic">"{aiFeedback}"</p>}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                                <Layers size={64} className="text-gray-100" />
                                <p className="text-gray-400 font-bold">Kategori ini belum ada soal.</p>
                            </div>
                        )}
                        
                        <div className="mt-16 space-y-8">
                            <div className="flex items-center justify-center gap-4 md:gap-8">
                                <button onClick={prevQuestion} className="p-5 bg-gray-100 text-gray-400 rounded-3xl hover:bg-gray-200 transition-all active:scale-90" title="Sebelumnya">
                                    <ChevronLeft size={28} />
                                </button>

                                <button onClick={() => setQuestions(questions.map(q => q.id === currentQ?.id ? {...q, mastered: !q.mastered} : q))} className={`p-5 rounded-3xl transition-all active:scale-90 ${currentQ?.mastered ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-100 text-gray-300 hover:text-gray-400'}`} title="Tandai Bisa">
                                    <CheckCircle2 size={28} />
                                </button>

                                <button onClick={() => setShowAnswer(!showAnswer)} className={`p-5 rounded-3xl transition-all active:scale-90 ${showAnswer ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-50 text-indigo-400 hover:bg-indigo-100'}`} title="Lihat Jawaban">
                                    {showAnswer ? <EyeOff size={28} /> : <Eye size={28} />}
                                </button>

                                <button onClick={nextQuestion} className="p-5 bg-indigo-600 text-white rounded-3xl shadow-xl hover:bg-indigo-700 active:scale-90 transition-all" title="Selanjutnya">
                                    <ChevronRight size={28} />
                                </button>
                            </div>

                            <div className="w-full max-md mx-auto space-y-3">
                                <div className="flex justify-between items-end px-2">
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Progress: {selectedCategory}</span>
                                    <span className="text-lg font-black text-indigo-600">{filteredQuestions.length > 0 ? currentIndex + 1 : 0} <span className="text-gray-300 text-xs">/ {filteredQuestions.length}</span></span>
                                </div>
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden p-1 shadow-inner">
                                    <div 
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.4)]" 
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            {/* ========== TOMBOL REVIEW - TAMBAHKAN DI SINI ========== */}
                            <button 
                                onClick={() => setShowReview(!showReview)} 
                                className="w-full py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={18} />
                                {showReview ? 'SEMBUNYIKAN REVIEW' : '📊 LIHAT REVIEW HASIL BELAJAR'}
                            </button>
                            
                        </div>
                    </div>
                    
                    {/* ========== SECTION REVIEW - TAMBAHKAN DI SINI ========== */}
                    {showReview && (
                        <div className="bg-white p-8 rounded-[48px] border border-gray-100 space-y-6 slide-up">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-black text-gray-900">Review Hasil Belajar</h3>
                                <div className="text-right">
                                    <p className="text-4xl font-black text-indigo-600">{masteredPercentage}%</p>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tingkat Penguasaan</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Sudah Dikuasai */}
                                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle2 className="text-emerald-500" size={20} />
                                        <h4 className="font-black text-emerald-700">SUDAH DIKUASAI ({masteredQuestions.length})</h4>
                                    </div>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                        {masteredQuestions.length > 0 ? (
                                            masteredQuestions.map(q => (
                                                <div key={q.id} className="bg-white p-3 rounded-xl text-xs font-bold text-gray-700">
                                                    {q.question}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-emerald-400 text-xs italic">Belum ada soal yang dikuasai</p>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Belum Dikuasai */}
                                <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <AlertCircle className="text-rose-500" size={20} />
                                        <h4 className="font-black text-rose-700">PERLU LATIHAN LAGI ({notMasteredQuestions.length})</h4>
                                    </div>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                        {notMasteredQuestions.length > 0 ? (
                                            notMasteredQuestions.map(q => (
                                                <div key={q.id} className="bg-white p-3 rounded-xl text-xs font-bold text-gray-700">
                                                    {q.question}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-rose-400 text-xs italic">Semua soal sudah dikuasai! 🎉</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                </>
            )}
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default StudyMode;
