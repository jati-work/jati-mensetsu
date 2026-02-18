import React, { useState, useEffect, useRef } from 'react';
import './mensetsu-guide.css';

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
    const items = document.querySelectorAll('.checklist li');
    const checkedCount = Object.values(checklistItems).filter(Boolean).length;
    const total = items.length;
    setProgress(total > 0 ? (checkedCount / total) * 100 : 0);
  };

  const updateActiveNav = () => {
    const sections = document.querySelectorAll('.section');
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleChecklistItem = (itemId: string) => {
    setChecklistItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const CollapsibleItem: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className={`collapsible ${isOpen ? 'active' : ''}`}>
        <div className="collapsible-header" onClick={() => setIsOpen(!isOpen)}>
          <span>{icon} {title}</span>
          <span className="collapsible-icon">{isOpen ? '▲' : '▼'}</span>
        </div>
        <div className="collapsible-content">
          {children}
        </div>
      </div>
    );
  };

  const ChecklistItems: React.FC<{ items: string[]; prefix: string }> = ({ items, prefix }) => (
    <ul className="checklist">
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

  const navItems = [
    { id: 'intro', icon: '🏠', label: 'Intro' },
    { id: 'persiapan', icon: '📚', label: 'Persiapan Materi' },
    { id: 'tips', icon: '💡', label: 'Tips Praktis' },
    { id: 'contoh', icon: '🗣️', label: 'Contoh Jawaban' },
    { id: 'online', icon: '💻', label: 'Etika Online' },
    { id: 'checklist', icon: '✅', label: 'Checklist' },
  ];

  return (
    <div className="mensetsu-guide-wrapper">
      <div className="container">
        {/* Navigation Sidebar */}
        <nav className="nav-sidebar">
          <div className="nav-title">📖 Menu Guide</div>
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.id} className="nav-item">
                <a
                  href={`#${item.id}`}
                  className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id);
                  }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Progress Bar */}
          <div className="progress-container">
            <div className="progress-label">Progress: {Math.round(progress)}%</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content" ref={contentRef}>
          {/* Hero Section */}
          <div className="hero">
            <h1>📝 Guide Mensetsu Online</h1>
            <p>Tokutei Ginou Kaigo - Panduan Lengkap Interview</p>
          </div>

          {/* Intro Section */}
          <section id="intro" className="section">
            <h2 className="section-title">
              <span className="section-icon">🏠</span>
              Introduction
            </h2>
            <div className="intro-content">
              <p>
                Selamat datang! Guide ini dirancang khusus untuk membantu kamu mempersiapkan diri menghadapi
                wawancara online untuk program Tokutei Ginou Kaigo di Jepang.
              </p>
              <p>
                Mensetsu (面接) atau wawancara adalah tahap penting dalam proses seleksi. Guide ini akan membantu
                kamu memahami apa yang diharapkan, bagaimana mempersiapkan diri, dan tips untuk sukses.
              </p>
            </div>

            <div className="info-box primary">
              <div className="info-box-title">🎯 Tujuan Guide Ini</div>
              <ul>
                <li>Memahami format dan struktur mensetsu online</li>
                <li>Mempelajari pertanyaan umum dan cara menjawabnya</li>
                <li>Menguasai etika dan tata krama wawancara online</li>
                <li>Mempersiapkan mental dan teknis untuk hari-H</li>
              </ul>
            </div>
          </section>

          {/* Persiapan Materi Section */}
          <section id="persiapan" className="section">
            <h2 className="section-title">
              <span className="section-icon">📚</span>
              Persiapan Materi
            </h2>

            <div className="subsection">
              <h3 className="subsection-title">📋 Kenali Diri Sendiri</h3>
              <CollapsibleItem title="Motivasi & Tujuan" icon="💭">
                <h4>Pertanyaan untuk direfleksikan:</h4>
                <ul>
                  <li><strong>Kenapa kaigo?</strong> Apa yang membuatmu tertarik dengan pekerjaan care worker?</li>
                  <li><strong>Kenapa Jepang?</strong> Mengapa memilih bekerja di Jepang, bukan negara lain?</li>
                  <li><strong>Tujuan jangka panjang:</strong> Apa yang ingin kamu capai dalam 3-5 tahun ke depan?</li>
                  <li><strong>Kontribusi:</strong> Bagaimana kamu bisa berkontribusi untuk facility mereka?</li>
                </ul>
                <div className="info-box warning">
                  <div className="info-box-title">⚠️ Tips</div>
                  <p>Jawaban harus <strong>spesifik</strong>, <strong>jujur</strong>, dan menunjukkan <strong>komitmen jangka panjang</strong>.</p>
                </div>
              </CollapsibleItem>

              <CollapsibleItem title="Pengalaman Relevan" icon="💼">
                <h4>Identifikasi pengalamanmu:</h4>
                <ul>
                  <li>Pengalaman kerja atau volunteer terkait care/perawatan</li>
                  <li>Pengalaman merawat anggota keluarga (lansia, sakit, disabilitas)</li>
                  <li>Pengalaman customer service atau interaksi dengan orang</li>
                  <li>Soft skills: empati, kesabaran, komunikasi, problem-solving</li>
                </ul>
                <div className="info-box success">
                  <div className="info-box-title">✅ Format STAR</div>
                  <p>Gunakan format <strong>STAR</strong> untuk menceritakan pengalaman:</p>
                  <ul>
                    <li><strong>S</strong>ituation: Konteks/situasi</li>
                    <li><strong>T</strong>ask: Tugas/tantangan yang dihadapi</li>
                    <li><strong>A</strong>ction: Tindakan yang kamu ambil</li>
                    <li><strong>R</strong>esult: Hasil/pembelajaran</li>
                  </ul>
                </div>
              </CollapsibleItem>

              <CollapsibleItem title="Pengetahuan tentang Jepang & Kaigo" icon="🇯🇵">
                <h4>Yang perlu kamu ketahui:</h4>
                <ul>
                  <li><strong>Budaya kerja Jepang:</strong> Punctuality, respect, teamwork, omotenashi</li>
                  <li><strong>Aging society:</strong> Jepang memiliki populasi lansia terbesar di dunia</li>
                  <li><strong>Kaigo system:</strong> Perbedaan level care (tokubetsu, kaigo, yōkaigo)</li>
                  <li><strong>Dasar bahasa Jepang:</strong> Minimal hiragana, katakana, salam dasar</li>
                </ul>
                <div className="info-box primary">
                  <div className="info-box-title">📖 Resources</div>
                  <ul>
                    <li>Pelajari tentang <em>Kaigo Hoken</em> (long-term care insurance)</li>
                    <li>Tonton video tentang daily life di care facility</li>
                    <li>Baca tentang <em>5 principles of care</em> di Jepang</li>
                  </ul>
                </div>
              </CollapsibleItem>
            </div>

            <div className="subsection">
              <h3 className="subsection-title">🏢 Riset tentang Facility</h3>
              <div className="info-box primary">
                <div className="info-box-title">🔍 Yang perlu dicari tahu:</div>
                <ul>
                  <li>Nama lengkap facility & lokasi</li>
                  <li>Jenis layanan (special nursing home, day service, home visit, dll)</li>
                  <li>Ukuran facility (jumlah resident, staff)</li>
                  <li>Philosophy atau nilai-nilai facility</li>
                  <li>Program training untuk foreign workers</li>
                  <li>Support system (housing, Japanese lessons, dll)</li>
                </ul>
              </div>
              <p style={{ marginTop: '15px' }}>
                <strong>Catatan:</strong> Tunjukkan bahwa kamu serius dengan melakukan riset. Ini menunjukkan initiative dan genuine interest.
              </p>
            </div>
          </section>

          {/* Tips Praktis Section */}
          <section id="tips" className="section">
            <h2 className="section-title">
              <span className="section-icon">💡</span>
              Tips Praktis
            </h2>

            <div className="subsection">
              <h3 className="subsection-title">🎯 Do's and Don'ts</h3>
              
              <div className="dos-donts-grid">
                <div className="dos-donts-card dos">
                  <h4>✅ DO's</h4>
                  <ul>
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

                <div className="dos-donts-card donts">
                  <h4>❌ DON'Ts</h4>
                  <ul>
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
            </div>

            <div className="subsection">
              <h3 className="subsection-title">🗣️ Tips Menjawab Pertanyaan</h3>
              
              <CollapsibleItem title="Structure Your Answer" icon="📝">
                <h4>Formula dasar:</h4>
                <ol>
                  <li><strong>Opening:</strong> Jawaban langsung (Yes/No atau main point)</li>
                  <li><strong>Body:</strong> Penjelasan + contoh konkret</li>
                  <li><strong>Closing:</strong> Kaitkan dengan posisi/future</li>
                </ol>
                <div className="example-box">
                  <strong>Contoh:</strong>
                  <p><em>Q: "Do you have experience in caregiving?"</em></p>
                  <p><strong>Opening:</strong> "Yes, I do. I have hands-on experience caring for my grandmother..."</p>
                  <p><strong>Body:</strong> "For 2 years, I helped with her daily activities like bathing, eating, and mobility..."</p>
                  <p><strong>Closing:</strong> "This experience taught me patience and compassion, which I believe are essential for kaigo work."</p>
                </div>
              </CollapsibleItem>

              <CollapsibleItem title="Difficult Questions" icon="🤔">
                <h4>Pertanyaan sulit & cara handle:</h4>
                <ul>
                  <li><strong>"Tell me about your weakness"</strong>
                    <br />→ Pilih weakness yang genuine tapi bisa di-improve. Selalu sebutkan apa yang kamu lakukan untuk improve.
                  </li>
                  <li><strong>"Why did you leave your last job?"</strong>
                    <br />→ Stay positive. Focus on what you're looking for, bukan apa yang kamu hindari.
                  </li>
                  <li><strong>"What if you don't like it in Japan?"</strong>
                    <br />→ Show commitment. Mention your preparation (language, culture) and flexibility.
                  </li>
                </ul>
              </CollapsibleItem>

              <CollapsibleItem title="When You Don't Know the Answer" icon="🤷">
                <h4>Strategi:</h4>
                <ol>
                  <li>Be honest: "That's a great question. I haven't thought about it from that angle before..."</li>
                  <li>Think aloud: "Let me think... Based on what I know about..."</li>
                  <li>Relate to what you DO know: "I don't have direct experience with that, but in a similar situation..."</li>
                  <li>Show willingness to learn: "I'd be very interested to learn more about that. Could you tell me more?"</li>
                </ol>
              </CollapsibleItem>
            </div>

            <div className="subsection">
              <h3 className="subsection-title">🧠 Mengelola Nervous & Anxiety</h3>
              <div className="info-box warning">
                <div className="info-box-title">It's Normal! 💛</div>
                <p>Feeling nervous is completely normal. Even experienced professionals get nervous before interviews. The key is managing it, not eliminating it.</p>
              </div>

              <h4>Teknik untuk tetap calm:</h4>
              <ul className="techniques-list">
                <li><strong>Breathing exercises:</strong> 4-7-8 technique (inhale 4 detik, hold 7 detik, exhale 8 detik)</li>
                <li><strong>Power pose:</strong> Berdiri tegak, tangan di pinggang, 2 menit sebelum interview</li>
                <li><strong>Positive self-talk:</strong> "I am prepared. I am capable. I can do this."</li>
                <li><strong>Visualize success:</strong> Bayangkan interview berjalan lancar</li>
                <li><strong>Ground yourself:</strong> Focus on sensasi fisik (kaki di lantai, napas)</li>
                <li><strong>Remember: They WANT you to succeed!</strong> Interviewer ingin menemukan kandidat yang tepat. Mereka rooting for you.</li>
              </ul>
            </div>
          </section>

          {/* Contoh Jawaban Section */}
          <section id="contoh" className="section">
            <h2 className="section-title">
              <span className="section-icon">🗣️</span>
              Contoh Jawaban
            </h2>

            <div className="subsection">
              <h3 className="subsection-title">🔥 Top 10 Pertanyaan Umum</h3>
              
              {[
                {
                  q: "Tell me about yourself / Jiko shoukai shite kudasai",
                  tips: [
                    "Keep it professional & relevant (2-3 menit)",
                    "Structure: Present → Past → Future",
                    "Highlight skills/experiences relevant to kaigo"
                  ],
                  example: `"My name is [Name], I'm [age] years old from [city]. Currently, I work as [current role], but I'm passionate about caregiving because [reason]. In the past, I [relevant experience]. I'm learning Japanese to prepare for working in Japan, and my goal is to become a certified care worker and contribute to Japan's aging society. I believe my [skills] will help me succeed in kaigo work."`
                },
                {
                  q: "Why do you want to work in kaigo?",
                  tips: [
                    "Show genuine passion, not just 'it's a job'",
                    "Connect to personal experience if possible",
                    "Mention values: empathy, dignity, compassion"
                  ],
                  example: `"I've always been drawn to helping others, especially the elderly. When I cared for my grandmother, I saw how small acts of kindness made a huge difference in her quality of life. Kaigo isn't just about physical care—it's about preserving dignity and bringing joy. I find this work deeply meaningful."`
                },
                {
                  q: "Why Japan? Why not work in your own country?",
                  tips: [
                    "Show you've done research",
                    "Balance: opportunity + genuine interest in Japan",
                    "Mention specific aspects (culture, training, work ethic)"
                  ],
                  example: `"Japan has one of the most advanced care systems in the world. I'm impressed by the emphasis on respect and quality of life for the elderly. Additionally, Japanese work culture values discipline and continuous improvement—qualities I admire. I also love Japanese culture and have been learning the language for [time]. Working in Japan allows me to grow professionally while contributing to a society I respect."`
                },
                {
                  q: "Do you have any experience in caregiving?",
                  tips: [
                    "Even informal experience counts!",
                    "Use STAR method",
                    "Highlight transferable skills"
                  ],
                  example: `"Yes, I cared for my elderly grandfather for 2 years after his stroke. I helped with daily activities like bathing, feeding, and mobility exercises. It was challenging—especially managing his frustration during recovery—but I learned patience, empathy, and the importance of communication. This experience confirmed my desire to pursue kaigo professionally."`
                },
                {
                  q: "What do you know about our facility?",
                  tips: [
                    "DO YOUR RESEARCH!",
                    "Mention specific details",
                    "Connect to your values/goals"
                  ],
                  example: `"I learned that [Facility Name] is a special nursing home in [Location] serving approximately [number] residents. I was particularly impressed by your philosophy of [mention their mission/values]. I also appreciate that you provide Japanese language training and support for foreign workers. I believe this supportive environment will help me grow as a care worker."`
                },
                {
                  q: "What are your strengths?",
                  tips: [
                    "Choose 2-3 relevant strengths",
                    "Give concrete examples",
                    "Relate to kaigo work"
                  ],
                  example: `"I'd say my key strengths are patience, empathy, and adaptability. For example, when working with my grandmother who had dementia, I learned to stay calm even in difficult moments and adapt my communication style to her needs. I'm also physically fit and comfortable with the physical demands of caregiving."`
                },
                {
                  q: "What are your weaknesses?",
                  tips: [
                    "Be honest but strategic",
                    "Choose a real weakness (not humble-brag)",
                    "Show you're working on it"
                  ],
                  example: `"One weakness I'm working on is my Japanese language skills. While I can handle basic conversations, I know I need to improve to communicate effectively with residents and colleagues. That's why I'm currently taking classes and practicing daily. I'm committed to reaching conversational fluency within my first year in Japan."`
                },
                {
                  q: "How do you handle stress and difficult situations?",
                  tips: [
                    "Give specific coping strategies",
                    "Use an example",
                    "Show emotional intelligence"
                  ],
                  example: `"I believe stress management is crucial in caregiving. When I feel overwhelmed, I take a few deep breaths and prioritize tasks. For example, when my grandfather became agitated, I stayed calm, spoke softly, and redirected his attention. After challenging situations, I reflect on what I could do better. I also maintain self-care through exercise and talking with supportive people."`
                },
                {
                  q: "Where do you see yourself in 5 years?",
                  tips: [
                    "Show long-term commitment",
                    "Mention growth within the field",
                    "Balance ambition with realism"
                  ],
                  example: `"In 5 years, I see myself as an experienced care worker, possibly with specialized certifications in dementia care or physical therapy. I'd love to mentor new foreign workers and help bridge cultural gaps. Most importantly, I want to be someone residents and their families trust and rely on."`
                },
                {
                  q: "Do you have any questions for us?",
                  tips: [
                    "ALWAYS have questions ready!",
                    "Ask about training, daily routine, team",
                    "Avoid questions about salary/benefits too early"
                  ],
                  example: `"Yes, I do! Could you tell me more about the training process for new staff? Also, what does a typical day look like for a care worker here? And what qualities do your most successful care workers have?"`
                }
              ].map((item, index) => (
                <CollapsibleItem key={index} title={item.q} icon="❓">
                  <div className="tips-box">
                    <h4>💡 Tips:</h4>
                    <ul>
                      {item.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </div>
                  <div className="example-box">
                    <h4>📝 Contoh Jawaban:</h4>
                    <p>{item.example}</p>
                  </div>
                </CollapsibleItem>
              ))}
            </div>
          </section>

          {/* Online Etiquette Section */}
          <section id="online" className="section">
            <h2 className="section-title">
              <span className="section-icon">💻</span>
              Etika Wawancara Online
            </h2>

            <div className="subsection">
              <h3 className="subsection-title">🎥 Technical Setup</h3>
              
              <div className="info-box primary">
                <div className="info-box-title">🖥️ Equipment Checklist:</div>
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
              </div>

              <div className="info-box warning">
                <div className="info-box-title">⚠️ Test Everything!</div>
                <ul>
                  <li>Do a test call 1-2 days before</li>
                  <li>Check camera angle, lighting, audio</li>
                  <li>Test screen share (if needed)</li>
                  <li>Have interviewer's contact info for tech issues</li>
                </ul>
              </div>
            </div>

            <div className="subsection">
              <h3 className="subsection-title">📹 Camera & Background</h3>
              
              <CollapsibleItem title="Camera Position" icon="📷">
                <ul>
                  <li><strong>Height:</strong> Camera at eye level (use books to elevate if needed)</li>
                  <li><strong>Distance:</strong> Upper body visible (head to chest)</li>
                  <li><strong>Angle:</strong> Face camera directly, not from side</li>
                  <li><strong>Eye contact:</strong> Look at camera, NOT at your own video</li>
                </ul>
              </CollapsibleItem>

              <CollapsibleItem title="Lighting" icon="💡">
                <ul>
                  <li><strong>Natural light:</strong> Face a window (not behind you)</li>
                  <li><strong>Artificial light:</strong> Use desk lamp in front</li>
                  <li><strong>Avoid:</strong> Backlighting (window behind), harsh overhead lights</li>
                  <li><strong>Test:</strong> Check if your face is well-lit, no shadows</li>
                </ul>
              </CollapsibleItem>

              <CollapsibleItem title="Background" icon="🖼️">
                <h4>Ideal background:</h4>
                <ul>
                  <li>Clean, neutral wall (white, beige, light gray)</li>
                  <li>Minimal decorations (1-2 tasteful items ok)</li>
                  <li>No clutter, laundry, unmade bed</li>
                  <li>No distracting movement (people, pets, TV)</li>
                </ul>
                <h4>Virtual background:</h4>
                <ul>
                  <li>Use only if you don't have a good physical background</li>
                  <li>Choose professional, subtle options</li>
                  <li>Avoid: beaches, space, anything distracting</li>
                  <li>Test beforehand (glitchy edges look unprofessional)</li>
                </ul>
              </CollapsibleItem>
            </div>

            <div className="subsection">
              <h3 className="subsection-title">👔 Appearance & Dress Code</h3>
              
              <div className="appearance-grid">
                <div className="appearance-card">
                  <h4>👕 Pakaian</h4>
                  <ul>
                    <li>Business casual minimum</li>
                    <li>Solid colors (avoid patterns)</li>
                    <li>Top half = priority (but wear pants!)</li>
                    <li>Men: Collared shirt or polo</li>
                    <li>Women: Blouse or neat top</li>
                    <li>Avoid: white (washes out), loud prints</li>
                  </ul>
                </div>

                <div className="appearance-card">
                  <h4>💇 Grooming</h4>
                  <ul>
                    <li>Hair neat & tidy</li>
                    <li>Men: Clean shave or groomed facial hair</li>
                    <li>Women: Natural makeup</li>
                    <li>Clean nails</li>
                    <li>Minimal accessories</li>
                    <li>Look fresh & rested</li>
                  </ul>
                </div>
              </div>

              <div className="info-box success">
                <div className="info-box-title">✨ Pro Tip</div>
                <p>Dress as if you're going to an in-person interview. It affects your confidence and how seriously you're taken!</p>
              </div>
            </div>

            <div className="subsection">
              <h3 className="subsection-title">🙏 Japanese Interview Etiquette</h3>
              
              <CollapsibleItem title="Opening & Greeting" icon="👋">
                <ol>
                  <li><strong>Join early:</strong> Enter waiting room 5 minutes before</li>
                  <li><strong>First impression:</strong> Camera ON, mic ON, smiling</li>
                  <li><strong>Bow:</strong> When admitted, bow slightly (15°) and say:
                    <br /><em>"Konnichiwa. Watashi wa [Name] desu. Kyou wa yoroshiku onegaishimasu."</em>
                    <br />("Good afternoon. I am [Name]. Thank you for today.")
                  </li>
                  <li><strong>Wait:</strong> Let interviewer start</li>
                </ol>
              </CollapsibleItem>

              <CollapsibleItem title="During Interview" icon="💬">
                <ul>
                  <li><strong>Posture:</strong> Sit up straight, hands on lap or desk</li>
                  <li><strong>Nodding:</strong> Nod to show you're listening (but don't overdo)</li>
                  <li><strong>Aizuchi:</strong> Use "Hai" (yes), "Sou desu ne" (I see) appropriately</li>
                  <li><strong>Pauses:</strong> OK to pause before answering (shows thoughtfulness)</li>
                  <li><strong>Keigo:</strong> If you know some Japanese, use polite form</li>
                  <li><strong>Respect:</strong> Don't interrupt. Wait for them to finish.</li>
                </ul>
              </CollapsibleItem>

              <CollapsibleItem title="Closing" icon="👋">
                <ol>
                  <li><strong>Thank them:</strong>
                    <br /><em>"Kyou wa ohanashi dekite, totemo ureshikatta desu. Doumo arigatou gozaimashita."</em>
                    <br />("I'm very happy I could speak with you today. Thank you very much.")
                  </li>
                  <li><strong>Bow:</strong> Deeper bow (30°) at the end</li>
                  <li><strong>Exit:</strong> Wait a moment before leaving the call</li>
                  <li><strong>Follow-up:</strong> Send thank-you email within 24 hours</li>
                </ol>
              </CollapsibleItem>
            </div>

            <div className="subsection">
              <h3 className="subsection-title">🚨 Handling Technical Issues</h3>
              
              <div className="info-box danger">
                <div className="info-box-title">⚠️ Emergency Plan</div>
                <h4>If your internet crashes:</h4>
                <ol>
                  <li>Stay calm. Switch to backup device (phone hotspot)</li>
                  <li>Immediately email/message interviewer: "I apologize, I'm having internet issues. Reconnecting now."</li>
                  <li>Rejoin ASAP</li>
                  <li>When back: Apologize briefly, don't dwell on it</li>
                </ol>
                <h4>If their audio/video has issues:</h4>
                <ul>
                  <li>Politely inform: "Excuse me, I think your microphone/camera might not be working."</li>
                  <li>Offer to wait while they fix it</li>
                  <li>Stay patient and understanding</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Checklist Timeline Section */}
          <section id="checklist" className="section">
            <h2 className="section-title">
              <span className="section-icon">✅</span>
              Checklist Persiapan Timeline
            </h2>

            <p style={{ marginBottom: '30px' }}>
              Ikuti checklist ini untuk memastikan kamu siap 100% di hari-H! Klik setiap item untuk menandainya sebagai selesai.
            </p>

            <CollapsibleItem title="2-3 Minggu Sebelum" icon="📋">
              <h4>Materi:</h4>
              <ChecklistItems
                prefix="week2-material"
                items={[
                  "Review guide ini thoroughly",
                  "List 10 pertanyaan umum & siapkan jawaban",
                  "Riset tentang facility/company",
                  "Identifikasi 3-5 cerita/pengalaman relevan",
                  "Practice STAR method answers"
                ]}
              />
              <h4>Bahasa Jepang:</h4>
              <ChecklistItems
                prefix="week2-japanese"
                items={[
                  "Practice self-introduction in Japanese",
                  "Learn basic keigo phrases",
                  "Review kaigo terminology"
                ]}
              />
              <h4>Mock Interview:</h4>
              <ChecklistItems
                prefix="week2-mock"
                items={[
                  "Schedule mock interview #1 with friend/sensei",
                  "Record yourself answering questions",
                  "Review recording & note improvement areas"
                ]}
              />
            </CollapsibleItem>

            <CollapsibleItem title="1 Minggu Sebelum" icon="📋">
              <h4>Polish:</h4>
              <ChecklistItems
                prefix="week1-polish"
                items={[
                  "Mock interview #2 via Zoom",
                  "Refine answers based on feedback",
                  "Practice online bow & greeting",
                  "Practice looking at camera (not screen)",
                  "Review kaigo terminology"
                ]}
              />
              <h4>Teknis:</h4>
              <ChecklistItems
                prefix="week1-tech"
                items={[
                  "Test camera, mic, internet",
                  "Choose & setup interview location",
                  "Test lighting",
                  "Update Zoom to latest version"
                ]}
              />
              <h4>Logistik:</h4>
              <ChecklistItems
                prefix="week1-logistics"
                items={[
                  "Confirm interview time, date, Zoom link",
                  "Test Zoom link beforehand",
                  "Prepare interview outfit & test on camera",
                  "Arrange backup internet (mobile hotspot)"
                ]}
              />
            </CollapsibleItem>

            <CollapsibleItem title="1-2 Hari Sebelum" icon="📋">
              <h4>Final Preparation:</h4>
              <ChecklistItems
                prefix="days1-prep"
                items={[
                  "Mock interview #3 - full simulation",
                  "Final review materi",
                  "Prepare all documents",
                  "Full equipment test"
                ]}
              />
              <h4>Self-care:</h4>
              <ChecklistItems
                prefix="days1-selfcare"
                items={[
                  "Prepare outfit (test on camera)",
                  "Hydrate well",
                  "Light exercise",
                  "Avoid alcohol",
                  "Prepare interview space"
                ]}
              />
            </CollapsibleItem>

            <CollapsibleItem title="Malam Sebelum (H-1)" icon="📋">
              <h4>Mental Prep:</h4>
              <ChecklistItems
                prefix="night-mental"
                items={[
                  "Visualization exercise",
                  "Light review materi",
                  "Prepare positive affirmations",
                  "Relaxation routine",
                  "Practice napas perut"
                ]}
              />
              <h4>Practical:</h4>
              <ChecklistItems
                prefix="night-practical"
                items={[
                  "Set 2-3 alarms",
                  "Charge all devices fully",
                  "Test Zoom link one last time",
                  "Lay out outfit",
                  "Organize documents",
                  "Prepare interview space",
                  "Early bedtime (7-8 jam tidur)",
                  "Inform family about interview"
                ]}
              />
            </CollapsibleItem>

            <CollapsibleItem title="Pagi Hari-H" icon="📋">
              <h4>1 Hour Before:</h4>
              <ChecklistItems
                prefix="morning-1hour"
                items={[
                  "Test internet speed again",
                  "Join test Zoom meeting",
                  "Setup interview space (camera, lighting, background)",
                  "Close all unnecessary programs",
                  "Turn phone to SILENT",
                  "Put up 'Do Not Disturb' sign",
                  "Water bottle ready (out of frame)"
                ]}
              />
              <h4>5 Minutes Before:</h4>
              <ChecklistItems
                prefix="morning-5min"
                items={[
                  "Click Zoom link, join meeting",
                  "Wait in waiting room",
                  "Camera ON, Mic ON",
                  "Sit with good posture",
                  "Calm, confident expression",
                  "Ready to bow & greet"
                ]}
              />
              <div className="info-box success" style={{ marginTop: '20px' }}>
                <div className="info-box-title">✨ Mantra</div>
                <p style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 600, marginTop: '10px' }}>
                  "Aku siap. Aku bisa. Aku layak."
                </p>
              </div>
            </CollapsibleItem>
          </section>

          {/* Closing Hero */}
          <div className="hero" style={{ marginTop: '60px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>💪 がんばってください！</h2>
            <p style={{ fontSize: '1.1rem' }}>
              You got this! May this guide help you succeed in your journey to become a care worker in Japan.
            </p>
            <p style={{ marginTop: '15px', fontSize: '0.9rem', opacity: 0.9 }}>
              Your compassion will make a difference! 🙏
            </p>
          </div>
        </main>
      </div>

      {/* Back to Top Button */}
      <button
        className={`back-to-top ${showBackToTop ? 'show' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        ↑
      </button>
    </div>
  );
};

export default MensetsuGuide;
