import React, { useState, useEffect, useRef } from 'react';

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface CollapsibleSection {
  title: string;
  icon: string;
  content: React.ReactNode;
}

// ─── Design Tokens ────────────────────────────────────────────────────────────
const t = {
  // Primary: Indigo (matches app's purple/blue)
  red:     '#4338CA',   // indigo-700
  redMid:  '#6366F1',   // indigo-500
  redSoft: '#EEF2FF',   // indigo-50
  // Ink / text
  ink:     '#1E1B4B',   // indigo-950
  slate:   '#312E81',   // indigo-900 (dark text)
  mist:    '#F8F9FF',   // very light indigo tint
  white:   '#FFFFFF',
  // Accent: Teal/mint (matches app's green cards)
  gold:    '#0D9488',   // teal-600
  goldSoft:'#F0FDFA',   // teal-50
  // Success: Teal
  sage:    '#0D9488',   // teal-600
  sageSoft:'#CCFBF1',   // teal-100
  // Info: Sky blue
  sky:     '#0284C7',   // sky-600
  skySoft: '#E0F2FE',   // sky-100
  // Warning: Amber
  amber:   '#D97706',   // amber-600
  amberSoft:'#FEF3C7',  // amber-100
  // Danger: Rose
  border:  '#E5E7EB',
  textSub: '#6B7280',
  radius:  '12px',
  shadow:  '0 2px 16px rgba(30,27,75,0.08)',
  shadowHov:'0 8px 32px rgba(30,27,75,0.14)',
};

const font = {
  jp: "'Noto Serif JP', 'Georgia', serif",
  body: "'Noto Sans JP', -apple-system, 'Segoe UI', sans-serif",
};

// ─── Global style injection ───────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&family=Noto+Sans+JP:wght@400;500;600;700&display=swap');

  .mg-wrapper * { box-sizing: border-box; margin: 0; padding: 0; }

  .mg-wrapper {
    font-family: ${font.body};
    background: ${t.mist};
    min-height: 100vh;
    color: ${t.ink};
  }

  /* ── Nav ── */
  .mg-nav-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 8px;
    text-decoration: none;
    color: ${t.slate};
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.2s;
    border-left: 3px solid transparent;
  }
  .mg-nav-link:hover {
    background: ${t.redSoft};
    color: ${t.red};
    border-left-color: ${t.red};
  }
  .mg-nav-link.active {
    background: ${t.redSoft};
    color: ${t.red};
    border-left-color: ${t.red};
    font-weight: 600;
  }

  /* ── Progress ── */
  .mg-progress-track {
    height: 6px;
    background: ${t.border};
    border-radius: 99px;
    overflow: hidden;
    margin-top: 8px;
  }
  .mg-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4338CA, #0D9488);
    border-radius: 99px;
    transition: width 0.5s ease;
  }

  /* ── Collapsible ── */
  .mg-collapsible-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    background: ${t.white};
    border: 1px solid ${t.border};
    border-radius: ${t.radius};
    cursor: pointer;
    font-weight: 600;
    font-size: 0.92rem;
    color: ${t.slate};
    transition: all 0.2s;
    margin-bottom: 2px;
    user-select: none;
  }
  .mg-collapsible-header:hover {
    background: ${t.redSoft};
    border-color: ${t.red};
    color: ${t.red};
  }
  .mg-collapsible-header.open {
    background: ${t.red};
    border-color: ${t.red};
    color: white;
    border-radius: ${t.radius} ${t.radius} 0 0;
    margin-bottom: 0;
  }
  .mg-collapsible-body {
    border: 1px solid ${t.red};
    border-top: none;
    border-radius: 0 0 ${t.radius} ${t.radius};
    background: ${t.white};
    padding: 20px;
    margin-bottom: 8px;
    animation: mg-slideDown 0.22s ease;
  }
  @keyframes mg-slideDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Checklist ── */
  .mg-checklist {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 8px 0 12px;
  }
  .mg-checklist li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 9px 14px;
    border-radius: 8px;
    font-size: 0.87rem;
    cursor: pointer;
    border: 1px solid ${t.border};
    background: ${t.mist};
    transition: all 0.15s;
    line-height: 1.45;
  }
  .mg-checklist li::before {
    content: '○';
    color: ${t.textSub};
    font-size: 1rem;
    flex-shrink: 0;
    margin-top: 0px;
  }
  .mg-checklist li:hover {
    border-color: ${t.red};
    background: ${t.redSoft};
  }
  .mg-checklist li.checked {
    background: ${t.sageSoft};
    border-color: ${t.sage};
    color: ${t.sage};
    text-decoration: line-through;
    text-decoration-color: ${t.sage};
  }
  .mg-checklist li.checked::before {
    content: '✓';
    color: ${t.sage};
    font-weight: 700;
  }

  /* ── Info Boxes ── */
  .mg-info-box {
    border-radius: ${t.radius};
    padding: 16px 20px;
    margin: 14px 0;
    border-left: 4px solid;
  }
  .mg-info-box.primary   { background: ${t.skySoft};   border-color: ${t.sky};   }
  .mg-info-box.success   { background: ${t.sageSoft};  border-color: ${t.sage};  }
  .mg-info-box.warning   { background: ${t.amberSoft}; border-color: ${t.amber}; }
  .mg-info-box.danger    { background: ${t.redSoft};   border-color: ${t.red};   }
  .mg-info-box-title {
    font-weight: 700;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
    opacity: 0.85;
  }
  .mg-info-box ul, .mg-info-box ol {
    padding-left: 18px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .mg-info-box li { font-size: 0.88rem; line-height: 1.5; }
  .mg-info-box p  { font-size: 0.88rem; line-height: 1.6; }

  /* ── Example / Tips boxes ── */
  .mg-tips-box {
    background: ${t.goldSoft};
    border: 1px solid ${t.gold};
    border-radius: 8px;
    padding: 14px 18px;
    margin-bottom: 12px;
  }
  .mg-tips-box h4 { font-size: 0.82rem; color: ${t.gold}; margin-bottom: 6px; }
  .mg-tips-box ul { padding-left: 16px; }
  .mg-tips-box li { font-size: 0.86rem; line-height: 1.5; }

  .mg-example-box {
    background: ${t.skySoft};
    border: 1px solid ${t.sky}44;
    border-radius: 8px;
    padding: 14px 18px;
    font-size: 0.87rem;
    line-height: 1.65;
    color: ${t.slate};
  }
  .mg-example-box strong { color: ${t.sky}; }

  /* ── Content lists ── */
  .mg-body-ul, .mg-body-ol {
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin: 8px 0;
  }
  .mg-body-ul li, .mg-body-ol li {
    font-size: 0.9rem;
    line-height: 1.6;
    color: ${t.slate};
  }
  .mg-body-ul li strong, .mg-body-ol li strong { color: ${t.ink}; }

  /* ── Techniques list ── */
  .mg-techniques-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 12px 0;
  }
  .mg-techniques-list li {
    padding: 10px 14px 10px 14px;
    border-radius: 8px;
    background: ${t.white};
    border: 1px solid ${t.border};
    font-size: 0.88rem;
    line-height: 1.5;
    position: relative;
    padding-left: 38px;
  }
  .mg-techniques-list li::before {
    content: '→';
    position: absolute;
    left: 14px;
    color: ${t.red};
    font-weight: 700;
  }

  /* ── Back to top ── */
  .mg-back-top {
    position: fixed;
    bottom: 28px;
    right: 28px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: ${t.red};
    color: white;
    border: none;
    font-size: 1.1rem;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(67,56,202,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: translateY(16px);
    transition: all 0.25s;
    pointer-events: none;
    z-index: 100;
  }
  .mg-back-top.show {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
  .mg-back-top:hover {
    background: ${t.redMid};
    transform: translateY(-2px);
  }

  /* ── Dos Donts & Appearance grids ── */
  .mg-dos-donts-grid, .mg-appearance-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin: 14px 0;
  }
  @media (max-width: 640px) {
    .mg-dos-donts-grid, .mg-appearance-grid { grid-template-columns: 1fr; }
  }
  .mg-dos-card, .mg-donts-card, .mg-appearance-card {
    border-radius: ${t.radius};
    padding: 18px;
    border: 1px solid;
  }
  .mg-dos-card    { background: ${t.sageSoft}; border-color: ${t.sage};  }
  .mg-donts-card  { background: ${t.redSoft};  border-color: ${t.red};   }
  .mg-appearance-card { background: ${t.white}; border-color: ${t.border}; }
  .mg-dos-card h4    { color: ${t.sage};  margin-bottom: 10px; font-size: 0.9rem; }
  .mg-donts-card h4  { color: ${t.red};   margin-bottom: 10px; font-size: 0.9rem; }
  .mg-appearance-card h4 { color: ${t.slate}; margin-bottom: 10px; font-size: 0.9rem; }

  /* ── Section decorative rule ── */
  .mg-section-rule {
    width: 40px;
    height: 3px;
    background: ${t.red};
    border-radius: 2px;
    margin-top: 6px;
    margin-bottom: 24px;
  }
`;

const MensetsuGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('intro');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [progress, setProgress] = useState(0);
  const [checklistItems, setChecklistItems] = useState<{ [key: string]: boolean }>({});
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.pageYOffset > 300);
      updateActiveNav();
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    updateProgress();
  }, [checklistItems]);

  const updateProgress = () => {
    const items = document.querySelectorAll('.mg-checklist li');
    const checkedCount = Object.values(checklistItems).filter(Boolean).length;
    const total = items.length;
    setProgress(total > 0 ? (checkedCount / total) * 100 : 0);
  };

  const updateActiveNav = () => {
    const sections = document.querySelectorAll('.mg-section');
    let current = 'intro';
    sections.forEach((section) => {
      const sectionTop = (section as HTMLElement).offsetTop;
      if (window.pageYOffset >= sectionTop - 200) {
        current = section.getAttribute('id') || 'intro';
      }
    });
    setActiveSection(current);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const toggleChecklistItem = (itemId: string) => {
    setChecklistItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // ── Sub-components ─────────────────────────────────────────────────────────
  const CollapsibleItem: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div style={{ marginBottom: '8px' }}>
        <div
          className={`mg-collapsible-header ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1rem' }}>{icon}</span>
            <span>{title}</span>
          </span>
          <span style={{ fontSize: '0.75rem', opacity: 0.7, transition: 'transform 0.2s', display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
        </div>
        {isOpen && (
          <div className="mg-collapsible-body">
            {children}
          </div>
        )}
      </div>
    );
  };

  const ChecklistItems: React.FC<{ items: string[]; prefix: string }> = ({ items, prefix }) => (
    <ul className="mg-checklist">
      {items.map((item, index) => {
        const itemId = `${prefix}-${index}`;
        return (
          <li
            key={itemId}
            className={checklistItems[itemId] ? 'checked' : ''}
            onClick={() => toggleChecklistItem(itemId)}
          >
            {item}
          </li>
        );
      })}
    </ul>
  );

  const InfoBox: React.FC<{ type: 'primary' | 'success' | 'warning' | 'danger'; title: string; children: React.ReactNode }> = ({ type, title, children }) => (
    <div className={`mg-info-box ${type}`}>
      <div className="mg-info-box-title">{title}</div>
      {children}
    </div>
  );

  const SectionTitle: React.FC<{ icon: string; children: React.ReactNode }> = ({ icon, children }) => (
    <div style={{ marginBottom: '4px' }}>
      <h2 style={{
        fontFamily: font.jp,
        fontSize: '1.6rem',
        fontWeight: 700,
        color: t.ink,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <span style={{
          width: '40px', height: '40px',
          background: t.red,
          borderRadius: '10px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.1rem',
          flexShrink: 0,
        }}>{icon}</span>
        {children}
      </h2>
      <div className="mg-section-rule" />
    </div>
  );

  const SubsectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 style={{
      fontSize: '1rem',
      fontWeight: 700,
      color: t.slate,
      marginBottom: '14px',
      marginTop: '28px',
      paddingBottom: '8px',
      borderBottom: `2px solid ${t.border}`,
    }}>{children}</h3>
  );

  const navItems = [
    { id: 'intro',     icon: '🏠', label: 'Intro' },
    { id: 'persiapan', icon: '📚', label: 'Persiapan Materi' },
    { id: 'tips',      icon: '💡', label: 'Tips Praktis' },
    { id: 'contoh',    icon: '🗣️', label: 'Contoh Jawaban' },
    { id: 'online',    icon: '💻', label: 'Etika Online' },
    { id: 'checklist', icon: '✅', label: 'Checklist' },
  ];

  return (
    <>
      {/* Inject global styles */}
      <style>{GLOBAL_CSS}</style>

      <div className="mg-wrapper">
        <div style={{
          maxWidth: '1180px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
          gap: '28px',
          padding: '28px 20px',
          alignItems: 'start',
        }}>

          {/* ── Sidebar ── */}
          <nav style={{
            position: 'sticky',
            top: '20px',
            background: t.white,
            borderRadius: '16px',
            padding: '20px',
            boxShadow: t.shadow,
            border: `1px solid ${t.border}`,
          }}>
            <div style={{
              fontFamily: font.jp,
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: t.red,
              marginBottom: '14px',
              paddingBottom: '12px',
              borderBottom: `1px solid ${t.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>📖</span> Guide Menu
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`mg-nav-link ${activeSection === item.id ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); scrollToSection(item.id); }}
                  >
                    <span style={{ fontSize: '0.95rem' }}>{item.icon}</span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Progress */}
            <div style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: `1px solid ${t.border}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: t.textSub, fontWeight: 600 }}>PROGRESS</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: t.red }}>{Math.round(progress)}%</span>
              </div>
              <div className="mg-progress-track">
                <div className="mg-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              {progress > 0 && (
                <div style={{ fontSize: '0.72rem', color: t.sage, marginTop: '6px', textAlign: 'center' }}>
                  {progress === 100 ? '🎉 Semua selesai! Gambatte!' : `Keep going! 頑張れ！`}
                </div>
              )}
            </div>

            {/* Japanese decorative element */}
            <div style={{
              marginTop: '20px',
              textAlign: 'center',
              padding: '12px',
              background: t.redSoft,
              borderRadius: '10px',
            }}>
              <div style={{ fontFamily: font.jp, fontSize: '1.4rem', color: t.red, lineHeight: 1.3 }}>面接</div>
              <div style={{ fontSize: '0.68rem', color: t.textSub, marginTop: '2px', letterSpacing: '0.5px' }}>MENSETSU GUIDE</div>
            </div>
          </nav>

          {/* ── Main Content ── */}
          <main ref={contentRef} style={{ minWidth: 0 }}>

            {/* Hero */}
            <div style={{
              background: `linear-gradient(135deg, ${t.ink} 0%, #3730A3 60%, #6366F122 100%)`,
              borderRadius: '20px',
              padding: '48px 40px',
              marginBottom: '28px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Decorative kanji watermark */}
              <div style={{
                position: 'absolute',
                right: '-10px',
                top: '-20px',
                fontFamily: font.jp,
                fontSize: '140px',
                color: 'rgba(255,255,255,0.04)',
                lineHeight: 1,
                pointerEvents: 'none',
                userSelect: 'none',
              }}>介</div>

              <div style={{
                display: 'inline-block',
                background: t.red,
                color: 'white',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                padding: '4px 12px',
                borderRadius: '99px',
                marginBottom: '16px',
              }}>
                Tokutei Ginou Kaigo
              </div>
              <h1 style={{
                fontFamily: font.jp,
                fontSize: '2.2rem',
                fontWeight: 700,
                color: t.white,
                lineHeight: 1.25,
                marginBottom: '10px',
              }}>
                📝 Guide Mensetsu Online
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', fontWeight: 400 }}>
                Panduan Lengkap Interview — Persiapan sampai Hari-H
              </p>
            </div>

            {/* ── INTRO ── */}
            <section id="intro" className="mg-section" style={{ background: t.white, borderRadius: '16px', padding: '36px', marginBottom: '20px', boxShadow: t.shadow, border: `1px solid ${t.border}` }}>
              <SectionTitle icon="🏠">Introduction</SectionTitle>
              <p style={{ color: t.slate, lineHeight: 1.75, fontSize: '0.95rem', marginBottom: '12px' }}>
                Selamat datang! Guide ini dirancang khusus untuk membantu kamu mempersiapkan diri menghadapi
                wawancara online untuk program <strong>Tokutei Ginou Kaigo</strong> di Jepang.
              </p>
              <p style={{ color: t.slate, lineHeight: 1.75, fontSize: '0.95rem', marginBottom: '20px' }}>
                Mensetsu (面接) atau wawancara adalah tahap penting dalam proses seleksi. Guide ini akan membantu
                kamu memahami apa yang diharapkan, bagaimana mempersiapkan diri, dan tips untuk sukses.
              </p>
              <InfoBox type="primary" title="🎯 Tujuan Guide Ini">
                <ul className="mg-body-ul">
                  <li>Memahami format dan struktur mensetsu online</li>
                  <li>Mempelajari pertanyaan umum dan cara menjawabnya</li>
                  <li>Menguasai etika dan tata krama wawancara online</li>
                  <li>Mempersiapkan mental dan teknis untuk hari-H</li>
                </ul>
              </InfoBox>
            </section>

            {/* ── PERSIAPAN ── */}
            <section id="persiapan" className="mg-section" style={{ background: t.white, borderRadius: '16px', padding: '36px', marginBottom: '20px', boxShadow: t.shadow, border: `1px solid ${t.border}` }}>
              <SectionTitle icon="📚">Persiapan Materi</SectionTitle>

              <SubsectionTitle>📋 Kenali Diri Sendiri</SubsectionTitle>
              <CollapsibleItem title="Motivasi & Tujuan" icon="💭">
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: t.slate, marginBottom: '8px' }}>Pertanyaan untuk direfleksikan:</h4>
                <ul className="mg-body-ul">
                  <li><strong>Kenapa kaigo?</strong> Apa yang membuatmu tertarik dengan pekerjaan care worker?</li>
                  <li><strong>Kenapa Jepang?</strong> Mengapa memilih bekerja di Jepang, bukan negara lain?</li>
                  <li><strong>Tujuan jangka panjang:</strong> Apa yang ingin kamu capai dalam 3-5 tahun ke depan?</li>
                  <li><strong>Kontribusi:</strong> Bagaimana kamu bisa berkontribusi untuk facility mereka?</li>
                </ul>
                <InfoBox type="warning" title="⚠️ Tips">
                  <p>Jawaban harus <strong>spesifik</strong>, <strong>jujur</strong>, dan menunjukkan <strong>komitmen jangka panjang</strong>.</p>
                </InfoBox>
              </CollapsibleItem>

              <CollapsibleItem title="Pengalaman Relevan" icon="💼">
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: t.slate, marginBottom: '8px' }}>Identifikasi pengalamanmu:</h4>
                <ul className="mg-body-ul">
                  <li>Pengalaman kerja atau volunteer terkait care/perawatan</li>
                  <li>Pengalaman merawat anggota keluarga (lansia, sakit, disabilitas)</li>
                  <li>Pengalaman customer service atau interaksi dengan orang</li>
                  <li>Soft skills: empati, kesabaran, komunikasi, problem-solving</li>
                </ul>
                <InfoBox type="success" title="✅ Format STAR">
                  <p>Gunakan format <strong>STAR</strong> untuk menceritakan pengalaman:</p>
                  <ul className="mg-body-ul" style={{ marginTop: '6px' }}>
                    <li><strong>S</strong>ituation: Konteks/situasi</li>
                    <li><strong>T</strong>ask: Tugas/tantangan yang dihadapi</li>
                    <li><strong>A</strong>ction: Tindakan yang kamu ambil</li>
                    <li><strong>R</strong>esult: Hasil/pembelajaran</li>
                  </ul>
                </InfoBox>
              </CollapsibleItem>

              <CollapsibleItem title="Pengetahuan tentang Jepang & Kaigo" icon="🇯🇵">
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: t.slate, marginBottom: '8px' }}>Yang perlu kamu ketahui:</h4>
                <ul className="mg-body-ul">
                  <li><strong>Budaya kerja Jepang:</strong> Punctuality, respect, teamwork, omotenashi</li>
                  <li><strong>Aging society:</strong> Jepang memiliki populasi lansia terbesar di dunia</li>
                  <li><strong>Kaigo system:</strong> Perbedaan level care (tokubetsu, kaigo, yōkaigo)</li>
                  <li><strong>Dasar bahasa Jepang:</strong> Minimal hiragana, katakana, salam dasar</li>
                </ul>
                <InfoBox type="primary" title="📖 Resources">
                  <ul className="mg-body-ul">
                    <li>Pelajari tentang <em>Kaigo Hoken</em> (long-term care insurance)</li>
                    <li>Tonton video tentang daily life di care facility</li>
                    <li>Baca tentang <em>5 principles of care</em> di Jepang</li>
                  </ul>
                </InfoBox>
              </CollapsibleItem>

              <SubsectionTitle>🏢 Riset tentang Facility</SubsectionTitle>
              <InfoBox type="primary" title="🔍 Yang perlu dicari tahu:">
                <ul className="mg-body-ul">
                  <li>Nama lengkap facility & lokasi</li>
                  <li>Jenis layanan (special nursing home, day service, home visit, dll)</li>
                  <li>Ukuran facility (jumlah resident, staff)</li>
                  <li>Philosophy atau nilai-nilai facility</li>
                  <li>Program training untuk foreign workers</li>
                  <li>Support system (housing, Japanese lessons, dll)</li>
                </ul>
              </InfoBox>
              <p style={{ fontSize: '0.88rem', color: t.slate, marginTop: '12px', lineHeight: 1.6 }}>
                <strong>Catatan:</strong> Tunjukkan bahwa kamu serius dengan melakukan riset. Ini menunjukkan initiative dan genuine interest.
              </p>
            </section>

            {/* ── TIPS ── */}
            <section id="tips" className="mg-section" style={{ background: t.white, borderRadius: '16px', padding: '36px', marginBottom: '20px', boxShadow: t.shadow, border: `1px solid ${t.border}` }}>
              <SectionTitle icon="💡">Tips Praktis</SectionTitle>

              <SubsectionTitle>🎯 Do's and Don'ts</SubsectionTitle>
              <div className="mg-dos-donts-grid">
                <div className="mg-dos-card">
                  <h4>✅ DO's</h4>
                  <ul className="mg-body-ul">
                    <li>Jawab dengan jujur dan spesifik</li>
                    <li>Tunjukkan antusiasme dan passion</li>
                    <li>Berikan contoh konkret dari pengalaman</li>
                    <li>Tanyakan pertanyaan yang thoughtful</li>
                    <li>Maintain eye contact (pandang kamera)</li>
                    <li>Smile naturally</li>
                    <li>Gunakan bahasa tubuh yang positif</li>
                    <li>Dengarkan dengan aktif</li>
                    <li>Acknowledge nervous feelings (it's ok!)</li>
                    <li>Thank them at the end</li>
                  </ul>
                </div>
                <div className="mg-donts-card">
                  <h4>❌ DON'Ts</h4>
                  <ul className="mg-body-ul">
                    <li>Berbohong atau membesar-besarkan</li>
                    <li>Badmouth previous employer/experience</li>
                    <li>Fokus hanya pada gaji/benefit</li>
                    <li>Bilang "I don't know" tanpa elaborasi</li>
                    <li>Menjawab terlalu singkat atau terlalu panjang</li>
                    <li>Look at your own video (pandang kamera!)</li>
                    <li>Interrupt interviewer</li>
                    <li>Use slang or overly casual language</li>
                    <li>Show signs of boredom/disinterest</li>
                    <li>Rush your answers</li>
                  </ul>
                </div>
              </div>

              <SubsectionTitle>🗣️ Tips Menjawab Pertanyaan</SubsectionTitle>
              <CollapsibleItem title="Structure Your Answer" icon="📝">
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: t.slate, marginBottom: '8px' }}>Formula dasar:</h4>
                <ol className="mg-body-ol">
                  <li><strong>Opening:</strong> Jawaban langsung (Yes/No atau main point)</li>
                  <li><strong>Body:</strong> Penjelasan + contoh konkret</li>
                  <li><strong>Closing:</strong> Kaitkan dengan posisi/future</li>
                </ol>
                <div className="mg-example-box" style={{ marginTop: '12px' }}>
                  <strong>Contoh:</strong>
                  <p style={{ marginTop: '6px' }}><em>Q: "Do you have experience in caregiving?"</em></p>
                  <p style={{ marginTop: '6px' }}><strong>Opening:</strong> "Yes, I do. I have hands-on experience caring for my grandmother..."</p>
                  <p><strong>Body:</strong> "For 2 years, I helped with her daily activities like bathing, eating, and mobility..."</p>
                  <p><strong>Closing:</strong> "This experience taught me patience and compassion, which I believe are essential for kaigo work."</p>
                </div>
              </CollapsibleItem>

              <CollapsibleItem title="Difficult Questions" icon="🤔">
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: t.slate, marginBottom: '8px' }}>Pertanyaan sulit & cara handle:</h4>
                <ul className="mg-body-ul">
                  <li><strong>"Tell me about your weakness"</strong><br />→ Pilih weakness yang genuine tapi bisa di-improve. Selalu sebutkan apa yang kamu lakukan untuk improve.</li>
                  <li><strong>"Why did you leave your last job?"</strong><br />→ Stay positive. Focus on what you're looking for, bukan apa yang kamu hindari.</li>
                  <li><strong>"What if you don't like it in Japan?"</strong><br />→ Show commitment. Mention your preparation (language, culture) and flexibility.</li>
                </ul>
              </CollapsibleItem>

              <CollapsibleItem title="When You Don't Know the Answer" icon="🤷">
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: t.slate, marginBottom: '8px' }}>Strategi:</h4>
                <ol className="mg-body-ol">
                  <li>Be honest: "That's a great question. I haven't thought about it from that angle before..."</li>
                  <li>Think aloud: "Let me think... Based on what I know about..."</li>
                  <li>Relate to what you DO know: "I don't have direct experience with that, but in a similar situation..."</li>
                  <li>Show willingness to learn: "I'd be very interested to learn more about that. Could you tell me more?"</li>
                </ol>
              </CollapsibleItem>

              <SubsectionTitle>🧠 Mengelola Nervous & Anxiety</SubsectionTitle>
              <InfoBox type="warning" title="It's Normal! 💛">
                <p>Feeling nervous is completely normal. Even experienced professionals get nervous before interviews. The key is managing it, not eliminating it.</p>
              </InfoBox>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: t.slate, marginTop: '16px', marginBottom: '8px' }}>Teknik untuk tetap calm:</h4>
              <ul className="mg-techniques-list">
                <li><strong>Breathing exercises:</strong> 4-7-8 technique (inhale 4 detik, hold 7 detik, exhale 8 detik)</li>
                <li><strong>Power pose:</strong> Berdiri tegak, tangan di pinggang, 2 menit sebelum interview</li>
                <li><strong>Positive self-talk:</strong> "I am prepared. I am capable. I can do this."</li>
                <li><strong>Visualize success:</strong> Bayangkan interview berjalan lancar</li>
                <li><strong>Ground yourself:</strong> Focus on sensasi fisik (kaki di lantai, napas)</li>
                <li><strong>Remember: They WANT you to succeed!</strong> Interviewer ingin menemukan kandidat yang tepat. Mereka rooting for you.</li>
              </ul>
            </section>

            {/* ── CONTOH JAWABAN ── */}
            <section id="contoh" className="mg-section" style={{ background: t.white, borderRadius: '16px', padding: '36px', marginBottom: '20px', boxShadow: t.shadow, border: `1px solid ${t.border}` }}>
              <SectionTitle icon="🗣️">Contoh Jawaban</SectionTitle>

              <SubsectionTitle>🔥 Top 10 Pertanyaan Umum</SubsectionTitle>
              {[
                {
                  q: "Tell me about yourself / Jiko shoukai shite kudasai",
                  tips: ["Keep it professional & relevant (2-3 menit)", "Structure: Present → Past → Future", "Highlight skills/experiences relevant to kaigo"],
                  example: `"My name is [Name], I'm [age] years old from [city]. Currently, I work as [current role], but I'm passionate about caregiving because [reason]. In the past, I [relevant experience]. I'm learning Japanese to prepare for working in Japan, and my goal is to become a certified care worker and contribute to Japan's aging society. I believe my [skills] will help me succeed in kaigo work."`
                },
                {
                  q: "Why do you want to work in kaigo?",
                  tips: ["Show genuine passion, not just 'it's a job'", "Connect to personal experience if possible", "Mention values: empathy, dignity, compassion"],
                  example: `"I've always been drawn to helping others, especially the elderly. When I cared for my grandmother, I saw how small acts of kindness made a huge difference in her quality of life. Kaigo isn't just about physical care—it's about preserving dignity and bringing joy. I find this work deeply meaningful."`
                },
                {
                  q: "Why Japan? Why not work in your own country?",
                  tips: ["Show you've done research", "Balance: opportunity + genuine interest in Japan", "Mention specific aspects (culture, training, work ethic)"],
                  example: `"Japan has one of the most advanced care systems in the world. I'm impressed by the emphasis on respect and quality of life for the elderly. Additionally, Japanese work culture values discipline and continuous improvement—qualities I admire. I also love Japanese culture and have been learning the language for [time]. Working in Japan allows me to grow professionally while contributing to a society I respect."`
                },
                {
                  q: "Do you have any experience in caregiving?",
                  tips: ["Even informal experience counts!", "Use STAR method", "Highlight transferable skills"],
                  example: `"Yes, I cared for my elderly grandfather for 2 years after his stroke. I helped with daily activities like bathing, feeding, and mobility exercises. It was challenging—especially managing his frustration during recovery—but I learned patience, empathy, and the importance of communication. This experience confirmed my desire to pursue kaigo professionally."`
                },
                {
                  q: "What do you know about our facility?",
                  tips: ["DO YOUR RESEARCH!", "Mention specific details", "Connect to your values/goals"],
                  example: `"I learned that [Facility Name] is a special nursing home in [Location] serving approximately [number] residents. I was particularly impressed by your philosophy of [mention their mission/values]. I also appreciate that you provide Japanese language training and support for foreign workers. I believe this supportive environment will help me grow as a care worker."`
                },
                {
                  q: "What are your strengths?",
                  tips: ["Choose 2-3 relevant strengths", "Give concrete examples", "Relate to kaigo work"],
                  example: `"I'd say my key strengths are patience, empathy, and adaptability. For example, when working with my grandmother who had dementia, I learned to stay calm even in difficult moments and adapt my communication style to her needs. I'm also physically fit and comfortable with the physical demands of caregiving."`
                },
                {
                  q: "What are your weaknesses?",
                  tips: ["Be honest but strategic", "Choose a real weakness (not humble-brag)", "Show you're working on it"],
                  example: `"One weakness I'm working on is my Japanese language skills. While I can handle basic conversations, I know I need to improve to communicate effectively with residents and colleagues. That's why I'm currently taking classes and practicing daily. I'm committed to reaching conversational fluency within my first year in Japan."`
                },
                {
                  q: "How do you handle stress and difficult situations?",
                  tips: ["Give specific coping strategies", "Use an example", "Show emotional intelligence"],
                  example: `"I believe stress management is crucial in caregiving. When I feel overwhelmed, I take a few deep breaths and prioritize tasks. For example, when my grandfather became agitated, I stayed calm, spoke softly, and redirected his attention. After challenging situations, I reflect on what I could do better. I also maintain self-care through exercise and talking with supportive people."`
                },
                {
                  q: "Where do you see yourself in 5 years?",
                  tips: ["Show long-term commitment", "Mention growth within the field", "Balance ambition with realism"],
                  example: `"In 5 years, I see myself as an experienced care worker, possibly with specialized certifications in dementia care or physical therapy. I'd love to mentor new foreign workers and help bridge cultural gaps. Most importantly, I want to be someone residents and their families trust and rely on."`
                },
                {
                  q: "Do you have any questions for us?",
                  tips: ["ALWAYS have questions ready!", "Ask about training, daily routine, team", "Avoid questions about salary/benefits too early"],
                  example: `"Yes, I do! Could you tell me more about the training process for new staff? Also, what does a typical day look like for a care worker here? And what qualities do your most successful care workers have?"`
                }
              ].map((item, index) => (
                <CollapsibleItem key={index} title={`${index + 1}. ${item.q}`} icon="❓">
                  <div className="mg-tips-box">
                    <h4>💡 Tips:</h4>
                    <ul className="mg-body-ul">
                      {item.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </div>
                  <div className="mg-example-box">
                    <strong>📝 Contoh Jawaban:</strong>
                    <p style={{ marginTop: '8px' }}>{item.example}</p>
                  </div>
                </CollapsibleItem>
              ))}
            </section>

            {/* ── ONLINE ETIQUETTE ── */}
            <section id="online" className="mg-section" style={{ background: t.white, borderRadius: '16px', padding: '36px', marginBottom: '20px', boxShadow: t.shadow, border: `1px solid ${t.border}` }}>
              <SectionTitle icon="💻">Etika Wawancara Online</SectionTitle>

              <SubsectionTitle>🎥 Technical Setup</SubsectionTitle>
              <InfoBox type="primary" title="🖥️ Equipment Checklist:">
                <ChecklistItems
                  prefix="tech-setup"
                  items={[
                    "Stable internet connection (minimum 10 Mbps)",
                    "Computer/laptop with working camera",
                    "Good quality microphone or earphones with mic",
                    "Zoom/Google Meet/Teams installed & tested",
                    "Backup device ready (phone/tablet)",
                    "Backup internet (mobile hotspot)",
                    "Charger plugged in"
                  ]}
                />
              </InfoBox>
              <InfoBox type="warning" title="⚠️ Test Everything!">
                <ul className="mg-body-ul">
                  <li>Do a test call 1-2 days before</li>
                  <li>Check camera angle, lighting, audio</li>
                  <li>Test screen share (if needed)</li>
                  <li>Have interviewer's contact info for tech issues</li>
                </ul>
              </InfoBox>

              <SubsectionTitle>📹 Camera & Background</SubsectionTitle>
              <CollapsibleItem title="Camera Position" icon="📷">
                <ul className="mg-body-ul">
                  <li><strong>Height:</strong> Camera at eye level (use books to elevate if needed)</li>
                  <li><strong>Distance:</strong> Upper body visible (head to chest)</li>
                  <li><strong>Angle:</strong> Face camera directly, not from side</li>
                  <li><strong>Eye contact:</strong> Look at camera, NOT at your own video</li>
                </ul>
              </CollapsibleItem>
              <CollapsibleItem title="Lighting" icon="💡">
                <ul className="mg-body-ul">
                  <li><strong>Natural light:</strong> Face a window (not behind you)</li>
                  <li><strong>Artificial light:</strong> Use desk lamp in front</li>
                  <li><strong>Avoid:</strong> Backlighting (window behind), harsh overhead lights</li>
                  <li><strong>Test:</strong> Check if your face is well-lit, no shadows</li>
                </ul>
              </CollapsibleItem>
              <CollapsibleItem title="Background" icon="🖼️">
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: t.slate, marginBottom: '6px' }}>Ideal background:</h4>
                <ul className="mg-body-ul">
                  <li>Clean, neutral wall (white, beige, light gray)</li>
                  <li>Minimal decorations (1-2 tasteful items ok)</li>
                  <li>No clutter, laundry, unmade bed</li>
                  <li>No distracting movement (people, pets, TV)</li>
                </ul>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: t.slate, margin: '12px 0 6px' }}>Virtual background:</h4>
                <ul className="mg-body-ul">
                  <li>Use only if you don't have a good physical background</li>
                  <li>Choose professional, subtle options</li>
                  <li>Avoid: beaches, space, anything distracting</li>
                  <li>Test beforehand (glitchy edges look unprofessional)</li>
                </ul>
              </CollapsibleItem>

              <SubsectionTitle>👔 Appearance & Dress Code</SubsectionTitle>
              <div className="mg-appearance-grid">
                <div className="mg-appearance-card">
                  <h4>👕 Pakaian</h4>
                  <ul className="mg-body-ul">
                    <li>Business casual minimum</li>
                    <li>Solid colors (avoid patterns)</li>
                    <li>Top half = priority (but wear pants!)</li>
                    <li>Men: Collared shirt or polo</li>
                    <li>Women: Blouse or neat top</li>
                    <li>Avoid: white (washes out), loud prints</li>
                  </ul>
                </div>
                <div className="mg-appearance-card">
                  <h4>💇 Grooming</h4>
                  <ul className="mg-body-ul">
                    <li>Hair neat & tidy</li>
                    <li>Men: Clean shave or groomed facial hair</li>
                    <li>Women: Natural makeup</li>
                    <li>Clean nails</li>
                    <li>Minimal accessories</li>
                    <li>Look fresh & rested</li>
                  </ul>
                </div>
              </div>
              <InfoBox type="success" title="✨ Pro Tip">
                <p>Dress as if you're going to an in-person interview. It affects your confidence and how seriously you're taken!</p>
              </InfoBox>

              <SubsectionTitle>🙏 Japanese Interview Etiquette</SubsectionTitle>
              <CollapsibleItem title="Opening & Greeting" icon="👋">
                <ol className="mg-body-ol">
                  <li><strong>Join early:</strong> Enter waiting room 5 minutes before</li>
                  <li><strong>First impression:</strong> Camera ON, mic ON, smiling</li>
                  <li><strong>Bow:</strong> When admitted, bow slightly (15°) and say:<br /><em style={{ color: t.sky }}>"Konnichiwa. Watashi wa [Name] desu. Kyou wa yoroshiku onegaishimasu."</em><br /><span style={{ fontSize: '0.82rem', color: t.textSub }}>("Good afternoon. I am [Name]. Thank you for today.")</span></li>
                  <li><strong>Wait:</strong> Let interviewer start</li>
                </ol>
              </CollapsibleItem>
              <CollapsibleItem title="During Interview" icon="💬">
                <ul className="mg-body-ul">
                  <li><strong>Posture:</strong> Sit up straight, hands on lap or desk</li>
                  <li><strong>Nodding:</strong> Nod to show you're listening (but don't overdo)</li>
                  <li><strong>Aizuchi:</strong> Use "Hai" (yes), "Sou desu ne" (I see) appropriately</li>
                  <li><strong>Pauses:</strong> OK to pause before answering (shows thoughtfulness)</li>
                  <li><strong>Keigo:</strong> If you know some Japanese, use polite form</li>
                  <li><strong>Respect:</strong> Don't interrupt. Wait for them to finish.</li>
                </ul>
              </CollapsibleItem>
              <CollapsibleItem title="Closing" icon="🏁">
                <ol className="mg-body-ol">
                  <li><strong>Thank them:</strong><br /><em style={{ color: t.sky }}>"Kyou wa ohanashi dekite, totemo ureshikatta desu. Doumo arigatou gozaimashita."</em><br /><span style={{ fontSize: '0.82rem', color: t.textSub }}>("I'm very happy I could speak with you today. Thank you very much.")</span></li>
                  <li><strong>Bow:</strong> Deeper bow (30°) at the end</li>
                  <li><strong>Exit:</strong> Wait a moment before leaving the call</li>
                  <li><strong>Follow-up:</strong> Send thank-you email within 24 hours</li>
                </ol>
              </CollapsibleItem>

              <SubsectionTitle>🚨 Handling Technical Issues</SubsectionTitle>
              <InfoBox type="danger" title="⚠️ Emergency Plan">
                <h4 style={{ fontWeight: 700, marginBottom: '6px', fontSize: '0.85rem' }}>If your internet crashes:</h4>
                <ol className="mg-body-ol">
                  <li>Stay calm. Switch to backup device (phone hotspot)</li>
                  <li>Immediately email/message interviewer: "I apologize, I'm having internet issues. Reconnecting now."</li>
                  <li>Rejoin ASAP</li>
                  <li>When back: Apologize briefly, don't dwell on it</li>
                </ol>
                <h4 style={{ fontWeight: 700, margin: '12px 0 6px', fontSize: '0.85rem' }}>If their audio/video has issues:</h4>
                <ul className="mg-body-ul">
                  <li>Politely inform: "Excuse me, I think your microphone/camera might not be working."</li>
                  <li>Offer to wait while they fix it</li>
                  <li>Stay patient and understanding</li>
                </ul>
              </InfoBox>
            </section>

            {/* ── CHECKLIST ── */}
            <section id="checklist" className="mg-section" style={{ background: t.white, borderRadius: '16px', padding: '36px', marginBottom: '20px', boxShadow: t.shadow, border: `1px solid ${t.border}` }}>
              <SectionTitle icon="✅">Checklist Persiapan Timeline</SectionTitle>
              <p style={{ color: t.slate, fontSize: '0.92rem', lineHeight: 1.65, marginBottom: '24px' }}>
                Ikuti checklist ini untuk memastikan kamu siap 100% di hari-H! Klik setiap item untuk menandainya sebagai selesai.
              </p>

              <CollapsibleItem title="2-3 Minggu Sebelum" icon="📋">
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Materi:</h4>
                <ChecklistItems prefix="week2-material" items={["Review guide ini thoroughly", "List 10 pertanyaan umum & siapkan jawaban", "Riset tentang facility/company", "Identifikasi 3-5 cerita/pengalaman relevan", "Practice STAR method answers"]} />
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '12px', marginBottom: '6px' }}>Bahasa Jepang:</h4>
                <ChecklistItems prefix="week2-japanese" items={["Practice self-introduction in Japanese", "Learn basic keigo phrases", "Review kaigo terminology"]} />
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '12px', marginBottom: '6px' }}>Mock Interview:</h4>
                <ChecklistItems prefix="week2-mock" items={["Schedule mock interview #1 with friend/sensei", "Record yourself answering questions", "Review recording & note improvement areas"]} />
              </CollapsibleItem>

              <CollapsibleItem title="1 Minggu Sebelum" icon="📋">
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Polish:</h4>
                <ChecklistItems prefix="week1-polish" items={["Mock interview #2 via Zoom", "Refine answers based on feedback", "Practice online bow & greeting", "Practice looking at camera (not screen)", "Review kaigo terminology"]} />
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '12px', marginBottom: '6px' }}>Teknis:</h4>
                <ChecklistItems prefix="week1-tech" items={["Test camera, mic, internet", "Choose & setup interview location", "Test lighting", "Update Zoom to latest version"]} />
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '12px', marginBottom: '6px' }}>Logistik:</h4>
                <ChecklistItems prefix="week1-logistics" items={["Confirm interview time, date, Zoom link", "Test Zoom link beforehand", "Prepare interview outfit & test on camera", "Arrange backup internet (mobile hotspot)"]} />
              </CollapsibleItem>

              <CollapsibleItem title="1-2 Hari Sebelum" icon="📋">
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Final Preparation:</h4>
                <ChecklistItems prefix="days1-prep" items={["Mock interview #3 - full simulation", "Final review materi", "Prepare all documents", "Full equipment test"]} />
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '12px', marginBottom: '6px' }}>Self-care:</h4>
                <ChecklistItems prefix="days1-selfcare" items={["Prepare outfit (test on camera)", "Hydrate well", "Light exercise", "Avoid alcohol", "Prepare interview space"]} />
              </CollapsibleItem>

              <CollapsibleItem title="Malam Sebelum (H-1)" icon="🌙">
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Mental Prep:</h4>
                <ChecklistItems prefix="night-mental" items={["Visualization exercise", "Light review materi", "Prepare positive affirmations", "Relaxation routine", "Practice napas perut"]} />
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '12px', marginBottom: '6px' }}>Practical:</h4>
                <ChecklistItems prefix="night-practical" items={["Set 2-3 alarms", "Charge all devices fully", "Test Zoom link one last time", "Lay out outfit", "Organize documents", "Prepare interview space", "Early bedtime (7-8 jam tidur)", "Inform family about interview"]} />
              </CollapsibleItem>

              <CollapsibleItem title="Pagi Hari-H 🌅" icon="☀️">
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>1 Hour Before:</h4>
                <ChecklistItems prefix="morning-1hour" items={["Test internet speed again", "Join test Zoom meeting", "Setup interview space (camera, lighting, background)", "Close all unnecessary programs", "Turn phone to SILENT", "Put up 'Do Not Disturb' sign", "Water bottle ready (out of frame)"]} />
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '12px', marginBottom: '6px' }}>5 Minutes Before:</h4>
                <ChecklistItems prefix="morning-5min" items={["Click Zoom link, join meeting", "Wait in waiting room", "Camera ON, Mic ON", "Sit with good posture", "Calm, confident expression", "Ready to bow & greet"]} />
                <InfoBox type="success" title="✨ Mantra">
                  <p style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, fontFamily: font.jp, letterSpacing: '1px', color: t.sage, marginTop: '4px' }}>
                    "Aku siap. Aku bisa. Aku layak."
                  </p>
                </InfoBox>
              </CollapsibleItem>
            </section>

            {/* ── Closing Hero ── */}
            <div style={{
              background: `linear-gradient(135deg, ${t.ink} 0%, #3730A3 100%)`,
              borderRadius: '20px',
              padding: '48px 40px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', left: '50%', top: '50%',
                transform: 'translate(-50%, -50%)',
                fontFamily: font.jp, fontSize: '180px',
                color: 'rgba(255,255,255,0.03)',
                pointerEvents: 'none', userSelect: 'none', lineHeight: 1,
              }}>頑</div>
              <div style={{ fontFamily: font.jp, fontSize: '2.2rem', color: t.white, marginBottom: '12px' }}>
                💪 がんばってください！
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.6 }}>
                You got this! May this guide help you succeed in your journey to become a care worker in Japan.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', marginTop: '12px' }}>
                Your compassion will make a difference! 🙏
              </p>
            </div>

          </main>
        </div>

        {/* ── Back to Top ── */}
        <button
          className={`mg-back-top ${showBackToTop ? 'show' : ''}`}
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          ↑
        </button>
      </div>
    </>
  );
};

export default MensetsuGuide;
