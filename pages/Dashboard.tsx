
import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../supabase';
import { ClipboardList, CheckCircle2, RotateCcw, Square, Trash2, Edit3, GripVertical } from 'lucide-react';

interface Props {
    userName: string;
    roadmapSteps: any[];
    setRoadmapSteps: (val: any) => void;
    targetDate: string;
    setTargetDate: (val: string) => void;
    certStatus: string;
    setCertStatus: (val: string) => void;
    tskList: any[];
}

const Dashboard: React.FC<Props> = ({ userName, roadmapSteps, setRoadmapSteps, targetDate, setTargetDate, certStatus, setCertStatus }) => {
    const [editingMetric, setEditingMetric] = useState<null | 'target' | 'cert'>(null);
    const [draggedId, setDraggedId] = useState<number | null>(null);

    useEffect(() => {
        loadRoadmap();
        loadSettings();
    }, []);

    const loadRoadmap = async () => {
        const { data } = await supabase.from('roadmap_steps').select('*').order('order_index', { ascending: true });
        if (data) {
            setRoadmapSteps(data.map((r: any, index: number) => ({
                id: r.id,
                label: r.label,
                status: r.status
            })));
        }
    };

    const loadSettings = async () => {
        const { data } = await supabase.from('user_settings').select('*').single();
        if (data) {
            setTargetDate(data.target_date);
            setCertStatus(data.cert_status);
        }
    };

    const saveRoadmapStep = async (step: any) => {
        await supabase.from('roadmap_steps').upsert({
            id: step.id,
            label: step.label,
            status: step.status,
            order_index: roadmapSteps.findIndex(s => s.id === step.id)
        });
    };

    const deleteRoadmapStep = async (id: number) => {
        await supabase.from('roadmap_steps').delete().eq('id', id);
    };

const saveSettings = async () => {
    console.log('🔥 SAVING SETTINGS:', { targetDate, certStatus });
    
    try {
        // UPDATE instead of UPSERT
        const { data, error } = await supabase
            .from('user_settings')
            .update({
                target_date: targetDate,
                cert_status: certStatus
            })
            .eq('user_id', 'default-user');
        
        if (error) {
            console.error('❌ ERROR SAVING:', error);
        } else {
            console.log('✅ SAVED SUCCESSFULLY:', data);
        }
    } catch (err) {
        console.error('❌ SAVE FAILED:', err);
    }
};

const handleDragStart = (id: number) => setDraggedId(id);

const handleDragOver = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (draggedId === null || draggedId === targetId) return;
    const newList = [...roadmapSteps];
    const draggedIndex = newList.findIndex(s => s.id === draggedId);
    const targetIndex = newList.findIndex(s => s.id === targetId);
    if (draggedIndex !== -1 && targetIndex !== -1) {
        const item = newList[draggedIndex];
        newList.splice(draggedIndex, 1);
        newList.splice(targetIndex, 0, item);
        setRoadmapSteps(newList);
        
        // Save all steps with updated order
        newList.forEach(async (step, index) => {
            await supabase.from('roadmap_steps').update({ order_index: index }).eq('id', step.id);
        });
    }
};

const handleDragEnd = () => setDraggedId(null);
    
    // Readiness score based ONLY on Recruitment Journey
    const readinessScore = useMemo(() => {
        if (!roadmapSteps.length) return 0;
        const doneCount = roadmapSteps.filter(s => s.status === 'done').length;
        return Math.round((doneCount / roadmapSteps.length) * 100);
    }, [roadmapSteps]);

    return (
        <div className="space-y-10 fade-in pb-20">
            <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Halo, {userName}! 🌸</h1>
                <p className="text-indigo-500 font-black uppercase text-[10px] tracking-[0.4em]">Skor Kesiapan: {readinessScore}%</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-50 p-8 rounded-[40px] border border-indigo-100 cursor-pointer group" onClick={() => setEditingMetric('target')}>
                    <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">Target Berangkat</h4>
                    {editingMetric === 'target' ? (
<input 
    autoFocus 
    value={targetDate} 
    onChange={(e) => setTargetDate(e.target.value)} 
    onBlur={() => {
        setEditingMetric(null);
        saveSettings();
    }} 
    className="text-2xl font-black bg-transparent border-b-2 border-indigo-400 outline-none w-full" 
/>
                    ) : <p className="text-3xl font-black text-indigo-900">{targetDate} <Edit3 size={14} className="inline opacity-20 group-hover:opacity-100" /></p>}
                </div>
                <div className="bg-emerald-50 p-8 rounded-[40px] border border-emerald-100 cursor-pointer group" onClick={() => setEditingMetric('cert')}>
                    <h4 className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4">Sertifikasi</h4>
                    {editingMetric === 'cert' ? (
<input 
    autoFocus 
    value={certStatus} 
    onChange={(e) => setCertStatus(e.target.value)} 
    onBlur={() => {
        setEditingMetric(null);
        saveSettings();
    }} 
    className="text-2xl font-black bg-transparent border-b-2 border-emerald-400 outline-none w-full" 
/>
                    ) : <p className="text-3xl font-black text-emerald-900">{certStatus} <Edit3 size={14} className="inline opacity-20 group-hover:opacity-100" /></p>}
                </div>
<div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-xl">
    <h4 className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-4">Readiness</h4>
    <p className="text-3xl font-black">{readinessScore}%</p>
</div>
            </div>

            <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100">
                <h3 className="text-xl font-black mb-10 flex items-center gap-3"><ClipboardList className="text-indigo-600" /> Recruitment Journey</h3>
                <div className="space-y-6">
                    {roadmapSteps.map(step => (
                        <div 
    key={step.id} 
    draggable
    onDragStart={() => handleDragStart(step.id)}
    onDragOver={(e) => handleDragOver(e, step.id)}
    onDragEnd={handleDragEnd}
    className={`flex items-center gap-6 group cursor-grab active:cursor-grabbing transition-all ${
        draggedId === step.id ? 'opacity-30 scale-95' : ''
    }`}
>
                            <GripVertical size={24} className="text-gray-200" />
                            <div onClick={async () => {
    const updated = roadmapSteps.map(s => s.id === step.id ? {...s, status: s.status === 'done' ? 'ongoing' : s.status === 'ongoing' ? 'pending' : 'done'} : s);
    setRoadmapSteps(updated);
    const updatedItem = updated.find(s => s.id === step.id);
    if (updatedItem) await saveRoadmapStep(updatedItem);
}} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white cursor-pointer transition-all ${step.status === 'done' ? 'bg-emerald-500 shadow-lg' : step.status === 'ongoing' ? 'bg-indigo-600' : 'bg-gray-100 text-gray-300'}`}>
                                {step.status === 'done' ? <CheckCircle2 /> : step.status === 'ongoing' ? <RotateCcw size={22} className="animate-spin" /> : <Square />}
                            </div>
                            <div className={`flex-1 p-8 rounded-[35px] border-2 flex items-center justify-between ${step.status === 'ongoing' ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-100'}`}>
                                <input 
                                    value={step.label} 
                                    onChange={(e) => {
    const updated = roadmapSteps.map(s => s.id === step.id ? {...s, label: e.target.value} : s);
    setRoadmapSteps(updated);
    const updatedItem = updated.find(s => s.id === step.id);
    if (updatedItem) saveRoadmapStep(updatedItem);
}}
                                    className={`font-black text-xl bg-transparent outline-none w-full ${step.status === 'done' ? 'line-through opacity-40' : ''}`}
                                    placeholder="Nama Langkah..."
                                />
                                <button onClick={async () => {
    await deleteRoadmapStep(step.id);
    setRoadmapSteps(roadmapSteps.filter(s => s.id !== step.id));
}} className="text-rose-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity ml-4"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))}
                    <button onClick={async () => {
    const newStep = { id: Date.now(), label: "Langkah Baru", status: "pending" };
    await saveRoadmapStep(newStep);
    setRoadmapSteps([...roadmapSteps, newStep]);
}} className="w-full py-8 border-4 border-dashed border-gray-100 rounded-[35px] text-gray-300 font-black hover:bg-gray-50 transition-all">+ TAMBAH PROGRESS</button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
