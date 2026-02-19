import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../supabase';
import { ShieldCheck, PlusCircle, CheckSquare, Upload, Trash2, Download, StickyNote, Edit3, CheckCircle, Lock, GripVertical } from 'lucide-react';
import { initGoogleDrive, uploadToDrive } from '../utils/googleDrive';

interface Props {
    checklist: any[];
    setChecklist: (val: any) => void;
    docNotes: string;
    setDocNotes: (val: string) => void;
}

const DocumentHub: React.FC<Props> = ({ checklist, setChecklist, docNotes, setDocNotes }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [draggedId, setDraggedId] = useState<number | null>(null);

useEffect(() => {
    loadDocs();
    loadNotes();
    initGoogleDrive(); // Initialize Google Drive
}, []);

    const loadDocs = async () => {
        const { data } = await supabase.from('documents').select('*').order('order_index', { ascending: true });
        if (data) {
            setChecklist(data.map((d: any) => ({
                id: d.id,
                label: d.label,
                isDone: d.is_done,
                fileUrl: d.file_url,
                fileName: d.file_name
            })));
        }
    };

    const loadNotes = async () => {
        const { data } = await supabase.from('doc_notes').select('*').single();
        if (data) setDocNotes(data.content);
    };

const saveDoc = async (doc: any) => {
    await supabase.from('documents').upsert({
        id: doc.id,
        label: doc.label,
        is_done: doc.isDone,
        file_url: doc.fileUrl,
        file_name: doc.fileName,
        order_index: checklist.findIndex(d => d.id === doc.id)
    });
};

    const deleteDoc = async (id: number) => {
        await supabase.from('documents').delete().eq('id', id);
    };

    const saveNotes = async (content: string) => {
        try {
            const { error } = await supabase.from('doc_notes').upsert(
                { user_id: 'default-user', content },
                { onConflict: 'user_id' }
            );
            if (error) {
                console.error('Error saving notes:', error);
            } else {
                console.log('Notes saved successfully!');
            }
        } catch (err) {
            console.error('Save notes failed:', err);
        }
    };

const handleFileUpload = (id: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Upload to Google Drive
                const driveFile = await uploadToDrive(file);
                
                // Update checklist with Drive link
                const updated = checklist.map(i => 
                    i.id === id 
                    ? { ...i, isDone: true, fileUrl: driveFile.webViewLink, fileName: driveFile.name } 
                    : i
                );
                setChecklist(updated);
                
                // Save to database
                const updatedItem = updated.find(i => i.id === id);
                if (updatedItem) await saveDoc(updatedItem);
                
                alert('✅ File berhasil di-upload ke Google Drive!');
            } catch (error) {
                console.error('Upload error:', error);
                alert('❌ Upload gagal. Pastikan kamu sudah login ke Google.');
            }
        }
    };
    input.click();
};
    const handleDragStart = (id: number) => setDraggedId(id);

const handleDragOver = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (draggedId === null || draggedId === targetId) return;
    const newList = [...checklist];
    const draggedIndex = newList.findIndex(d => d.id === draggedId);
    const targetIndex = newList.findIndex(d => d.id === targetId);
    if (draggedIndex !== -1 && targetIndex !== -1) {
        const item = newList[draggedIndex];
        newList.splice(draggedIndex, 1);
        newList.splice(targetIndex, 0, item);
        setChecklist(newList);
        
        // Save order_index ke database
        newList.forEach(async (doc, index) => {
            await supabase.from('documents')
                .update({ order_index: index })
                .eq('id', doc.id);
        });
    }
};

    const handleDragEnd = () => setDraggedId(null);
    
    return (
        <div className="space-y-12 fade-in pb-20 pt-4 md:pt-0">
            <div className="space-y-2">
                <h1 className="text-4xl font-black">Document Hub</h1>
                <p className="text-emerald-500 font-black text-xs uppercase tracking-widest">Pusat Data & Berkas Jati</p>
            </div>

            {/* Checklist Section */}
            <div className="bg-white p-10 rounded-[48px] border border-gray-100 space-y-8 shadow-sm slide-up">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black text-emerald-600 flex items-center gap-3"><ShieldCheck /> Berkas Aman</h3>
                    <button onClick={async () => {
                        const newDoc = { id: Date.now(), label: "Dokumen Baru", isDone: false, fileUrl: null, fileName: null };
                        await saveDoc(newDoc);
                        setChecklist([...checklist, newDoc]);
                    }} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl transition-all active:scale-95"><PlusCircle size={24} /></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {checklist.map(item => (
                        <div 
                            key={item.id} 
                            draggable
                            onDragStart={() => handleDragStart(item.id)}
                            onDragOver={(e) => handleDragOver(e, item.id)}
                            onDragEnd={handleDragEnd}
                            className={`relative group cursor-grab active:cursor-grabbing transition-all ${
                                draggedId === item.id ? 'opacity-30 scale-95' : ''
                            }`}
                        >
                            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-4 transition-all hover:bg-white hover:shadow-lg">
                                <GripVertical size={20} className="text-gray-200 flex-shrink-0" />
                                
                                <button onClick={async () => {
                                    const updated = checklist.map(i => i.id === item.id ? {...i, isDone: !i.isDone} : i);
                                    setChecklist(updated);
                                    const updatedItem = updated.find(i => i.id === item.id);
                                    if (updatedItem) await saveDoc(updatedItem);
                                }} className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center transition-all ${item.isDone ? 'bg-emerald-500 text-white' : 'bg-white text-gray-200 border-2 border-gray-100'}`}>
                                    <CheckSquare size={20} />
                                </button>
                                
                                <div className="flex-1">
                                    <input value={item.label} onChange={(e) => {
                                        const updated = checklist.map(i => i.id === item.id ? {...i, label: e.target.value} : i);
                                        setChecklist(updated);
                                        const updatedItem = updated.find(i => i.id === item.id);
                                        if (updatedItem) saveDoc(updatedItem);
                                    }} className="font-bold bg-transparent outline-none text-gray-900 w-full" placeholder="Nama Dokumen..." />
                                    {item.fileName && <p className="text-[9px] font-bold text-indigo-400 mt-1 uppercase truncate max-w-[150px]">{item.fileName}</p>}
                                </div>
                                
                                <div className="flex gap-2 flex-shrink-0">
                                    <button onClick={() => handleFileUpload(item.id)} className="p-3 bg-white rounded-xl text-indigo-500 shadow-sm hover:bg-indigo-50" title="Upload Document"><Upload size={16} /></button>
                                    {item.fileUrl && (
                                        <a href={item.fileUrl} download={item.fileName || "document"} className="p-3 bg-white rounded-xl text-emerald-500 shadow-sm hover:bg-emerald-50" title="Download Document"><Download size={16} /></a>
                                    )}
                                </div>
                            </div>
                            
                            {/* Tombol X mini di pojok kanan atas */}
                            <button 
                                onClick={async () => {
                                    await deleteDoc(item.id);
                                    setChecklist(checklist.filter(i => i.id !== item.id));
                                }} 
                                className="absolute -top-2 -right-2 w-6 h-6 bg-rose-400 hover:bg-rose-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all opacity-0 group-hover:opacity-100"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Digital Notepad Section */}
            <div className="bg-white p-10 rounded-[48px] border border-gray-100 space-y-8 shadow-sm slide-up">
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-indigo-600 flex items-center gap-3"><StickyNote /> Digital Notepad</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-1">Template Email & Catatan Strategis</p>
                    </div>
                    <button 
                        onClick={() => setIsEditing(!isEditing)} 
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] transition-all uppercase tracking-widest shadow-md active:scale-95 ${isEditing ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-indigo-600 text-white shadow-indigo-200'}`}
                    >
                        {isEditing ? <CheckCircle size={18} /> : <Edit3 size={18} />} 
                        {isEditing ? 'SIMPAN CATATAN' : 'EDIT CATATAN'}
                    </button>
                </div>

                <div className="relative group">
                    <textarea 
                        value={docNotes} 
                        onChange={(e) => {
                            setDocNotes(e.target.value);
                            saveNotes(e.target.value);
                        }}
                        readOnly={!isEditing}
                        placeholder="Klik tombol 'EDIT CATATAN' untuk mulai menulis template email atau catatan di sini..."
                        className={`w-full h-[500px] p-10 rounded-[40px] border-4 transition-all outline-none font-bold text-sm leading-relaxed resize-none shadow-inner ${
                            isEditing 
                            ? 'bg-white border-indigo-100 text-gray-700 ring-4 ring-indigo-50' 
                            : 'bg-gray-50/50 border-transparent text-gray-400 cursor-not-allowed'
                        }`}
                    />
                    
                    <div className="absolute bottom-8 right-10 flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                            {isEditing ? 'Sedang Mengetik...' : 'Otomatis Tersimpan'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentHub;
