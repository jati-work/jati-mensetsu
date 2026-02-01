import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Trash2, Edit3, X, Plus, GripVertical, Download, Upload, Clock, Languages, Search } from 'lucide-react';

interface Question {
    id: number;
    category: string;
    question: string;
    answerJapanese: string;
    answerRomaji: string;
    answerIndo: string;
    mastered: boolean;
    timeLimit: number;
}

interface Props {
    questions: Question[];
    setQuestions: (val: Question[]) => void;
}

const Management: React.FC<Props> = ({ questions, setQuestions }) => {
    const [bulkCsv, setBulkCsv] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Question | null>(null);
    const [isAddingManual, setIsAddingManual] = useState(false);
const [addForm, setAddForm] = useState<Omit<Question, 'id' | 'mastered'>>({
    category: '', question: '', answerJapanese: '', answerRomaji: '', answerIndo: '', timeLimit: 30
});
const [searchQuery, setSearchQuery] = useState('');
const [categoryInput, setCategoryInput] = useState('');
const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);

// Ambil semua kategori unik yang pernah dibuat
const existingCategories = useMemo(() => {
    return Array.from(new Set(questions.map(q => q.category))).filter(cat => cat.trim() !== '');
}, [questions]);

    const [draggedId, setDraggedId] = useState<number | null>(null);

    // Load dari Supabase saat pertama kali
    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = async () => {
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .order('created_at', { ascending: true });
        
        if (data && data.length > 0) {
            const loaded = data.map((item: any) => ({
                id: item.id,
                category: item.category,
                question: item.question,
                answerJapanese: item.answer_japanese,
                answerRomaji: item.answer_romaji,
                answerIndo: item.answer_indo,
                mastered: item.mastered,
                timeLimit: item.time_limit
            }));
            setQuestions(loaded);
        }
    };

    const saveQuestion = async (q: Question) => {
        await supabase.from('questions').upsert({
            id: q.id,
            category: q.category,
            question: q.question,
            answer_japanese: q.answerJapanese,
            answer_romaji: q.answerRomaji,
            answer_indo: q.answerIndo,
            time_limit: q.timeLimit,
            mastered: q.mastered
        });
    };

    const deleteQuestion = async (id: number) => {
        await supabase.from('questions').delete().eq('id', id);
    };

    const handleDragStart = (id: number) => setDraggedId(id);
    const handleDragOver = (e: React.DragEvent, targetId: number) => {
        e.preventDefault();
        if (draggedId === null || draggedId === targetId) return;
        const newList = [...questions];
        const draggedIndex = newList.findIndex(q => q.id === draggedId);
        const targetIndex = newList.findIndex(q => q.id === targetId);
        if (draggedIndex !== -1 && targetIndex !== -1) {
            const item = newList[draggedIndex];
            newList.splice(draggedIndex, 1);
            newList.splice(targetIndex, 0, item);
            setQuestions(newList);
        }
    };
    const handleDragEnd = () => setDraggedId(null);

const saveEdit = async () => {
    if (editForm) {
        await saveQuestion(editForm);
        setQuestions(questions.map(q => q.id === editingId ? editForm : q));
        setEditingId(null);
    }
};

const saveManual = async () => {
    if (!addForm.question || !addForm.answerJapanese) return;
    const newQ = { id: Date.now(), ...addForm, mastered: false };
    await saveQuestion(newQ);
    setQuestions([...questions, newQ]);
    setIsAddingManual(false);
    setAddForm({ category: '', question: '', answerJapanese: '', answerRomaji: '', answerIndo: '', timeLimit: 30 });
};

    const exportCsv = () => {
        const header = "Kategori,Soal,Jepang,Romaji,Indo,Waktu\n";
        const rows = questions.map(q => `"${q.category}","${q.question}","${q.answerJapanese}","${q.answerRomaji}","${q.answerIndo}",${q.timeLimit}`).join("\n");
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `database_mensetsu_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="space-y-12 fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-gray-900">Database Management</h1>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Tahan & Geser kartu untuk ganti urutan</p>
                </div>
            </div>
            
            <div className="space-y-10">
                <div className="bg-white p-10 rounded-[48px] border border-gray-100 space-y-8 shadow-sm">
                    <h3 className="text-xl font-black text-indigo-600 flex items-center gap-3"><Upload size={20}/> Impor Massal</h3>
                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed">✨ Copy langsung dari Excel atau gunakan format: <code className="bg-gray-100 px-2 py-1 rounded">Kategori, Soal, Jepang, Romaji, Indo, Waktu</code></p>
                    <textarea value={bulkCsv} onChange={(e) => setBulkCsv(e.target.value)} className="w-full h-48 p-6 bg-gray-50 rounded-[30px] text-xs font-bold outline-none border-none resize-none shadow-inner" placeholder="📋 Copy paste langsung dari Excel atau ketik manual:
Perkenalan diri	お名前は何ですか？	私の名前はJatiです	Watashi no namae wa Jati desu	Nama saya Jati	30

Format: Kategori, Soal, Jepang, Romaji, Indo, Waktu" />
<button onClick={async () => {
    const rows = bulkCsv.split('\n').filter(r => r.trim());
    const newQ = rows.map(r => {
        // Auto-detect: Tab dari Excel atau Comma dari CSV
        const separator = r.includes('\t') ? '\t' : ',';
        const p = r.split(separator).map(v => v.trim().replace(/^"|"$/g, ''));
        
        return { 
            id: Date.now() + Math.random(), 
            category: p[0] || 'Umum', 
            question: p[1] || '?', 
            answerJapanese: p[2] || '', 
            answerRomaji: p[3] || '', 
            answerIndo: p[4] || '', 
            timeLimit: parseInt(p[5]) || 30, 
            mastered: false 
        };
    });
    
    for (const q of newQ) {
        await saveQuestion(q);
    }
    setQuestions([...questions, ...newQ]);
    setBulkCsv('');
}} className="w-full py-6 bg-gray-900 text-white rounded-[28px] font-black uppercase shadow-xl hover:bg-black transition-all">TAMBAH KE DATABASE</button>
                </div>

                <div className="space-y-6">
<div className="flex justify-between items-center px-4">
    <h3 className="text-xl font-black">Pertanyaan ({questions.length})</h3>
    <div className="flex gap-4">
        <button onClick={exportCsv} className="flex items-center gap-3 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-emerald-100 transition-all">
            <Download size={18} /> EXPORT CSV
        </button>
        <button onClick={() => setIsAddingManual(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
            <Plus size={16} /> TAMBAH MANUAL
        </button>
    </div>
</div>

{/* Search Bar */}
<div className="px-4">
    <div className="relative">
        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Cari pertanyaan, kategori, atau jawaban..."
            className="w-full pl-16 pr-6 py-5 bg-gray-50 rounded-[28px] font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-200 focus:bg-white transition-all shadow-inner"
        />
    </div>
</div>

<div className="space-y-6 max-h-[800px] overflow-y-auto custom-scroll pr-4">
                        {isAddingManual && (
                            <div className="p-8 rounded-[45px] border-4 border-dashed border-indigo-100 bg-indigo-50/20 slide-up space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
    <input 
        value={addForm.category} 
        onChange={(e) => {
            setAddForm({...addForm, category: e.target.value});
            setShowCategorySuggestions(true);
        }}
        onFocus={() => setShowCategorySuggestions(true)}
        className="bg-white p-5 rounded-2xl font-bold text-xs outline-none w-full" 
        placeholder="Kategori" 
    />
    {showCategorySuggestions && addForm.category && existingCategories.filter(cat => 
        cat.toLowerCase().includes(addForm.category.toLowerCase())
    ).length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-indigo-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
            {existingCategories
                .filter(cat => cat.toLowerCase().includes(addForm.category.toLowerCase()))
                .map((cat, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => {
                            setAddForm({...addForm, category: cat});
                            setShowCategorySuggestions(false);
                        }}
                        className="w-full text-left px-5 py-3 hover:bg-indigo-50 font-bold text-xs transition-all first:rounded-t-2xl last:rounded-b-2xl"
                    >
                        {cat}
                    </button>
                ))
            }
        </div>
    )}
</div>
                                    <input type="number" value={addForm.timeLimit} onChange={(e) => setAddForm({...addForm, timeLimit: parseInt(e.target.value)})} className="bg-white p-5 rounded-2xl font-bold text-xs outline-none" placeholder="Timer (detik)" />
                                </div>
                                <input value={addForm.question} onChange={(e) => setAddForm({...addForm, question: e.target.value})} className="w-full bg-white p-5 rounded-2xl font-bold text-xs outline-none" placeholder="Soal" />
                                <input value={addForm.answerJapanese} onChange={(e) => setAddForm({...addForm, answerJapanese: e.target.value})} className="w-full bg-white p-5 rounded-2xl font-bold text-xs outline-none" placeholder="Jawaban Jepang" />
                                <input value={addForm.answerRomaji} onChange={(e) => setAddForm({...addForm, answerRomaji: e.target.value})} className="w-full bg-white p-5 rounded-2xl font-bold text-xs outline-none" placeholder="Romaji" />
                                <input value={addForm.answerIndo} onChange={(e) => setAddForm({...addForm, answerIndo: e.target.value})} className="w-full bg-white p-5 rounded-2xl font-bold text-xs outline-none" placeholder="Terjemahan Indo" />
                                <div className="flex gap-4">
                                    <button onClick={saveManual} className="flex-1 py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase shadow-md">SIMPAN KARTU</button>
                                    <button onClick={() => setIsAddingManual(false)} className="px-10 py-5 bg-white text-gray-400 rounded-2xl font-black text-xs uppercase shadow-sm">BATAL</button>
                                </div>
                            </div>
                        )}

                        {questions.filter(q => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
        q.question.toLowerCase().includes(search) ||
        q.category.toLowerCase().includes(search) ||
        q.answerJapanese.toLowerCase().includes(search) ||
        q.answerRomaji.toLowerCase().includes(search) ||
        q.answerIndo.toLowerCase().includes(search)
    );
}).map((q) => (
                            <div 
                                key={q.id} 
                                draggable 
                                onDragStart={() => handleDragStart(q.id)}
                                onDragOver={(e) => handleDragOver(e, q.id)}
                                onDragEnd={handleDragEnd}
                                className={`p-8 rounded-[45px] border transition-all cursor-grab active:cursor-grabbing ${draggedId === q.id ? 'opacity-20 scale-95 border-indigo-300 shadow-inner' : 'bg-white border-gray-100 shadow-sm hover:border-indigo-100 hover:shadow-md'}`}
                            >
                                {editingId === q.id ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
    <input 
        value={editForm?.category} 
        onChange={(e) => {
            setEditForm(prev => prev ? {...prev, category: e.target.value} : null);
            setShowCategorySuggestions(true);
        }}
        onFocus={() => setShowCategorySuggestions(true)}
        className="bg-gray-50 p-4 rounded-xl font-bold text-xs w-full" 
    />
    {showCategorySuggestions && editForm?.category && existingCategories.filter(cat => 
        cat.toLowerCase().includes(editForm.category.toLowerCase())
    ).length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-indigo-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
            {existingCategories
                .filter(cat => cat.toLowerCase().includes(editForm.category.toLowerCase()))
                .map((cat, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => {
                            setEditForm(prev => prev ? {...prev, category: cat} : null);
                            setShowCategorySuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 font-bold text-xs transition-all first:rounded-t-2xl last:rounded-b-2xl"
                    >
                        {cat}
                    </button>
                ))
            }
        </div>
    )}
</div>
                                            <input type="number" value={editForm?.timeLimit} onChange={(e) => setEditForm(prev => prev ? {...prev, timeLimit: parseInt(e.target.value)} : null)} className="bg-gray-50 p-4 rounded-xl font-bold text-xs" />
                                        </div>
                                        <input value={editForm?.question} onChange={(e) => setEditForm(prev => prev ? {...prev, question: e.target.value} : null)} className="w-full bg-gray-50 p-4 rounded-xl font-bold text-xs" />
                                        <input value={editForm?.answerJapanese} onChange={(e) => setEditForm(prev => prev ? {...prev, answerJapanese: e.target.value} : null)} className="w-full bg-gray-50 p-4 rounded-xl font-bold text-xs" />
                                        <input value={editForm?.answerRomaji} onChange={(e) => setEditForm(prev => prev ? {...prev, answerRomaji: e.target.value} : null)} className="w-full bg-gray-50 p-4 rounded-xl font-bold text-xs" />
                                        <input value={editForm?.answerIndo} onChange={(e) => setEditForm(prev => prev ? {...prev, answerIndo: e.target.value} : null)} className="w-full bg-gray-50 p-4 rounded-xl font-bold text-xs" />
                                        <div className="flex gap-4 pt-2">
                                            <button onClick={saveEdit} className="flex-1 py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs">SIMPAN PERUBAHAN</button>
                                            <button onClick={() => setEditingId(null)} className="px-10 py-5 bg-gray-100 text-gray-400 rounded-2xl font-black text-xs">BATAL</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="flex-1 flex items-start gap-4">
                                            <GripVertical size={24} className="text-gray-200 mt-2" />
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full font-black text-[9px] uppercase tracking-wider">{q.category}</span>
                                                    <span className="px-4 py-1.5 bg-rose-50 text-rose-500 rounded-full font-black text-[9px] uppercase flex items-center gap-1"><Clock size={10}/> {q.timeLimit}s</span>
                                                </div>
                                                <h4 className="text-2xl font-black text-gray-900 leading-tight">{q.question}</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                                        <p className="text-[8px] font-black text-indigo-400 uppercase mb-1">Jepang</p>
                                                        <p className="text-sm font-black text-gray-700">{q.answerJapanese}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 mt-1 italic">{q.answerRomaji}</p>
                                                    </div>
                                                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                                        <p className="text-[8px] font-black text-emerald-400 uppercase mb-1">Indonesia</p>
                                                        <p className="text-sm font-bold text-gray-600 italic">"{q.answerIndo}"</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button onClick={() => { setEditingId(q.id); setEditForm(q); }} className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all shadow-sm" title="Edit"><Edit3 size={18} /></button>
<button onClick={async () => {
    await deleteQuestion(q.id);
    setQuestions(questions.filter(i => i.id !== q.id));
}} className="p-4 bg-rose-50 text-rose-400 rounded-2xl hover:bg-rose-100 hover:text-rose-600 transition-all shadow-sm" title="Hapus"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Management;
