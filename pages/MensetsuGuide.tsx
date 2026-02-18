import React, { useState, useEffect, useRef } from 'react';

// ─── Design Tokens — matched to Dashboard vibe ─────────────────────────────
// Dashboard: text-gray-900 font-black, indigo-600 primary, emerald-500 accent
// rounded-[40px] cards, shadow-sm, border-gray-100, clean white panels
const t = {
  primary:     '#4F46E5',   // indigo-600
  primaryMid:  '#6366F1',   // indigo-500
  primarySoft: '#EEF2FF',   // indigo-50
  ink:         '#111827',   // gray-900
  body:        '#374151',   // gray-700
  sub:         '#9CA3AF',   // gray-400
  mist:        '#F9FAFB',   // gray-50
  white:       '#FFFFFF',
  emerald:     '#10B981',   // emerald-500
  emeraldSoft: '#ECFDF5',   // emerald-50
  emeraldMid:  '#D1FAE5',   // emerald-100
  amber:       '#D97706',
  amberSoft:   '#FEF3C7',
  border:      '#F3F4F6',   // gray-100
  borderMid:   '#E5E7EB',   // gray-200
  shadow:      '0 1px 3px rgba(0,0,0,0.06)',
};

const font = {
  jp:   "'Noto Serif JP', 'Georgia', serif",
  body: "'Inter', -apple-system, 'Segoe UI', sans-serif",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Noto+Serif+JP:wght@400;700&display=swap');

  .mg * { box-sizing: border-box; margin: 0; padding: 0; }
  .mg { font-family: ${font.body}; background: ${t.mist}; min-height: 100vh; color: ${t.ink}; }

  .mg-nav-link {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 12px; border-radius: 12px;
    text-decoration: none; color: ${t.body};
    font-size: 0.83rem; font-weight: 600; transition: all 0.18s;
  }
  .mg-nav-link:hover, .mg-nav-link.active { background: ${t.primarySoft}; color: ${t.primary}; }

  .mg-progress-track { height: 6px; background: ${t.borderMid}; border-radius: 99px; overflow: hidden; margin-top: 8px; }
  .mg-progress-fill  { height: 100%; background: linear-gradient(90deg, ${t.primary}, ${t.emerald}); border-radius: 99px; transition: width 0.5s ease; }

  .mg-coll-hdr {
    display: flex; align-items: center; justify-content: space-between;
    padding: 13px 18px; background: ${t.white}; border: 1.5px solid ${t.border};
    border-radius: 16px; cursor: pointer; font-weight: 700; font-size: 0.88rem;
    color: ${t.ink}; transition: all 0.18s; margin-bottom: 2px; user-select: none;
  }
  .mg-coll-hdr:hover { background: ${t.primarySoft}; border-color: ${t.primaryMid}; color: ${t.primary}; }
  .mg-coll-hdr.open  { background: ${t.primary}; border-color: ${t.primary}; color: white; border-radius: 16px 16px 0 0; margin-bottom: 0; }
  .mg-coll-body { border: 1.5px solid ${t.primary}; border-top: none; border-radius: 0 0 16px 16px; background: ${t.white}; padding: 20px 22px; margin-bottom: 8px; animation: mgIn 0.2s ease; }
  @keyframes mgIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

  .mg-cl { list-style: none; display: flex; flex-direction: column; gap: 5px; margin: 8px 0 10px; }
  .mg-cl li { display: flex; align-items: flex-start; gap: 10px; padding: 9px 14px; border-radius: 12px; font-size: 0.875rem; cursor: pointer; border: 1.5px solid ${t.border}; background: ${t.mist}; transition: all 0.15s; line-height: 1.5; font-weight: 500; color: ${t.body}; }
  .mg-cl li::before { content: '○'; color: ${t.sub}; font-size: 0.9rem; flex-shrink: 0; }
  .mg-cl li:hover { border-color: ${t.primaryMid}; background: ${t.primarySoft}; }
  .mg-cl li.done { background: ${t.emeraldSoft}; border-color: ${t.emerald}; color: ${t.emerald}; text-decoration: line-through; text-decoration-color: ${t.emerald}; }
  .mg-cl li.done::before { content: '✓'; color: ${t.emerald}; font-weight: 900; }

  .mg-box { border-radius: 14px; padding: 14px 18px; margin: 10px 0; border-left: 4px solid; }
  .mg-box.p { background: ${t.primarySoft}; border-color: ${t.primary}; }
  .mg-box.s { background: ${t.emeraldSoft}; border-color: ${t.emerald}; }
  .mg-box.w { background: ${t.amberSoft};   border-color: ${t.amber}; }
  .mg-box.d { background: #FFF1F2; border-color: #F43F5E; }
  .mg-box-ttl { font-weight: 900; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 7px; }
  .mg-box.p .mg-box-ttl { color: ${t.primary}; }
  .mg-box.s .mg-box-ttl { color: ${t.emerald}; }
  .mg-box.w .mg-box-ttl { color: ${t.amber}; }
  .mg-box.d .mg-box-ttl { color: #F43F5E; }
  .mg-box p, .mg-box li { font-size: 0.875rem; line-height: 1.65; color: ${t.body}; }
  .mg-box ul, .mg-box ol { padding-left: 18px; display: flex; flex-direction: column; gap: 3px; margin-top: 4px; }

  .mg-tips { background: #FFFBEB; border: 1.5px solid #FCD34D; border-radius: 12px; padding: 13px 16px; margin-bottom: 10px; }
  .mg-tips h4 { font-size: 0.74rem; color: ${t.amber}; font-weight: 900; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
  .mg-tips ul { padding-left: 16px; }
  .mg-tips li { font-size: 0.86rem; line-height: 1.55; color: ${t.body}; }

  .mg-eg { background: ${t.primarySoft}; border: 1.5px solid #C7D2FE; border-radius: 12px; padding: 14px 18px; font-size: 0.875rem; line-height: 1.7; color: ${t.body}; }
  .mg-eg strong { color: ${t.primary}; }

  .mg-ul, .mg-ol { padding-left: 20px; display: flex; flex-direction: column; gap: 5px; margin: 7px 0; }
  .mg-ul li, .mg-ol li { font-size: 0.9rem; line-height: 1.65; color: ${t.body}; }
  .mg-ul li strong, .mg-ol li strong { color: ${t.ink}; font-weight: 700; }

  .mg-tech { list-style: none; display: flex; flex-direction: column; gap: 6px; margin: 10px 0; }
  .mg-tech li { padding: 11px 16px 11px 40px; border-radius: 12px; background: ${t.white}; border: 1.5px solid ${t.border}; font-size: 0.875rem; line-height: 1.55; position: relative; font-weight: 500; color: ${t.body}; }
  .mg-tech li::before { content: '→'; position: absolute; left: 14px; color: ${t.primary}; font-weight: 900; }
  .mg-tech li strong { color: ${t.ink}; }

  .mg-rule { width: 32px; height: 3px; background: ${t.primary}; border-radius: 2px; margin: 5px 0 20px; }

  .mg-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0; }
  @media (max-width: 600px) { .mg-2col { grid-template-columns: 1fr; } }

  .mg-pcard { background: ${t.white}; border: 1.5px solid ${t.border}; border-radius: 14px; padding: 14px 16px; }
  .mg-pcard-ico { font-size: 1.3rem; margin-bottom: 6px; }
  .mg-pcard-ttl { font-weight: 900; color: ${t.ink}; font-size: 0.85rem; margin-bottom: 4px; }

  .mg-vkcmp { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0; }
  .mg-vk { border-radius: 14px; padding: 14px 16px; }
  .mg-vk.id { background: #FFF7ED; border: 1.5px solid #FED7AA; }
  .mg-vk.jp { background: ${t.primarySoft}; border: 1.5px solid #C7D2FE; }
  .mg-vk h5 { font-size: 0.72rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
  .mg-vk.id h5 { color: #EA580C; }
  .mg-vk.jp h5 { color: ${t.primary}; }
  .mg-vk p { font-size: 0.85rem; line-height: 1.6; color: ${t.body}; }

  .mg-mantra { background: linear-gradient(135deg, ${t.primary} 0%, #7C3AED 100%); border-radius: 20px; padding: 24px 28px; text-align: center; margin-top: 14px; }
  .mg-mantra-main { font-family: ${font.jp}; font-size: 1.1rem; font-weight: 700; color: white; line-height: 1.7; letter-spacing: 0.5px; }
  .mg-mantra-sub { margin-top: 10px; font-size: 0.82rem; color: rgba(255,255,255,0.72); line-height: 1.65; }

  .mg-dos { background: ${t.emeraldSoft}; border: 1.5px solid ${t.emeraldMid}; border-radius: 20px; padding: 18px; }
  .mg-donts { background: #FFF1F2; border: 1.5px solid #FECDD3; border-radius: 20px; padding: 18px; }
  .mg-acard { background: ${t.white}; border: 1.5px solid ${t.border}; border-radius: 20px; padding: 18px; }
  .mg-dos h4 { color: ${t.emerald}; font-weight: 900; font-size: 0.875rem; margin-bottom: 10px; }
  .mg-donts h4 { color: #F43F5E; font-weight: 900; font-size: 0.875rem; margin-bottom: 10px; }
  .mg-acard h4 { color: ${t.ink}; font-weight: 900; font-size: 0.875rem; margin-bottom: 10px; }

  .mg-btt { position: fixed; bottom: 28px; right: 28px; width: 44px; height: 44px; border-radius: 50%; background: ${t.primary}; color: white; border: none; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 16px rgba(79,70,229,0.35); display: flex; align-items: center; justify-content: center; opacity: 0; transform: translateY(16px); transition: all 0.25s; pointer-events: none; z-index: 100; }
  .mg-btt.show { opacity: 1; transform: translateY(0); pointer-events: auto; }
  .mg-btt:hover { background: ${t.primaryMid}; transform: translateY(-2px); }
`;

const MensetsuGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState('intro');
  const [showBtt, setShowBtt] = useState(false);
  const [progress, setProgress] = useState(0);
  const [checked, setChecked] = useState<{ [k: string]: boolean }>({});
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setShowBtt(window.pageYOffset > 300);
      const secs = document.querySelectorAll('.mg-sec');
      let cur = 'intro';
      secs.forEach(s => { if (window.pageYOffset >= (s as HTMLElement).offsetTop - 200) cur = s.getAttribute('id') || 'intro'; });
      setActiveSection(cur);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const items = document.querySelectorAll('.mg-cl li');
    const cnt = Object.values(checked).filter(Boolean).length;
    setProgress(items.length > 0 ? (cnt / items.length) * 100 : 0);
  }, [checked]);

  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); setActiveSection(id); };
  const toggle = (id: string) => setChecked(p => ({ ...p, [id]: !p[id] }));

  const Coll: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ marginBottom: '7px' }}>
        <div className={`mg-coll-hdr ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>{icon}</span><span>{title}</span></span>
          <span style={{ fontSize: '0.68rem', opacity: 0.7, display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
        </div>
        {open && <div className="mg-coll-body">{children}</div>}
      </div>
    );
  };

  const CL: React.FC<{ items: string[]; pfx: string }> = ({ items, pfx }) => (
    <ul className="mg-cl">
      {items.map((item, i) => { const id = `${pfx}-${i}`; return <li key={id} className={checked[id] ? 'done' : ''} onClick={() => toggle(id)}>{item}</li>; })}
    </ul>
  );

  const IB: React.FC<{ t_: 'p'|'s'|'w'|'d'; title: string; children: React.ReactNode }> = ({ t_, title, children }) => (
    <div className={`mg-box ${t_}`}><div className="mg-box-ttl">{title}</div>{children}</div>
  );

  const ST: React.FC<{ icon: string; children: React.ReactNode }> = ({ icon, children }) => (
    <div style={{ marginBottom: '4px' }}>
      <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: t.ink, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ width: '36px', height: '36px', background: t.primary, borderRadius: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', flexShrink: 0 }}>{icon}</span>
        {children}
      </h2>
      <div className="mg-rule" />
    </div>
  );

  const Sub: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 style={{ fontSize: '0.92rem', fontWeight: 900, color: t.ink, marginBottom: '10px', marginTop: '24px', paddingBottom: '8px', borderBottom: `2px solid ${t.border}` }}>{children}</h3>
  );

  const H4s: React.FC<{ children: React.ReactNode; mt?: boolean }> = ({ children, mt }) => (
    <h4 style={{ fontSize: '0.74rem', fontWeight: 900, color: t.sub, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '7px', marginTop: mt ? '14px' : undefined }}>{children}</h4>
  );

  const Sec: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ background: t.white, borderRadius: '32px', padding: '34px', marginBottom: '14px', boxShadow: t.shadow, border: `1.5px solid ${t.border}` }}>{children}</div>
  );

  const navItems = [
    { id: 'intro',     icon: '🏠', label: 'Intro' },
    { id: 'persiapan', icon: '📚', label: 'Persiapan' },
    { id: 'tips',      icon: '💡', label: 'Tips Praktis' },
    { id: 'contoh',    icon: '🗣️', label: 'Contoh Jawaban' },
    { id: 'online',    icon: '💻', label: 'Etika Online' },
    { id: 'checklist', icon: '✅', label: 'Checklist' },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="mg">
        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'grid', gridTemplateColumns: '210px 1fr', gap: '22px', padding: '26px 18px', alignItems: 'start' }}>

          {/* Sidebar */}
          <nav style={{ position: 'sticky', top: '20px', background: t.white, borderRadius: '26px', padding: '18px', boxShadow: t.shadow, border: `1.5px solid ${t.border}` }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', color: t.primary, marginBottom: '12px', paddingBottom: '12px', borderBottom: `1.5px solid ${t.border}` }}>
              📖 Guide Menu
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {navItems.map(n => (
                <li key={n.id}>
                  <a href={`#${n.id}`} className={`mg-nav-link ${activeSection === n.id ? 'active' : ''}`} onClick={e => { e.preventDefault(); scrollTo(n.id); }}>
                    <span>{n.icon}</span>{n.label}
                  </a>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: `1.5px solid ${t.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: t.sub, textTransform: 'uppercase', letterSpacing: '1px' }}>Progress</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: t.primary }}>{Math.round(progress)}%</span>
              </div>
              <div className="mg-progress-track"><div className="mg-progress-fill" style={{ width: `${progress}%` }} /></div>
              {progress > 0 && <p style={{ fontSize: '0.68rem', color: t.emerald, marginTop: '5px', textAlign: 'center', fontWeight: 700 }}>{progress === 100 ? '🎉 Gambatte!' : '頑張れ！'}</p>}
            </div>
            <div style={{ marginTop: '14px', background: t.primarySoft, borderRadius: '14px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontFamily: font.jp, fontSize: '1.4rem', color: t.primary, fontWeight: 700 }}>面接</div>
              <div style={{ fontSize: '0.63rem', color: t.sub, marginTop: '2px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>Mensetsu Guide</div>
            </div>
          </nav>

          {/* Main */}
          <main ref={ref} style={{ minWidth: 0 }}>

            {/* Hero */}
            <div style={{ background: `linear-gradient(135deg, ${t.ink} 0%, #3730A3 100%)`, borderRadius: '36px', padding: '42px 38px', marginBottom: '18px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-8px', top: '-12px', fontFamily: font.jp, fontSize: '120px', color: 'rgba(255,255,255,0.04)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>介</div>
              <span style={{ display: 'inline-block', background: t.primary, color: 'white', fontSize: '0.66rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '99px', marginBottom: '14px' }}>Tokutei Ginou Kaigo</span>
              <h1 style={{ fontFamily: font.jp, fontSize: '1.9rem', fontWeight: 700, color: 'white', lineHeight: 1.25, marginBottom: '8px' }}>📝 Guide Mensetsu Online</h1>
              <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: '0.92rem' }}>Panduan Lengkap Interview — Persiapan sampai Hari-H</p>
            </div>

            {/* INTRO */}
            <Sec>
              <section id="intro" className="mg-sec">
                <ST icon="🏠">Introduction</ST>
                <p style={{ color: t.body, lineHeight: 1.75, fontSize: '0.9rem', marginBottom: '10px' }}>
                  Selamat datang! Guide ini dirancang khusus untuk membantu kamu mempersiapkan diri menghadapi wawancara online untuk program <strong>Tokutei Ginou Kaigo</strong> di Jepang.
                </p>
                <p style={{ color: t.body, lineHeight: 1.75, fontSize: '0.9rem', marginBottom: '16px' }}>
                  Mensetsu (面接) adalah tahap krusial dalam proses seleksi. Guide ini membantumu memahami apa yang diharapkan, cara mempersiapkan diri, dan tips nyata untuk sukses.
                </p>
                <IB t_="p" title="🎯 Tujuan Guide Ini">
                  <ul className="mg-ul"><li>Memahami format dan struktur mensetsu online</li><li>Mempelajari pertanyaan umum dan cara menjawabnya</li><li>Menguasai etika dan tata krama wawancara online</li><li>Mempersiapkan mental dan teknis untuk hari-H</li></ul>
                </IB>
              </section>
            </Sec>

            {/* PERSIAPAN */}
            <Sec>
              <section id="persiapan" className="mg-sec">
                <ST icon="📚">Persiapan Materi</ST>
                <Sub>📋 Kenali Diri Sendiri</Sub>
                <Coll title="Motivasi & Tujuan" icon="💭">
                  <H4s>Pertanyaan untuk direfleksikan:</H4s>
                  <ul className="mg-ul"><li><strong>Kenapa kaigo?</strong> Apa yang membuatmu tertarik dengan pekerjaan care worker?</li><li><strong>Kenapa Jepang?</strong> Mengapa memilih bekerja di Jepang, bukan negara lain?</li><li><strong>Tujuan jangka panjang:</strong> Apa yang ingin kamu capai dalam 3-5 tahun ke depan?</li><li><strong>Kontribusi:</strong> Bagaimana kamu bisa berkontribusi untuk facility mereka?</li></ul>
                  <IB t_="w" title="⚠️ Tips"><p>Jawaban harus <strong>spesifik</strong>, <strong>jujur</strong>, dan menunjukkan <strong>komitmen jangka panjang</strong>.</p></IB>
                </Coll>
                <Coll title="Pengalaman Relevan" icon="💼">
                  <ul className="mg-ul"><li>Pengalaman kerja atau volunteer terkait care/perawatan</li><li>Pengalaman merawat anggota keluarga (lansia, sakit, disabilitas)</li><li>Pengalaman customer service atau interaksi dengan orang</li><li>Soft skills: empati, kesabaran, komunikasi, problem-solving</li></ul>
                  <IB t_="s" title="✅ Format STAR"><p>Gunakan format <strong>STAR</strong>:</p><ul className="mg-ul" style={{ marginTop: '5px' }}><li><strong>S</strong>ituation: Konteks/situasi</li><li><strong>T</strong>ask: Tugas/tantangan yang dihadapi</li><li><strong>A</strong>ction: Tindakan yang kamu ambil</li><li><strong>R</strong>esult: Hasil/pembelajaran</li></ul></IB>
                </Coll>
                <Coll title="Pengetahuan Jepang & Kaigo" icon="🇯🇵">
                  <ul className="mg-ul"><li><strong>Budaya kerja Jepang:</strong> Punctuality, respect, teamwork, omotenashi</li><li><strong>Aging society:</strong> Jepang memiliki populasi lansia terbesar di dunia</li><li><strong>Kaigo system:</strong> Perbedaan level care (tokubetsu, kaigo, yōkaigo)</li><li><strong>Dasar bahasa Jepang:</strong> Minimal hiragana, katakana, salam dasar</li></ul>
                  <IB t_="p" title="📖 Resources"><ul className="mg-ul"><li>Pelajari tentang <em>Kaigo Hoken</em> (long-term care insurance)</li><li>Tonton video daily life di care facility</li><li>Baca tentang <em>5 principles of care</em> di Jepang</li></ul></IB>
                </Coll>
                <Sub>🏢 Riset tentang Facility</Sub>
                <IB t_="p" title="🔍 Yang perlu dicari tahu:">
                  <ul className="mg-ul"><li>Nama lengkap facility & lokasi</li><li>Jenis layanan (special nursing home, day service, home visit)</li><li>Ukuran facility (jumlah resident, staff)</li><li>Philosophy atau nilai-nilai facility</li><li>Program training untuk foreign workers</li><li>Support system (housing, Japanese lessons)</li></ul>
                </IB>
              </section>
            </Sec>

            {/* TIPS */}
            <Sec>
              <section id="tips" className="mg-sec">
                <ST icon="💡">Tips Praktis</ST>

                <Sub>🎯 Do's and Don'ts</Sub>
                <div className="mg-2col">
                  <div className="mg-dos"><h4>✅ DO's</h4><ul className="mg-ul"><li>Jawab dengan jujur dan spesifik</li><li>Tunjukkan antusiasme dan passion</li><li>Berikan contoh konkret dari pengalaman</li><li>Tanyakan pertanyaan yang thoughtful</li><li>Maintain eye contact (pandang kamera)</li><li>Smile naturally</li><li>Dengarkan dengan aktif</li></ul></div>
                  <div className="mg-donts"><h4>❌ DON'Ts</h4><ul className="mg-ul"><li>Berbohong atau membesar-besarkan</li><li>Badmouth previous employer</li><li>Fokus hanya pada gaji/benefit</li><li>Bilang "I don't know" tanpa elaborasi</li><li>Look at your own video, bukan kamera</li><li>Interrupt interviewer</li><li>Rush your answers</li></ul></div>
                </div>

                <Sub>🗣️ Tips Menjawab Pertanyaan</Sub>
                <Coll title="Structure Your Answer" icon="📝">
                  <ol className="mg-ol"><li><strong>Opening:</strong> Jawaban langsung</li><li><strong>Body:</strong> Penjelasan + contoh konkret</li><li><strong>Closing:</strong> Kaitkan dengan posisi/future</li></ol>
                  <div className="mg-eg" style={{ marginTop: '10px' }}><strong>Contoh — Q: "Do you have experience in caregiving?"</strong><p style={{ marginTop: '8px' }}><strong>Opening:</strong> "Yes, I have hands-on experience caring for my grandmother..."</p><p><strong>Body:</strong> "For 2 years, I helped with bathing, eating, and mobility..."</p><p><strong>Closing:</strong> "This taught me patience and compassion — essential for kaigo."</p></div>
                </Coll>
                <Coll title="Difficult Questions" icon="🤔">
                  <ul className="mg-ul"><li><strong>"Tell me about your weakness"</strong><br />→ Pilih weakness yang genuine tapi bisa di-improve. Selalu sebutkan langkah perbaikannya.</li><li><strong>"Why did you leave your last job?"</strong><br />→ Stay positive. Focus on what you're looking for.</li><li><strong>"What if you don't like it in Japan?"</strong><br />→ Show commitment. Mention preparation dan flexibility.</li></ul>
                </Coll>
                <Coll title="When You Don't Know the Answer" icon="🤷">
                  <ol className="mg-ol"><li>Be honest: "That's a great question. I haven't thought about it from that angle..."</li><li>Think aloud: "Let me think... Based on what I know..."</li><li>Relate: "I don't have direct experience, but in a similar situation..."</li><li>Show willingness: "I'd love to learn more. Could you tell me more?"</li></ol>
                </Coll>

                {/* NERVOUS */}
                <Sub>🧠 Mengelola Nervous & Anxiety</Sub>
                <IB t_="w" title="It's Normal! 💛"><p>Feeling nervous is completely normal. Even experienced professionals get nervous. The key is managing it, not eliminating it.</p></IB>
                <ul className="mg-tech" style={{ marginTop: '10px' }}>
                  <li><strong>4-7-8 Breathing:</strong> Inhale 4 detik, hold 7, exhale 8 — langsung menenangkan sistem saraf</li>
                  <li><strong>Power pose:</strong> Berdiri tegak, tangan di pinggang, 2 menit sebelum interview</li>
                  <li><strong>Positive self-talk:</strong> "I am prepared. I am capable. I can do this."</li>
                  <li><strong>Visualize success:</strong> Bayangkan interview berjalan lancar dari awal sampai akhir</li>
                  <li><strong>Ground yourself:</strong> Focus sensasi fisik — kaki di lantai, napas masuk keluar</li>
                  <li><strong>Remember:</strong> Interviewer ingin menemukan kandidat yang tepat. Mereka rooting for you.</li>
                </ul>

                {/* NAPAS PERUT */}
                <Sub>🫁 Napas Perut — Fondasi Suara & Ketenangan</Sub>
                <IB t_="p" title="💡 Kenapa Ini Penting?">
                  <p>Napas perut bukan cuma soal tenang — ini fondasi suara yang stabil, jernih, dan berwibawa. Saat nervous, napasmu jadi dangkal dan suaramu ikut bergetar. Napas perut memutus siklus itu dari akarnya.</p>
                </IB>
                <Coll title="Cara Melakukan Napas Perut" icon="🫁">
                  <H4s>Langkah-langkah:</H4s>
                  <ol className="mg-ol">
                    <li>Duduk atau berdiri <strong>tegak</strong>. Punggung lurus, bahu rileks turun, dagu sedikit masuk.</li>
                    <li>Taruh satu tangan di <strong>dada</strong>, satu di <strong>perut</strong> (bawah tulang rusuk).</li>
                    <li><strong>Hirup</strong> perlahan lewat hidung — rasakan tangan di perut bergerak maju. Tangan di dada tetap diam.</li>
                    <li><strong>Tahan</strong> 2–3 detik.</li>
                    <li><strong>Hembuskan</strong> perlahan lewat mulut — perut kembali masuk, dada tetap tenang.</li>
                    <li>Ulangi 5–8 kali. Lakukan ini 10 menit sebelum interview dimulai.</li>
                  </ol>
                  <IB t_="s" title="✅ Tanda Berhasil">
                    <p>Tangan di perutmu yang bergerak — bukan dadamu. Suaramu akan terasa lebih dalam, lebih stabil, dan lebih mantap saat bicara.</p>
                  </IB>
                </Coll>

                {/* POSTUR */}
                <Coll title="Duduk Tegak = Napas Lebih Dalam + Percaya Diri" icon="🪑">
                  <p style={{ fontSize: '0.9rem', color: t.body, lineHeight: 1.7, marginBottom: '14px' }}>
                    Postur bukan cuma soal keliatan profesional di kamera. Duduk tegak secara langsung mempengaruhi <strong>napas, suara, dan rasa percaya dirimu</strong>. Ini bukan mitos — ini fisiologi.
                  </p>
                  <div className="mg-2col">
                    {[
                      { icon: '🫁', ttl: 'Napas Lebih Dalam', desc: 'Postur tegak membuka rongga dada, memberi diafragma ruang untuk bergerak penuh. Napas perut jadi lebih mudah dan natural.' },
                      { icon: '😌', ttl: 'Otomatis Lebih Rileks', desc: 'Otak membaca postur sebagai sinyal aman. Duduk tegak menurunkan kadar kortisol (hormon stres) secara natural.' },
                      { icon: '💪', ttl: 'Suara Lebih Kuat', desc: 'Suara dari tubuh yang tegak punya resonansi lebih baik — terdengar lebih mantap, lebih yakin, dan lebih jelas.' },
                      { icon: '✨', ttl: 'Percaya Diri Naik', desc: 'Power pose selama 2 menit meningkatkan rasa percaya diri secara nyata — bahkan sebelum interview dimulai.' },
                    ].map(c => (
                      <div key={c.ttl} className="mg-pcard">
                        <div className="mg-pcard-ico">{c.icon}</div>
                        <div className="mg-pcard-ttl">{c.ttl}</div>
                        <p style={{ fontSize: '0.82rem', color: t.body, lineHeight: 1.55 }}>{c.desc}</p>
                      </div>
                    ))}
                  </div>
                  <IB t_="w" title="💡 Quick Check Sebelum Interview">
                    <p><strong>Kaki datar di lantai, punggung tidak menempel sandaran, bahu rileks turun, kepala lurus.</strong> Cek ini 5 menit sebelum masuk waiting room — rasakan bedanya dalam 10 detik pertama.</p>
                  </IB>
                </Coll>

                {/* VOKAL JEPANG */}
                <Sub>👄 Vokal Jepang — Mulut, Lidah & Otot yang Baru</Sub>
                <IB t_="p" title="🎌 Kenapa Ini Berbeda?">
                  <p>Vokal Bahasa Jepang bukan sekadar "beda aksen" — cara kerja mulut, lidah, dan otot wajahmu secara fisik berbeda dari Bahasa Indonesia. Ini butuh latihan otot, bukan cuma hafalan.</p>
                </IB>
                <Coll title="Cara Kerja Mulut & Lidah untuk Vokal Jepang" icon="👄">
                  <div className="mg-vkcmp">
                    <div className="mg-vk id">
                      <h5>🇮🇩 Bahasa Indonesia</h5>
                      <p>Vokal <strong>tegas & ekspresif</strong>. Mulut bergerak lebih bebas dan lebar. Lidah dinamis ke berbagai posisi. Otot rahang lebih aktif.</p>
                    </div>
                    <div className="mg-vk jp">
                      <h5>🇯🇵 Bahasa Jepang</h5>
                      <p>Vokal <strong>rata & terkontrol</strong>. Mulut hampir seperti senyum tipis "E" yang datar. Lidah <strong>datar & rileks</strong> di dasar mulut. Otot wajah lebih stabil.</p>
                    </div>
                  </div>
                  <H4s mt>Posisi Mulut yang Benar:</H4s>
                  <ul className="mg-ul">
                    <li><strong>Bibir:</strong> Senyum kecil yang natural — seperti mengucapkan "E" tapi rileks, bukan dipaksakan. Sudut mulut sedikit terangkat.</li>
                    <li><strong>Lidah:</strong> Datar dan rileks di dasar mulut, ujung lidah menyentuh ringan belakang gigi bawah. Tidak tegang, tidak naik.</li>
                    <li><strong>Rahang:</strong> Lebih rileks dan sedikit tertutup dibanding bicara Bahasa Indonesia — ini yang membuat vokal Jepang terdengar lebih rapi.</li>
                    <li><strong>Leher:</strong> Rileks. Suara datang dari perut, bukan tenggorokan.</li>
                  </ul>
                  <IB t_="s" title="🏆 Tanda Kamu Sudah Di Jalur yang Benar">
                    <p>Kalau setelah latihan 15–20 menit <strong>sudut mulutmu terasa pegel</strong> — itu tanda bagus! Berarti otot-otot yang biasa kamu pakai untuk Bahasa Indonesia sedang beradaptasi ke pola Bahasa Jepang. <strong>Pegel itu adalah progress.</strong> Teruskan.</p>
                  </IB>
                </Coll>
                <Coll title="Latihan Vokal Cepat Sebelum Interview" icon="🎤">
                  <H4s>Warm-up 5 menit:</H4s>
                  <ol className="mg-ol">
                    <li>Ucapkan <strong>"A – I – U – E – O"</strong> perlahan, fokus pada posisi mulut dan lidah di setiap vokal.</li>
                    <li>Ucapkan <strong>"Watashi wa [nama] desu"</strong> — perhatikan mulut tidak terbuka terlalu lebar.</li>
                    <li>Baca teks Jepang sederhana keras-keras selama 2–3 menit.</li>
                    <li>Akhiri dengan self-introduction lengkap, tempo sedikit lebih lambat dari biasanya.</li>
                  </ol>
                  <IB t_="w" title="⏰ Kapan Latihan">
                    <p>Lakukan warm-up ini <strong>setiap pagi selama 2 minggu sebelum interview</strong> — bukan hanya hari H. Otot mulut butuh waktu membangun memori gerak yang baru.</p>
                  </IB>
                </Coll>
              </section>
            </Sec>

            {/* CONTOH JAWABAN */}
            <Sec>
              <section id="contoh" className="mg-sec">
                <ST icon="🗣️">Contoh Jawaban</ST>
                <Sub>🔥 Top 10 Pertanyaan Umum</Sub>
                {[
                  { q: "Tell me about yourself / Jiko shoukai shite kudasai", tips: ["Keep it professional & relevant (2-3 menit)", "Structure: Present → Past → Future", "Highlight skills relevant to kaigo"], example: `"My name is [Name], I'm [age] from [city]. I work as [role] but I'm passionate about caregiving because [reason]. I've [relevant experience]. I'm learning Japanese and my goal is to become a certified care worker contributing to Japan's aging society."` },
                  { q: "Why do you want to work in kaigo?", tips: ["Show genuine passion, not just 'it's a job'", "Connect to personal experience if possible", "Mention values: empathy, dignity, compassion"], example: `"I've always been drawn to helping others, especially the elderly. When I cared for my grandmother, small acts of kindness made a huge difference in her quality of life. Kaigo isn't just physical care — it's about preserving dignity and bringing joy. I find this deeply meaningful."` },
                  { q: "Why Japan? Why not your own country?", tips: ["Show you've done research", "Balance opportunity + genuine interest in Japan", "Mention culture, training, work ethic"], example: `"Japan has one of the most advanced care systems in the world. I'm impressed by the emphasis on respect and quality of life. Japanese work culture values discipline and continuous improvement — qualities I admire. I've been learning the language, and working here lets me grow professionally while contributing to a society I respect."` },
                  { q: "Do you have any experience in caregiving?", tips: ["Even informal experience counts!", "Use STAR method", "Highlight transferable skills"], example: `"Yes, I cared for my elderly grandfather for 2 years after his stroke — bathing, feeding, mobility exercises. It was challenging, but I learned patience, empathy, and communication. This confirmed my desire to pursue kaigo professionally."` },
                  { q: "What do you know about our facility?", tips: ["DO YOUR RESEARCH!", "Mention specific details", "Connect to your values/goals"], example: `"I learned that [Facility] is a special nursing home in [Location] serving [number] residents. I was particularly impressed by your philosophy of [values], and that you provide Japanese training for foreign workers. This environment is exactly where I want to grow."` },
                  { q: "What are your strengths?", tips: ["Choose 2-3 relevant strengths", "Give concrete examples", "Relate to kaigo work"], example: `"My key strengths are patience, empathy, and adaptability. Caring for my grandmother with dementia, I learned to stay calm and adapt my communication to her needs. I'm also physically fit and comfortable with the demands of caregiving."` },
                  { q: "What are your weaknesses?", tips: ["Be honest but strategic", "Choose a real weakness", "Show you're actively working on it"], example: `"I'm working on my Japanese. While I handle basic conversations, I need to improve for effective communication. I'm taking classes and practicing daily — committed to conversational fluency within my first year."` },
                  { q: "How do you handle stress?", tips: ["Give specific coping strategies", "Use an example", "Show emotional intelligence"], example: `"I take deep breaths and prioritize tasks. When my grandfather became agitated, I stayed calm, spoke softly, and redirected his attention. After challenges, I reflect on what I could do better and maintain self-care through exercise."` },
                  { q: "Where do you see yourself in 5 years?", tips: ["Show long-term commitment", "Mention growth within the field", "Balance ambition with realism"], example: `"I see myself as an experienced care worker, possibly specializing in dementia care. I'd love to mentor new foreign workers and bridge cultural gaps. Most importantly, I want to be someone residents and families trust completely."` },
                  { q: "Do you have any questions for us?", tips: ["ALWAYS have questions ready!", "Ask about training, daily routine, team", "Avoid salary questions too early"], example: `"Could you tell me more about the training process for new staff? What does a typical day look like? And what qualities do your most successful care workers share?"` },
                ].map((item, i) => (
                  <Coll key={i} title={`${i + 1}. ${item.q}`} icon="❓">
                    <div className="mg-tips"><h4>💡 Tips:</h4><ul className="mg-ul">{item.tips.map((tip, j) => <li key={j}>{tip}</li>)}</ul></div>
                    <div className="mg-eg"><strong>📝 Contoh Jawaban:</strong><p style={{ marginTop: '8px' }}>{item.example}</p></div>
                  </Coll>
                ))}
              </section>
            </Sec>

            {/* ONLINE */}
            <Sec>
              <section id="online" className="mg-sec">
                <ST icon="💻">Etika Wawancara Online</ST>

                <Sub>🎥 Technical Setup</Sub>
                <IB t_="p" title="🖥️ Equipment Checklist:">
                  <CL pfx="tech" items={["Stable internet connection (minimum 10 Mbps)", "Computer/laptop with working camera", "Good quality microphone or earphones with mic", "Zoom/Google Meet/Teams installed & tested", "Backup device ready (phone/tablet)", "Backup internet (mobile hotspot)", "Charger plugged in"]} />
                </IB>
                <IB t_="w" title="⚠️ Test Everything!">
                  <ul className="mg-ul"><li>Do a test call 1-2 days before</li><li>Check camera angle, lighting, audio</li><li>Have interviewer's contact info for emergencies</li></ul>
                </IB>

                <Sub>📹 Camera & Background</Sub>
                <Coll title="Camera Position" icon="📷">
                  <ul className="mg-ul"><li><strong>Height:</strong> Camera at eye level (use books to elevate)</li><li><strong>Distance:</strong> Upper body visible (head to chest)</li><li><strong>Eye contact:</strong> Look at camera, NOT at your own video</li></ul>
                </Coll>
                <Coll title="Lighting" icon="💡">
                  <ul className="mg-ul"><li><strong>Natural light:</strong> Face a window (not behind you)</li><li><strong>Artificial:</strong> Desk lamp in front of you</li><li><strong>Avoid:</strong> Backlighting, harsh overhead lights</li></ul>
                </Coll>
                <Coll title="Background" icon="🖼️">
                  <ul className="mg-ul"><li>Clean, neutral wall — white, beige, or light gray</li><li>No clutter, laundry, unmade bed, or distracting movement</li><li>Virtual bg: test beforehand for glitchy edges</li></ul>
                </Coll>

                <Sub>👔 Appearance & Dress Code</Sub>
                <div className="mg-2col">
                  <div className="mg-acard"><h4>👕 Pakaian</h4><ul className="mg-ul"><li>Business casual minimum</li><li>Solid colors (avoid patterns)</li><li>Men: Collared shirt or polo</li><li>Women: Blouse or neat top</li><li>Avoid white (washes out), loud prints</li></ul></div>
                  <div className="mg-acard"><h4>💇 Grooming</h4><ul className="mg-ul"><li>Hair neat & tidy</li><li>Men: Clean shave or groomed facial hair</li><li>Women: Natural makeup</li><li>Clean nails, minimal accessories</li><li>Look fresh & rested</li></ul></div>
                </div>
                <IB t_="s" title="✨ Pro Tip"><p>Dress as if you're going in person. It directly affects your confidence and how seriously you're taken.</p></IB>

                <Sub>🙏 Japanese Interview Etiquette</Sub>
                <Coll title="Opening & Greeting" icon="👋">
                  <ol className="mg-ol">
                    <li><strong>Join early:</strong> Enter waiting room 5 minutes before</li>
                    <li><strong>First impression:</strong> Camera ON, mic ON, smiling</li>
                    <li><strong>Bow (15°):</strong><br /><em style={{ color: t.primary }}>"Konnichiwa. Watashi wa [Name] desu. Kyou wa yoroshiku onegaishimasu."</em><br /><span style={{ fontSize: '0.79rem', color: t.sub }}>("Good afternoon. I am [Name]. Thank you for today.")</span></li>
                    <li><strong>Wait:</strong> Let interviewer lead</li>
                  </ol>
                </Coll>
                <Coll title="During Interview" icon="💬">
                  <ul className="mg-ul"><li><strong>Posture:</strong> Sit up straight, hands on lap or desk</li><li><strong>Nodding:</strong> Nod to show you're listening</li><li><strong>Aizuchi:</strong> "Hai", "Sou desu ne" appropriately</li><li><strong>Pauses:</strong> OK to pause before answering — shows thoughtfulness</li><li><strong>Respect:</strong> Never interrupt. Wait for them to finish.</li></ul>
                </Coll>
                <Coll title="Closing" icon="🏁">
                  <ol className="mg-ol">
                    <li><strong>Thank them (bow 30°):</strong><br /><em style={{ color: t.primary }}>"Kyou wa ohanashi dekite, totemo ureshikatta desu. Doumo arigatou gozaimashita."</em><br /><span style={{ fontSize: '0.79rem', color: t.sub }}>("I'm very happy I could speak with you. Thank you very much.")</span></li>
                    <li><strong>Follow-up:</strong> Send thank-you email within 24 hours</li>
                  </ol>
                </Coll>

                <Sub>🚨 Handling Technical Issues</Sub>
                <IB t_="d" title="⚠️ Emergency Plan">
                  <ul className="mg-ul"><li><strong>Internet crashes:</strong> Stay calm → switch to hotspot → email immediately → rejoin → apologize briefly, don't dwell</li><li><strong>Their audio/video down:</strong> Politely mention it, offer to wait, stay patient</li><li><strong>Key rule:</strong> How you handle problems shows your character.</li></ul>
                </IB>
              </section>
            </Sec>

            {/* CHECKLIST */}
            <Sec>
              <section id="checklist" className="mg-sec">
                <ST icon="✅">Checklist Persiapan Timeline</ST>
                <p style={{ color: t.body, fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '20px' }}>
                  Ikuti checklist ini untuk memastikan kamu siap 100% di hari-H! Klik setiap item untuk menandainya selesai.
                </p>

                <Coll title="2-3 Minggu Sebelum" icon="📋">
                  <H4s>Materi:</H4s>
                  <CL pfx="w2m" items={["Review guide ini thoroughly", "List 10 pertanyaan umum & siapkan jawaban", "Riset tentang facility/company", "Identifikasi 3-5 cerita/pengalaman relevan", "Practice STAR method answers"]} />
                  <H4s mt>Bahasa Jepang:</H4s>
                  <CL pfx="w2j" items={["Practice self-introduction in Japanese", "Learn basic keigo phrases", "Review kaigo terminology", "Latihan vokal A-I-U-E-O posisi mulut Jepang setiap pagi"]} />
                  <H4s mt>Mock Interview:</H4s>
                  <CL pfx="w2k" items={["Schedule mock interview #1 dengan teman/sensei", "Record yourself answering questions", "Review recording & catat area yang perlu diperbaiki"]} />
                </Coll>

                <Coll title="1 Minggu Sebelum" icon="📋">
                  <H4s>Polish:</H4s>
                  <CL pfx="w1p" items={["Mock interview #2 via Zoom", "Refine answers based on feedback", "Practice online bow & greeting", "Practice melihat kamera, bukan layar", "Review kaigo terminology"]} />
                  <H4s mt>Teknis:</H4s>
                  <CL pfx="w1t" items={["Test camera, mic, internet", "Setup & test interview location", "Test lighting", "Update Zoom ke versi terbaru"]} />
                  <H4s mt>Logistik:</H4s>
                  <CL pfx="w1l" items={["Confirm interview time, date, Zoom link", "Prepare interview outfit & test on camera", "Arrange backup internet (mobile hotspot)"]} />
                </Coll>

                <Coll title="1-2 Hari Sebelum" icon="📋">
                  <H4s>Final Prep:</H4s>
                  <CL pfx="d2p" items={["Mock interview #3 — full simulation", "Final review materi", "Prepare all documents", "Full equipment test"]} />
                  <H4s mt>Self-care:</H4s>
                  <CL pfx="d2s" items={["Prepare outfit (test on camera)", "Hydrate well", "Light exercise", "Avoid alcohol", "Prepare interview space"]} />
                </Coll>

                <Coll title="Malam H-1" icon="🌙">
                  <H4s>Mental Prep:</H4s>
                  <CL pfx="nm" items={["Visualization exercise — bayangkan interview berjalan lancar", "Light review materi (jangan belajar hal baru)", "Tulis affirmasi positifmu sendiri", "Relaxation routine — napas perut 10 menit", "Ingatkan diri: kamu sudah mempersiapkan ini"]} />
                  <H4s mt>Practical:</H4s>
                  <CL pfx="np" items={["Set 2-3 alarms", "Charge all devices fully", "Test Zoom link one last time", "Lay out outfit", "Organize documents", "Early bedtime (7-8 jam tidur)", "Inform family about interview"]} />
                </Coll>

                <Coll title="Pagi Hari-H" icon="☀️">
                  <H4s>1 Hour Before:</H4s>
                  <CL pfx="m1h" items={["Test internet speed", "Join test Zoom meeting", "Setup interview space (camera, lighting, background)", "Close all unnecessary programs", "Turn phone to SILENT", "Put up 'Do Not Disturb' sign", "Water bottle ready (out of frame)"]} />
                  <H4s mt>5 Minutes Before:</H4s>
                  <CL pfx="m5m" items={["Click Zoom link, join meeting", "Wait in waiting room", "Camera ON, Mic ON", "Duduk tegak — lakukan napas perut 5x", "Warm-up vokal: A-I-U-E-O pelan", "Calm, confident expression", "Ready to bow & greet"]} />

                  <div className="mg-mantra">
                    <div className="mg-mantra-main">
                      "Aku siap. Aku bisa. Aku layak."
                    </div>
                    <div className="mg-mantra-sub">
                      Semangat dan bangga — kamu sedang melakukan hal baik pada dirimu sendiri. 🌸
                    </div>
                  </div>
                </Coll>
              </section>
            </Sec>

            {/* Closing */}
            <div style={{ background: `linear-gradient(135deg, ${t.ink} 0%, #3730A3 100%)`, borderRadius: '36px', padding: '46px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', fontFamily: font.jp, fontSize: '150px', color: 'rgba(255,255,255,0.03)', pointerEvents: 'none', userSelect: 'none', lineHeight: 1 }}>頑</div>
              <div style={{ fontFamily: font.jp, fontSize: '1.9rem', color: 'white', marginBottom: '12px', fontWeight: 700 }}>💪 がんばってください！</div>
              <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.92rem', lineHeight: 1.7 }}>You got this! May this guide help you succeed in your journey to become a care worker in Japan.</p>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.82rem', marginTop: '10px' }}>Your compassion will make a difference. 🙏</p>
            </div>

          </main>
        </div>

        <button className={`mg-btt ${showBtt ? 'show' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">↑</button>
      </div>
    </>
  );
};

export default MensetsuGuide;
