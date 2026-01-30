
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';
import { PlusCircle, Trash2, Wallet, MessageCircle, TrendingUp, RefreshCw, XCircle, Briefcase, Bell } from 'lucide-react';

interface Round {
    id: number;
    label: string;
    date: string;
}

interface TSK {
    id: number;
    name: string;
    status: string;
    salary: number;
    rounds: Round[];
    notes: string;
    retro: string;
}

interface Props {
    tskList: TSK[];
    setTskList: (val: TSK[]) => void;
}

const TSKTracker: React.FC<Props> = ({ tskList, setTskList }) => {
    const [exchangeRate, setExchangeRate] = useState(105.5);
    const [lastFetch, setLastFetch] = useState<string>('Manual');
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        loadTSK();
    }, []);

    const loadTSK = async () => {
        const { data } = await supabase.from('tsk_applications').select('*').order('created_at', { ascending: false });
        if (data) {
            setTskList(data.map((t: any) => ({
                id: t.id,
                name: t.name,
                status: t.status,
                salary: t.salary,
                rounds: t.rounds || [],
                notes: t.notes,
                retro: t.retro
            })));
        }
    };

    const saveTSK = async (t: TSK) => {
        await supabase.from('tsk_applications').upsert({
            id: t.id,
            name: t.name,
            status: t.status,
            salary: t.salary,
            rounds: t.rounds,
            notes: t.notes,
            retro: t.retro
        });
    };

    const deleteTSK = async (id: number) => {
        await supabase.from('tsk_applications').delete().eq('id', id);
    };

    // Live Exchange Rate Fetcher
    const fetchKurs = async () => {
        setIsFetching(true);
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/JPY');
            const data = await response.json();
            if (data && data.rates && data.rates.IDR) {
                setExchangeRate(data.rates.IDR);
                setLastFetch(new Date().toLocaleTimeString());
            }
        } catch (error) {
            console.error('Gagal ambil kurs:', error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchKurs();
    }, []);

    // Memoized next interview logic
    const nextInterview = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        const all = tskList.flatMap(t => 
            (t.rounds || []).map((r: any) => ({
                date: r.date,
                name: t.name,
                round: r.label
            }))
        ).filter(item => item.date && new Date(item.date) >= now);
        
        return all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    }, [tskList]);

const addRound = async (tskId: number) => {
    const updated = tskList.map(t => {
        if (t.id === tskId) {
            const nextId = t.rounds.length + 1;
            return {
                ...t,
                rounds: [...t.rounds, { id: Date.now(), label: `ROUND ${nextId}`, date: '' }]
            };
        }
        return t;
    });
    setTskList(updated);
    const updatedItem = updated.find(t => t.id === tskId);
    if (updatedItem) await saveTSK(updatedItem);
};

const removeRound = async (tskId: number, roundId: number) => {
    const updated = tskList.map(t => {
        if (t.id === tskId) {
            return {
                ...t,
                rounds: t.rounds.filter(r => r.id !== roundId)
            };
        }
        return t;
    });
    setTskList(updated);
    const updatedItem = updated.find(t => t.id === tskId);
    if (updatedItem) await saveTSK(updatedItem);
};

const updateRound = async (tskId: number, roundId: number, field: keyof Round, value: string) => {
    const updated = tskList.map(t => {
        if (t.id === tskId) {
            return {
                ...t,
                rounds: t.rounds.map(r => r.id === roundId ? { ...r, [field]: value } : r)
            };
        }
        return t;
    });
    setTskList(updated);
    const updatedItem = updated.find(t => t.id === tskId);
    if (updatedItem) await saveTSK(updatedItem);
};

const handleAddTsk = async () => {
    const newTsk = { 
        id: Date.now(), 
        name: "Nama TSK", 
        status: "Screening", 
        salary: 180000, 
        rounds: [{ id: 1, label: 'ROUND 1', date: '' }], 
        notes: "", 
        retro: "" 
    };
    await saveTSK(newTsk);
    setTskList([newTsk, ...tskList]);
};

    return (
        <div className="space-y-10 fade-in pb-20 pt-10 md:pt-0">
            {/* Header & Kurs Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black">TSK Pipeline</h1>
                    <p className="text-indigo-400 font-black text-xs uppercase tracking-widest">Katalog Lamaran Kerja Jati</p>
                </div>
                
                <div className="flex items-center gap-6 bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Live Kurs JPY ➔ IDR</p>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-indigo-900">¥1 = Rp {exchangeRate.toFixed(2)}</span>
                            <button onClick={fetchKurs} className={`p-2 bg-white rounded-xl text-indigo-600 shadow-sm active:scale-95 transition-all ${isFetching ? 'animate-spin' : ''}`}>
                                <RefreshCw size={14} />
                            </button>
                        </div>
                        <p className="text-[8px] font-bold text-gray-400">Update: {lastFetch}</p>
                    </div>
                    <button onClick={handleAddTsk} className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-all">
                        <PlusCircle size={18} /> TAMBAH TARGET
                    </button>
                </div>
            </div>

            {/* Notification Banner */}
            {nextInterview && (
                <div className="bg-rose-50 border-2 border-rose-100 p-8 rounded-[48px] flex items-center gap-8 animate-in slide-in-from-top duration-500 shadow-sm">
                    <div className="w-16 h-16 bg-rose-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-rose-200"><Bell size={28} className="animate-bounce" /></div>
                    <div className="flex-1">
                        <h4 className="text-rose-900 font-black text-xl">Interview Terdekat!</h4>
                        <p className="text-rose-500 font-bold">Dengan {nextInterview.name} — {nextInterview.round}</p>
                        <p className="text-[10px] text-rose-300 font-black uppercase mt-1">Tanggal: {new Date(nextInterview.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
            )}

            <div className="space-y-8">
                {tskList.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-[56px] border-4 border-dashed border-gray-100">
                        <Briefcase size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 font-black">BELUM ADA TARGET LAMARAN</p>
                        <p className="text-gray-300 text-xs mt-1">Klik tombol di atas untuk mulai memantau TSK.</p>
                    </div>
                )}
                {tskList.map(tsk => (
                    <div key={tsk.id} className="bg-white p-8 md:p-10 rounded-[56px] shadow-sm border border-gray-100 space-y-10 group relative slide-up">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {/* Info Dasar */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Info Dasar</h3>
                                <input value={tsk.name} onChange={(e) => {
    const updated = tskList.map(t => t.id === tsk.id ? {...t, name: e.target.value} : t);
    setTskList(updated);
    const updatedItem = updated.find(t => t.id === tsk.id);
    if (updatedItem) saveTSK(updatedItem);
}} className="text-2xl md:text-3xl font-black text-gray-900 bg-transparent outline-none w-full border-b border-transparent focus:border-indigo-100" placeholder="Nama TSK" />
                                <select value={tsk.status} onChange={(e) => {
    const updated = tskList.map(t => t.id === tsk.id ? {...t, status: e.target.value} : t);
    setTskList(updated);
    const updatedItem = updated.find(t => t.id === tsk.id);
    if (updatedItem) saveTSK(updatedItem);
}} className="bg-indigo-50 text-indigo-600 px-6 py-2 rounded-full font-black text-[10px] uppercase border-none outline-none cursor-pointer">
                                    <option>Screening</option><option>Interview</option><option>Offer</option><option>Rejected</option>
                                </select>
                            </div>

                            {/* Gaji */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Penawaran Gaji</h3>
                                <div className="flex items-center gap-3">
                                    <span className="font-black text-gray-400">¥</span>
                                    <input type="number" value={tsk.salary} onChange={(e) => {
    const updated = tskList.map(t => t.id === tsk.id ? {...t, salary: parseInt(e.target.value) || 0} : t);
    setTskList(updated);
    const updatedItem = updated.find(t => t.id === tsk.id);
    if (updatedItem) saveTSK(updatedItem);
}} className="text-3xl font-black text-indigo-600 bg-transparent outline-none w-full" />
                                </div>
                                <p className="text-sm font-bold text-emerald-600 flex items-center gap-2"><Wallet size={14} /> ≈ Rp {(tsk.salary * exchangeRate).toLocaleString('id-ID')}</p>
                            </div>

                            {/* Stage Jadwal Dinamis */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stage Jadwal</h3>
                                    <button onClick={() => addRound(tsk.id)} className="p-1 text-indigo-500 hover:text-indigo-700 transition-colors"><PlusCircle size={16}/></button>
                                </div>
                                <div className="space-y-3 max-h-48 overflow-y-auto custom-scroll pr-2">
                                    {tsk.rounds.map((round) => (
                                        <div key={round.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl group/round">
                                            <input 
                                                value={round.label} 
                                                onChange={(e) => updateRound(tsk.id, round.id, 'label', e.target.value)} 
                                                className="bg-transparent text-[10px] font-black w-20 outline-none uppercase text-gray-500" 
                                            />
                                            <input 
                                                type="date" 
                                                value={round.date} 
                                                onChange={(e) => updateRound(tsk.id, round.id, 'date', e.target.value)} 
                                                className="bg-transparent text-xs font-bold outline-none flex-1" 
                                            />
                                            <button onClick={() => removeRound(tsk.id, round.id)} className="text-rose-300 hover:text-rose-500 opacity-0 group-hover/round:opacity-100 transition-opacity">
                                                <XCircle size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {tsk.rounds.length === 0 && <p className="text-[9px] text-gray-300 italic">Belum ada jadwal...</p>}
                                </div>
                            </div>
                        </div>

                        {/* Catatan & Retro */}
                        <div className="pt-10 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><MessageCircle size={14} /> Catatan Khusus</h3>
                                <textarea value={tsk.notes} onChange={(e) => {
    const updated = tskList.map(t => t.id === tsk.id ? {...t, notes: e.target.value} : t);
    setTskList(updated);
    const updatedItem = updated.find(t => t.id === tsk.id);
    if (updatedItem) saveTSK(updatedItem);
}} className="w-full h-24 bg-gray-50 p-6 rounded-[35px] text-sm outline-none resize-none border border-transparent focus:border-indigo-100" placeholder="Apa yang harus disiapkan? (Pakaian, Dokumen, dll)" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-2"><TrendingUp size={14} /> Retrospective / Evaluasi</h3>
                                <textarea value={tsk.retro} onChange={(e) => {
    const updated = tskList.map(t => t.id === tsk.id ? {...t, retro: e.target.value} : t);
    setTskList(updated);
    const updatedItem = updated.find(t => t.id === tsk.id);
    if (updatedItem) saveTSK(updatedItem);
}} className="w-full h-24 bg-orange-50/30 p-6 rounded-[35px] text-sm outline-none resize-none border border-transparent focus:border-orange-100" placeholder="Apa yang kurang dari interview kemarin?" />
                            </div>
                        </div>

                        {/* Footer Area - Delete Button */}
                        <div className="pt-6 flex justify-center">
                            <button 
                                onClick={async () => {
    await deleteTSK(tsk.id);
    setTskList(tskList.filter(t => t.id !== tsk.id));
}} 
                                className="flex items-center gap-2 text-[10px] font-black text-rose-300 hover:text-rose-500 transition-all uppercase tracking-widest bg-rose-50/50 px-8 py-3 rounded-2xl hover:bg-rose-50 active:scale-95 border border-rose-100/50"
                            >
                                <Trash2 size={14} /> Hapus Lamaran Ini
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TSKTracker;
