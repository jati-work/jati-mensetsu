import React, { useState, useMemo, useEffect } from 'react';
import { ClipboardList, CheckCircle2, RotateCcw, Square, Trash2, Edit3 } from 'lucide-react';
import { supabase } from '../supabase';

interface RoadmapStep {
    id: number;
    label: string;
    status: string; // 'pending' | 'ongoing' | 'done'
}

interface UserSettings {
    user_name: string;
    target_date: string;
    cert_status: string;
}

interface Props {
    userName: string;
    roadmapSteps: RoadmapStep[];
    setRoadmapSteps: (val: RoadmapStep[]) => void;
    targetDate: string;
    setTargetDate: (val: string) => void;
    certStatus: string;
    setCertStatus: (val: string) => void;
    tskList: any[];
}

const Dashboard: React.FC<Props> = ({ 
    userName, 
    roadmapSteps, 
    setRoadmapSteps, 
    targetDate, 
    setTargetDate, 
    certStatus, 
    setCertStatus 
}) => {
    const [editingMetric, setEditingMetric] = useState<null | 'target' | 'cert'>(null);

    // 🔥 LOAD DATA FROM SUPABASE
    useEffect(() => {
        loadRoadmapFromSupabase();
        loadUserSettingsFromSupabase();
    }, []);

    const loadRoadmapFromSupabase = async () => {
        try {
            const { data, error } = await supabase
                .from('roadmap')
                .select('*')
                .order('id', { ascending: true });

            if (error) {
                console.error('Error loading roadmap:', error);
                return;
            }

            if (data && data.length > 0) {
                setRoadmapSteps(data);
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const loadUserSettingsFromSupabase = async () => {
        try {
            const { data, error } = await supabase
                .from('user_settings')
                .select('*')
                .eq('id', 1)
                .single();

            if (error) {
                console.error('Error loading settings:', error);
                return;
            }

            if (data) {
                setTargetDate(data.target_date || targetDate);
                setCertStatus(data.cert_status || certStatus);
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };

    // 🔥 SAVE ROADMAP TO SUPABASE
    const saveRoadmapToSupabase = async (newStep: Omit<RoadmapStep, 'id'>) => {
        try {
            const { data, error } = await supabase
                .from('roadmap')
                .insert([newStep])
                .select();

            if (error) {
                console.error('Error saving roadmap:', error);
                alert('Gagal menyimpan: ' + error.message);
                return null;
            }

            return data[0];
        } catch (err) {
            console.error('Error:', err);
            return null;
        }
    };

    // 🔥 UPDATE ROADMAP TO SUPABASE
    const updateRoadmapToSupabase = async (id: number, updates: Partial<RoadmapStep>) => {
        try {
            const { error } = await supabase
                .from('roadmap')
                .update(updates)
                .eq('id', id);

            if (error) {
                console.error('Error updating roadmap:', error);
                return false;
            }

            return true;
        } catch (err) {
            console.error('Error:', err);
            return false;
        }
    };

    // 🔥 DELETE ROADMAP FROM SUPABASE
    const deleteRoadmapFromSupabase = async (id: number) => {
        try {
            const { error } = await supabase
                .from('roadmap')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting roadmap:', error);
                return false;
            }

            return true;
        } catch (err) {
            console.error('Error:', err);
            return false;
        }
    };

    // 🔥 UPDATE USER SETTINGS TO SUPABASE
    const updateUserSettingsToSupabase = async (updates: Partial<UserSettings>) => {
        try {
            const { error } = await supabase
                .from('user_settings')
                .update(updates)
                .eq('id', 1);

            if (error) {
                console.error('Error updating settings:', error);
                return false;
            }

            return true;
        } catch (err) {
            console.error('Error:', err);
            return false;
        }
    };

    // Readiness score based ONLY on Recruitment Journey
    const readinessScore = useMemo(() => {
        if (!roadmapSteps.length) return 0;
        const doneCount = roadmapSteps.filter(s => s.status === 'done').length;
        return Math.round((doneCount / roadmapSteps.length) * 100);
    }, [roadmapSteps]);

    const handleAddStep = async () => {
        const newStep = { label: "Langkah Baru", status: "pending" };
        const savedData = await saveRoadmapToSupabase(newStep);
        
        if (savedData) {
            setRoadmapSteps([...roadmapSteps, savedData]);
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: string) => {
        const nextStatus = 
            currentStatus === 'done' ? 'ongoing' : 
            currentStatus === 'ongoing' ? 'pending' : 
            'done';
        
        const success = await updateRoadmapToSupabase(id, { status: nextStatus });
        
        if (success) {
            setRoadmapSteps(roadmapSteps.map(s => s.id === id ? { ...s, status: nextStatus } : s));
        }
    };

    const handleUpdateLabel = async (id: number, label: string) => {
        const success = await updateRoadmapToSupabase(id, { label });
        
        if (success) {
            setRoadmapSteps(roadmapSteps.map(s => s.id === id ? { ...s, label } : s));
        }
    };

    const handleDeleteStep = async (id: number) => {
        const success = await deleteRoadmapFromSupabase(id);
        
        if (success) {
            setRoadmapSteps(roadmapSteps.filter(s => s.id !== id));
        }
    };

    const handleUpdateTargetDate = async (value: string) => {
        setTargetDate(value);
        await updateUserSettingsToSupabase({ target_date: value });
        setEditingMetric(null);
    };

    const handleUpdateCertStatus = async (value: string) => {
        setCertStatus(value);
        await updateUserSettingsToSupabase({ cert_status: value });
        setEditingMetric(null);
    };

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
                            onBlur={() => handleUpdateTargetDate(targetDate)} 
                            className="text-2xl font-black bg-transparent border-b-2 border-indigo-400 outline-none w-full" 
                        />
                    ) : (
                        <p className="text-3xl font-black text-indigo-900">{targetDate} <Edit3 size={14} className="inline opacity-20 group-hover:opacity-100" /></p>
                    )}
                </div>
                
                <div className="bg-emerald-50 p-8 rounded-[40px] border border-emerald-100 cursor-pointer group" onClick={() => setEditingMetric('cert')}>
                    <h4 className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4">Sertifikasi</h4>
                    {editingMetric === 'cert' ? (
                        <input 
                            autoFocus 
                            value={certStatus} 
                            onChange={(e) => setCertStatus(e.target.value)} 
                            onBlur={() => handleUpdateCertStatus(certStatus)} 
                            className="text-2xl font-black bg-transparent border-b-2 border-emerald-400 outline-none w-full" 
                        />
                    ) : (
                        <p className="text-3xl font-black text-emerald-900">{certStatus} <Edit3 size={14} className="inline opacity-20 group-hover:opacity-100" /></p>
                    )}
                </div>
                
                <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-xl flex flex-col justify-between">
                    <h4 className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Readiness</h4>
                    <p className="text-3xl font-black">{readinessScore}%</p>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100">
                <h3 className="text-xl font-black mb-10 flex items-center gap-3"><ClipboardList className="text-indigo-600" /> Recruitment Journey</h3>
                <div className="space-y-6">
                    {roadmapSteps.map(step => (
                        <div key={step.id} className="flex items-center gap-6 group">
                            <div 
                                onClick={() => handleToggleStatus(step.id, step.status)} 
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white cursor-pointer transition-all ${
                                    step.status === 'done' ? 'bg-emerald-500 shadow-lg' : 
                                    step.status === 'ongoing' ? 'bg-indigo-600' : 
                                    'bg-gray-100 text-gray-300'
                                }`}
                            >
                                {step.status === 'done' ? <CheckCircle2 /> : step.status === 'ongoing' ? <RotateCcw size={22} className="animate-spin" /> : <Square />}
                            </div>
                            <div className={`flex-1 p-8 rounded-[35px] border-2 flex items-center justify-between ${step.status === 'ongoing' ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-100'}`}>
                                <input 
                                    value={step.label} 
                                    onChange={(e) => handleUpdateLabel(step.id, e.target.value)} 
                                    className={`font-black text-xl bg-transparent outline-none w-full ${step.status === 'done' ? 'line-through opacity-40' : ''}`}
                                    placeholder="Nama Langkah..."
                                />
                                <button onClick={() => handleDeleteStep(step.id)} className="text-rose-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity ml-4"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))}
                    <button onClick={handleAddStep} className="w-full py-8 border-4 border-dashed border-gray-100 rounded-[35px] text-gray-300 font-black hover:bg-gray-50 transition-all">+ TAMBAH PROGRESS</button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
