
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { BrainCircuit, PlusCircle, Trash2, Languages, RotateCw, ChevronLeft, ChevronRight, Volume2, Edit3, X, GripVertical, Download, Upload, UserCircle, UserCircle2, ArrowLeftRight } from 'lucide-react';

interface Vocab {
    id: number;
    word: string;
    meaning: string;
    category: string;
}

interface Props {
    vocabList: Vocab[];
    setVocabList: (val: Vocab[]) => void;
}

const VocabHub: React.FC<Props> = ({ vocabList, setVocabList }) => {
    const [newWord, setNewWord] = useState('');
    const [newMeaning, setNewMeaning] = useState('');
    const [newCategory, setNewCategory] = useState('Umum');
    const [editingId, setEditingId] = useState<number | null>(null);
    const formRef = useRef<HTMLDivElement>(null);

    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [flashIndex, setFlashIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    
    // Fitur: Gender TTS & Flip Mode
    const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
    const [flipMode, setFlipMode] = useState<'JPtoID' | 'IDtoJP'>('JPtoID');
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [draggedId, setDraggedId] = useState<number | null>(null);

    useEffect(() => {
        loadVocab();
    }, []);

    const loadVocab = async () => {
        const { data } = await supabase.from('vocab').select('*').order('created_at', { ascending: true });
        if (data) {
            setVocabList(data.map((v: any) => ({
                id: v.id,
                word: v.word,
                meaning: v.meaning,
                category: v.category
            })));
        }
    };

    const saveVocab = async (v: Vocab) => {
        await supabase.from('vocab').upsert(v);
    };

    const deleteVocab = async (id: number) => {
        await supabase.from('vocab').delete().eq('id', id);
    };

    const handleDragStart = (id: number) => setDraggedId(id);

const handleDragOver = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (draggedId === null || draggedId === targetId) return;
    const newList = [...vocabList];
    const draggedIndex = newList.findIndex(v => v.id === draggedId);
    const targetIndex = newList.findIndex(v => v.id === targetId);
    if (draggedIndex !== -1 && targetIndex !== -1) {
        const item = newList[draggedIndex];
        newList.splice(draggedIndex, 1);
        newList.splice(targetIndex, 0, item);
        setVocabList(newList);
    }
};

const handleDragEnd = () => setDraggedId(null);

const exportCsv = () => {
    const header = "Kategori,Kata,Arti\n";
    const rows = vocabList.map(v => `"${v.category}","${v.word}","${v.meaning}"`).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocab_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
};

const importCsv = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (file) {
            const text = await file.text();
            const rows = text.split('\n').filter(r => r.trim()).slice(1); // Skip header
            const newVocabs = rows.map(r => {
                const p = r.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                return { 
                    id: Date.now() + Math.random(), 
                    category: p[0] || 'Umum', 
                    word: p[1] || '', 
                    meaning: p[2] || '' 
                };
            });
            
            for (const v of newVocabs) {
                await saveVocab(v);
            }
            setVocabList([...vocabList, ...newVocabs]);
        }
    };
    input.click();
};

    // --- TTS VOICE LOADING ---
    useEffect(() => {
        const loadVoices = () => {
            const allVoices = window.speechSynthesis.getVoices();
            // Ambil semua suara Jepang
            const japaneseVoices = allVoices.filter(v => v.lang.startsWith('ja'));
            console.log("Available Japanese Voices:", japaneseVoices.map(v => v.name));
            setAvailableVoices(japaneseVoices);
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    const categories = useMemo(() => {
        const cats = Array.from(new Set(vocabList.map(v => v.category))).filter(Boolean);
        return ['Semua', ...cats];
    }, [vocabList]);

    const filteredList = useMemo(() => {
        return selectedCategory === 'Semua' 
            ? vocabList 
            : vocabList.filter(v => v.category === selectedCategory);
    }, [vocabList, selectedCategory]);

    useEffect(() => {
        setFlashIndex(0);
        setIsFlipped(false);
    }, [selectedCategory]);

const handleSaveVocab = async () => {
    if (!newWord.trim() || !newMeaning.trim()) return;
    if (editingId !== null) {
        const updated = { id: editingId, word: newWord, meaning: newMeaning, category: newCategory || 'Umum' };
        await saveVocab(updated);
        setVocabList(vocabList.map(v => v.id === editingId ? updated : v));
        setEditingId(null);
    } else {
        const newVocab = { id: Date.now(), word: newWord, meaning: newMeaning, category: newCategory || 'Umum' };
        await saveVocab(newVocab);
        setVocabList([...vocabList, newVocab]);
    }
    setNewWord(''); setNewMeaning('');
};

    const speak = (text: string) => {
        if (!text) return;
        if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.85;

        if (availableVoices.length > 0) {
            // Kamus kata kunci suara
            const femaleKeywords = ['female', 'ayumi', 'haruka', 'kyoko', 'mizuki', 'sayaka', 'nanako', 'google 日本語'];
            const maleKeywords = ['male', 'ichiro', 'otoya', 'keita', 'takumi', 'keisuke'];

            let selectedVoice = null;
            if (voiceGender === 'female') {
                selectedVoice = availableVoices.find(v => 
                    femaleKeywords.some(key => v.name.toLowerCase().includes(key))
                );
            } else {
                // Pencarian suara cowok lebih teliti
                selectedVoice = availableVoices.find(v => 
                    maleKeywords.some(key => v.name.toLowerCase().includes(key))
                );
            }
            
            // Jika tidak ketemu yang spesifik sesuai gender, pakai yang pertama saja (fallback)
            utterance.voice = selectedVoice || availableVoices[0];
            
            // Debugging (opsional, bisa dilihat di console jika suara tetap cewek)
            if (selectedVoice) console.log(`Using voice: ${selectedVoice.name}`);
        }
        
        window.speechSynthesis.speak(utterance);
    };

    const currentCard = filteredList[flashIndex];

    return (
        <div className="space-y-12 fade-in pb-20 pt-4 md:pt-0">
<div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
    <div className="space-y-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Vocab Hub Pro</h1>
        <p className="text-indigo-500 font-black text-[10px] uppercase tracking-[0.3em]">Flashcards untuk hafalan kotoba</p>
    </div>
    <div className="flex gap-4">
        <button onClick={importCsv} className="flex items-center gap-3 bg-indigo-50 text-indigo-600 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-indigo-100 transition-all">
            <Upload size={18} /> IMPORT CSV
        </button>
        <button onClick={exportCsv} className="flex items-center gap-3 bg-emerald-50 text-emerald-600 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-emerald-100 transition-all">
            <Download size={18} /> EXPORT CSV
        </button>
    </div>
</div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
                <div className="xl:col-span-2 bg-white p-8 md:p-10 rounded-[48px] border border-gray-100 space-y-8 shadow-sm flex flex-col h-[800px] slide-up">
                    <h3 className="text-xl font-black text-indigo-600 flex items-center gap-3"><Languages /> Daftar Kotoba</h3>
                    
                    <div ref={formRef} className={`p-6 rounded-[35px] border-2 transition-all space-y-3 ${editingId ? 'bg-emerald-50 border-emerald-200' : 'bg-indigo-50/50 border-indigo-100'}`}>
                        {editingId && <button onClick={() => setEditingId(null)} className="float-right text-emerald-400"><X size={16}/></button>}
                        <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Kategori (Umum, Kerja, Medis...)" className="w-full p-4 bg-white rounded-2xl font-bold border-none outline-none text-xs shadow-inner" />
                        <input value={newWord} onChange={(e) => setNewWord(e.target.value)} placeholder="Kata Jepang" className="w-full p-4 bg-white rounded-2xl font-bold border-none outline-none text-xs shadow-inner" />
                        <input value={newMeaning} onChange={(e) => setNewMeaning(e.target.value)} placeholder="Arti" className="w-full p-4 bg-white rounded-2xl font-bold border-none outline-none text-xs shadow-inner" />
                        <button onClick={handleSaveVocab} className={`w-full p-5 rounded-2xl text-white font-black text-[10px] tracking-widest transition-all active:scale-95 ${editingId ? 'bg-emerald-500' : 'bg-indigo-600'}`}>
                            {editingId ? 'SIMPAN PERUBAHAN' : 'TAMBAH KATA'}
                        </button>
                    </div>

<div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
    {categories.map(cat => (
        <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}>
            {cat}
        </button>
    ))}
</div>

<div className="flex-1 overflow-y-auto custom-scroll space-y-3 pr-2">
    {filteredList.map((item) => (
        <div 
            key={item.id} 
            draggable
            onDragStart={() => handleDragStart(item.id)}
            onDragOver={(e) => handleDragOver(e, item.id)}
            onDragEnd={handleDragEnd}
            className={`p-5 border rounded-3xl flex items-center justify-between transition-all cursor-grab active:cursor-grabbing ${
                draggedId === item.id 
                    ? 'opacity-30 scale-95 bg-gray-50 border-indigo-200' 
                    : 'bg-white border-gray-100 hover:shadow-lg'
            }`}
        >
            <GripVertical size={16} className="text-gray-200 mr-2" />
                                <div>
                                    <span className="text-[7px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-400">{item.category}</span>
                                    <p className="text-sm font-black text-gray-900 mt-1">{item.word}</p>
                                    <p className="text-[10px] font-bold text-gray-400 italic">"{item.meaning}"</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => speak(item.word)} className="p-3 text-indigo-300 hover:text-indigo-600"><Volume2 size={16} /></button>
                                    <button onClick={() => { setEditingId(item.id); setNewWord(item.word); setNewMeaning(item.meaning); setNewCategory(item.category); }} className="p-3 text-gray-300 hover:text-gray-900"><Edit3 size={16} /></button>
                                    <button onClick={async () => {
    await deleteVocab(item.id);
    setVocabList(vocabList.filter(v => v.id !== item.id));
}} className="text-rose-200 p-3 hover:text-rose-500"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="xl:col-span-3 bg-indigo-600 p-8 md:p-14 rounded-[64px] shadow-2xl flex flex-col items-center justify-between h-[800px] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent"></div>
                    
                    <div className="w-full flex justify-between items-center relative z-10">
                        <button onClick={() => setFlipMode(flipMode === 'JPtoID' ? 'IDtoJP' : 'JPtoID')} className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all">
                            <ArrowLeftRight size={16} /> {flipMode === 'JPtoID' ? 'JP ➔ ID' : 'ID ➔ JP'}
                        </button>
                        <div className="flex bg-white/10 p-2 rounded-2xl gap-2">
                             <button onClick={() => setVoiceGender('female')} className={`p-2.5 rounded-xl transition-all ${voiceGender === 'female' ? 'bg-white text-indigo-600 scale-110' : 'text-indigo-200'}`} title="Suara Cewe"><UserCircle size={20}/></button>
                             <button onClick={() => setVoiceGender('male')} className={`p-2.5 rounded-xl transition-all ${voiceGender === 'male' ? 'bg-white text-indigo-600 scale-110' : 'text-indigo-200'}`} title="Suara Cowo"><UserCircle2 size={20}/></button>
                        </div>
                    </div>

                    {currentCard ? (
                        <div className="w-full max-w-lg space-y-12 relative z-10 flex flex-col items-center">
                            <div className="h-[450px] w-full perspective cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                                <div className={`relative h-full w-full transition-all duration-700 preserve-3d ${isFlipped ? 'my-rotate-y-180' : ''}`}>
                                    <div className="absolute inset-0 backface-hidden bg-white rounded-[64px] flex flex-col items-center justify-center p-12 text-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-b-8 border-indigo-100">
                                        <h4 className="font-black text-gray-900 text-6xl tracking-tight leading-tight">
                                            {flipMode === 'JPtoID' ? currentCard.word : currentCard.meaning}
                                        </h4>
                                        <p className="mt-12 text-indigo-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-3"><RotateCw size={16}/> Klik kartu untuk memutar</p>
                                    </div>
                                    <div className="absolute inset-0 backface-hidden my-rotate-y-180 bg-emerald-500 rounded-[64px] flex flex-col items-center justify-center p-12 text-center text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">
                                        <h4 className="font-black text-5xl tracking-tight leading-tight">
                                            {flipMode === 'JPtoID' ? currentCard.meaning : currentCard.word}
                                        </h4>
                                        <button onClick={(e) => { e.stopPropagation(); speak(currentCard.word); }} className="mt-10 p-5 bg-white/20 rounded-full hover:bg-white/30 transition-all">
                                            <Volume2 size={32} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-10">
                                <button onClick={() => setFlashIndex((flashIndex - 1 + filteredList.length) % filteredList.length)} className="p-5 bg-white/10 rounded-3xl text-white hover:bg-white/20 transition-all"><ChevronLeft size={32}/></button>
                                <div className="bg-white/10 px-8 py-4 rounded-3xl backdrop-blur-md">
                                    <span className="text-white font-black text-xl">{flashIndex + 1} <span className="opacity-30 text-sm">/ {filteredList.length}</span></span>
                                </div>
                                <button onClick={() => setFlashIndex((flashIndex + 1) % filteredList.length)} className="p-5 bg-white/10 rounded-3xl text-white hover:bg-white/20 transition-all"><ChevronRight size={32}/></button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-24 bg-white/5 rounded-[80px] border border-white/10 backdrop-blur-lg">
                           <BrainCircuit size={80} className="mx-auto text-indigo-300 opacity-20 animate-pulse" />
                           <p className="text-white/40 mt-8 font-black uppercase tracking-[0.3em] text-sm">Pilih Kategori atau Tambah Kata Baru</p>
                        </div>
                    )}
                    <div className="h-4"></div>
                </div>
            </div>
            <style>{`
                .perspective { perspective: 2000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .my-rotate-y-180 { transform: rotateY(180deg); }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
};

export default VocabHub;
