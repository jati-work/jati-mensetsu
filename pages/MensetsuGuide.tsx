import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabase';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ContentBlock {
  block_key: string;
  content: any; // JSON — shape depends on block type
}

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const t = {
  primary:     '#4F46E5',
  primaryMid:  '#6366F1',
  primarySoft: '#EEF2FF',
  ink:         '#111827',
  body:        '#374151',
  sub:         '#9CA3AF',
  mist:        '#F9FAFB',
  white:       '#FFFFFF',
  emerald:     '#10B981',
  emeraldSoft: '#ECFDF5',
  emeraldMid:  '#D1FAE5',
  amber:       '#D97706',
  amberSoft:   '#FEF3C7',
  border:      '#F3F4F6',
  borderMid:   '#E5E7EB',
  shadow:      '0 1px 3px rgba(0,0,0,0.06)',
};

const font = {
  jp:   "'Noto Serif JP', 'Georgia', serif",
  body: "'Inter', -apple-system, 'Segoe UI', sans-serif",
};

// ─── Default Content (fallback saat DB kosong) ───────────────────────────────
const DEFAULT_CONTENT: Record<string, any> = {
  // Info boxes
  'intro.tujuan': { title: '🎯 Tujuan Guide Ini', items: ['Memahami format dan struktur mensetsu online', 'Mempelajari pertanyaan umum dan cara menjawabnya', 'Menguasai etika dan tata krama wawancara online', 'Mempersiapkan mental dan teknis untuk hari-H'] },
  'intro.p1': { text: 'Selamat datang! Guide ini dirancang khusus untuk membantu kamu mempersiapkan diri menghadapi wawancara online untuk program Tokutei Ginou Kaigo di Jepang.' },
  'intro.p2': { text: 'Mensetsu (面接) adalah tahap krusial dalam proses seleksi. Guide ini membantumu memahami apa yang diharapkan, cara mempersiapkan diri, dan tips nyata untuk sukses.' },

  // Persiapan collapsibles
  'persiapan.motivasi': { title: 'Motivasi & Tujuan', icon: '💭', items: ['Kenapa kaigo? Apa yang membuatmu tertarik dengan pekerjaan care worker?', 'Kenapa Jepang? Mengapa memilih bekerja di Jepang, bukan negara lain?', 'Tujuan jangka panjang: Apa yang ingin kamu capai dalam 3-5 tahun ke depan?', 'Kontribusi: Bagaimana kamu bisa berkontribusi untuk facility mereka?'], warning: 'Jawaban harus spesifik, jujur, dan menunjukkan komitmen jangka panjang.' },
  'persiapan.pengalaman': { title: 'Pengalaman Relevan', icon: '💼', items: ['Pengalaman kerja atau volunteer terkait care/perawatan', 'Pengalaman merawat anggota keluarga (lansia, sakit, disabilitas)', 'Pengalaman customer service atau interaksi dengan orang', 'Soft skills: empati, kesabaran, komunikasi, problem-solving'] },
  'persiapan.pengetahuan': { title: 'Pengetahuan Jepang & Kaigo', icon: '🇯🇵', items: ['Budaya kerja Jepang: Punctuality, respect, teamwork, omotenashi', 'Aging society: Jepang memiliki populasi lansia terbesar di dunia', 'Kaigo system: Perbedaan level care (tokubetsu, kaigo, yōkaigo)', 'Dasar bahasa Jepang: Minimal hiragana, katakana, salam dasar'] },
  'persiapan.facility': { title: '🔍 Yang perlu dicari tahu:', items: ['Nama lengkap facility & lokasi', 'Jenis layanan (special nursing home, day service, home visit)', 'Ukuran facility (jumlah resident, staff)', 'Philosophy atau nilai-nilai facility', 'Program training untuk foreign workers', 'Support system (housing, Japanese lessons)'] },

  // Tips collapsibles
  'tips.dos': { items: ['Jawab dengan jujur dan spesifik', 'Tunjukkan antusiasme dan passion', 'Berikan contoh konkret dari pengalaman', 'Tanyakan pertanyaan yang thoughtful', 'Maintain eye contact (pandang kamera)', 'Smile naturally', 'Dengarkan dengan aktif'] },
  'tips.donts': { items: ['Berbohong atau membesar-besarkan', 'Badmouth previous employer', 'Fokus hanya pada gaji/benefit', 'Bilang "I don\'t know" tanpa elaborasi', 'Look at your own video, bukan kamera', 'Interrupt interviewer', 'Rush your answers'] },
  'tips.nervous': { items: ['4-7-8 Breathing: Inhale 4 detik, hold 7, exhale 8 — langsung menenangkan sistem saraf', 'Power pose: Berdiri tegak, tangan di pinggang, 2 menit sebelum interview', 'Positive self-talk: "I am prepared. I am capable. I can do this."', 'Visualize success: Bayangkan interview berjalan lancar dari awal sampai akhir', 'Ground yourself: Focus sensasi fisik — kaki di lantai, napas masuk keluar', 'Remember: Interviewer ingin menemukan kandidat yang tepat. Mereka rooting for you.'] },

  // Napas perut
  'tips.napas.steps': { items: ['Duduk atau berdiri tegak. Punggung lurus, bahu rileks turun, dagu sedikit masuk.', 'Taruh satu tangan di dada, satu di perut (bawah tulang rusuk).', 'Hirup perlahan lewat hidung — rasakan tangan di perut bergerak maju. Tangan di dada tetap diam.', 'Tahan 2–3 detik.', 'Hembuskan perlahan lewat mulut — perut kembali masuk, dada tetap tenang.', 'Ulangi 5–8 kali. Lakukan ini 10 menit sebelum interview dimulai.'] },

  // Postur cards
  'tips.postur.cards': { cards: [{ icon: '🫁', title: 'Napas Lebih Dalam', desc: 'Postur tegak membuka rongga dada, memberi diafragma ruang untuk bergerak penuh. Napas perut jadi lebih mudah dan natural.' }, { icon: '😌', title: 'Otomatis Lebih Rileks', desc: 'Otak membaca postur sebagai sinyal aman. Duduk tegak menurunkan kadar kortisol (hormon stres) secara natural.' }, { icon: '💪', title: 'Suara Lebih Kuat', desc: 'Suara dari tubuh yang tegak punya resonansi lebih baik — terdengar lebih mantap, lebih yakin, dan lebih jelas.' }, { icon: '✨', title: 'Percaya Diri Naik', desc: 'Power pose selama 2 menit meningkatkan rasa percaya diri secara nyata — bahkan sebelum interview dimulai.' }] },

  // Vokal
  'tips.vokal.posisi': { items: ['Bibir: Senyum kecil yang natural — seperti mengucapkan "E" tapi rileks, bukan dipaksakan. Sudut mulut sedikit terangkat.', 'Lidah: Datar dan rileks di dasar mulut, ujung lidah menyentuh ringan belakang gigi bawah. Tidak tegang, tidak naik.', 'Rahang: Lebih rileks dan sedikit tertutup dibanding bicara Bahasa Indonesia — ini yang membuat vokal Jepang terdengar lebih rapi.', 'Leher: Rileks. Suara datang dari perut, bukan tenggorokan.'] },
  'tips.vokal.warmup': { items: ['Ucapkan "A – I – U – E – O" perlahan, fokus pada posisi mulut dan lidah di setiap vokal.', 'Ucapkan "Watashi wa [nama] desu" — perhatikan mulut tidak terbuka terlalu lebar.', 'Baca teks Jepang sederhana keras-keras selama 2–3 menit.', 'Akhiri dengan self-introduction lengkap, tempo sedikit lebih lambat dari biasanya.'] },

  // Q&A
  'contoh.qa': { questions: [
    { q: 'Tell me about yourself / Jiko shoukai shite kudasai', tips: ['Keep it professional & relevant (2-3 menit)', 'Structure: Present → Past → Future', 'Highlight skills relevant to kaigo'], example: '"My name is [Name], I\'m [age] from [city]. I work as [role] but I\'m passionate about caregiving because [reason]. I\'ve [relevant experience]. I\'m learning Japanese and my goal is to become a certified care worker contributing to Japan\'s aging society."' },
    { q: 'Why do you want to work in kaigo?', tips: ['Show genuine passion, not just "it\'s a job"', 'Connect to personal experience if possible', 'Mention values: empathy, dignity, compassion'], example: '"I\'ve always been drawn to helping others, especially the elderly. When I cared for my grandmother, small acts of kindness made a huge difference in her quality of life. Kaigo isn\'t just physical care — it\'s about preserving dignity and bringing joy. I find this deeply meaningful."' },
    { q: 'Why Japan? Why not your own country?', tips: ['Show you\'ve done research', 'Balance opportunity + genuine interest in Japan', 'Mention culture, training, work ethic'], example: '"Japan has one of the most advanced care systems in the world. I\'m impressed by the emphasis on respect and quality of life. Japanese work culture values discipline and continuous improvement — qualities I admire. Working here lets me grow professionally while contributing to a society I respect."' },
    { q: 'Do you have any experience in caregiving?', tips: ['Even informal experience counts!', 'Use STAR method', 'Highlight transferable skills'], example: '"Yes, I cared for my elderly grandfather for 2 years after his stroke — bathing, feeding, mobility exercises. It was challenging, but I learned patience, empathy, and communication. This confirmed my desire to pursue kaigo professionally."' },
    { q: 'What do you know about our facility?', tips: ['DO YOUR RESEARCH!', 'Mention specific details', 'Connect to your values/goals'], example: '"I learned that [Facility] is a special nursing home in [Location] serving [number] residents. I was particularly impressed by your philosophy of [values], and that you provide Japanese training for foreign workers. This environment is exactly where I want to grow."' },
    { q: 'What are your strengths?', tips: ['Choose 2-3 relevant strengths', 'Give concrete examples', 'Relate to kaigo work'], example: '"My key strengths are patience, empathy, and adaptability. Caring for my grandmother with dementia, I learned to stay calm and adapt my communication to her needs. I\'m also physically fit and comfortable with the demands of caregiving."' },
    { q: 'What are your weaknesses?', tips: ['Be honest but strategic', 'Choose a real weakness', 'Show you\'re actively working on it'], example: '"I\'m working on my Japanese. While I handle basic conversations, I need to improve for effective communication. I\'m taking classes and practicing daily — committed to conversational fluency within my first year."' },
    { q: 'How do you handle stress?', tips: ['Give specific coping strategies', 'Use an example', 'Show emotional intelligence'], example: '"I take deep breaths and prioritize tasks. When my grandfather became agitated, I stayed calm, spoke softly, and redirected his attention. After challenges, I reflect on what I could do better and maintain self-care through exercise."' },
    { q: 'Where do you see yourself in 5 years?', tips: ['Show long-term commitment', 'Mention growth within the field', 'Balance ambition with realism'], example: '"I see myself as an experienced care worker, possibly specializing in dementia care. I\'d love to mentor new foreign workers and bridge cultural gaps. Most importantly, I want to be someone residents and families trust completely."' },
    { q: 'Do you have any questions for us?', tips: ['ALWAYS have questions ready!', 'Ask about training, daily routine, team', 'Avoid salary questions too early'], example: '"Could you tell me more about the training process for new staff? What does a typical day look like? And what qualities do your most successful care workers share?"' },
  ]},

  // Online etiquette
  'online.tech': { items: ['Stable internet connection (minimum 10 Mbps)', 'Computer/laptop with working camera', 'Good quality microphone or earphones with mic', 'Zoom/Google Meet/Teams installed & tested', 'Backup device ready (phone/tablet)', 'Backup internet (mobile hotspot)', 'Charger plugged in'] },
  'online.camera': { items: ['Height: Camera at eye level (use books to elevate)', 'Distance: Upper body visible (head to chest)', 'Eye contact: Look at camera, NOT at your own video'] },
  'online.lighting': { items: ['Natural light: Face a window (not behind you)', 'Artificial: Desk lamp in front of you', 'Avoid: Backlighting, harsh overhead lights'] },
  'online.background': { items: ['Clean, neutral wall — white, beige, or light gray', 'No clutter, laundry, unmade bed, or distracting movement', 'Virtual bg: test beforehand for glitchy edges'] },
  'online.pakaian': { items: ['Business casual minimum', 'Solid colors (avoid patterns)', 'Men: Collared shirt or polo', 'Women: Blouse or neat top', 'Avoid white (washes out), loud prints'] },
  'online.grooming': { items: ['Hair neat & tidy', 'Men: Clean shave or groomed facial hair', 'Women: Natural makeup', 'Clean nails, minimal accessories', 'Look fresh & rested'] },

  // Checklist
  'checklist.w2mat': { items: ['Review guide ini thoroughly', 'List 10 pertanyaan umum & siapkan jawaban', 'Riset tentang facility/company', 'Identifikasi 3-5 cerita/pengalaman relevan', 'Practice STAR method answers'] },
  'checklist.w2jp': { items: ['Practice self-introduction in Japanese', 'Learn basic keigo phrases', 'Review kaigo terminology', 'Latihan vokal A-I-U-E-O posisi mulut Jepang setiap pagi'] },
  'checklist.w2mock': { items: ['Schedule mock interview #1 dengan teman/sensei', 'Record yourself answering questions', 'Review recording & catat area yang perlu diperbaiki'] },
  'checklist.w1pol': { items: ['Mock interview #2 via Zoom', 'Refine answers based on feedback', 'Practice online bow & greeting', 'Practice melihat kamera, bukan layar', 'Review kaigo terminology'] },
  'checklist.w1tech': { items: ['Test camera, mic, internet', 'Setup & test interview location', 'Test lighting', 'Update Zoom ke versi terbaru'] },
  'checklist.w1log': { items: ['Confirm interview time, date, Zoom link', 'Prepare interview outfit & test on camera', 'Arrange backup internet (mobile hotspot)'] },
  'checklist.d2prep': { items: ['Mock interview #3 — full simulation', 'Final review materi', 'Prepare all documents', 'Full equipment test'] },
  'checklist.d2self': { items: ['Prepare outfit (test on camera)', 'Hydrate well', 'Light exercise', 'Avoid alcohol', 'Prepare interview space'] },
  'checklist.nment': { items: ['Visualization exercise — bayangkan interview berjalan lancar', 'Light review materi (jangan belajar hal baru)', 'Tulis affirmasi positifmu sendiri', 'Relaxation routine — napas perut 10 menit', 'Ingatkan diri: kamu sudah mempersiapkan ini'] },
  'checklist.nprac': { items: ['Set 2-3 alarms', 'Charge all devices fully', 'Test Zoom link one last time', 'Lay out outfit', 'Organize documents', 'Early bedtime (7-8 jam tidur)', 'Inform family about interview'] },
  'checklist.m1h': { items: ['Test internet speed', 'Join test Zoom meeting', 'Setup interview space (camera, lighting, background)', 'Close all unnecessary programs', 'Turn phone to SILENT', 'Put up \'Do Not Disturb\' sign', 'Water bottle ready (out of frame)'] },
  'checklist.m5m': { items: ['Click Zoom link, join meeting', 'Wait in waiting room', 'Camera ON, Mic ON', 'Duduk tegak — lakukan napas perut 5x', 'Warm-up vokal: A-I-U-E-O pelan', 'Calm, confident expression', 'Ready to bow & greet'] },

  // Mantra
  'checklist.mantra': { main: '"Aku siap. Aku bisa. Aku layak."', sub: 'Semangat dan bangga — kamu sedang melakukan hal baik pada dirimu sendiri. 🌸' },
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Noto+Serif+JP:wght@400;700&display=swap');

  .mg * { box-sizing: border-box; margin: 0; padding: 0; }
  .mg { font-family: ${font.body}; background: ${t.mist}; min-height: 100vh; color: ${t.ink}; }

  .mg-nav-link { display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-radius: 12px; text-decoration: none; color: ${t.body}; font-size: 0.83rem; font-weight: 600; transition: all 0.18s; }
  .mg-nav-link:hover, .mg-nav-link.active { background: ${t.primarySoft}; color: ${t.primary}; }

  .mg-progress-track { height: 6px; background: ${t.borderMid}; border-radius: 99px; overflow: hidden; margin-top: 8px; }
  .mg-progress-fill  { height: 100%; background: linear-gradient(90deg, ${t.primary}, ${t.emerald}); border-radius: 99px; transition: width 0.5s ease; }

  .mg-coll-hdr { display: flex; align-items: center; justify-content: space-between; padding: 13px 18px; background: ${t.white}; border: 1.5px solid ${t.border}; border-radius: 16px; cursor: pointer; font-weight: 700; font-size: 0.88rem; color: ${t.ink}; transition: all 0.18s; margin-bottom: 2px; user-select: none; }
  .mg-coll-hdr:hover { background: ${t.primarySoft}; border-color: ${t.primaryMid}; color: ${t.primary}; }
  .mg-coll-hdr.open  { background: ${t.primary}; border-color: ${t.primary}; color: white; border-radius: 16px 16px 0 0; margin-bottom: 0; }
  .mg-coll-body { border: 1.5px solid ${t.primary}; border-top: none; border-radius: 0 0 16px 16px; background: ${t.white}; padding: 20px 22px; margin-bottom: 8px; animation: mgIn 0.2s ease; }
  @keyframes mgIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

  .mg-cl { list-style: none; display: flex; flex-direction: column; gap: 5px; margin: 8px 0 10px; }
  .mg-cl li { display: flex; align-items: flex-start; gap: 10px; padding: 9px 14px; border-radius: 12px; font-size: 0.875rem; border: 1.5px solid ${t.border}; background: ${t.mist}; transition: all 0.15s; line-height: 1.5; font-weight: 500; color: ${t.body}; }
  .mg-cl li::before { content: '○'; color: ${t.sub}; font-size: 0.9rem; flex-shrink: 0; margin-top: 1px; }
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
  .mg-vk.jp   h5 { color: ${t.primary}; }
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

  /* ── Edit system ── */
  .mg-editable-wrap { position: relative; }
  .mg-editable-wrap:hover .mg-edit-btn { opacity: 1; }
  .mg-edit-btn { position: absolute; top: -8px; right: -8px; z-index: 10; width: 28px; height: 28px; border-radius: 50%; background: ${t.primary}; color: white; border: 2px solid white; font-size: 0.7rem; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.18s; box-shadow: 0 2px 8px rgba(79,70,229,0.35); }
  .mg-edit-btn:hover { transform: scale(1.1); }
  .mg-save-badge { position: fixed; bottom: 80px; right: 28px; background: ${t.emerald}; color: white; font-size: 0.75rem; font-weight: 700; padding: 6px 14px; border-radius: 99px; box-shadow: 0 2px 10px rgba(16,185,129,0.4); animation: mgFadeIn 0.2s ease; z-index: 200; }
  @keyframes mgFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

  /* Edit modal */
  .mg-modal-overlay { position: fixed; inset: 0; background: rgba(17,24,39,0.5); display: flex; align-items: center; justify-content: center; z-index: 300; padding: 20px; backdrop-filter: blur(2px); }
  .mg-modal { background: white; border-radius: 24px; padding: 28px; width: 100%; max-width: 560px; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
  .mg-modal h3 { font-size: 1rem; font-weight: 900; color: ${t.ink}; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
  .mg-modal-field { margin-bottom: 14px; }
  .mg-modal-field label { display: block; font-size: 0.74rem; font-weight: 700; color: ${t.sub}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
  .mg-modal-field input, .mg-modal-field textarea { width: 100%; padding: 10px 14px; border: 1.5px solid ${t.borderMid}; border-radius: 10px; font-size: 0.88rem; font-family: ${font.body}; color: ${t.ink}; outline: none; transition: border-color 0.15s; resize: vertical; background: ${t.mist}; }
  .mg-modal-field input:focus, .mg-modal-field textarea:focus { border-color: ${t.primary}; background: white; }
  .mg-modal-item { display: flex; gap: 8px; margin-bottom: 7px; align-items: flex-start; }
  .mg-modal-item input { flex: 1; }
  .mg-modal-item-del { width: 30px; height: 30px; border-radius: 8px; border: none; background: #FFF1F2; color: #F43F5E; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 4px; }
  .mg-modal-item-del:hover { background: #F43F5E; color: white; }
  .mg-modal-add { width: 100%; padding: 8px; border: 1.5px dashed ${t.borderMid}; border-radius: 10px; background: transparent; color: ${t.sub}; font-size: 0.82rem; font-weight: 700; cursor: pointer; margin-top: 4px; }
  .mg-modal-add:hover { border-color: ${t.primary}; color: ${t.primary}; background: ${t.primarySoft}; }
  .mg-modal-actions { display: flex; gap: 8px; margin-top: 20px; }
  .mg-modal-save { flex: 1; padding: 11px; background: ${t.primary}; color: white; border: none; border-radius: 12px; font-size: 0.88rem; font-weight: 700; cursor: pointer; }
  .mg-modal-save:hover { background: ${t.primaryMid}; }
  .mg-modal-cancel { padding: 11px 18px; background: ${t.border}; color: ${t.body}; border: none; border-radius: 12px; font-size: 0.88rem; font-weight: 700; cursor: pointer; }
  .mg-modal-cancel:hover { background: ${t.borderMid}; }
`;

// ─── Main Component ───────────────────────────────────────────────────────────
const MensetsuGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState('intro');
  const [showBtt, setShowBtt] = useState(false);
  const [progress, setProgress] = useState(0);
  const [checkedItems, setCheckedItems] = useState<{ [k: string]: boolean }>({});
  const [content, setContent] = useState<Record<string, any>>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saveBadge, setSaveBadge] = useState(false);
  const [editModal, setEditModal] = useState<{ key: string; type: string } | null>(null);
  const [editDraft, setEditDraft] = useState<any>(null);
  const ref = useRef<HTMLDivElement>(null);

  // ── Load from Supabase ──
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('guide_content').select('block_key, content');
        if (data && data.length > 0) {
          const merged = { ...DEFAULT_CONTENT };
          data.forEach((row: any) => { merged[row.block_key] = row.content; });
          setContent(merged);
        }
      } catch (e) {
        console.error('Load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Scroll / Nav ──
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

  // ── Progress ──
  useEffect(() => {
    const items = document.querySelectorAll('.mg-cl li');
    const cnt = Object.values(checkedItems).filter(Boolean).length;
    setProgress(items.length > 0 ? (cnt / items.length) * 100 : 0);
  }, [checkedItems]);

  // ── Save to Supabase ──
  const saveBlock = useCallback(async (key: string, val: any) => {
    setContent(prev => ({ ...prev, [key]: val }));
    try {
      await supabase.from('guide_content').upsert({ block_key: key, content: val, updated_at: new Date().toISOString() }, { onConflict: 'block_key' });
      setSaveBadge(true);
      setTimeout(() => setSaveBadge(false), 2000);
    } catch (e) { console.error('Save error:', e); }
  }, []);

  // ── Open edit modal ──
  const openEdit = (key: string, type: string) => {
    setEditDraft(JSON.parse(JSON.stringify(content[key]))); // deep clone
    setEditModal({ key, type });
  };

  const closeModal = () => { setEditModal(null); setEditDraft(null); };

  const commitEdit = () => {
    if (editModal && editDraft) saveBlock(editModal.key, editDraft);
    closeModal();
  };

  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); setActiveSection(id); };
  const toggleCheck = (id: string) => setCheckedItems(p => ({ ...p, [id]: !p[id] }));

  // ─── Sub-components ─────────────────────────────────────────────────────────
  // Wrapper that shows edit button on hover
  const Editable: React.FC<{ blockKey: string; type: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ blockKey, type, children, style }) => (
    <div className="mg-editable-wrap" style={{ position: 'relative', ...style }}>
      {children}
      <button className="mg-edit-btn" onClick={() => openEdit(blockKey, type)} title="Edit konten ini">✎</button>
    </div>
  );

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

  // Editable checklist
  const CL: React.FC<{ blockKey: string; pfx: string }> = ({ blockKey, pfx }) => {
    const items: string[] = content[blockKey]?.items || [];
    return (
      <Editable blockKey={blockKey} type="items">
        <ul className="mg-cl">
          {items.map((item, i) => { const id = `${pfx}-${i}`; return <li key={id} className={checkedItems[id] ? 'done' : ''} onClick={() => toggleCheck(id)}>{item}</li>; })}
        </ul>
      </Editable>
    );
  };

  // Editable info box
  const IB: React.FC<{ blockKey?: string; t_: 'p'|'s'|'w'|'d'; title: string; children?: React.ReactNode }> = ({ blockKey, t_, title, children }) => {
    const box = (
      <div className={`mg-box ${t_}`}><div className="mg-box-ttl">{title}</div>{children}</div>
    );
    if (!blockKey) return box;
    return <Editable blockKey={blockKey} type="items">{box}</Editable>;
  };

  // Editable list (ul)
  const EList: React.FC<{ blockKey: string; ordered?: boolean }> = ({ blockKey, ordered }) => {
    const items: string[] = content[blockKey]?.items || [];
    const Tag = ordered ? 'ol' : 'ul';
    return (
      <Editable blockKey={blockKey} type="items">
        <Tag className={ordered ? 'mg-ol' : 'mg-ul'}>
          {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }} />)}
        </Tag>
      </Editable>
    );
  };

  // Editable paragraph
  const EP: React.FC<{ blockKey: string; style?: React.CSSProperties }> = ({ blockKey, style }) => {
    const text: string = content[blockKey]?.text || '';
    return (
      <Editable blockKey={blockKey} type="text">
        <p style={{ color: t.body, lineHeight: 1.75, fontSize: '0.9rem', ...style }} dangerouslySetInnerHTML={{ __html: text }} />
      </Editable>
    );
  };

  const ST: React.FC<{ icon: string; children: React.ReactNode }> = ({ icon, children }) => (
    <div style={{ marginBottom: '4px' }}>
      <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: t.ink, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ width: '36px', height: '36px', background: t.primary, borderRadius: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', flexShrink: 0 }}>{icon}</span>
        {children}
      </h2>
      <div className="mg-rule" />
    </div>
  );
  const Sub: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 style={{ fontSize: '0.92rem', fontWeight: 900, color: t.ink, marginBottom: '10px', marginTop: '24px', paddingBottom: '8px', borderBottom: `2px solid ${t.border}` }}>{children}</h3>;
  const H4s: React.FC<{ children: React.ReactNode; mt?: boolean }> = ({ children, mt }) => <h4 style={{ fontSize: '0.74rem', fontWeight: 900, color: t.sub, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '7px', marginTop: mt ? '14px' : undefined }}>{children}</h4>;
  const Sec: React.FC<{ children: React.ReactNode }> = ({ children }) => <div style={{ background: t.white, borderRadius: '32px', padding: '34px', marginBottom: '14px', boxShadow: t.shadow, border: `1.5px solid ${t.border}` }}>{children}</div>;

  const navItems = [
    { id: 'intro', icon: '🏠', label: 'Intro' },
    { id: 'persiapan', icon: '📚', label: 'Persiapan' },
    { id: 'tips', icon: '💡', label: 'Tips Praktis' },
    { id: 'contoh', icon: '🗣️', label: 'Contoh Jawaban' },
    { id: 'online', icon: '💻', label: 'Etika Online' },
    { id: 'checklist', icon: '✅', label: 'Checklist' },
  ];

  // ─── Edit Modal ───────────────────────────────────────────────────────────────
  const EditModal = () => {
    if (!editModal || !editDraft) return null;
    const { type } = editModal;

    return (
      <div className="mg-modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
        <div className="mg-modal">
          <h3>✎ Edit Konten</h3>

          {type === 'text' && (
            <div className="mg-modal-field">
              <label>Teks</label>
              <textarea rows={4} value={editDraft.text || ''} onChange={e => setEditDraft({ ...editDraft, text: e.target.value })} />
            </div>
          )}

          {type === 'items' && (
            <div className="mg-modal-field">
              <label>Items (klik untuk edit, × untuk hapus)</label>
              {(editDraft.items || []).map((item: string, i: number) => (
                <div key={i} className="mg-modal-item">
                  <input value={item} onChange={e => { const arr = [...editDraft.items]; arr[i] = e.target.value; setEditDraft({ ...editDraft, items: arr }); }} />
                  <button className="mg-modal-item-del" onClick={() => { const arr = editDraft.items.filter((_: any, j: number) => j !== i); setEditDraft({ ...editDraft, items: arr }); }}>×</button>
                </div>
              ))}
              <button className="mg-modal-add" onClick={() => setEditDraft({ ...editDraft, items: [...(editDraft.items || []), ''] })}>+ Tambah item</button>
            </div>
          )}

          {type === 'qa' && (
            <div className="mg-modal-field">
              <label>Pertanyaan & Jawaban</label>
              {(editDraft.questions || []).map((qa: any, i: number) => (
                <div key={i} style={{ border: `1.5px solid ${t.border}`, borderRadius: '12px', padding: '14px', marginBottom: '10px' }}>
                  <label>Pertanyaan {i + 1}</label>
                  <input value={qa.q} onChange={e => { const arr = [...editDraft.questions]; arr[i] = { ...arr[i], q: e.target.value }; setEditDraft({ ...editDraft, questions: arr }); }} style={{ marginBottom: '6px' }} />
                  <label>Contoh Jawaban</label>
                  <textarea rows={3} value={qa.example} onChange={e => { const arr = [...editDraft.questions]; arr[i] = { ...arr[i], example: e.target.value }; setEditDraft({ ...editDraft, questions: arr }); }} />
                  <label>Tips (satu per baris)</label>
                  <textarea rows={2} value={(qa.tips || []).join('\n')} onChange={e => { const arr = [...editDraft.questions]; arr[i] = { ...arr[i], tips: e.target.value.split('\n') }; setEditDraft({ ...editDraft, questions: arr }); }} />
                </div>
              ))}
            </div>
          )}

          {type === 'mantra' && (
            <>
              <div className="mg-modal-field">
                <label>Mantra Utama</label>
                <input value={editDraft.main || ''} onChange={e => setEditDraft({ ...editDraft, main: e.target.value })} />
              </div>
              <div className="mg-modal-field">
                <label>Kalimat Kedua</label>
                <textarea rows={2} value={editDraft.sub || ''} onChange={e => setEditDraft({ ...editDraft, sub: e.target.value })} />
              </div>
            </>
          )}

          {type === 'cards' && (
            <div className="mg-modal-field">
              <label>Cards</label>
              {(editDraft.cards || []).map((card: any, i: number) => (
                <div key={i} style={{ border: `1.5px solid ${t.border}`, borderRadius: '12px', padding: '12px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                    <input value={card.icon} style={{ width: '60px' }} onChange={e => { const arr = [...editDraft.cards]; arr[i] = { ...arr[i], icon: e.target.value }; setEditDraft({ ...editDraft, cards: arr }); }} placeholder="emoji" />
                    <input value={card.title} style={{ flex: 1 }} onChange={e => { const arr = [...editDraft.cards]; arr[i] = { ...arr[i], title: e.target.value }; setEditDraft({ ...editDraft, cards: arr }); }} placeholder="Judul" />
                  </div>
                  <textarea rows={2} value={card.desc} onChange={e => { const arr = [...editDraft.cards]; arr[i] = { ...arr[i], desc: e.target.value }; setEditDraft({ ...editDraft, cards: arr }); }} placeholder="Deskripsi" />
                </div>
              ))}
            </div>
          )}

          <div className="mg-modal-actions">
            <button className="mg-modal-cancel" onClick={closeModal}>Batal</button>
            <button className="mg-modal-save" onClick={commitEdit}>💾 Simpan</button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: t.sub, fontFamily: font.body }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>⏳</div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Memuat guide...</div>
      </div>
    </div>
  );

  const c = content; // shorthand

  return (
    <>
      <style>{CSS}</style>
      <div className="mg">
        {saveBadge && <div className="mg-save-badge">✓ Tersimpan</div>}
        <EditModal />

        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'grid', gridTemplateColumns: '210px 1fr', gap: '22px', padding: '26px 18px', alignItems: 'start' }}>

          {/* Sidebar */}
          <nav style={{ position: 'sticky', top: '20px', background: t.white, borderRadius: '26px', padding: '18px', boxShadow: t.shadow, border: `1.5px solid ${t.border}` }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', color: t.primary, marginBottom: '12px', paddingBottom: '12px', borderBottom: `1.5px solid ${t.border}` }}>📖 Guide Menu</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {navItems.map(n => (
                <li key={n.id}><a href={`#${n.id}`} className={`mg-nav-link ${activeSection === n.id ? 'active' : ''}`} onClick={e => { e.preventDefault(); scrollTo(n.id); }}><span>{n.icon}</span>{n.label}</a></li>
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

            {/* ── INTRO ── */}
            <Sec><section id="intro" className="mg-sec">
              <ST icon="🏠">Introduction</ST>
              <EP blockKey="intro.p1" style={{ marginBottom: '10px' }} />
              <EP blockKey="intro.p2" style={{ marginBottom: '16px' }} />
              <Editable blockKey="intro.tujuan" type="items">
                <div className="mg-box p">
                  <div className="mg-box-ttl" style={{ color: t.primary }}>{c['intro.tujuan']?.title}</div>
                  <ul className="mg-ul">{(c['intro.tujuan']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
                </div>
              </Editable>
            </section></Sec>

            {/* ── PERSIAPAN ── */}
            <Sec><section id="persiapan" className="mg-sec">
              <ST icon="📚">Persiapan Materi</ST>
              <Sub>📋 Kenali Diri Sendiri</Sub>

              <Editable blockKey="persiapan.motivasi" type="items">
                <Coll title={c['persiapan.motivasi']?.title || 'Motivasi & Tujuan'} icon={c['persiapan.motivasi']?.icon || '💭'}>
                  <H4s>Pertanyaan untuk direfleksikan:</H4s>
                  <ul className="mg-ul">{(c['persiapan.motivasi']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
                  {c['persiapan.motivasi']?.warning && <div className="mg-box w" style={{ marginTop: '10px' }}><div className="mg-box-ttl" style={{ color: t.amber }}>⚠️ Tips</div><p>{c['persiapan.motivasi'].warning}</p></div>}
                </Coll>
              </Editable>

              <Editable blockKey="persiapan.pengalaman" type="items">
                <Coll title={c['persiapan.pengalaman']?.title || 'Pengalaman Relevan'} icon={c['persiapan.pengalaman']?.icon || '💼'}>
                  <ul className="mg-ul">{(c['persiapan.pengalaman']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
                  <div className="mg-box s" style={{ marginTop: '10px' }}><div className="mg-box-ttl" style={{ color: t.emerald }}>✅ Format STAR</div><p>Gunakan format <strong>STAR</strong>: <strong>S</strong>ituation, <strong>T</strong>ask, <strong>A</strong>ction, <strong>R</strong>esult</p></div>
                </Coll>
              </Editable>

              <Editable blockKey="persiapan.pengetahuan" type="items">
                <Coll title={c['persiapan.pengetahuan']?.title || 'Pengetahuan Jepang & Kaigo'} icon={c['persiapan.pengetahuan']?.icon || '🇯🇵'}>
                  <ul className="mg-ul">{(c['persiapan.pengetahuan']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
                </Coll>
              </Editable>

              <Sub>🏢 Riset tentang Facility</Sub>
              <Editable blockKey="persiapan.facility" type="items">
                <div className="mg-box p">
                  <div className="mg-box-ttl" style={{ color: t.primary }}>{c['persiapan.facility']?.title}</div>
                  <ul className="mg-ul">{(c['persiapan.facility']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
                </div>
              </Editable>
            </section></Sec>

            {/* ── TIPS ── */}
            <Sec><section id="tips" className="mg-sec">
              <ST icon="💡">Tips Praktis</ST>

              <Sub>🎯 Do's and Don'ts</Sub>
              <div className="mg-2col">
                <Editable blockKey="tips.dos" type="items">
                  <div className="mg-dos"><h4>✅ DO's</h4><ul className="mg-ul">{(c['tips.dos']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul></div>
                </Editable>
                <Editable blockKey="tips.donts" type="items">
                  <div className="mg-donts"><h4>❌ DON'Ts</h4><ul className="mg-ul">{(c['tips.donts']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul></div>
                </Editable>
              </div>

              <Sub>🗣️ Tips Menjawab Pertanyaan</Sub>
              <Coll title="Structure Your Answer" icon="📝">
                <ol className="mg-ol"><li><strong>Opening:</strong> Jawaban langsung</li><li><strong>Body:</strong> Penjelasan + contoh konkret</li><li><strong>Closing:</strong> Kaitkan dengan posisi/future</li></ol>
              </Coll>
              <Coll title="Difficult Questions" icon="🤔">
                <ul className="mg-ul"><li><strong>"Tell me about your weakness"</strong> → Pilih weakness genuine, sebutkan langkah perbaikannya.</li><li><strong>"Why did you leave your last job?"</strong> → Stay positive, focus on what you're looking for.</li><li><strong>"What if you don't like it in Japan?"</strong> → Show commitment dan flexibility.</li></ul>
              </Coll>
              <Coll title="When You Don't Know the Answer" icon="🤷">
                <ol className="mg-ol"><li>Be honest: "That's a great question. I haven't thought about it from that angle..."</li><li>Think aloud: "Let me think... Based on what I know..."</li><li>Relate: "I don't have direct experience, but in a similar situation..."</li><li>Show willingness: "I'd love to learn more. Could you tell me more?"</li></ol>
              </Coll>

              <Sub>🧠 Mengelola Nervous & Anxiety</Sub>
              <div className="mg-box w"><div className="mg-box-ttl" style={{ color: t.amber }}>It's Normal! 💛</div><p>Feeling nervous is completely normal. The key is managing it, not eliminating it.</p></div>
              <Editable blockKey="tips.nervous" type="items">
                <ul className="mg-tech" style={{ marginTop: '10px' }}>{(c['tips.nervous']?.items || []).map((item: string, i: number) => <li key={i}><span dangerouslySetInnerHTML={{ __html: item }} /></li>)}</ul>
              </Editable>

              <Sub>🫁 Napas Perut — Fondasi Suara & Ketenangan</Sub>
              <div className="mg-box p"><div className="mg-box-ttl" style={{ color: t.primary }}>💡 Kenapa Ini Penting?</div><p>Napas perut bukan cuma soal tenang — ini fondasi suara yang stabil, jernih, dan berwibawa. Saat nervous, napasmu jadi dangkal dan suaramu ikut bergetar. Napas perut memutus siklus itu dari akarnya.</p></div>
              <Coll title="Cara Melakukan Napas Perut" icon="🫁">
                <H4s>Langkah-langkah:</H4s>
                <Editable blockKey="tips.napas.steps" type="items">
                  <ol className="mg-ol">{(c['tips.napas.steps']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ol>
                </Editable>
                <div className="mg-box s" style={{ marginTop: '10px' }}><div className="mg-box-ttl" style={{ color: t.emerald }}>✅ Tanda Berhasil</div><p>Tangan di perutmu yang bergerak — bukan dadamu. Suaramu akan terasa lebih dalam, lebih stabil, dan lebih mantap saat bicara.</p></div>
              </Coll>

              <Coll title="Duduk Tegak = Napas Lebih Dalam + Percaya Diri" icon="🪑">
                <p style={{ fontSize: '0.9rem', color: t.body, lineHeight: 1.7, marginBottom: '14px' }}>Postur bukan cuma soal keliatan profesional di kamera. Duduk tegak secara langsung mempengaruhi <strong>napas, suara, dan rasa percaya dirimu</strong>.</p>
                <Editable blockKey="tips.postur.cards" type="cards">
                  <div className="mg-2col">
                    {(c['tips.postur.cards']?.cards || []).map((card: any, i: number) => (
                      <div key={i} className="mg-pcard">
                        <div className="mg-pcard-ico">{card.icon}</div>
                        <div className="mg-pcard-ttl">{card.title}</div>
                        <p style={{ fontSize: '0.82rem', color: t.body, lineHeight: 1.55 }}>{card.desc}</p>
                      </div>
                    ))}
                  </div>
                </Editable>
                <div className="mg-box w" style={{ marginTop: '12px' }}><div className="mg-box-ttl" style={{ color: t.amber }}>💡 Quick Check</div><p><strong>Kaki datar di lantai, punggung tidak menempel sandaran, bahu rileks turun, kepala lurus.</strong></p></div>
              </Coll>

              <Sub>👄 Vokal Jepang — Mulut, Lidah & Otot yang Baru</Sub>
              <div className="mg-box p"><div className="mg-box-ttl" style={{ color: t.primary }}>🎌 Kenapa Ini Berbeda?</div><p>Vokal Bahasa Jepang bukan sekadar "beda aksen" — cara kerja mulut, lidah, dan otot wajahmu secara fisik berbeda dari Bahasa Indonesia. Ini butuh latihan otot, bukan cuma hafalan.</p></div>
              <Coll title="Cara Kerja Mulut & Lidah untuk Vokal Jepang" icon="👄">
                <div className="mg-vkcmp">
                  <div className="mg-vk id"><h5>🇮🇩 Bahasa Indonesia</h5><p>Vokal <strong>tegas & ekspresif</strong>. Mulut bergerak lebih bebas dan lebar. Lidah dinamis ke berbagai posisi. Otot rahang lebih aktif.</p></div>
                  <div className="mg-vk jp"><h5>🇯🇵 Bahasa Jepang</h5><p>Vokal <strong>rata & terkontrol</strong>. Mulut hampir seperti senyum tipis "E" yang datar. Lidah <strong>datar & rileks</strong> di dasar mulut. Otot wajah lebih stabil.</p></div>
                </div>
                <H4s mt>Posisi Mulut yang Benar:</H4s>
                <Editable blockKey="tips.vokal.posisi" type="items">
                  <ul className="mg-ul">{(c['tips.vokal.posisi']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
                </Editable>
                <div className="mg-box s" style={{ marginTop: '10px' }}><div className="mg-box-ttl" style={{ color: t.emerald }}>🏆 Tanda Kamu Di Jalur yang Benar</div><p>Kalau setelah latihan 15–20 menit <strong>sudut mulutmu terasa pegel</strong> — itu tanda bagus! Otot sedang beradaptasi ke pola Bahasa Jepang. <strong>Pegel itu adalah progress.</strong></p></div>
              </Coll>

              <Coll title="Latihan Vokal Cepat Sebelum Interview" icon="🎤">
                <H4s>Warm-up 5 menit:</H4s>
                <Editable blockKey="tips.vokal.warmup" type="items">
                  <ol className="mg-ol">{(c['tips.vokal.warmup']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ol>
                </Editable>
                <div className="mg-box w" style={{ marginTop: '10px' }}><div className="mg-box-ttl" style={{ color: t.amber }}>⏰ Kapan Latihan</div><p>Lakukan warm-up ini <strong>setiap pagi selama 2 minggu sebelum interview</strong>. Otot mulut butuh waktu membangun memori gerak yang baru.</p></div>
              </Coll>
            </section></Sec>

            {/* ── CONTOH JAWABAN ── */}
            <Sec><section id="contoh" className="mg-sec">
              <ST icon="🗣️">Contoh Jawaban</ST>
              <Sub>🔥 Top 10 Pertanyaan Umum</Sub>
              <Editable blockKey="contoh.qa" type="qa">
                <div>
                  {(c['contoh.qa']?.questions || []).map((item: any, i: number) => (
                    <Coll key={i} title={`${i + 1}. ${item.q}`} icon="❓">
                      <div className="mg-tips"><h4>💡 Tips:</h4><ul className="mg-ul">{(item.tips || []).map((tip: string, j: number) => <li key={j}>{tip}</li>)}</ul></div>
                      <div className="mg-eg"><strong>📝 Contoh Jawaban:</strong><p style={{ marginTop: '8px' }}>{item.example}</p></div>
                    </Coll>
                  ))}
                </div>
              </Editable>
            </section></Sec>

            {/* ── ONLINE ── */}
            <Sec><section id="online" className="mg-sec">
              <ST icon="💻">Etika Wawancara Online</ST>

              <Sub>🎥 Technical Setup</Sub>
              <div className="mg-box p">
                <div className="mg-box-ttl" style={{ color: t.primary }}>🖥️ Equipment Checklist:</div>
                <CL blockKey="online.tech" pfx="tech" />
              </div>
              <div className="mg-box w"><div className="mg-box-ttl" style={{ color: t.amber }}>⚠️ Test Everything!</div><ul className="mg-ul"><li>Do a test call 1-2 days before</li><li>Check camera angle, lighting, audio</li><li>Have interviewer's contact info for emergencies</li></ul></div>

              <Sub>📹 Camera & Background</Sub>
              <Coll title="Camera Position" icon="📷"><Editable blockKey="online.camera" type="items"><ul className="mg-ul">{(c['online.camera']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul></Editable></Coll>
              <Coll title="Lighting" icon="💡"><Editable blockKey="online.lighting" type="items"><ul className="mg-ul">{(c['online.lighting']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul></Editable></Coll>
              <Coll title="Background" icon="🖼️"><Editable blockKey="online.background" type="items"><ul className="mg-ul">{(c['online.background']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul></Editable></Coll>

              <Sub>👔 Appearance & Dress Code</Sub>
              <div className="mg-2col">
                <Editable blockKey="online.pakaian" type="items"><div className="mg-acard"><h4>👕 Pakaian</h4><ul className="mg-ul">{(c['online.pakaian']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul></div></Editable>
                <Editable blockKey="online.grooming" type="items"><div className="mg-acard"><h4>💇 Grooming</h4><ul className="mg-ul">{(c['online.grooming']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul></div></Editable>
              </div>
              <div className="mg-box s"><div className="mg-box-ttl" style={{ color: t.emerald }}>✨ Pro Tip</div><p>Dress as if you're going in person. It directly affects your confidence and how seriously you're taken.</p></div>

              <Sub>🙏 Japanese Interview Etiquette</Sub>
              <Coll title="Opening & Greeting" icon="👋">
                <ol className="mg-ol"><li><strong>Join early:</strong> Enter waiting room 5 minutes before</li><li><strong>First impression:</strong> Camera ON, mic ON, smiling</li><li><strong>Bow (15°):</strong><br /><em style={{ color: t.primary }}>"Konnichiwa. Watashi wa [Name] desu. Kyou wa yoroshiku onegaishimasu."</em></li><li><strong>Wait:</strong> Let interviewer lead</li></ol>
              </Coll>
              <Coll title="During Interview" icon="💬">
                <ul className="mg-ul"><li><strong>Posture:</strong> Sit up straight, hands on lap or desk</li><li><strong>Aizuchi:</strong> "Hai", "Sou desu ne" appropriately</li><li><strong>Pauses:</strong> OK to pause before answering</li><li><strong>Respect:</strong> Never interrupt</li></ul>
              </Coll>
              <Coll title="Closing" icon="🏁">
                <ol className="mg-ol"><li><strong>Thank them (bow 30°):</strong><br /><em style={{ color: t.primary }}>"Kyou wa ohanashi dekite, totemo ureshikatta desu. Doumo arigatou gozaimashita."</em></li><li><strong>Follow-up:</strong> Send thank-you email within 24 hours</li></ol>
              </Coll>
              <div className="mg-box d"><div className="mg-box-ttl" style={{ color: '#F43F5E' }}>⚠️ Emergency Plan</div><ul className="mg-ul"><li><strong>Internet crashes:</strong> Stay calm → switch to hotspot → email → rejoin → apologize briefly</li><li><strong>Their audio/video down:</strong> Politely mention it, stay patient</li></ul></div>
            </section></Sec>

            {/* ── CHECKLIST ── */}
            <Sec><section id="checklist" className="mg-sec">
              <ST icon="✅">Checklist Persiapan Timeline</ST>
              <p style={{ color: t.body, fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '20px' }}>Klik setiap item untuk menandainya selesai. Hover item untuk mengedit.</p>

              <Coll title="2-3 Minggu Sebelum" icon="📋">
                <H4s>Materi:</H4s><CL blockKey="checklist.w2mat" pfx="w2m" />
                <H4s mt>Bahasa Jepang:</H4s><CL blockKey="checklist.w2jp" pfx="w2j" />
                <H4s mt>Mock Interview:</H4s><CL blockKey="checklist.w2mock" pfx="w2k" />
              </Coll>
              <Coll title="1 Minggu Sebelum" icon="📋">
                <H4s>Polish:</H4s><CL blockKey="checklist.w1pol" pfx="w1p" />
                <H4s mt>Teknis:</H4s><CL blockKey="checklist.w1tech" pfx="w1t" />
                <H4s mt>Logistik:</H4s><CL blockKey="checklist.w1log" pfx="w1l" />
              </Coll>
              <Coll title="1-2 Hari Sebelum" icon="📋">
                <H4s>Final Prep:</H4s><CL blockKey="checklist.d2prep" pfx="d2p" />
                <H4s mt>Self-care:</H4s><CL blockKey="checklist.d2self" pfx="d2s" />
              </Coll>
              <Coll title="Malam H-1" icon="🌙">
                <H4s>Mental Prep:</H4s><CL blockKey="checklist.nment" pfx="nm" />
                <H4s mt>Practical:</H4s><CL blockKey="checklist.nprac" pfx="np" />
              </Coll>
              <Coll title="Pagi Hari-H" icon="☀️">
                <H4s>1 Hour Before:</H4s><CL blockKey="checklist.m1h" pfx="m1h" />
                <H4s mt>5 Minutes Before:</H4s><CL blockKey="checklist.m5m" pfx="m5m" />
                <Editable blockKey="checklist.mantra" type="mantra">
                  <div className="mg-mantra">
                    <div className="mg-mantra-main">{c['checklist.mantra']?.main}</div>
                    <div className="mg-mantra-sub">{c['checklist.mantra']?.sub}</div>
                  </div>
                </Editable>
              </Coll>
            </section></Sec>

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
