import React, { useState, useEffect } from 'react';
import { ShieldCheck, PlusCircle, CheckSquare, Upload, Trash2, Download, StickyNote, Edit3, CheckCircle, Lock } from 'lucide-react';
import { supabase } from '../supabase';

interface Document {
    id: number;
    label: string;
    is_done: boolean;
    file_url: string | null;
    file_name: string | null;
}

interface Props {
    checklist: Document[];
    setChecklist: (val: Document[]) => void;
    docNotes: string;
    setDocNotes: (val: string) => void;
}

const DocumentHub: React.FC<Props> = ({ checklist, setChecklist, docNotes, setDocNotes }) => {
    const [isEditing, setIsEditing] = useState(false);

    // 🔥 LOAD DATA FROM SUPABASE
    useEffect(() => {
        loadDocumentsFromSupabase();
        loadNotesFromSupabase();
    }, []);

    const loadDocumentsFromSupabase = async () => {
        try {
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .order('id', { ascending: true });

            if (error) {
                console.error('Error loading documents:', error);
                return;
            }

            if (data) {
                setChecklist(data);
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const loadNotesFromSupabase = async () => {
        try {
            const { data, error } = await supabase
                .from('document_notes')
                .select('*')
                .eq('id', 1)
                .single();

            if (error) {
                console.error('Error loading notes:', error);
                return;
            }

            if (data) {
                setDocNotes(data.content || '');
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };

    // 🔥 SAVE DOCUMENT TO SUPABASE
    const saveDocumentToSupabase = async (newDoc: Omit<Document, 'id'>) => {
        try {
            const { data, error } = await supabase
                .from('documents')
                .insert([newDoc])
                .select();

            if (error) {
                console.error('Error saving document:', error);
                alert('Gagal menyimpan: ' + error.message);
                return null;
            }

            return data[0];
        } catch (err) {
            console.error('Error:', err);
            return null;
        }
    };

    // 🔥 UPDATE DOCUMENT TO SUPABASE
    const updateDocumentToSupabase = async (id: number, updates: Partial<Document>) => {
        try {
            const { error } = await supabase
                .from('documents')
                .update(updates)
                .eq('id', id);

            if (error) {
                console.error('Error updating document:', error);
                return false;
            }

            return true;
        } catch (err) {
            console.error('Error:', err);
            return false;
        }
    };

    // 🔥 DELETE DOCUMENT FROM SUPABASE
    const deleteDocumentFromSupabase = async (id: number) => {
        try {
            const { error } = await supabase
                .from('documents')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting document:', error);
                alert('Gagal hapus: ' + error.message);
                return false;
            }

            return true;
        } catch (err) {
            console.error('Error:', err);
            return false;
        }
    };

    // 🔥 SAVE NOTES TO SUPABASE (Auto-save on change)
    const saveNotesToSupabase = async (content: string) => {
        try {
            const { error } = await supabase
                .from('document_notes')
                .update({ content })
                .eq('id', 1);

            if (error) {
                console.error('Error saving notes:', error);
                return false;
            }

            return true;
        } catch (err) {
            console.error('Error:', err);
            return false;
        }
    };

    // Auto-save notes with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (docNotes !== undefined) {
                saveNotesToSupabase(docNotes);
            }
        }, 1000); // 1 second debounce

        return () => clearTimeout(timer);
    }, [docNotes]);

    const handleAddDocument = async () => {
        const newDoc = { label: "Dokumen Baru", is_done: false, file_url: null, file_name: null };
        const savedData = await saveDocumentToSupabase(newDoc);
        
        if (savedData) {
            setChecklist([...checklist, savedData]);
        }
    };

    const handleToggleDone = async (id: number, currentStatus: boolean) => {
        const success = await updateDocumentToSupabase(id, { is_done: !currentStatus });
        
        if (success) {
            setChecklist(checklist.map(i => i.id === id ? { ...i, is_done: !i.is_done } : i));
        }
    };

    const handleUpdateLabel = async (id: number, label: string) => {
        const success = await updateDocumentToSupabase(id, { label });
        
        if (success) {
            setChecklist(checklist.map(i => i.id === id ? { ...i, label } : i));
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus dokumen ini?')) return;
        
        const success = await deleteDocumentFromSupabase(id);
        if (success) {
            setChecklist(checklist.filter(i => i.id !== id));
        }
    };

    const handleFileUpload = async (id: number) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (file) {
                const fileUrl = URL.createObjectURL(file);
                const success = await updateDocumentToSupabase(id, { 
                    is_done: true, 
                    file_url: fileUrl, 
                    file_name: file.name 
                });
                
                if (success) {
                    setChecklist(checklist.map(i => i.id === id ? { ...i, is_done: true, file_url: fileUrl, file_name: file.name } : i));
                }
            }
        };
        input.click();
    };

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
                    <button onClick={handleAddDocument} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl transition-all active:scale-95"><PlusCircle size={24} /></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {checklist.map(item => (
                        <div key={item.id} className="p-6 bg-gray-50 rounded-3xl group border border-gray-100 flex items-center gap-4 transition-all hover:bg-white hover:shadow-lg">
                            <button onClick={() => handleToggleDone(item.id, item.is_done)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${item.is_done ? 'bg-emerald-500 text-white' : 'bg-white text-gray-200 border-2 border-gray-100'}`}><CheckSquare size={20} /></button>
                            <div className="flex-1">
                                <input value={item.label} onChange={(e) => handleUpdateLabel(item.id, e.target.value)} className="font-bold bg-transparent outline-none text-gray-900 w-full" placeholder="Nama Dokumen..." />
                                {item.file_name && <p className="text-[9px] font-bold text-indigo-400 mt-1 uppercase truncate max-w-[150px]">{item.file_name}</p>}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleFileUpload(item.id)} className="p-3 bg-white rounded-xl text-indigo-500 shadow-sm hover:bg-indigo-50" title="Upload Document"><Upload size={16} /></button>
                                {item.file_url && (
                                    <a href={item.file_url} download={item.file_name || "document"} className="p-3 bg-white rounded-xl text-emerald-500 shadow-sm hover:bg-emerald-50" title="Download Document"><Download size={16} /></a>
                                )}
                                <button onClick={() => handleDelete(item.id)} className="p-3 bg-white rounded-xl text-rose-300 hover:text-rose-500 shadow-sm" title="Hapus"><Trash2 size={16} /></button>
                            </div>
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
                        onChange={(e) => setDocNotes(e.target.value)}
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
