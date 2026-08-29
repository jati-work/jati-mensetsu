import React, { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Eraser, Lock, Unlock, Highlighter, Pencil, Type, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';
import { supabase } from '../supabase.ts';

const WARNA_HIGHLIGHT = ['#fff176', '#a5d6a7', '#f48fb1', '#90caf9'];
const WARNA_TEKS = ['#4338ca', '#c0392b', '#1565c0', '#000000'];
const WARNA_PEN = ['#e53935', '#1565c0', '#4338ca', '#000000'];
const PAPER_WIDTH = 780;
const PAPER_HEIGHT = 1000;

function bacaPreferensi(key: string, fallback: any) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

function CatatanTeks({ data, autoFocus, onSimpan, onHapus, hapusMode, onPindah }: any) {
  const [text, setText] = useState(data.text || '');
  const [editing, setEditing] = useState(autoFocus || !data.text);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  function selesai() {
    setEditing(false);
    if (text.trim()) onSimpan(data.id, text);
    else onHapus(data.id);
  }

  return (
    <div
      onMouseDown={e => e.stopPropagation()}
      onClick={() => { if (hapusMode) { onHapus(data.id); return; } if (!editing) setEditing(true); }}
      style={{
        position: 'absolute', left: data.x * 100 + '%', top: data.y * 100 + '%', minWidth: 60,
        outline: hapusMode ? '2px dashed #dc2626' : editing ? '1.5px dashed #4338ca' : 'none',
        outlineOffset: 3, borderRadius: 8, cursor: hapusMode ? 'pointer' : 'default',
      }}
    >
      {editing && !hapusMode && (
        <div
          onMouseDown={e => { e.stopPropagation(); onPindah(data.id, e); }}
          title="Geser catatan"
          style={{ position: 'absolute', left: -18, top: 2, width: 16, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab', color: '#4338ca', fontSize: 13, background: 'rgba(255,255,255,.9)', borderRadius: 6, border: '1px solid rgba(67,56,202,.4)' }}
        >⠿</div>
      )}
      {editing && !hapusMode ? (
        <textarea
          ref={ref}
          value={text}
          onChange={e => setText(e.target.value)}
          onBlur={selesai}
          rows={Math.max(1, text.split('\n').length)}
          placeholder="Tulis catatan..."
          className="font-bold"
          style={{ display: 'block', resize: 'both', minWidth: 120, minHeight: 30, fontSize: 13, padding: '5px 7px', border: '1.5px dashed #4338ca', borderRadius: 8, background: 'rgba(255,255,255,.95)', color: data.color || '#4338ca' }}
        />
      ) : (
        <div className="font-bold" style={{ fontSize: 13, color: data.color || '#4338ca', cursor: hapusMode ? 'pointer' : 'text', whiteSpace: 'pre-wrap', padding: '2px 4px' }}>
          {data.text}
        </div>
      )}
    </div>
  );
}

function HighlightBox({ data, onHapus, hapusMode, modeUji, revealed, onToggleReveal }: any) {
  const tertutup = modeUji && !revealed;
  return (
    <div
      onMouseDown={e => e.stopPropagation()}
      onClick={() => { if (hapusMode) { onHapus(data.id); return; } if (modeUji) onToggleReveal(data.id); }}
      title={modeUji ? (tertutup ? 'Tap untuk buka jawaban' : 'Tap untuk tutup lagi') : undefined}
      style={{
        position: 'absolute', left: data.x * 100 + '%', top: data.y * 100 + '%',
        width: data.width * 100 + '%', height: data.height * 100 + '%', background: data.color,
        opacity: tertutup ? 1 : 0.4, mixBlendMode: tertutup ? 'normal' : 'multiply',
        outline: hapusMode ? '2px dashed #dc2626' : 'none', outlineOffset: 2,
        cursor: hapusMode || modeUji ? 'pointer' : 'default', transition: 'opacity .15s ease', borderRadius: 3,
      }}
    />
  );
}

const Notebook: React.FC = () => {
  const [halaman, setHalaman] = useState<any[]>([]);
  const [indexAktif, setIndexAktif] = useState(0);
  const [teks, setTeks] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false);
  const [anotasi, setAnotasi] = useState<any[]>([]);
  const [mode, setMode] = useState<string | null>(null);
  const [modeUji, setModeUji] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Set<number>>(new Set());
  const [warnaHighlight, setWarnaHighlight] = useState(() => bacaPreferensi('nb-warnaHighlight', WARNA_HIGHLIGHT[0]));
  const [warnaTeks, setWarnaTeks] = useState(() => bacaPreferensi('nb-warnaTeks', WARNA_TEKS[0]));
  const [warnaPen, setWarnaPen] = useState(() => bacaPreferensi('nb-warnaPen', WARNA_PEN[0]));
  const [tebalPen, setTebalPen] = useState(() => bacaPreferensi('nb-tebalPen', 3));
  const [penAktif, setPenAktif] = useState<any>(null);
  const [drawing, setDrawing] = useState<any>(null);
  const [editingTeksId, setEditingTeksId] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ dx: 0, dy: 0 });

  const debounceRef = useRef<any>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const halamanAktif = halaman[indexAktif] || null;
  const terkunci = !!halamanAktif?.is_locked;

  useEffect(() => { localStorage.setItem('nb-warnaHighlight', JSON.stringify(warnaHighlight)); }, [warnaHighlight]);
  useEffect(() => { localStorage.setItem('nb-warnaTeks', JSON.stringify(warnaTeks)); }, [warnaTeks]);
  useEffect(() => { localStorage.setItem('nb-warnaPen', JSON.stringify(warnaPen)); }, [warnaPen]);
  useEffect(() => { localStorage.setItem('nb-tebalPen', JSON.stringify(tebalPen)); }, [tebalPen]);

  async function muatHalaman() {
    setLoading(true);
    const { data, error } = await supabase.from('notebook_pages').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Gagal memuat notebook:', error); setLoading(false); return; }
    let list = data || [];
    if (list.length === 0) {
      const { data: baru } = await supabase.from('notebook_pages').insert({ content: '' }).select().single();
      if (baru) list = [baru];
    }
    setHalaman(list);
    setIndexAktif(0);
    setTeks(list[0]?.content || '');
    if (list[0]) await muatAnotasi(list[0].id);
    setLoading(false);
  }

  useEffect(() => { muatHalaman(); }, []);

  useEffect(() => {
    setTeks(halamanAktif?.content || '');
    setMode(null);
    setModeUji(false);
    setRevealedIds(new Set());
    if (halamanAktif) muatAnotasi(halamanAktif.id); else setAnotasi([]);
  }, [indexAktif]);

  async function muatAnotasi(pageId: number) {
    const { data } = await supabase.from('notebook_highlights').select('*').eq('notebook_page_id', pageId);
    setAnotasi(data || []);
  }

  function handleChangeTeks(val: string) {
    setTeks(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => simpanTeks(val), 1200);
  }

  async function simpanTeks(val: string) {
    if (!halamanAktif) return;
    setSaving(true);
    const { error } = await supabase.from('notebook_pages').update({ content: val, updated_at: new Date().toISOString() }).eq('id', halamanAktif.id);
    setSaving(false);
    if (error) { console.error('Gagal simpan notebook:', error); return; }
    setHalaman(list => list.map((h, i) => (i === indexAktif ? { ...h, content: val } : h)));
  }

  function paksaSimpan() {
    if (debounceRef.current) { clearTimeout(debounceRef.current); debounceRef.current = null; simpanTeks(teks); }
  }

  function gantiHalaman(delta: number) {
    paksaSimpan();
    setIndexAktif(i => Math.min(Math.max(i + delta, 0), halaman.length - 1));
  }

  async function tambahHalaman() {
    paksaSimpan();
    const { data, error } = await supabase.from('notebook_pages').insert({ content: '' }).select().single();
    if (error) { alert('Gagal menambah halaman: ' + error.message); return; }
    setHalaman(list => [data, ...list]);
    setIndexAktif(0);
  }

  async function hapusHalamanAktif() {
    if (!halamanAktif) return;
    const id = halamanAktif.id;
    await supabase.from('notebook_pages').delete().eq('id', id);
    const sisa = halaman.filter(h => h.id !== id);
    if (sisa.length === 0) {
      const { data } = await supabase.from('notebook_pages').insert({ content: '' }).select().single();
      setHalaman(data ? [data] : []);
      setIndexAktif(0);
      setTeks('');
    } else {
      const idxBaru = Math.min(indexAktif, sisa.length - 1);
      setHalaman(sisa);
      setIndexAktif(idxBaru);
      setTeks(sisa[idxBaru]?.content || '');
    }
    setKonfirmasiHapus(false);
  }

  async function kunciHalaman() {
    paksaSimpan();
    const { error } = await supabase.from('notebook_pages').update({ is_locked: true }).eq('id', halamanAktif.id);
    if (error) { alert('Gagal mengunci halaman: ' + error.message); return; }
    setHalaman(list => list.map((h, i) => (i === indexAktif ? { ...h, is_locked: true } : h)));
    setMode(null);
  }

  async function bukaKunci() {
    const { error } = await supabase.from('notebook_pages').update({ is_locked: false }).eq('id', halamanAktif.id);
    if (error) { alert('Gagal membuka kunci: ' + error.message); return; }
    setHalaman(list => list.map((h, i) => (i === indexAktif ? { ...h, is_locked: false } : h)));
    setMode(null);
    setModeUji(false);
  }

  function pilihMode(m: string) { setModeUji(false); setMode(cur => (cur === m ? null : m)); }

  function toggleModeUji() {
    setModeUji(m => { const next = !m; if (next) setMode(null); setRevealedIds(new Set()); return next; });
  }

  function toggleReveal(id: number) {
    setRevealedIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }

  function posisiRelatif(e: React.MouseEvent) {
    const rect = overlayRef.current!.getBoundingClientRect();
    return { x: Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1), y: Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1) };
  }

  function handleOverlayMouseDown(e: React.MouseEvent) {
    if (mode === 'highlight') { const { x, y } = posisiRelatif(e); setDrawing({ startX: x, startY: y, x, y, width: 0, height: 0 }); }
    else if (mode === 'pen') { setPenAktif({ points: [posisiRelatif(e)] }); }
    else if (mode === 'text' && e.target === overlayRef.current) { const { x, y } = posisiRelatif(e); tambahCatatan(x, y); }
  }

  function handleOverlayMouseMove(e: React.MouseEvent) {
    if (draggingId != null) {
      const pos = posisiRelatif(e);
      const nx = Math.min(Math.max(pos.x - dragOffset.dx, 0), 1);
      const ny = Math.min(Math.max(pos.y - dragOffset.dy, 0), 1);
      setAnotasi(a => a.map(item => (item.id === draggingId ? { ...item, x: nx, y: ny } : item)));
      return;
    }
    if (penAktif) { setPenAktif((cur: any) => ({ points: [...cur.points, posisiRelatif(e)] })); return; }
    if (!drawing) return;
    const { x: curX, y: curY } = posisiRelatif(e);
    setDrawing((d: any) => ({ ...d, x: Math.min(d.startX, curX), y: Math.min(d.startY, curY), width: Math.abs(curX - d.startX), height: Math.abs(curY - d.startY) }));
  }

  async function handleOverlayMouseUp() {
    if (draggingId != null) { await selesaiDrag(); return; }
    if (penAktif) {
      const points = penAktif.points; setPenAktif(null);
      if (points.length < 2) return;
      const baru = { notebook_page_id: halamanAktif.id, type: 'pen', x: 0, y: 0, width: 0, height: 0, color: warnaPen, thickness: tebalPen, points };
      const { data, error } = await supabase.from('notebook_highlights').insert(baru).select().single();
      if (error) { alert('Gagal simpan coretan: ' + error.message); return; }
      setAnotasi(a => [...a, data]);
      return;
    }
    if (!drawing) return;
    const { x, y, width, height } = drawing; setDrawing(null);
    if (width < 0.004 || height < 0.004) return;
    const baru = { notebook_page_id: halamanAktif.id, type: 'highlight', x, y, width, height, color: warnaHighlight };
    const { data, error } = await supabase.from('notebook_highlights').insert(baru).select().single();
    if (error) { alert('Gagal simpan highlight: ' + error.message); return; }
    setAnotasi(a => [...a, data]);
  }

  async function tambahCatatan(x: number, y: number) {
    const baru = { notebook_page_id: halamanAktif.id, type: 'text', x, y, width: 0.25, height: 0, color: warnaTeks, text: '' };
    const { data, error } = await supabase.from('notebook_highlights').insert(baru).select().single();
    if (error) { alert('Gagal bikin catatan: ' + error.message); return; }
    setAnotasi(a => [...a, data]);
    setEditingTeksId(data.id);
  }

  async function simpanTeksCatatan(id: number, text: string) {
    await supabase.from('notebook_highlights').update({ text }).eq('id', id);
    setAnotasi(a => a.map(x => (x.id === id ? { ...x, text } : x)));
  }

  async function hapusAnotasi(id: number) {
    await supabase.from('notebook_highlights').delete().eq('id', id);
    setAnotasi(a => a.filter(x => x.id !== id));
  }

  function mulaiDrag(id: number, e: React.MouseEvent) {
    const item = anotasi.find(a => a.id === id);
    if (!item) return;
    const pos = posisiRelatif(e);
    setDragOffset({ dx: pos.x - item.x, dy: pos.y - item.y });
    setDraggingId(id);
  }

  async function selesaiDrag() {
    if (draggingId == null) return;
    const id = draggingId;
    const item = anotasi.find(a => a.id === id);
    setDraggingId(null);
    if (item) await supabase.from('notebook_highlights').update({ x: item.x, y: item.y }).eq('id', id);
  }

  const highlightList = anotasi.filter(a => a.type === 'highlight');
  const teksList = anotasi.filter(a => a.type === 'text');
  const penList = anotasi.filter(a => a.type === 'pen');

  const toolBtn = (active: boolean, danger = false) =>
    `flex items-center justify-center w-11 h-11 rounded-2xl border-2 transition-all ${
      active ? (danger ? 'bg-rose-500 border-rose-500 text-white' : 'bg-indigo-600 border-indigo-600 text-white') : (danger ? 'bg-white border-rose-200 text-rose-500 hover:bg-rose-50' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50')
    }`;

  if (loading) return <div className="p-16 text-gray-400 font-bold">Memuat notebook...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Notebook</h1>
          <p className="text-gray-400 font-bold text-sm mt-1">
            {modeUji ? `Mode Uji · ${revealedIds.size}/${highlightList.length} dibuka` : terkunci ? 'Terkunci' : saving ? 'Menyimpan...' : 'Tersimpan'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => gantiHalaman(-1)} disabled={indexAktif <= 0} className={toolBtn(false)} style={{ opacity: indexAktif <= 0 ? 0.3 : 1 }}><ChevronLeft size={18} /></button>
          <div className="flex items-center gap-2 bg-indigo-50 rounded-full px-4 py-2">
            <span className="font-black text-indigo-600 text-sm">{indexAktif + 1}</span>
            <span className="text-gray-400 font-bold text-sm">/ {halaman.length}</span>
          </div>
          <button onClick={() => gantiHalaman(1)} disabled={indexAktif >= halaman.length - 1} className={toolBtn(false)} style={{ opacity: indexAktif >= halaman.length - 1 ? 0.3 : 1 }}><ChevronRight size={18} /></button>
          <button onClick={tambahHalaman} title="Tambah halaman" className={toolBtn(false)}><Plus size={18} /></button>
          <button onClick={() => (terkunci ? bukaKunci() : kunciHalaman())} title={terkunci ? 'Buka kunci' : 'Kunci halaman'} className={toolBtn(terkunci)}>
            {terkunci ? <Unlock size={18} /> : <Lock size={18} />}
          </button>
          <button onClick={() => setKonfirmasiHapus(true)} title="Hapus halaman" className={toolBtn(false, true)}><Trash2 size={18} /></button>
        </div>
      </div>

      {/* Toolbar anotasi (cuma muncul kalau halaman terkunci) */}
      {terkunci && highlightList.length > 0 && (
        <div className="flex items-center gap-3">
          <button onClick={toggleModeUji} className={toolBtn(modeUji, true)} title="Mode Uji: sembunyikan bagian yang di-highlight"><Eye size={18} /></button>
          {modeUji && revealedIds.size < highlightList.length && (
            <button onClick={() => setRevealedIds(new Set(highlightList.map(h => h.id)))} className="text-indigo-600 font-black text-xs uppercase tracking-widest px-4 py-2 rounded-full bg-indigo-50">
              Buka semua
            </button>
          )}
        </div>
      )}
      {terkunci && !modeUji && (
        <div className="flex items-center gap-3 flex-wrap bg-gray-50 rounded-3xl p-4">
          <button onClick={() => pilihMode('highlight')} className={toolBtn(mode === 'highlight')} title="Highlight"><Highlighter size={18} /></button>
          <button onClick={() => pilihMode('pen')} className={toolBtn(mode === 'pen')} title="Pena"><Pencil size={18} /></button>
          <button onClick={() => pilihMode('text')} className={toolBtn(mode === 'text')} title="Catatan"><Type size={18} /></button>
          <button onClick={() => pilihMode('hapus')} className={toolBtn(mode === 'hapus', true)} title="Hapus anotasi"><Eraser size={18} /></button>
          {mode === 'highlight' && WARNA_HIGHLIGHT.map(w => (
            <button key={w} onClick={() => setWarnaHighlight(w)} style={{ width: 24, height: 24, borderRadius: '50%', background: w, border: warnaHighlight === w ? '2px solid #111' : '1px solid rgba(0,0,0,.15)' }} />
          ))}
          {mode === 'pen' && (<>
            {WARNA_PEN.map(w => (<button key={w} onClick={() => setWarnaPen(w)} style={{ width: 24, height: 24, borderRadius: '50%', background: w, border: warnaPen === w ? '2px solid #111' : '1px solid rgba(0,0,0,.15)' }} />))}
            <input type="range" min={1} max={10} value={tebalPen} onChange={e => setTebalPen(Number(e.target.value))} />
          </>)}
          {mode === 'text' && WARNA_TEKS.map(w => (
            <button key={w} onClick={() => setWarnaTeks(w)} style={{ width: 24, height: 24, borderRadius: '50%', background: w, border: warnaTeks === w ? '2px solid #111' : '1px solid rgba(0,0,0,.15)' }} />
          ))}
        </div>
      )}

      {/* Kertas */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 flex justify-center overflow-x-auto">
        {terkunci ? (
          <div style={{ position: 'relative', width: PAPER_WIDTH, minHeight: PAPER_HEIGHT, fontSize: 16, lineHeight: 1.8, color: '#1f2937', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
            {teks || <span className="text-gray-300">(halaman ini kosong)</span>}
            <div
              ref={overlayRef}
              onMouseDown={handleOverlayMouseDown}
              onMouseMove={handleOverlayMouseMove}
              onMouseUp={handleOverlayMouseUp}
              onMouseLeave={() => { setDrawing(null); setPenAktif(null); selesaiDrag(); }}
              style={{ position: 'absolute', inset: 0, cursor: mode === 'highlight' || mode === 'pen' ? 'crosshair' : mode === 'text' ? 'text' : 'default' }}
            >
              {highlightList.map(h => (
                <HighlightBox key={h.id} data={h} onHapus={hapusAnotasi} hapusMode={mode === 'hapus'} modeUji={modeUji} revealed={revealedIds.has(h.id)} onToggleReveal={toggleReveal} />
              ))}
              {penList.map(p => (
                <svg key={p.id} width="100%" height="100%" viewBox={`0 0 ${PAPER_WIDTH} ${PAPER_HEIGHT}`} style={{ position: 'absolute', inset: 0, pointerEvents: mode === 'hapus' ? 'stroke' : 'none', cursor: mode === 'hapus' ? 'pointer' : 'default' }} onClick={() => { if (mode === 'hapus') hapusAnotasi(p.id); }}>
                  <polyline points={(p.points || []).map((pt: any) => `${pt.x * PAPER_WIDTH},${pt.y * PAPER_HEIGHT}`).join(' ')} fill="none" stroke={p.color} strokeWidth={p.thickness || 3} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ))}
              {penAktif && (
                <svg width="100%" height="100%" viewBox={`0 0 ${PAPER_WIDTH} ${PAPER_HEIGHT}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  <polyline points={penAktif.points.map((pt: any) => `${pt.x * PAPER_WIDTH},${pt.y * PAPER_HEIGHT}`).join(' ')} fill="none" stroke={warnaPen} strokeWidth={tebalPen} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {teksList.map(t => (
                <CatatanTeks key={t.id} data={t} autoFocus={t.id === editingTeksId} onSimpan={simpanTeksCatatan} onHapus={hapusAnotasi} hapusMode={mode === 'hapus'} onPindah={mulaiDrag} />
              ))}
              {drawing && (
                <div style={{ position: 'absolute', left: drawing.x * 100 + '%', top: drawing.y * 100 + '%', width: drawing.width * 100 + '%', height: drawing.height * 100 + '%', background: warnaHighlight, opacity: 0.4, mixBlendMode: 'multiply', pointerEvents: 'none' }} />
              )}
            </div>
          </div>
        ) : (
          <textarea
            value={teks}
            onChange={e => handleChangeTeks(e.target.value)}
            placeholder="Tulis pertanyaan & jawaban yang mau dihafalin di sini..."
            style={{ width: PAPER_WIDTH, minHeight: PAPER_HEIGHT, resize: 'none', border: 'none', outline: 'none', fontSize: 16, lineHeight: 1.8, color: '#1f2937' }}
          />
        )}
      </div>

      {/* Modal konfirmasi hapus */}
      {konfirmasiHapus && (
        <div onClick={() => setKonfirmasiHapus(false)} className="fixed inset-0 bg-indigo-900/20 backdrop-blur-sm z-[1000] flex items-center justify-center p-6">
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-xl">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-4"><Trash2 size={28} /></div>
            <h3 className="font-black text-lg text-gray-900 mb-2">Hapus halaman ini?</h3>
            <p className="text-gray-400 font-bold text-sm mb-6">Isi tulisan dan semua highlight/catatan di halaman ini akan hilang permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setKonfirmasiHapus(false)} className="flex-1 py-3 rounded-2xl border border-gray-200 font-black text-sm text-gray-500">Batal</button>
              <button onClick={hapusHalamanAktif} className="flex-1 py-3 rounded-2xl bg-rose-500 text-white font-black text-sm">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notebook;
