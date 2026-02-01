
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { BrainCircuit, PlusCircle, Trash2, Languages, RotateCw, ChevronLeft, ChevronRight, Volume2, Edit3, X, GripVertical, Download, Upload, UserCircle, UserCircle2, ArrowLeftRight, Search, CheckCircle2, AlertCircle } from 'lucide-react';

interface Vocab {
    id: number;
    word: string;
    meaning: string;
    category: string;
    example_japanese?: string;
    example_indo?: string;
    mastered?: boolean;  // TAMBAH INI
}

interface Props {
    vocabList: Vocab[];
    setVocabList: (val: Vocab[]) => void;
}

const VocabHub: React.FC<Props> = ({ vocabList, setVocabList }) => {
    const [newWord, setNewWord] = useState('');
    const [newMeaning, setNewMeaning] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [newExampleJapanese, setNewExampleJapanese] = useState('');
    const [newExampleIndo, setNewExampleIndo] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const formRef = useRef<HTMLDivElement>(null);
    const editedItemRef = useRef<HTMLDivElement | null>(null);
    const [lastEditedId, setLastEditedId] = useState<number | null>(null);
    const [glowingId, setGlowingId] = useState<number | null>(null);

    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [flashIndex, setFlashIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    
    // Fitur: Gender TTS & Flip Mode
    const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
    const [flipMode, setFlipMode] = useState<'JPtoID' | 'IDtoJP'>('JPtoID');
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [draggedId, setDraggedId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [importResults, setImportResults] = useState<{success: string[], failed: string[]} | null>(null);
    const [showImportModal, setShowImportModal] = useState(false);
    // Ambil semua kategori unik
    const [showReview, setShowReview] = useState(false);
    const [studyMode, setStudyMode] = useState<'casual' | 'exam' | 'random' | 'examRandom'>('casual');
    const [timeLeft, setTimeLeft] = useState(10);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);
    const [reviewType, setReviewType] = useState<'mastered' | 'needsReview' | null>(null);
    const [answeredCount, setAnsweredCount] = useState(0);
    const [originalIndex, setOriginalIndex] = useState(0);

const playBeep = (frequency: number = 800, duration: number = 100) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
};

// ========== PASTE FILTEREDLIST DI SINI (BARIS 57-58) ==========
const filteredList = useMemo(() => {
    let filtered = selectedCategory === 'Semua' 
        ? vocabList 
        : vocabList.filter(v => v.category === selectedCategory);
    
    // Filter berdasarkan review type
    if (reviewType === 'mastered') {
        filtered = filtered.filter(v => v.mastered);
    } else if (reviewType === 'needsReview') {
        filtered = filtered.filter(v => !v.mastered);
    }
    
    if (searchQuery) {
        const search = searchQuery.toLowerCase();
        filtered = filtered.filter(v => 
            v.word.toLowerCase().includes(search) ||
            v.meaning.toLowerCase().includes(search) ||
            v.category.toLowerCase().includes(search)
        );
    }
    
    return filtered;
}, [vocabList, selectedCategory, searchQuery, reviewType]);
    
const existingCategories = useMemo(() => {
    return Array.from(new Set(vocabList.map(v => v.category))).filter(cat => cat.trim() !== '');
}, [vocabList]);
    
useEffect(() => {
    let timer: any;
    if (isTimerRunning && timeLeft > 0) {
        timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
        setIsTimerRunning(false);
        // Hapus auto next - biar user yang next manual
    }
    
    // Play beep untuk countdown 3, 2, 1
    if (isTimerRunning && timeLeft <= 3 && timeLeft > 0) {
        // Bunyi makin tinggi pas makin mendekati 0
        const freq = timeLeft === 3 ? 600 : timeLeft === 2 ? 800 : 1000;
        playBeep(freq, 100);
    }
    
    return () => clearInterval(timer);
}, [isTimerRunning, timeLeft, flashIndex, filteredList.length, studyMode]);

// Reset timer saat ganti kartu
useEffect(() => {
    if (studyMode === 'exam' || studyMode === 'examRandom') {
        setTimeLeft(10);
        setIsTimerRunning(true);
    }
    setIsFlipped(false);
}, [flashIndex, studyMode]);
    
useEffect(() => {
    loadVocab();
}, []);

// AUTO SCROLL #1: Saat MULAI EDIT → scroll ke kotak edit
useEffect(() => {
    if (editingId !== null && formRef.current) {
        setTimeout(() => {
            formRef.current?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 100);
    }
}, [editingId]);

// AUTO SCROLL #2: Saat SELESAI SAVE → scroll ke log yang baru di-edit
useEffect(() => {
    if (lastEditedId !== null && editedItemRef.current) {
        setTimeout(() => {
            editedItemRef.current?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // Trigger glow effect
            setGlowingId(lastEditedId);
            
            // Hilangkan glow setelah 2 detik
            setTimeout(() => {
                setGlowingId(null);
            }, 2000);
            
            setLastEditedId(null);
        }, 100);
    }
}, [lastEditedId]);

const loadVocab = async () => {
    const { data } = await supabase.from('vocab').select('*').order('order_index', { ascending: true });
    if (data) {
        setVocabList(data.map((v: any) => ({
            id: v.id,
            word: v.word,
            meaning: v.meaning,
            category: v.category,
            example_japanese: v.example_japanese || '',
            example_indo: v.example_indo || '',
            mastered: v.mastered || false
        })));
    }
};

const saveVocab = async (v: any) => {
    if (v.id) {
        // UPDATE data yang sudah ada
        const { data, error } = await supabase.from('vocab').update({
            word: v.word,
            meaning: v.meaning,
            category: v.category,
            example_japanese: v.example_japanese,
            example_indo: v.example_indo,
            mastered: v.mastered || false,
            order_index: vocabList.findIndex(voc => voc.id === v.id)
        }).eq('id', v.id).select();
        
        if (error) console.error('Error updating vocab:', error);
        return data ? data[0] : null;
    } else {
        // INSERT data baru (tanpa ID, biar Supabase auto-generate)
        const { data, error } = await supabase.from('vocab').insert({
            word: v.word,
            meaning: v.meaning,
            category: v.category,
            example_japanese: v.example_japanese,
            example_indo: v.example_indo,
            mastered: v.mastered || false,
            order_index: vocabList.length
        }).select();
        
        if (error) console.error('Error inserting vocab:', error);
        return data ? data[0] : null;
    }
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
        
        // Save order_index ke database
        newList.forEach(async (vocab, index) => {
            await supabase.from('vocab')
                .update({ order_index: index })
                .eq('id', vocab.id);
        });
    }
};

const handleDragEnd = () => setDraggedId(null);

const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
        setIsImporting(true);
        setImportProgress(0);
        setImportResults(null);
        setShowImportModal(true);
        
        // Import library XLSX
        const XLSX = await import('xlsx');
        
        setImportProgress(10);
        
        // Baca file Excel
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        setImportProgress(30);
        
        // Parse data dari Excel
        const parsedData = jsonData.map((row: any, index) => ({
            category: row.Category || row.category || 'Umum',
            word: row.Word || row.word || '',
            meaning: row.Meaning || row.meaning || '',
            example_japanese: row['Example Japanese'] || row.example_japanese || '',
            example_indo: row['Example Indo'] || row.example_indo || '',
            mastered: false,
            order_index: vocabList.length + index
        })).filter(item => item.word && item.meaning);
        
        setImportProgress(50);
        
        // Cek duplikat berdasarkan word
        const existingWords = new Set(vocabList.map(v => v.word.trim().toLowerCase()));
        const newData = parsedData.filter(item => 
            !existingWords.has(item.word.trim().toLowerCase())
        );
        const duplicates = parsedData.filter(item => 
            existingWords.has(item.word.trim().toLowerCase())
        );
        
        const successList: string[] = [];
        const failedList: string[] = [];
        
        // Tambah info duplikat
        duplicates.forEach(item => {
            failedList.push(`${item.word} (sudah ada di database)`);
        });
        
        // INSERT batch ke Supabase
        if (newData.length > 0) {
            const { data, error } = await supabase
                .from('vocab')
                .insert(newData)
                .select();
            
            setImportProgress(80);
            
            if (error) {
                console.error('Error bulk insert:', error);
                newData.forEach(item => failedList.push(`${item.word} (error: ${error.message})`));
            } else if (data) {
                const newVocabs = data.map((item: any) => ({
                    id: item.id,
                    word: item.word,
                    meaning: item.meaning,
                    category: item.category,
                    example_japanese: item.example_japanese || '',
                    example_indo: item.example_indo || '',
                    mastered: item.mastered || false
                }));
                
                setVocabList([...vocabList, ...newVocabs]);
                data.forEach(item => successList.push(item.word));
            }
        } else {
            setImportProgress(80);
        }
        
        setImportProgress(100);
        setImportResults({ success: successList, failed: failedList });
        
        // Reset file input
        event.target.value = '';
        
    } catch (err) {
        console.error('Error:', err);
        setImportResults({ 
            success: [], 
            failed: ['Error membaca file: ' + (err as Error).message] 
        });
    } finally {
        setIsImporting(false);
    }
};

const renderImportModal = () => {
    if (!showImportModal) return null;
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:pl-64">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 space-y-6">
                {isImporting && !importResults && (
                    <>
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full">
                                <Upload className="text-indigo-600 animate-bounce" size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900">Importing Vocab...</h3>
                            <p className="text-sm text-gray-500">Mohon tunggu, sedang memproses file</p>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${importProgress}%` }}
                                />
                            </div>
                            <p className="text-center text-sm font-bold text-indigo-600">{importProgress}%</p>
                        </div>
                    </>
                )}
                
                {importResults && (
                    <>
                        <div className="text-center space-y-3">
                            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
                                importResults.failed.length === 0 ? 'bg-emerald-100' : 'bg-amber-100'
                            }`}>
                                {importResults.failed.length === 0 ? (
                                    <span className="text-4xl">✅</span>
                                ) : (
                                    <span className="text-4xl">⚠️</span>
                                )}
                            </div>
                            <h3 className="text-2xl font-black text-gray-900">Import Selesai!</h3>
                        </div>
                        
                        <div className="space-y-4 max-h-80 overflow-y-auto">
                            {importResults.success.length > 0 && (
                                <div className="bg-emerald-50 rounded-2xl p-5 border-2 border-emerald-200">
                                    <p className="font-black text-emerald-700 text-sm mb-3">
                                        ✅ Berhasil ({importResults.success.length})
                                    </p>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {importResults.success.map((item, idx) => (
                                            <p key={idx} className="text-xs text-emerald-600 font-medium">
                                                • {item.length > 60 ? item.substring(0, 60) + '...' : item}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {importResults.failed.length > 0 && (
                                <div className="bg-rose-50 rounded-2xl p-5 border-2 border-rose-200">
                                    <p className="font-black text-rose-700 text-sm mb-3">
                                        ❌ Gagal ({importResults.failed.length})
                                    </p>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {importResults.failed.map((item, idx) => (
                                            <p key={idx} className="text-xs text-rose-600 font-medium">
                                                • {item.length > 60 ? item.substring(0, 60) + '...' : item}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <button 
                            onClick={() => {
                                setShowImportModal(false);
                                setImportResults(null);
                                setImportProgress(0);
                            }}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm transition-all"
                        >
                            TUTUP
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
    
const exportExcel = async () => {
    // Import library XLSX
    const XLSX = await import('xlsx');
    
    // Siapkan data
    const exportData = vocabList.map(v => ({
        'Category': v.category,
        'Word': v.word,
        'Meaning': v.meaning,
        'Example Japanese': v.example_japanese || '',
        'Example Indo': v.example_indo || ''
    }));
    
    // Buat worksheet dan workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vocab');
    
    // Download
    XLSX.writeFile(workbook, `vocab_${new Date().toISOString().split('T')[0]}.xlsx`);
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

    useEffect(() => {
        setFlashIndex(0);
        setIsFlipped(false);
    }, [selectedCategory]);

const handleSaveVocab = async () => {
    if (!newWord.trim() || !newMeaning.trim()) return;
    
    if (editingId !== null) {
        // EDIT MODE - cek duplikat SEMUA FIELD kecuali diri sendiri
        const duplicate = vocabList.find(v => 
            v.id !== editingId && 
            v.word.trim().toLowerCase() === newWord.trim().toLowerCase() &&
            v.meaning.trim().toLowerCase() === newMeaning.trim().toLowerCase() &&
            v.category.trim().toLowerCase() === (newCategory || 'Umum').trim().toLowerCase() &&
            (v.example_japanese || '').trim().toLowerCase() === (newExampleJapanese || '').trim().toLowerCase() &&
            (v.example_indo || '').trim().toLowerCase() === (newExampleIndo || '').trim().toLowerCase()
        );
        
        if (duplicate) {
            alert(`❌ Data vocab ini sudah ada di database!\n\nKata: "${duplicate.word}"\nArti: "${duplicate.meaning}"\nKategori: ${duplicate.category}\n\nSemua field harus berbeda untuk menambah vocab baru.`);
            return;
        }
        
        const updated: Vocab = { 
            id: editingId, 
            word: newWord, 
            meaning: newMeaning, 
            category: newCategory || 'Umum',
            example_japanese: newExampleJapanese,
            example_indo: newExampleIndo,
            mastered: false
        };
        const savedVocab = await saveVocab(updated);
        if (savedVocab) {
            setVocabList(vocabList.map(v => v.id === editingId ? savedVocab : v));
        }
        
        setLastEditedId(editingId);
        setEditingId(null);
    } else {
        // ADD NEW MODE - cek duplikat SEMUA FIELD
        const duplicate = vocabList.find(v => 
            v.word.trim().toLowerCase() === newWord.trim().toLowerCase() &&
            v.meaning.trim().toLowerCase() === newMeaning.trim().toLowerCase() &&
            v.category.trim().toLowerCase() === (newCategory || 'Umum').trim().toLowerCase() &&
            (v.example_japanese || '').trim().toLowerCase() === (newExampleJapanese || '').trim().toLowerCase() &&
            (v.example_indo || '').trim().toLowerCase() === (newExampleIndo || '').trim().toLowerCase()
        );
        
        if (duplicate) {
            alert(`❌ Data vocab ini sudah ada di database!\n\nKata: "${duplicate.word}"\nArti: "${duplicate.meaning}"\nKategori: ${duplicate.category}\n\nSemua field harus berbeda untuk menambah vocab baru.`);
            return;
        }
        
        const newVocab = { 
            word: newWord, 
            meaning: newMeaning, 
            category: newCategory || 'Umum',
            example_japanese: newExampleJapanese,
            example_indo: newExampleIndo,
            mastered: false
        };
        
        const savedVocab = await saveVocab(newVocab as Vocab);
        if (savedVocab) {
            setVocabList([...vocabList, savedVocab]);
        }
    }
    
    // Reset semua field
    setNewWord(''); 
    setNewMeaning('');
    setNewCategory('');
    setNewExampleJapanese('');
    setNewExampleIndo('');
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

// Statistik untuk Review
const masteredVocab = filteredList.filter(v => v.mastered);
const notMasteredVocab = filteredList.filter(v => !v.mastered);
const masteredPercentage = filteredList.length > 0 
    ? Math.round((masteredVocab.length / filteredList.length) * 100) 
    : 0;

// TAMBAHKAN FUNGSI INI DI SINI (SETELAH masteredVocab didefinisikan)
const startReview = (type: 'mastered' | 'needsReview') => {
    const vocabsToReview = type === 'mastered' 
        ? masteredVocab 
        : notMasteredVocab;
    
    if (vocabsToReview.length === 0) {
        alert(type === 'mastered' 
            ? 'Belum ada vocab yang dihafal untuk direview!' 
            : 'Belum ada vocab yang perlu diulang!');
        return;
    }
    
    // Tutup review section dan set mode review
    setShowReview(false);
    setReviewType(type);
    setFlashIndex(0); // Reset ke kartu pertama
    setIsFlipped(false); // Reset flip
    
    // Scroll ke flashcard
    setTimeout(() => {
        const flashcardElement = document.querySelector('.flashcard-container');
        if (flashcardElement) {
            flashcardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
};

// Mode Review Khusus
if (isReviewing && reviewType) {
    const vocabsToReview = reviewType === 'mastered' ? masteredVocab : notMasteredVocab;

    
    return (
        <>
            {renderImportModal()}
            <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <button 
                        onClick={() => setIsReviewing(false)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold flex items-center gap-2"
                    >
                        <ChevronLeft size={20} />
                        Kembali ke Review
                    </button>
                    
                    <div className="bg-white p-8 rounded-3xl shadow-xl">
                        <h2 className="text-3xl font-black mb-2">
                            {reviewType === 'mastered' ? '✅ Review Vocab yang Sudah Dihafal' : '🔄 Review Vocab yang Perlu Diulang'}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Total: {vocabsToReview.length} vocab dari kategori <span className="font-bold text-indigo-600">{selectedCategory}</span>
                        </p>
                        
                        <div className="grid gap-4">
                            {vocabsToReview.map((vocab) => (
                                <div key={vocab.id} className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-indigo-100 hover:border-indigo-300 transition-all">
                                    <p className="font-black text-2xl text-gray-900 mb-2">{vocab.word}</p>
                                    <p className="text-gray-600 text-lg mb-3">"{vocab.meaning}"</p>
                                    {vocab.example_japanese && (
                                        <p className="text-sm text-gray-500 italic mb-1">🇯🇵 {vocab.example_japanese}</p>
                                    )}
                                    {vocab.example_indo && (
                                        <p className="text-sm text-gray-500 italic">🇮🇩 {vocab.example_indo}</p>
                                    )}
                                    <div className="mt-3 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                                        {vocab.category}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
    
    return (
        <>
            {renderImportModal()}
            <div className="space-y-12 fade-in pb-20 pt-4 md:pt-0">
<div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
    <div className="space-y-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Vocab Hub Pro</h1>
        <p className="text-indigo-500 font-black text-[10px] uppercase tracking-[0.3em]">Flashcards untuk hafalan kotoba</p>
    </div>
    <div className="flex gap-4">
<label className="flex items-center gap-3 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-indigo-100 transition-all cursor-pointer">
    <Upload size={18} /> IMPORT EXCEL
<input 
    type="file" 
    accept=".xlsx,.xls"    // ← Excel aja
    onChange={handleFileImport}
    className="hidden"
/>
</label>
        <button onClick={exportExcel} className="flex items-center gap-3 bg-emerald-50 text-emerald-600 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-emerald-100 transition-all">
            <Download size={18} /> EXPORT EXCEL
        </button>
    </div>
</div>

{/* Info Format CSV */}
<div className="bg-indigo-50 border-2 border-indigo-200 rounded-3xl p-6 space-y-3">
    <div className="flex items-start gap-3">
        <div className="p-2 bg-indigo-100 rounded-xl flex-shrink-0">
            <Upload className="text-indigo-600" size={20} />
        </div>
        <div className="flex-1">
            <h4 className="font-black text-indigo-900 text-sm mb-2">📋 Format File EXCEL untuk Import</h4>
            <div className="space-y-2 text-xs font-bold text-indigo-700">
                <p className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                    Header: <code className="bg-white px-2 py-1 rounded text-[10px] font-mono">Category,Word,Meaning,Example Japanese,Example Indo</code>
                </p>
                <p className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                    Bisa pakai <strong>koma (,)</strong> atau <strong>tab dari Excel</strong>
                </p>
                <p className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                    Data duplikat otomatis dilewati
                </p>
            </div>
            <details className="mt-3">
                <summary className="cursor-pointer text-indigo-600 font-black text-[10px] uppercase tracking-wider hover:text-indigo-800 select-none">
                    ▶ Lihat Contoh Format
                </summary>
                <div className="mt-3 bg-white rounded-xl p-4 border border-indigo-100">
<pre className="text-[9px] font-mono text-gray-600 overflow-x-auto whitespace-pre">
{`Category,Word,Meaning,Example Japanese,Example Indo
Salam,こんにちは,Halo,こんにちは、お元気ですか,Halo apa kabar
Salam,ありがとう,Terima kasih,ありがとうございます,Terima kasih banyak
Salam,さようなら,Selamat tinggal,さようなら、また会いましょう,Sampai jumpa lagi`}
</pre>
                </div>
            </details>
        </div>
    </div>
</div>
                
{/* Mode Selector */}
<div className="flex gap-3 justify-center">
    <button 
        onClick={() => { setStudyMode('casual'); setIsTimerRunning(false); }} 
        className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${studyMode === 'casual' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}
    >
        ☕ SANTAI
    </button>
    <button 
        onClick={() => { setStudyMode('exam'); setTimeLeft(10); setIsTimerRunning(true); }} 
        className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${studyMode === 'exam' ? 'bg-rose-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}
    >
        ⏱️ UJIAN (10s)
    </button>
    <button 
        onClick={() => { setStudyMode('random'); setFlashIndex(Math.floor(Math.random() * filteredList.length)); }} 
        className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${studyMode === 'random' ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}
    >
        🎲 ACAK
    </button>
    <button 
        onClick={() => { setStudyMode('examRandom'); setTimeLeft(10); setIsTimerRunning(true); setFlashIndex(Math.floor(Math.random() * filteredList.length)); }} 
        className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${studyMode === 'examRandom' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}
    >
        🎯 UJIAN ACAK
    </button>
</div>
            
            <div className="space-y-10">
                <div className="bg-white p-8 md:p-10 rounded-[48px] border border-gray-100 space-y-8 shadow-sm flex flex-col slide-up">
                    <h3 className="text-xl font-black text-indigo-600 flex items-center gap-3"><Languages /> Daftar Kotoba</h3>
                    
                    <div ref={formRef} className={`p-6 rounded-[35px] border-2 transition-all space-y-3 ${editingId ? 'bg-emerald-50 border-emerald-200' : 'bg-indigo-50/50 border-indigo-100'}`}>
                        {editingId && <button onClick={() => setEditingId(null)} className="float-right text-emerald-400"><X size={16}/></button>}
                        <div className="relative">
    <input 
        value={newCategory} 
        onChange={e => {
            setNewCategory(e.target.value);
            setShowCategorySuggestions(true);
        }}
        onFocus={() => setShowCategorySuggestions(true)}
        className="w-full p-4 bg-white rounded-2xl font-bold border-none outline-none text-xs shadow-inner"
        placeholder="Kategori" 
    />
    {showCategorySuggestions && newCategory && existingCategories.filter(cat => 
        cat.toLowerCase().includes(newCategory.toLowerCase())
    ).length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-indigo-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
            {existingCategories
                .filter(cat => cat.toLowerCase().includes(newCategory.toLowerCase()))
                .map((cat, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => {
                            setNewCategory(cat);
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
                        <input value={newWord} onChange={(e) => setNewWord(e.target.value)} placeholder="Kata Jepang" className="w-full p-4 bg-white rounded-2xl font-bold border-none outline-none text-xs shadow-inner" />
                        <input value={newMeaning} onChange={(e) => setNewMeaning(e.target.value)} placeholder="Arti" className="w-full p-4 bg-white rounded-2xl font-bold border-none outline-none text-xs shadow-inner" />

{/* TAMBAH 2 TEXTAREA INI */}
<textarea 
    value={newExampleJapanese} 
    onChange={(e) => setNewExampleJapanese(e.target.value)} 
    placeholder="Contoh kalimat Jepang (opsional)" 
    className="w-full p-4 bg-white rounded-2xl font-bold border-none outline-none text-xs shadow-inner resize-none h-20" 
/>
<textarea 
    value={newExampleIndo} 
    onChange={(e) => setNewExampleIndo(e.target.value)} 
    placeholder="Contoh kalimat Indonesia (opsional)" 
    className="w-full p-4 bg-white rounded-2xl font-bold border-none outline-none text-xs shadow-inner resize-none h-20" 
/>
                        
                        <button onClick={handleSaveVocab} className={`w-full p-5 rounded-2xl text-white font-black text-[10px] tracking-widest transition-all active:scale-95 ${editingId ? 'bg-emerald-500' : 'bg-indigo-600'}`}>
                            {editingId ? 'SIMPAN PERUBAHAN' : 'TAMBAH KATA'}
                        </button>
                    </div>

<div className="relative">
    <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth">
        {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}>
                {cat}
            </button>
        ))}
    </div>
</div>

{/* Search Bar */}
<div className="relative">
    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
    <input 
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="🔍 Cari kata atau arti..."
        className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-[24px] font-bold text-xs outline-none border-2 border-transparent focus:border-indigo-200 focus:bg-white transition-all shadow-inner"
    />
</div>
                    
<div className="max-h-[400px] overflow-y-auto custom-scroll space-y-3 pr-2">
    {filteredList.map((item) => (
<div 
    key={item.id}
    ref={item.id === editingId || item.id === lastEditedId ? editedItemRef : null}
    draggable
    onDragStart={() => handleDragStart(item.id)}
    onDragOver={(e) => handleDragOver(e, item.id)}
    onDragEnd={handleDragEnd}
    className={`p-5 border rounded-3xl flex items-center justify-between transition-all cursor-grab active:cursor-grabbing ${
    draggedId === item.id 
        ? 'opacity-30 scale-95 bg-gray-50 border-indigo-200' 
        : item.id === glowingId
        ? 'bg-emerald-50 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] scale-105 animate-[glow-pulse_1s_ease-in-out_2]'
        : 'bg-white border-gray-100 hover:shadow-lg'
}`}
>
<GripVertical size={16} className="text-gray-200 mr-2 flex-shrink-0" />

{/* Kolom Kiri: Kata & Arti */}
<div className="flex-1 min-w-0">
    <span className="text-[7px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-400">{item.category}</span>
    <p className="text-sm font-black text-gray-900 mt-1">{item.word}</p>
    <p className="text-[10px] font-bold text-gray-400 italic">"{item.meaning}"</p>
</div>

{/* Kolom Kanan: Contoh Kalimat (kalau ada) */}
{(item.example_japanese || item.example_indo) && (
    <div className="flex-1 min-w-0 pl-4 border-l border-gray-100">
        {item.example_japanese && (
            <div className="mb-2">
                <p className="text-[7px] font-black uppercase text-indigo-400 mb-0.5">CONTOH JEPANG</p>
                <p className="text-xs font-bold text-gray-600 truncate">{item.example_japanese}</p>
            </div>
        )}
        {item.example_indo && (
            <div>
                <p className="text-[7px] font-black uppercase text-emerald-400 mb-0.5">CONTOH INDO</p>
                <p className="text-xs font-bold text-gray-500 italic truncate">"{item.example_indo}"</p>
            </div>
        )}
    </div>
)}

                                <div className="flex items-center gap-1">
                                    <button onClick={() => speak(item.word)} className="p-3 text-indigo-300 hover:text-indigo-600"><Volume2 size={16} /></button>
                                    <button onClick={() => { 
    setEditingId(item.id); 
    setNewWord(item.word); 
    setNewMeaning(item.meaning); 
    setNewCategory(item.category);
    setNewExampleJapanese(item.example_japanese || '');  // TAMBAH INI
    setNewExampleIndo(item.example_indo || '');          // TAMBAH INI
}} className="p-3 text-gray-300 hover:text-gray-900"><Edit3 size={16} /></button>
                                    <button onClick={async () => {
    await deleteVocab(item.id);
    setVocabList(vocabList.filter(v => v.id !== item.id));
}} className="text-rose-200 p-3 hover:text-rose-500"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

{/* Indikator Mode Review */}
{reviewType && (
    <div className="bg-white p-4 rounded-3xl border-2 border-indigo-200 flex items-center justify-between">
        <div>
            <p className="text-sm font-bold text-gray-500">Mode Review Aktif:</p>
            <p className="text-lg font-black text-indigo-600">
                {reviewType === 'mastered' ? '✅ Sudah Dihafal' : '🔄 Perlu Diulang'}
            </p>
        </div>
        <button 
            onClick={() => setReviewType(null)}
            className="px-4 py-2 bg-rose-500 text-white rounded-xl font-bold text-xs hover:bg-rose-600 transition-all"
        >
            ✕ Keluar Mode Review
        </button>
    </div>
)}
                
                <div className="bg-indigo-600 p-8 md:p-14 rounded-[64px] shadow-2xl flex flex-col items-center justify-between min-h-[900px] relative overflow-hidden">
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
                                    {/* Timer Display - Mode Ujian */}
{(studyMode === 'exam' || studyMode === 'examRandom') && (
    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-rose-500 text-white px-6 py-2 rounded-full font-black text-lg shadow-xl z-20">
        ⏱️ {timeLeft}s
    </div>
)}
                            <div className="h-[450px] w-full perspective cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                                <div className={`relative h-full w-full transition-all duration-700 preserve-3d ${isFlipped ? 'my-rotate-y-180' : ''}`}>
                                    
<div className="absolute inset-0 backface-hidden bg-white rounded-[64px] flex flex-col items-center justify-center p-12 text-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-b-8 border-indigo-100">
    {/* TTS Button - Pojok Kanan Atas */}
    <button 
        onClick={(e) => { e.stopPropagation(); speak(currentCard.word); }} 
        className="absolute top-6 right-6 p-3 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-all shadow-sm"
    >
        <Volume2 size={20} />
    </button>
    
    <h4 className="font-black text-gray-900 text-5xl tracking-tight leading-tight break-words max-w-full px-4">
        {flipMode === 'JPtoID' ? currentCard.word : currentCard.meaning}
    </h4>
    
    {flipMode === 'JPtoID' && currentCard.example_japanese && (
        <p className="mt-6 text-sm font-bold text-gray-400 italic leading-relaxed break-words max-w-full px-4">
            "{currentCard.example_japanese}"
        </p>
    )}
    {flipMode === 'IDtoJP' && currentCard.example_indo && (
        <p className="mt-6 text-sm font-bold text-gray-400 italic leading-relaxed break-words max-w-full px-4">
            "{currentCard.example_indo}"
        </p>
    )}
    
</div>
<div className="absolute inset-0 backface-hidden my-rotate-y-180 bg-emerald-500 rounded-[64px] flex flex-col items-center justify-center p-12 text-center text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">
    {/* TTS Button - Pojok Kanan Atas */}
    <button 
        onClick={(e) => { e.stopPropagation(); speak(currentCard.word); }} 
        className="absolute top-6 right-6 p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all"
    >
        <Volume2 size={20} />
    </button>
    
    <h4 className="font-black text-4xl tracking-tight leading-tight break-words max-w-full px-4">
        {flipMode === 'JPtoID' ? currentCard.meaning : currentCard.word}
    </h4>
    
    {flipMode === 'JPtoID' && currentCard.example_indo && (
        <p className="mt-6 text-sm font-bold text-white/80 italic leading-relaxed break-words max-w-full px-4">
            "{currentCard.example_indo}"
        </p>
    )}
        {flipMode === 'IDtoJP' && currentCard.example_japanese && (
            <p className="mt-6 text-sm font-bold text-white/80 italic leading-relaxed break-words max-w-full px-4">
                "{currentCard.example_japanese}"
            </p>
        )}
    </div>  {/* ← Penutup kartu belakang (hijau) */}
                        
                                </div>  {/* ← Penutup div preserve-3d */}
                            </div>  {/* ← Penutup div h-[450px] perspective */}

{/* Progress Bar - TARUH DI SINI ✅ */}
{(studyMode === 'random' || studyMode === 'examRandom') && (
    <div className="w-full max-w-lg mx-auto mb-6 bg-white/5 p-4 rounded-3xl border-2 border-white/20 backdrop-blur-sm">
        <div className="bg-white/20 rounded-full h-4 overflow-hidden border border-white/30 shadow-inner">
            <div 
                className="bg-gradient-to-r from-yellow-300 via-orange-400 to-rose-500 h-full transition-all duration-300 shadow-lg"
                style={{ width: `${(answeredCount / filteredList.length) * 100}%` }}
            />
        </div>
        <div className="flex justify-between mt-3 text-xs text-white font-black">
            <span>PROGRESS: {answeredCount} SOAL DIJAWAB</span>
            <span className="text-yellow-300">{answeredCount} / {filteredList.length}</span>
        </div>
    </div>
)}
                                    
                            <div className="flex items-center gap-10">
                                <button onClick={() => setFlashIndex((flashIndex - 1 + filteredList.length) % filteredList.length)} className="p-5 bg-white/10 rounded-3xl text-white hover:bg-white/20 transition-all"><ChevronLeft size={32}/></button>

{/* TAMBAH TOMBOL MASTERED */}
    <button 
        onClick={async () => {
            const updated = vocabList.map(v => v.id === currentCard.id ? {...v, mastered: !v.mastered} : v);
            setVocabList(updated);
            const updatedVocab = updated.find(v => v.id === currentCard.id);
            if (updatedVocab) await saveVocab(updatedVocab);
        }} 
        className={`p-5 rounded-3xl transition-all ${currentCard.mastered ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
        title="Tandai Sudah Hafal"
    >
        <CheckCircle2 size={32} />
    </button>
                                
<div className="bg-white/10 px-8 py-4 rounded-3xl backdrop-blur-md">
    <span className="text-white font-black text-xl">
        {(studyMode === 'random' || studyMode === 'examRandom') ? answeredCount + 1 : flashIndex + 1}
        <span className="opacity-30 text-sm"> / {filteredList.length}</span>
    </span>
</div>
<button onClick={() => {
    if (studyMode === 'random' || studyMode === 'examRandom') {
        // Hitung sudah jawab berapa (termasuk yang sekarang)
        const currentAnswered = answeredCount + 1;
        
        if (currentAnswered >= filteredList.length) {
            // Sudah selesai semua - reset
            setAnsweredCount(0);
            setFlashIndex(Math.floor(Math.random() * filteredList.length));
        } else {
            // Masih ada soal - lanjut ke random berikutnya
            setAnsweredCount(currentAnswered);
            setFlashIndex(Math.floor(Math.random() * filteredList.length));
        }
    } else {
        setFlashIndex((flashIndex + 1) % filteredList.length);
    }
}} 
className={`p-5 rounded-3xl transition-all ${
    (studyMode === 'random' || studyMode === 'examRandom') && answeredCount >= filteredList.length
    ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
    : 'bg-white text-indigo-600 hover:bg-indigo-50'
}`}>
    {(studyMode === 'random' || studyMode === 'examRandom') && answeredCount >= filteredList.length
        ? <RotateCw size={32}/> 
        : <ChevronRight size={32}/>
    }
</button>
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

{/* Tombol Review */}
<button 
    onClick={() => setShowReview(!showReview)} 
    className="w-full py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
>
    <CheckCircle2 size={18} />
    {showReview ? 'SEMBUNYIKAN REVIEW' : '📊 LIHAT REVIEW HAFALAN'}
</button>

{/* Review Section */}
{showReview && (
    <div className="bg-white p-8 rounded-[48px] border border-gray-100 space-y-6 slide-up">
        <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-gray-900">Review Hafalan Vocab</h3>
            <div className="text-right">
                <p className="text-4xl font-black text-indigo-600">{masteredPercentage}%</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tingkat Hafalan</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sudah Dihafal */}
            <div 
    onClick={() => startReview('mastered')}
    className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition-all"
>
                <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="text-emerald-500" size={20} />
                    <h4 className="font-black text-emerald-700">SUDAH DIHAFAL ({masteredVocab.length})</h4>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {masteredVocab.length > 0 ? (
                        masteredVocab.map(v => (
                            <div key={v.id} className="bg-white p-3 rounded-xl">
                                <p className="text-sm font-black text-gray-900">{v.word}</p>
                                <p className="text-xs text-gray-500 italic">"{v.meaning}"</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-emerald-400 text-xs italic">Belum ada vocab yang dihafal</p>
                    )}
                </div>
            </div>
            
            {/* Belum Dihafal */}
            <div 
    onClick={() => startReview('needsReview')}
    className="bg-rose-50 p-6 rounded-3xl border border-rose-100 cursor-pointer hover:bg-rose-100 transition-all"
>
                <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="text-rose-500" size={20} />
                    <h4 className="font-black text-rose-700">PERLU DIULANG ({notMasteredVocab.length})</h4>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {notMasteredVocab.length > 0 ? (
                        notMasteredVocab.map(v => (
                            <div key={v.id} className="bg-white p-3 rounded-xl">
                                <p className="text-sm font-black text-gray-900">{v.word}</p>
                                <p className="text-xs text-gray-500 italic">"{v.meaning}"</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-rose-400 text-xs italic">Semua vocab sudah dihafal! 🎉</p>
                    )}
                </div>
            </div>
        </div>
    </div>
)}
                
            </div>
<style>{`
    .perspective { perspective: 2000px; }
    .preserve-3d { transform-style: preserve-3d; }
    .backface-hidden { backface-visibility: hidden; }
    .my-rotate-y-180 { transform: rotateY(180deg); }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    
    @keyframes glow-pulse {
        0%, 100% { box-shadow: 0 0 20px rgba(16,185,129,0.3); }
        50% { box-shadow: 0 0 40px rgba(16,185,129,0.6); }
    }
`}</style>
        </div>
        </>
);
};

export default VocabHub;
