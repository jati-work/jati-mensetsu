import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabase';

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

// ─── Default Content (semua teks Indonesia / romaji Jepang) ───────────────────
const DC: Record<string, any> = {
  // Intro
  'intro.p1': { text: 'Selamat datang! Panduan ini dirancang khusus untuk membantu kamu mempersiapkan diri menghadapi wawancara online untuk program <strong>Tokutei Ginou Kaigo</strong> di Jepang.' },
  'intro.p2': { text: 'Mensetsu (面接) adalah tahap krusial dalam proses seleksi. Panduan ini membantumu memahami apa yang diharapkan, cara mempersiapkan diri, dan tips nyata untuk sukses.' },
  'intro.tujuan': { title: '🎯 Tujuan Panduan Ini', items: ['Memahami format dan struktur mensetsu online', 'Mempelajari pertanyaan umum dan cara menjawabnya', 'Menguasai etika dan tata krama wawancara online', 'Mempersiapkan mental dan teknis untuk hari-H'] },

  // Persiapan
  'persiapan.motivasi': { title: 'Motivasi & Tujuan', icon: '💭', items: ['Kenapa kaigo? Apa yang membuatmu tertarik dengan pekerjaan perawat lansia?', 'Kenapa Jepang? Mengapa memilih bekerja di Jepang, bukan negara lain?', 'Rencana jangka panjang: Apa yang ingin kamu capai dalam 3-5 tahun ke depan?', 'Kontribusi: Bagaimana kamu bisa berkontribusi untuk fasilitas mereka?'], warning: 'Jawaban harus spesifik, jujur, dan menunjukkan komitmen jangka panjang.' },
  'persiapan.pengalaman': { title: 'Pengalaman Relevan', icon: '💼', items: ['Pengalaman kerja atau sukarela terkait perawatan', 'Pengalaman merawat anggota keluarga (lansia, sakit, disabilitas)', 'Pengalaman melayani orang atau berinteraksi langsung', 'Kemampuan soft skill: empati, kesabaran, komunikasi, pemecahan masalah'] },
  'persiapan.pengetahuan': { title: 'Pengetahuan Jepang & Kaigo', icon: '🇯🇵', items: ['Budaya kerja Jepang: kedisiplinan, saling menghormati, kerja tim, omotenashi (おもてなし)', 'Masyarakat menua: Jepang memiliki populasi lansia terbesar di dunia', 'Sistem kaigo: perbedaan level perawatan (tokubetsu, kaigo, youkaigo)', 'Dasar bahasa Jepang: minimal hiragana, katakana, salam dasar'] },
  'persiapan.facility': { title: '🔍 Yang perlu dicari tahu:', items: ['Nama lengkap fasilitas & lokasi', 'Jenis layanan (tokubetsu yougo roujin houmu, day service, home visit)', 'Ukuran fasilitas (jumlah penghuni, staf)', 'Filosofi atau nilai-nilai fasilitas', 'Program pelatihan untuk pekerja asing', 'Fasilitas pendukung (tempat tinggal, kelas bahasa Jepang)'] },

  // Tips - Dos Donts
  'tips.dos': { items: ['Jawab dengan jujur dan spesifik', 'Tunjukkan semangat dan minat yang tulus', 'Berikan contoh nyata dari pengalaman', 'Ajukan pertanyaan yang bermakna', 'Jaga kontak mata — pandang kamera, bukan layar', 'Senyum secara alami', 'Dengarkan dengan penuh perhatian'] },
  'tips.donts': { items: ['Berbohong atau melebih-lebihkan pengalaman', 'Menjelek-jelekkan tempat kerja sebelumnya', 'Hanya fokus pada gaji atau tunjangan', 'Menjawab "saya tidak tahu" tanpa penjelasan lanjutan', 'Melihat video diri sendiri, bukan kamera', 'Memotong pembicaraan pewawancara', 'Menjawab terburu-buru tanpa berpikir'] },

  // Tips - cara menjawab
  'tips.struktur': { title: 'Cara Menyusun Jawaban', icon: '📝', items: ['Pembuka (Opening): Jawaban langsung dan singkat', 'Isi (Body): Penjelasan + contoh nyata dari pengalaman', 'Penutup (Closing): Kaitkan dengan posisi atau tujuanmu di masa depan'] },
  'tips.sulit': { title: 'Pertanyaan yang Sering Sulit Dijawab', icon: '🤔', items: ['"Apa kelemahan kamu?" → Pilih kelemahan yang nyata tapi sedang diperbaiki. Selalu sebutkan langkah konkret yang sudah kamu ambil.', '"Kenapa keluar dari kerja sebelumnya?" → Tetap positif. Fokus pada apa yang kamu cari, bukan apa yang kamu hindari.', '"Bagaimana kalau kamu tidak betah di Jepang?" → Tunjukkan komitmen. Ceritakan persiapan yang sudah kamu lakukan (bahasa, budaya, mental).'] },
  'tips.tidaktahu': { title: 'Kalau Tidak Tahu Jawabannya', icon: '🤷', items: ['Jujur dan tenang: "Pertanyaan yang menarik. Saya belum pernah memikirkan dari sudut itu sebelumnya..."', 'Berpikir keras: "Sebentar ya... Berdasarkan yang saya ketahui..."', 'Kaitkan dengan yang kamu tahu: "Saya belum punya pengalaman langsung, tapi dalam situasi serupa..."', 'Tunjukkan kemauan belajar: "Saya sangat ingin tahu lebih. Boleh saya tanya lebih lanjut?"'] },

  // Nervous
  'tips.nervous': { items: ['Teknik napas 4-7-8: tarik napas 4 detik, tahan 7 detik, keluarkan 8 detik — langsung menenangkan sistem saraf', 'Power pose: berdiri tegak, tangan di pinggang, 2 menit sebelum mensetsu', 'Afirmasi diri: "Saya siap. Saya bisa. Saya layak."', 'Visualisasi sukses: bayangkan mensetsu berjalan lancar dari awal sampai akhir', 'Grounding: fokus pada sensasi fisik — kaki di lantai, napas masuk keluar', 'Ingat: pewawancara ingin menemukan kandidat yang tepat. Mereka mendukungmu.'] },

  // Napas perut
  'tips.napas.steps': { items: ['Duduk atau berdiri tegak. Punggung lurus, bahu rileks turun, dagu sedikit masuk.', 'Taruh satu tangan di dada, satu di perut (bawah tulang rusuk).', 'Tarik napas perlahan lewat hidung — rasakan tangan di perut bergerak maju. Tangan di dada tetap diam.', 'Tahan 2–3 detik.', 'Keluarkan perlahan lewat mulut — perut kembali masuk, dada tetap tenang.', 'Ulangi 5–8 kali. Lakukan ini 10 menit sebelum mensetsu dimulai.'] },
  'tips.napas.infobox': { text: 'Napas perut bukan cuma soal tenang — ini fondasi suara yang stabil, jernih, dan berwibawa. Saat gugup, napasmu jadi dangkal dan suaramu ikut bergetar. Napas perut memutus siklus itu dari akarnya.' },
  'tips.napas.berhasil': { text: 'Tangan di perutmu yang bergerak — bukan dadamu. Suaramu akan terasa lebih dalam, lebih stabil, dan lebih mantap saat bicara.' },

  // Postur
  'tips.postur.intro': { text: 'Postur bukan cuma soal terlihat profesional di kamera. Duduk tegak secara langsung mempengaruhi napas, suara, dan rasa percaya dirimu.' },
  'tips.postur.cards': { cards: [{ icon: '🫁', title: 'Napas Lebih Dalam', desc: 'Postur tegak membuka rongga dada, memberi diafragma ruang untuk bergerak penuh. Napas perut jadi lebih mudah dan alami.' }, { icon: '😌', title: 'Otomatis Lebih Rileks', desc: 'Otak membaca postur sebagai sinyal aman. Duduk tegak menurunkan kadar kortisol (hormon stres) secara alami.' }, { icon: '💪', title: 'Suara Lebih Kuat', desc: 'Suara dari tubuh yang tegak punya resonansi lebih baik — terdengar lebih mantap, lebih yakin, dan lebih jelas.' }, { icon: '✨', title: 'Rasa Percaya Diri Naik', desc: 'Berdiri atau duduk tegak selama 2 menit meningkatkan rasa percaya diri secara nyata — bahkan sebelum mensetsu dimulai.' }] },
  'tips.postur.quickcheck': { text: 'Sebelum masuk waiting room — cek: kaki datar di lantai, punggung tidak menempel sandaran, bahu rileks turun, kepala lurus. Rasakan bedanya dalam 10 detik pertama.' },

  // Vokal
  'tips.vokal.info': { text: 'Vokal Bahasa Jepang bukan sekadar "beda aksen" — cara kerja mulut, lidah, dan otot wajahmu secara fisik berbeda dari Bahasa Indonesia. Ini butuh latihan otot, bukan cuma hafalan.' },
  'tips.vokal.id': { text: 'Vokal tegas & ekspresif. Mulut bergerak lebih bebas dan lebar. Lidah dinamis ke berbagai posisi. Otot rahang lebih aktif.' },
  'tips.vokal.jp': { text: 'Vokal rata & terkontrol. Mulut hampir seperti senyum tipis "E" yang datar. Lidah datar & rileks di dasar mulut. Otot wajah lebih stabil.' },
  'tips.vokal.posisi': { items: ['Bibir: senyum kecil yang alami — seperti mengucapkan huruf "E" tapi rileks, tidak dipaksakan. Sudut mulut sedikit terangkat.', 'Lidah: datar dan rileks di dasar mulut, ujung lidah menyentuh ringan belakang gigi bawah. Tidak tegang, tidak naik.', 'Rahang: lebih rileks dan sedikit tertutup dibanding berbicara Bahasa Indonesia — ini yang membuat vokal Jepang terdengar lebih rapi.', 'Leher: rileks. Suara datang dari perut, bukan tenggorokan.'] },
  'tips.vokal.pegel': { text: 'Kalau setelah latihan 15–20 menit sudut mulutmu terasa pegel — itu tanda bagus! Berarti otot-otot yang biasa kamu pakai untuk Bahasa Indonesia sedang beradaptasi ke pola Bahasa Jepang. Pegel itu adalah tanda kemajuan. Teruskan.' },
  'tips.vokal.warmup': { items: ['Ucapkan "A – I – U – E – O" perlahan, fokus pada posisi mulut dan lidah di setiap vokal.', 'Ucapkan "Watashi wa [nama] desu" — perhatikan mulut tidak terbuka terlalu lebar.', 'Baca teks Jepang sederhana dengan suara keras selama 2–3 menit.', 'Akhiri dengan perkenalan diri lengkap, tempo sedikit lebih lambat dari biasanya.'] },
  'tips.vokal.kapan': { text: 'Lakukan pemanasan ini setiap pagi selama 2 minggu sebelum mensetsu — bukan hanya di hari H. Otot mulut butuh waktu membangun memori gerak yang baru.' },

  // Q&A
  'contoh.qa': { questions: [
    { q: 'Ceritakan tentang dirimu / Jiko shoukai shite kudasai (自己紹介してください)', tips: ['Jawab secara profesional & relevan (2-3 menit)', 'Struktur: Sekarang → Masa lalu → Masa depan', 'Tonjolkan kemampuan yang relevan dengan kaigo'], example: '"Nama saya [Nama], usia [umur] tahun, berasal dari [kota]. Saat ini saya bekerja sebagai [pekerjaan], namun saya sangat tertarik dengan dunia kaigo karena [alasan]. Sebelumnya, saya pernah [pengalaman relevan]. Saya sedang belajar bahasa Jepang, dan tujuan saya adalah menjadi pekerja kaigo bersertifikat yang bisa berkontribusi nyata bagi masyarakat lansia di Jepang."' },
    { q: 'Kenapa kamu ingin bekerja di kaigo?', tips: ['Tunjukkan minat yang tulus, bukan sekadar "butuh kerja"', 'Kaitkan dengan pengalaman pribadi kalau ada', 'Sebutkan nilai-nilai: empati, kemuliaan, perhatian'], example: '"Saya selalu merasa terpanggil untuk membantu orang lain, terutama lansia. Ketika merawat nenek saya, saya melihat bagaimana tindakan kecil penuh kasih bisa sangat berarti bagi kualitas hidupnya. Kaigo bukan sekadar perawatan fisik — ini soal menjaga martabat dan membawa kebahagiaan. Itulah yang membuat saya ingin menekuni bidang ini."' },
    { q: 'Kenapa Jepang? Kenapa tidak di negara sendiri?', tips: ['Tunjukkan kamu sudah riset', 'Padukan antara peluang + ketertarikan tulus pada Jepang', 'Sebutkan sistem, pelatihan, dan etos kerja Jepang'], example: '"Jepang memiliki salah satu sistem perawatan lansia terbaik di dunia. Saya sangat terkesan dengan penghargaan terhadap martabat dan kualitas hidup. Etos kerja Jepang yang mengutamakan kedisiplinan dan perbaikan terus-menerus adalah nilai yang saya kagumi. Bekerja di sini memberi saya kesempatan tumbuh secara profesional sekaligus berkontribusi bagi masyarakat yang saya hormati."' },
    { q: 'Apakah kamu punya pengalaman dalam bidang kaigo atau perawatan?', tips: ['Pengalaman informal pun dihitung!', 'Gunakan metode STAR (Situasi, Tugas, Aksi, Hasil)', 'Tonjolkan kemampuan yang bisa ditransfer'], example: '"Ya, saya merawat kakek saya selama 2 tahun setelah beliau terkena stroke — membantu mandi, makan, dan latihan mobilitas. Pengalaman itu tidak mudah, tapi mengajarkan saya kesabaran, empati, dan pentingnya komunikasi. Dari sanalah saya semakin yakin ingin menekuni kaigo secara profesional."' },
    { q: 'Apa yang kamu ketahui tentang fasilitas kami?', tips: ['WAJIB riset terlebih dahulu!', 'Sebutkan detail spesifik yang kamu temukan', 'Kaitkan dengan nilai dan tujuanmu'], example: '"Saya tahu bahwa [Nama Fasilitas] adalah panti jompo khusus di [Lokasi] yang melayani [jumlah] penghuni. Saya terkesan dengan filosofi [nilai-nilai] yang dipegang fasilitas ini, dan program pelatihan bahasa Jepang untuk pekerja asing. Lingkungan seperti inilah yang membuat saya ingin berkembang bersama kalian."' },
    { q: 'Apa kelebihan kamu?', tips: ['Pilih 2-3 kelebihan yang relevan dengan kaigo', 'Berikan contoh nyata', 'Kaitkan langsung dengan pekerjaan kaigo'], example: '"Kelebihan utama saya adalah kesabaran, empati, dan kemampuan beradaptasi. Ketika merawat nenek saya yang mengidap demensia, saya belajar untuk tetap tenang dan menyesuaikan cara komunikasi sesuai kebutuhannya. Saya juga sehat secara fisik dan nyaman dengan tuntutan fisik pekerjaan kaigo."' },
    { q: 'Apa kekurangan kamu?', tips: ['Jujur tapi strategis', 'Pilih kekurangan yang nyata, bukan pura-pura rendah hati', 'Tunjukkan kamu aktif memperbaikinya'], example: '"Salah satu hal yang sedang saya kembangkan adalah kemampuan bahasa Jepang. Meskipun sudah bisa percakapan dasar, saya ingin lebih lancar untuk berkomunikasi efektif dengan penghuni dan rekan kerja. Saya rutin les dan berlatih setiap hari — targetnya lancar percakapan dalam tahun pertama bekerja."' },
    { q: 'Bagaimana cara kamu menghadapi tekanan atau situasi sulit?', tips: ['Berikan strategi yang spesifik', 'Gunakan contoh nyata', 'Tunjukkan kecerdasan emosional'], example: '"Saya menarik napas dalam dan memprioritaskan tugas. Saat kakek saya menjadi gelisah, saya tetap tenang, berbicara pelan, dan mengalihkan perhatiannya dengan lembut. Setelah menghadapi situasi sulit, saya selalu refleksi — apa yang bisa saya lakukan lebih baik. Saya juga menjaga kondisi diri sendiri lewat olahraga dan dukungan orang-orang terdekat."' },
    { q: 'Di mana kamu melihat dirimu 5 tahun ke depan?', tips: ['Tunjukkan komitmen jangka panjang', 'Sebutkan pertumbuhan dalam bidang kaigo', 'Seimbangkan ambisi dengan realisme'], example: '"Lima tahun ke depan, saya ingin menjadi pekerja kaigo berpengalaman, mungkin dengan spesialisasi dalam perawatan demensia. Saya juga ingin membantu membimbing pekerja asing baru dan menjembatani perbedaan budaya. Yang paling penting, saya ingin menjadi seseorang yang benar-benar dipercaya oleh penghuni dan keluarga mereka."' },
    { q: 'Apakah kamu punya pertanyaan untuk kami?', tips: ['SELALU siapkan pertanyaan!', 'Tanyakan soal pelatihan, rutinitas harian, tim kerja', 'Hindari bertanya soal gaji di awal'], example: '"Boleh saya tahu lebih tentang proses pelatihan untuk staf baru? Seperti apa rutinitas harian pekerja kaigo di sini? Dan kualitas apa yang paling kamu lihat dari pekerja kaigo yang berhasil di fasilitas ini?"' },
  ]},

  // Online setup
  'online.tech': { items: ['Koneksi internet stabil (minimal 10 Mbps)', 'Komputer atau laptop dengan kamera yang berfungsi', 'Mikrofon berkualitas atau earphone dengan mic', 'Zoom/Google Meet/Teams sudah terpasang dan dicoba', 'Perangkat cadangan siap (ponsel/tablet)', 'Internet cadangan (hotspot ponsel)', 'Charger tersambung selama mensetsu'] },
  'online.testsemua': { items: ['Lakukan uji panggilan 1-2 hari sebelum mensetsu', 'Cek sudut kamera, pencahayaan, dan audio', 'Simpan kontak pewawancara untuk keadaan darurat'] },
  'online.camera': { items: ['Tinggi: kamera sejajar mata (gunakan buku untuk menopang jika perlu)', 'Jarak: tubuh bagian atas terlihat (kepala hingga dada)', 'Kontak mata: pandang kamera, BUKAN video dirimu sendiri'] },
  'online.lighting': { items: ['Cahaya alami: hadap jendela (jangan membelakanginya)', 'Cahaya buatan: lampu meja di depan wajah', 'Hindari: cahaya dari belakang, lampu atas yang terlalu terang'] },
  'online.background': { items: ['Dinding bersih dan netral — putih, krem, atau abu-abu muda', 'Tidak ada kekacauan, cucian, kasur berantakan, atau gerakan mengganggu', 'Latar virtual: coba terlebih dahulu agar tidak kelihatan aneh'] },
  'online.pakaian': { items: ['Minimal berpakaian rapi seperti ke kantor', 'Pilih warna polos (hindari motif ramai)', 'Pria: kemeja berkerah atau polo', 'Wanita: blus atau atasan rapi', 'Hindari warna putih (terlalu menyilaukan di kamera) dan corak mencolok'] },
  'online.grooming': { items: ['Rambut rapi dan tertata', 'Pria: bersih cukuran atau jenggot yang dirawat', 'Wanita: riasan natural', 'Kuku bersih, aksesori minimal', 'Tampil segar dan beristirahat cukup'] },
  'online.protip': { text: 'Berpakaianlah seolah kamu hadir secara langsung. Ini langsung mempengaruhi rasa percaya dirimu dan kesan yang kamu tinggalkan.' },

  // Etika Jepang
  'online.opening': { items: ['Masuk lebih awal: bergabung ke waiting room 5 menit sebelumnya', 'Kesan pertama: kamera ON, mikrofon ON, senyum ramah', 'Membungkuk 15° sambil mengucapkan: "Konnichiwa. Watashi wa [Nama] desu. Kyou wa yoroshiku onegaishimasu." (Selamat siang. Saya [Nama]. Terima kasih untuk hari ini.)', 'Tunggu pewawancara yang memulai pembicaraan'] },
  'online.selama': { items: ['Postur: duduk tegak, tangan di atas pangkuan atau meja', 'Anggukan: anggukkan kepala sebagai tanda mendengarkan (jangan berlebihan)', 'Aizuchi (あいづち): ucapkan "Hai" atau "Sou desu ne" dengan tepat', 'Jeda: tidak apa-apa berhenti sejenak sebelum menjawab — menunjukkan kamu berpikir', 'Hormat: jangan pernah memotong pembicaraan. Tunggu mereka selesai bicara.'] },
  'online.penutup': { items: ['Ucapkan terima kasih sambil membungkuk 30°: "Kyou wa ohanashi dekite, totemo ureshikatta desu. Doumo arigatou gozaimashita." (Saya sangat senang bisa berbicara dengan Anda hari ini. Terima kasih banyak.)', 'Kirim surel ucapan terima kasih dalam 24 jam setelah mensetsu'] },
  'online.darurat': { items: ['Internet putus: tetap tenang → pindah ke hotspot → segera kirim surel → bergabung kembali → minta maaf singkat tanpa berlarut-larut', 'Audio/video pewawancara bermasalah: sampaikan dengan sopan, tawarkan untuk menunggu, tetap sabar', 'Ingat: cara kamu menghadapi masalah teknis mencerminkan karakter aslimu'] },

  // Checklist
  'checklist.w2mat': { items: ['Baca ulang panduan ini secara menyeluruh', 'Buat daftar 10 pertanyaan umum & siapkan jawabannya', 'Riset tentang fasilitas / perusahaan yang melamar', 'Identifikasi 3-5 cerita/pengalaman relevan yang akan diceritakan', 'Latihan menjawab dengan metode STAR'] },
  'checklist.w2jp': { items: ['Latihan jiko shoukai (perkenalan diri) dalam bahasa Jepang', 'Pelajari ungkapan keigo (bahasa hormat) dasar', 'Pelajari kosakata kaigo yang sering digunakan', 'Latihan vokal A-I-U-E-O dengan posisi mulut Jepang setiap pagi'] },
  'checklist.w2mock': { items: ['Jadwalkan simulasi mensetsu #1 bersama teman atau sensei', 'Rekam diri sendiri saat menjawab pertanyaan', 'Tonton rekaman & catat hal-hal yang perlu diperbaiki'] },
  'checklist.w1pol': { items: ['Simulasi mensetsu #2 via Zoom', 'Perbaiki jawaban berdasarkan masukan', 'Latihan membungkuk dan memberi salam secara online', 'Latihan memandang kamera, bukan layar', 'Ulang kosakata kaigo penting'] },
  'checklist.w1tech': { items: ['Uji kamera, mikrofon, dan koneksi internet', 'Siapkan dan tes lokasi mensetsu', 'Tes pencahayaan', 'Perbarui Zoom ke versi terbaru'] },
  'checklist.w1log': { items: ['Konfirmasi jadwal, tanggal, dan tautan Zoom', 'Siapkan pakaian mensetsu & coba di depan kamera', 'Siapkan internet cadangan (hotspot ponsel)'] },
  'checklist.d2prep': { items: ['Simulasi mensetsu #3 — penuh seperti hari H', 'Ulang materi secara menyeluruh', 'Siapkan semua dokumen yang dibutuhkan', 'Uji semua peralatan'] },
  'checklist.d2self': { items: ['Siapkan pakaian (coba di depan kamera)', 'Minum air yang cukup', 'Olahraga ringan', 'Hindari alkohol', 'Bersihkan dan siapkan ruangan mensetsu'] },
  'checklist.nment': { items: ['Latihan visualisasi — bayangkan mensetsu berjalan lancar', 'Ulang materi ringan (jangan belajar hal baru)', 'Tulis afirmasi positif dengan kata-katamu sendiri', 'Rutinitas relaksasi — napas perut 10 menit', 'Ingatkan diri: kamu sudah mempersiapkan ini dengan sungguh-sungguh'] },
  'checklist.nprac': { items: ['Pasang 2-3 alarm', 'Isi daya semua perangkat hingga penuh', 'Tes tautan Zoom satu kali terakhir', 'Taruh pakaian di tempat yang mudah dijangkau', 'Atur semua dokumen', 'Tidur lebih awal (7-8 jam)', 'Beritahu keluarga tentang jadwal mensetsu'] },
  'checklist.m1h': { items: ['Tes kecepatan internet', 'Bergabung ke pertemuan Zoom uji coba', 'Atur ruangan mensetsu (kamera, pencahayaan, latar belakang)', 'Tutup semua program yang tidak diperlukan', 'Alihkan ponsel ke mode diam', 'Pasang tanda "Jangan Ganggu"', 'Siapkan air minum (di luar frame kamera)'] },
  'checklist.m5m': { items: ['Klik tautan Zoom, bergabung ke pertemuan', 'Tunggu di waiting room', 'Kamera ON, Mikrofon ON', 'Duduk tegak — lakukan napas perut 5 kali', 'Pemanasan vokal: A-I-U-E-O perlahan', 'Ekspresi tenang dan percaya diri', 'Siap membungkuk dan memberi salam'] },

  // Mantra
  'checklist.mantra': { main: '"Aku siap. Aku bisa. Aku layak."', sub: 'Semangat dan bangga — kamu sedang melakukan hal baik pada dirimu sendiri. 🌸' },

  // Closing hero
  'closing.main': { text: 'Kamu pasti bisa! Semoga panduan ini membantumu sukses dalam perjalanan menjadi pekerja kaigo di Jepang.' },
  'closing.sub': { text: 'Kepedulianmu akan membuat perbedaan nyata bagi banyak orang. 🙏' },
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
  .mg-cl li { display: flex; align-items: flex-start; gap: 10px; padding: 9px 14px; border-radius: 12px; font-size: 0.875rem; border: 1.5px solid ${t.border}; background: ${t.mist}; transition: all 0.15s; line-height: 1.5; font-weight: 500; color: ${t.body}; cursor: pointer; }
  .mg-cl li::before { content: '○'; color: ${t.sub}; font-size: 0.9rem; flex-shrink: 0; margin-top: 1px; }
  .mg-cl li:hover { border-color: ${t.primaryMid}; background: ${t.primarySoft}; }
  .mg-cl li.done { background: ${t.emeraldSoft}; border-color: ${t.emerald}; color: ${t.emerald}; text-decoration: line-through; text-decoration-color: ${t.emerald}; }
  .mg-cl li.done::before { content: '✓'; color: ${t.emerald}; font-weight: 900; }

  .mg-box { border-radius: 14px; padding: 14px 18px; margin: 10px 0; border-left: 4px solid; }
  .mg-box.p { background: ${t.primarySoft}; border-color: ${t.primary}; }
  .mg-box.s { background: ${t.emeraldSoft}; border-color: ${t.emerald}; }
  .mg-box.w { background: ${t.amberSoft}; border-color: ${t.amber}; }
  .mg-box.d { background: #FFF1F2; border-color: #F43F5E; }
  .mg-box-ttl { font-weight: 900; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 7px; }
  .mg-box.p .mg-box-ttl { color: ${t.primary}; }
  .mg-box.s .mg-box-ttl { color: ${t.emerald}; }
  .mg-box.w .mg-box-ttl { color: ${t.amber}; }
  .mg-box.d .mg-box-ttl { color: #F43F5E; }
  .mg-box p, .mg-box li { font-size: 0.875rem; line-height: 1.65; color: ${t.body}; }
  .mg-box ul, .mg-box ol { padding-left: 18px; display: flex; flex-direction: column; gap: 3px; margin-top: 4px; }

  .mg-tips-box { background: #FFFBEB; border: 1.5px solid #FCD34D; border-radius: 12px; padding: 13px 16px; margin-bottom: 10px; }
  .mg-tips-box h4 { font-size: 0.74rem; color: ${t.amber}; font-weight: 900; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
  .mg-tips-box ul { padding-left: 16px; }
  .mg-tips-box li { font-size: 0.86rem; line-height: 1.55; color: ${t.body}; }

  .mg-eg { background: ${t.primarySoft}; border: 1.5px solid #C7D2FE; border-radius: 12px; padding: 14px 18px; font-size: 0.875rem; line-height: 1.7; color: ${t.body}; }
  .mg-eg strong { color: ${t.primary}; }

  .mg-ul, .mg-ol { padding-left: 20px; display: flex; flex-direction: column; gap: 5px; margin: 7px 0; }
  .mg-ul li, .mg-ol li { font-size: 0.9rem; line-height: 1.65; color: ${t.body}; }
  .mg-ul li strong, .mg-ol li strong { color: ${t.ink}; font-weight: 700; }

  .mg-arr { list-style: none; display: flex; flex-direction: column; gap: 6px; margin: 10px 0; }
  .mg-arr li { padding: 11px 16px 11px 40px; border-radius: 12px; background: ${t.white}; border: 1.5px solid ${t.border}; font-size: 0.875rem; line-height: 1.55; position: relative; font-weight: 500; color: ${t.body}; }
  .mg-arr li::before { content: '→'; position: absolute; left: 14px; color: ${t.primary}; font-weight: 900; }
  .mg-arr li strong { color: ${t.ink}; }

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
  .mg-vk.id h5 { color: #EA580C; } .mg-vk.jp h5 { color: ${t.primary}; }
  .mg-vk p { font-size: 0.85rem; line-height: 1.6; color: ${t.body}; }

  .mg-mantra { background: linear-gradient(135deg, ${t.primary} 0%, #7C3AED 100%); border-radius: 20px; padding: 24px 28px; text-align: center; margin-top: 14px; }
  .mg-mantra-main { font-family: ${font.jp}; font-size: 1.1rem; font-weight: 700; color: white; line-height: 1.7; }
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

  /* Edit system */
  .mg-ew { position: relative; }
  .mg-ew:hover > .mg-eb { opacity: 1; }
  .mg-eb { position: absolute; top: -9px; right: -9px; z-index: 10; width: 28px; height: 28px; border-radius: 50%; background: ${t.primary}; color: white; border: 2.5px solid white; font-size: 0.7rem; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.18s; box-shadow: 0 2px 8px rgba(79,70,229,0.4); }
  .mg-eb:hover { transform: scale(1.12); opacity: 1 !important; }
  .mg-save-badge { position: fixed; bottom: 80px; right: 28px; background: ${t.emerald}; color: white; font-size: 0.75rem; font-weight: 700; padding: 6px 14px; border-radius: 99px; box-shadow: 0 2px 10px rgba(16,185,129,0.4); animation: mgFIn 0.2s ease; z-index: 200; }
  @keyframes mgFIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

  .mg-mo { position: fixed; inset: 0; background: rgba(17,24,39,0.55); display: flex; align-items: center; justify-content: center; z-index: 300; padding: 20px; backdrop-filter: blur(3px); }
  .mg-md { background: white; border-radius: 24px; padding: 28px; width: 100%; max-width: 580px; max-height: 82vh; overflow-y: auto; box-shadow: 0 24px 64px rgba(0,0,0,0.22); }
  .mg-md h3 { font-size: 1rem; font-weight: 900; color: ${t.ink}; margin-bottom: 18px; }
  .mg-mf { margin-bottom: 12px; }
  .mg-mf label { display: block; font-size: 0.73rem; font-weight: 700; color: ${t.sub}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
  .mg-mf input, .mg-mf textarea { width: 100%; padding: 9px 13px; border: 1.5px solid ${t.borderMid}; border-radius: 10px; font-size: 0.88rem; font-family: ${font.body}; color: ${t.ink}; outline: none; transition: border-color 0.15s; resize: vertical; background: ${t.mist}; }
  .mg-mf input:focus, .mg-mf textarea:focus { border-color: ${t.primary}; background: white; }
  .mg-mi { display: flex; gap: 7px; margin-bottom: 6px; align-items: flex-start; }
  .mg-mi input { flex: 1; }
  .mg-mi-del { width: 30px; height: 30px; border-radius: 8px; border: none; background: #FFF1F2; color: #F43F5E; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 3px; }
  .mg-mi-del:hover { background: #F43F5E; color: white; }
  .mg-madd { width: 100%; padding: 8px; border: 1.5px dashed ${t.borderMid}; border-radius: 10px; background: transparent; color: ${t.sub}; font-size: 0.82rem; font-weight: 700; cursor: pointer; margin-top: 2px; }
  .mg-madd:hover { border-color: ${t.primary}; color: ${t.primary}; background: ${t.primarySoft}; }
  .mg-mact { display: flex; gap: 8px; margin-top: 20px; }
  .mg-msave { flex: 1; padding: 11px; background: ${t.primary}; color: white; border: none; border-radius: 12px; font-size: 0.88rem; font-weight: 700; cursor: pointer; }
  .mg-msave:hover { background: ${t.primaryMid}; }
  .mg-mcancel { padding: 11px 18px; background: ${t.border}; color: ${t.body}; border: none; border-radius: 12px; font-size: 0.88rem; font-weight: 700; cursor: pointer; }
  .mg-mcancel:hover { background: ${t.borderMid}; }
  .mg-qa-block { border: 1.5px solid ${t.border}; border-radius: 12px; padding: 14px; margin-bottom: 10px; }
  .mg-qa-block label { display: block; font-size: 0.72rem; font-weight: 700; color: ${t.sub}; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 4px; margin-top: 8px; }
  .mg-qa-block label:first-child { margin-top: 0; }
`;

// ─── Main Component ───────────────────────────────────────────────────────────
const MensetsuGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState('intro');
  const [showBtt, setShowBtt] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ci, setCi] = useState<Record<string, boolean>>({});   // checkedItems
  const [content, setContent] = useState<Record<string, any>>(DC);
  const [loading, setLoading] = useState(true);
  const [saveBadge, setSaveBadge] = useState(false);
  const [modal, setModal] = useState<{ key: string; type: string } | null>(null);
  const [draft, setDraft] = useState<any>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  // Load from Supabase
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('guide_content').select('block_key, content');
        if (data?.length) {
          const merged = { ...DC };
          data.forEach((r: any) => { merged[r.block_key] = r.content; });
          setContent(merged);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  // Scroll handler
  useEffect(() => {
    const fn = () => {
      setShowBtt(window.pageYOffset > 300);
      document.querySelectorAll('.mg-sec').forEach(s => {
        if (window.pageYOffset >= (s as HTMLElement).offsetTop - 200)
          setActiveSection(s.getAttribute('id') || 'intro');
      });
    };
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

// Progress tracker — tiap kotak = 20%, ada 5 kotak
useEffect(() => {
  const SECTIONS = ['w2', 'w1', 'd2', 'nm', 'm'];
  const completedSections = SECTIONS.filter(pfx =>
    document.querySelectorAll(`.mg-cl li[class]`).length >= 0 &&
    (() => {
      const allInSection = Object.keys(ci).filter(k => k.startsWith(pfx + '-'));
      return allInSection.length > 0 && allInSection.every(k => ci[k]);
    })()
  ).length;
  setProgress(completedSections * 20);
}, [ci]);

  const saveBlock = useCallback(async (key: string, val: any) => {
    setContent(p => ({ ...p, [key]: val }));
    try {
      await supabase.from('guide_content').upsert({ block_key: key, content: val, updated_at: new Date().toISOString() }, { onConflict: 'block_key' });
      setSaveBadge(true);
      setTimeout(() => setSaveBadge(false), 2000);
    } catch (e) { console.error(e); }
  }, []);

  const openEdit = (key: string, type: string) => {
    setDraft(JSON.parse(JSON.stringify(content[key] ?? DC[key] ?? {})));
    setModal({ key, type });
  };
  const closeModal = () => { setModal(null); setDraft(null); };
  const commitEdit = () => { if (modal && draft) saveBlock(modal.key, draft); closeModal(); };
  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); setActiveSection(id); };
  const toggleCheck = (id: string) => setCi(p => ({ ...p, [id]: !p[id] }));
  const c = content;

  // ─── Sub-components ──────────────────────────────────────────────────────────
  const E: React.FC<{ bk: string; type: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ bk, type, children, style }) => (
    <div className="mg-ew" style={{ position: 'relative', ...style }}>
      {children}
      <button className="mg-eb" onClick={() => openEdit(bk, type)} title="Edit">✎</button>
    </div>
  );

  const Coll: React.FC<{ title: string; icon?: string; children: React.ReactNode }> = ({ title, icon, children }) => {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ marginBottom: '7px' }}>
        <div className={`mg-coll-hdr ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{icon && <span>{icon}</span>}<span>{title}</span></span>
          <span style={{ fontSize: '0.68rem', opacity: 0.7, display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
        </div>
        {open && <div className="mg-coll-body">{children}</div>}
      </div>
    );
  };

  const EColl: React.FC<{ bk: string; children: React.ReactNode }> = ({ bk, children }) => (
    <E bk={bk} type="coll">
      <Coll title={c[bk]?.title || ''} icon={c[bk]?.icon}>
        {children}
      </Coll>
    </E>
  );

  const CL: React.FC<{ bk: string; pfx: string }> = ({ bk, pfx }) => {
    const items: string[] = c[bk]?.items || [];
    return (
      <E bk={bk} type="items">
        <ul className="mg-cl">
          {items.map((item, i) => { const id = `${pfx}-${i}`; return <li key={id} className={ci[id] ? 'done' : ''} onClick={() => toggleCheck(id)}>{item}</li>; })}
        </ul>
      </E>
    );
  };

  const EItems: React.FC<{ bk: string; tag?: 'ul' | 'ol'; cls?: string }> = ({ bk, tag = 'ul', cls }) => {
    const items: string[] = c[bk]?.items || [];
    const Tag = tag;
    return (
      <E bk={bk} type="items">
        <Tag className={cls || (tag === 'ol' ? 'mg-ol' : 'mg-ul')}>
          {items.map((item, i) => <li key={i}>{item}</li>)}
        </Tag>
      </E>
    );
  };

  const EP: React.FC<{ bk: string; style?: React.CSSProperties }> = ({ bk, style }) => (
    <E bk={bk} type="text">
      <p style={{ color: t.body, lineHeight: 1.75, fontSize: '0.9rem', ...style }} dangerouslySetInnerHTML={{ __html: c[bk]?.text || '' }} />
    </E>
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
  const Sub: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 style={{ fontSize: '0.92rem', fontWeight: 900, color: t.ink, marginBottom: '10px', marginTop: '24px', paddingBottom: '8px', borderBottom: `2px solid ${t.border}` }}>{children}</h3>;
  const H4s: React.FC<{ children: React.ReactNode; mt?: boolean }> = ({ children, mt }) => <h4 style={{ fontSize: '0.74rem', fontWeight: 900, color: t.sub, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '7px', marginTop: mt ? '14px' : undefined }}>{children}</h4>;
  const Sec: React.FC<{ children: React.ReactNode }> = ({ children }) => <div style={{ background: t.white, borderRadius: '32px', padding: '34px', marginBottom: '14px', boxShadow: t.shadow, border: `1.5px solid ${t.border}` }}>{children}</div>;
  const Box: React.FC<{ v: 'p'|'s'|'w'|'d'; title: string; bk?: string; children?: React.ReactNode }> = ({ v, title, bk, children }) => {
    const colors = { p: t.primary, s: t.emerald, w: t.amber, d: '#F43F5E' };
    const inner = <div className={`mg-box ${v}`}><div className="mg-box-ttl" style={{ color: colors[v] }}>{title}</div>{children || <p dangerouslySetInnerHTML={{ __html: c[bk!]?.text || '' }} />}</div>;
    return bk ? <E bk={bk} type="text">{inner}</E> : inner;
  };

  const navItems = [
    { id: 'intro', icon: '🏠', label: 'Intro' },
    { id: 'persiapan', icon: '📚', label: 'Persiapan' },
    { id: 'tips', icon: '💡', label: 'Tips Praktis' },
    { id: 'contoh', icon: '🗣️', label: 'Contoh Jawaban' },
    { id: 'online', icon: '💻', label: 'Etika Online' },
    { id: 'checklist', icon: '✅', label: 'Checklist' },
  ];

  // ─── Edit Modal ───────────────────────────────────────────────────────────────
  const Modal = () => {
    if (!modal || !draft) return null;
    const { type } = modal;
    const updItem = (i: number, val: string) => { const a = [...draft.items]; a[i] = val; setDraft({ ...draft, items: a }); };
    const delItem = (i: number) => setDraft({ ...draft, items: draft.items.filter((_: any, j: number) => j !== i) });
    const addItem = () => setDraft({ ...draft, items: [...(draft.items || []), ''] });

    return (
      <div className="mg-mo" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
        <div className="mg-md">
          <h3>✎ Edit Konten</h3>

          {(type === 'text') && (
            <div className="mg-mf"><label>Teks</label>
              <textarea rows={4} value={draft.text || ''} onChange={e => setDraft({ ...draft, text: e.target.value })} />
            </div>
          )}

          {(type === 'items' || type === 'coll') && (
            <>
              {type === 'coll' && (
                <div className="mg-2col" style={{ marginBottom: '12px' }}>
                  <div className="mg-mf"><label>Judul</label><input value={draft.title || ''} onChange={e => setDraft({ ...draft, title: e.target.value })} /></div>
                  <div className="mg-mf"><label>Ikon (emoji)</label><input value={draft.icon || ''} onChange={e => setDraft({ ...draft, icon: e.target.value })} /></div>
                </div>
              )}
              <div className="mg-mf"><label>Item — klik × untuk hapus</label>
                {(draft.items || []).map((item: string, i: number) => (
                  <div key={i} className="mg-mi">
                    <input value={item} onChange={e => updItem(i, e.target.value)} />
                    <button className="mg-mi-del" onClick={() => delItem(i)}>×</button>
                  </div>
                ))}
                <button className="mg-madd" onClick={addItem}>+ Tambah item</button>
              </div>
            </>
          )}

          {type === 'qa' && (
            <div className="mg-mf"><label>Pertanyaan & Jawaban</label>
              {(draft.questions || []).map((qa: any, i: number) => (
                <div key={i} className="mg-qa-block">
                  <label>Pertanyaan {i + 1}</label>
                  <input value={qa.q} onChange={e => { const a = [...draft.questions]; a[i] = { ...a[i], q: e.target.value }; setDraft({ ...draft, questions: a }); }} />
                  <label>Contoh Jawaban</label>
                  <textarea rows={3} value={qa.example} onChange={e => { const a = [...draft.questions]; a[i] = { ...a[i], example: e.target.value }; setDraft({ ...draft, questions: a }); }} />
                  <label>Tips (satu per baris)</label>
                  <textarea rows={2} value={(qa.tips || []).join('\n')} onChange={e => { const a = [...draft.questions]; a[i] = { ...a[i], tips: e.target.value.split('\n') }; setDraft({ ...draft, questions: a }); }} />
                </div>
              ))}
            </div>
          )}

          {type === 'mantra' && (
            <>
              <div className="mg-mf"><label>Mantra Utama</label><input value={draft.main || ''} onChange={e => setDraft({ ...draft, main: e.target.value })} /></div>
              <div className="mg-mf"><label>Kalimat Penyemangat</label><textarea rows={2} value={draft.sub || ''} onChange={e => setDraft({ ...draft, sub: e.target.value })} /></div>
            </>
          )}

          {type === 'cards' && (
            <div className="mg-mf"><label>Kartu</label>
              {(draft.cards || []).map((card: any, i: number) => (
                <div key={i} style={{ border: `1.5px solid ${t.border}`, borderRadius: '12px', padding: '12px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                    <input value={card.icon} style={{ width: '60px' }} placeholder="emoji" onChange={e => { const a = [...draft.cards]; a[i] = { ...a[i], icon: e.target.value }; setDraft({ ...draft, cards: a }); }} />
                    <input value={card.title} style={{ flex: 1 }} placeholder="Judul" onChange={e => { const a = [...draft.cards]; a[i] = { ...a[i], title: e.target.value }; setDraft({ ...draft, cards: a }); }} />
                  </div>
                  <textarea rows={2} value={card.desc} placeholder="Deskripsi" onChange={e => { const a = [...draft.cards]; a[i] = { ...a[i], desc: e.target.value }; setDraft({ ...draft, cards: a }); }} />
                </div>
              ))}
            </div>
          )}

          {type === 'closing' && (
            <>
              <div className="mg-mf"><label>Kalimat Utama</label><textarea rows={2} value={draft.text || ''} onChange={e => setDraft({ ...draft, text: e.target.value })} /></div>
              <div className="mg-mf"><label>Kalimat Kedua</label><input value={draft.sub || ''} onChange={e => setDraft({ ...draft, sub: e.target.value })} /></div>
            </>
          )}

          <div className="mg-mact">
            <button className="mg-mcancel" onClick={closeModal}>Batal</button>
            <button className="mg-msave" onClick={commitEdit}>💾 Simpan</button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: t.sub, fontFamily: font.body }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>⏳</div><div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Memuat panduan...</div></div>
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="mg">
        {saveBadge && <div className="mg-save-badge">✓ Tersimpan</div>}
        <Modal />

        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'grid', gridTemplateColumns: '210px 1fr', gap: '22px', padding: '26px 18px', alignItems: 'start' }}>

          {/* Sidebar */}
          <nav style={{ position: 'sticky', top: '20px', background: t.white, borderRadius: '26px', padding: '18px', boxShadow: t.shadow, border: `1.5px solid ${t.border}` }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', color: t.primary, marginBottom: '12px', paddingBottom: '12px', borderBottom: `1.5px solid ${t.border}` }}>📖 Menu Panduan</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {navItems.map(n => (
                <li key={n.id}><a href={`#${n.id}`} className={`mg-nav-link ${activeSection === n.id ? 'active' : ''}`} onClick={e => { e.preventDefault(); scrollTo(n.id); }}><span>{n.icon}</span>{n.label}</a></li>
              ))}
            </ul>
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: `1.5px solid ${t.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: t.sub, textTransform: 'uppercase', letterSpacing: '1px' }}>Kemajuan</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: t.primary }}>{Math.round(progress)}%</span>
              </div>
              <div className="mg-progress-track"><div className="mg-progress-fill" style={{ width: `${progress}%` }} /></div>
              {progress > 0 && <p style={{ fontSize: '0.68rem', color: t.emerald, marginTop: '5px', textAlign: 'center', fontWeight: 700 }}>{progress === 100 ? '🎉 Gambatte!' : '頑張れ！'}</p>}
            </div>
            <div style={{ marginTop: '14px', background: t.primarySoft, borderRadius: '14px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontFamily: font.jp, fontSize: '1.4rem', color: t.primary, fontWeight: 700 }}>面接</div>
              <div style={{ fontSize: '0.63rem', color: t.sub, marginTop: '2px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>Panduan Mensetsu</div>
            </div>
          </nav>

          {/* Main */}
          <main ref={mainRef} style={{ minWidth: 0 }}>

            {/* Hero */}
            <div style={{ background: `linear-gradient(135deg, ${t.ink} 0%, #3730A3 100%)`, borderRadius: '36px', padding: '42px 38px', marginBottom: '18px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-8px', top: '-12px', fontFamily: font.jp, fontSize: '120px', color: 'rgba(255,255,255,0.04)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>介</div>
              <span style={{ display: 'inline-block', background: t.primary, color: 'white', fontSize: '0.66rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '99px', marginBottom: '14px' }}>Tokutei Ginou Kaigo</span>
              <h1 style={{ fontFamily: font.jp, fontSize: '1.9rem', fontWeight: 700, color: 'white', lineHeight: 1.25, marginBottom: '8px' }}>📝 Panduan Mensetsu Online</h1>
              <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: '0.92rem' }}>Panduan Lengkap Wawancara — Dari Persiapan hingga Hari-H</p>
            </div>

            {/* ── INTRO ── */}
            <Sec><section id="intro" className="mg-sec">
              <ST icon="🏠">Pengantar</ST>
              <EP bk="intro.p1" style={{ marginBottom: '10px' }} />
              <EP bk="intro.p2" style={{ marginBottom: '16px' }} />
              <E bk="intro.tujuan" type="items">
                <div className="mg-box p">
                  <div className="mg-box-ttl" style={{ color: t.primary }}>{c['intro.tujuan']?.title}</div>
                  <ul className="mg-ul">{(c['intro.tujuan']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
                </div>
              </E>
            </section></Sec>

            {/* ── PERSIAPAN ── */}
            <Sec><section id="persiapan" className="mg-sec">
              <ST icon="📚">Persiapan Materi</ST>
              <Sub>📋 Kenali Diri Sendiri</Sub>

              <EColl bk="persiapan.motivasi">
                <H4s>Pertanyaan untuk direnungkan:</H4s>
                <ul className="mg-ul">{(c['persiapan.motivasi']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
                {c['persiapan.motivasi']?.warning && <div className="mg-box w" style={{ marginTop: '10px' }}><div className="mg-box-ttl" style={{ color: t.amber }}>⚠️ Catatan</div><p>{c['persiapan.motivasi'].warning}</p></div>}
              </EColl>

              <EColl bk="persiapan.pengalaman">
                <ul className="mg-ul">{(c['persiapan.pengalaman']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
                <div className="mg-box s" style={{ marginTop: '10px' }}><div className="mg-box-ttl" style={{ color: t.emerald }}>✅ Metode STAR</div><p>Ceritakan pengalaman dengan format: <strong>S</strong>ituasi → <strong>T</strong>ugas → <strong>A</strong>ksi → <strong>H</strong>asil</p></div>
              </EColl>

              <EColl bk="persiapan.pengetahuan">
                <ul className="mg-ul">{(c['persiapan.pengetahuan']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
              </EColl>

              <Sub>🏢 Riset tentang Fasilitas</Sub>
              <E bk="persiapan.facility" type="items">
                <div className="mg-box p">
                  <div className="mg-box-ttl" style={{ color: t.primary }}>{c['persiapan.facility']?.title}</div>
                  <ul className="mg-ul">{(c['persiapan.facility']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
                </div>
              </E>
            </section></Sec>

            {/* ── TIPS ── */}
            <Sec><section id="tips" className="mg-sec">
              <ST icon="💡">Tips Praktis</ST>

              <Sub>🎯 Yang Perlu Dilakukan & Dihindari</Sub>
              <div className="mg-2col">
                <E bk="tips.dos" type="items">
                  <div className="mg-dos"><h4>✅ Yang Dilakukan</h4><ul className="mg-ul">{(c['tips.dos']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul></div>
                </E>
                <E bk="tips.donts" type="items">
                  <div className="mg-donts"><h4>❌ Yang Dihindari</h4><ul className="mg-ul">{(c['tips.donts']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul></div>
                </E>
              </div>

              <Sub>🗣️ Tips Menjawab Pertanyaan</Sub>

              <EColl bk="tips.struktur">
                <EItems bk="tips.struktur" tag="ol" />
              </EColl>

              <EColl bk="tips.sulit">
                <EItems bk="tips.sulit" />
              </EColl>

              <EColl bk="tips.tidaktahu">
                <EItems bk="tips.tidaktahu" tag="ol" />
              </EColl>

              <Sub>🧠 Mengelola Rasa Gugup (Kinchousuru / 緊張する)</Sub>
              <div className="mg-box w"><div className="mg-box-ttl" style={{ color: t.amber }}>Itu Wajar! 💛</div><p>Merasa gugup sebelum mensetsu adalah hal yang sangat normal. Bahkan profesional berpengalaman pun merasakannya. Kuncinya bukan menghilangkan rasa gugup, tapi mengelolanya dengan baik.</p></div>
              <E bk="tips.nervous" type="items">
                <ul className="mg-arr" style={{ marginTop: '10px' }}>{(c['tips.nervous']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
              </E>

              <Sub>🫁 Napas Perut — Fondasi Suara & Ketenangan</Sub>
              <Box v="p" title="💡 Kenapa Ini Penting?" bk="tips.napas.infobox" />
              <Coll title="Cara Melakukan Napas Perut" icon="🫁">
                <H4s>Langkah-langkah:</H4s>
                <EItems bk="tips.napas.steps" tag="ol" />
                <Box v="s" title="✅ Tanda Berhasil" bk="tips.napas.berhasil" />
              </Coll>

              <Coll title="Duduk Tegak = Napas Lebih Dalam + Rasa Percaya Diri" icon="🪑">
                <EP bk="tips.postur.intro" style={{ marginBottom: '14px', fontWeight: 500 }} />
                <E bk="tips.postur.cards" type="cards">
                  <div className="mg-2col">
                    {(c['tips.postur.cards']?.cards || []).map((card: any, i: number) => (
                      <div key={i} className="mg-pcard">
                        <div className="mg-pcard-ico">{card.icon}</div>
                        <div className="mg-pcard-ttl">{card.title}</div>
                        <p style={{ fontSize: '0.82rem', color: t.body, lineHeight: 1.55 }}>{card.desc}</p>
                      </div>
                    ))}
                  </div>
                </E>
                <Box v="w" title="💡 Cek Postur Sebelum Mensetsu" bk="tips.postur.quickcheck" />
              </Coll>

              <Sub>👄 Vokal Jepang — Mulut, Lidah & Otot yang Baru</Sub>
              <Box v="p" title="🎌 Kenapa Ini Berbeda?" bk="tips.vokal.info" />
              <Coll title="Cara Kerja Mulut & Lidah untuk Vokal Jepang" icon="👄">
                <div className="mg-vkcmp">
                  <div className="mg-vk id">
                    <h5>🇮🇩 Bahasa Indonesia</h5>
                    <E bk="tips.vokal.id" type="text"><p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: t.body }}>{c['tips.vokal.id']?.text}</p></E>
                  </div>
                  <div className="mg-vk jp">
                    <h5>🇯🇵 Bahasa Jepang</h5>
                    <E bk="tips.vokal.jp" type="text"><p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: t.body }}>{c['tips.vokal.jp']?.text}</p></E>
                  </div>
                </div>
                <H4s mt>Posisi Mulut yang Benar:</H4s>
                <EItems bk="tips.vokal.posisi" />
                <Box v="s" title="🏆 Tanda Kamu Di Jalur yang Benar" bk="tips.vokal.pegel" />
              </Coll>

              <Coll title="Pemanasan Vokal Sebelum Mensetsu" icon="🎤">
                <H4s>Pemanasan 5 menit:</H4s>
                <EItems bk="tips.vokal.warmup" tag="ol" />
                <Box v="w" title="⏰ Kapan Mulai Latihan?" bk="tips.vokal.kapan" />
              </Coll>
            </section></Sec>

            {/* ── CONTOH JAWABAN ── */}
            <Sec><section id="contoh" className="mg-sec">
              <ST icon="🗣️">Contoh Jawaban</ST>
              <Sub>🔥 10 Pertanyaan yang Sering Ditanyakan</Sub>
              <E bk="contoh.qa" type="qa">
                <div>
                  {(c['contoh.qa']?.questions || []).map((item: any, i: number) => (
                    <Coll key={i} title={`${i + 1}. ${item.q}`} icon="❓">
                      <div className="mg-tips-box"><h4>💡 Tips:</h4><ul className="mg-ul">{(item.tips || []).map((tip: string, j: number) => <li key={j}>{tip}</li>)}</ul></div>
                      <div className="mg-eg"><strong>📝 Contoh Jawaban:</strong><p style={{ marginTop: '8px' }}>{item.example}</p></div>
                    </Coll>
                  ))}
                </div>
              </E>
            </section></Sec>

            {/* ── ONLINE ── */}
            <Sec><section id="online" className="mg-sec">
              <ST icon="💻">Etika Wawancara Online</ST>

              <Sub>🎥 Persiapan Teknis</Sub>
              <div className="mg-box p">
                <div className="mg-box-ttl" style={{ color: t.primary }}>🖥️ Daftar Peralatan:</div>
                <CL bk="online.tech" pfx="tech" />
              </div>
              <E bk="online.testsemua" type="items">
                <div className="mg-box w">
                  <div className="mg-box-ttl" style={{ color: t.amber }}>⚠️ Uji Semua Sebelum Hari-H!</div>
                  <ul className="mg-ul">{(c['online.testsemua']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
                </div>
              </E>

              <Sub>📹 Kamera & Latar Belakang</Sub>
              <Coll title="Posisi Kamera" icon="📷"><EItems bk="online.camera" /></Coll>
              <Coll title="Pencahayaan" icon="💡"><EItems bk="online.lighting" /></Coll>
              <Coll title="Latar Belakang (Background)" icon="🖼️"><EItems bk="online.background" /></Coll>

              <Sub>👔 Penampilan & Kode Berpakaian</Sub>
              <div className="mg-2col">
                <E bk="online.pakaian" type="items"><div className="mg-acard"><h4>👕 Pakaian</h4><ul className="mg-ul">{(c['online.pakaian']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul></div></E>
                <E bk="online.grooming" type="items"><div className="mg-acard"><h4>💇 Penampilan Diri</h4><ul className="mg-ul">{(c['online.grooming']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul></div></E>
              </div>
              <Box v="s" title="✨ Tips Penting" bk="online.protip" />

              <Sub>🙏 Tata Krama Mensetsu Jepang (Nihon no Reigi / 日本の礼儀)</Sub>
              <Coll title="Pembukaan & Salam" icon="👋">
                <EItems bk="online.opening" tag="ol" />
              </Coll>
              <Coll title="Selama Mensetsu Berlangsung" icon="💬">
                <EItems bk="online.selama" />
              </Coll>
              <Coll title="Penutupan" icon="🏁">
                <EItems bk="online.penutup" tag="ol" />
              </Coll>

              <Sub>🚨 Mengatasi Masalah Teknis</Sub>
              <E bk="online.darurat" type="items">
                <div className="mg-box d">
                  <div className="mg-box-ttl" style={{ color: '#F43F5E' }}>⚠️ Rencana Darurat</div>
                  <ul className="mg-ul">{(c['online.darurat']?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
                </div>
              </E>
            </section></Sec>

            {/* ── CHECKLIST ── */}
            <Sec><section id="checklist" className="mg-sec">
              <ST icon="✅">Checklist Persiapan</ST>
              <p style={{ color: t.body, fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '20px' }}>Klik setiap item untuk menandainya selesai. Arahkan kursor ke blok untuk mengedit isinya.</p>

              <Coll title="2-3 Minggu Sebelum" icon="📋">
                <H4s>Materi:</H4s><CL bk="checklist.w2mat" pfx="w2m" />
                <H4s mt>Bahasa Jepang:</H4s><CL bk="checklist.w2jp" pfx="w2j" />
                <H4s mt>Simulasi Mensetsu:</H4s><CL bk="checklist.w2mock" pfx="w2k" />
              </Coll>
              <Coll title="1 Minggu Sebelum" icon="📋">
                <H4s>Perbaikan & Polesan:</H4s><CL bk="checklist.w1pol" pfx="w1p" />
                <H4s mt>Teknis:</H4s><CL bk="checklist.w1tech" pfx="w1t" />
                <H4s mt>Logistik:</H4s><CL bk="checklist.w1log" pfx="w1l" />
              </Coll>
              <Coll title="1-2 Hari Sebelum" icon="📋">
                <H4s>Persiapan Akhir:</H4s><CL bk="checklist.d2prep" pfx="d2p" />
                <H4s mt>Perawatan Diri:</H4s><CL bk="checklist.d2self" pfx="d2s" />
              </Coll>
              <Coll title="Malam H-1" icon="🌙">
                <H4s>Persiapan Mental:</H4s><CL bk="checklist.nment" pfx="nm" />
                <H4s mt>Persiapan Praktis:</H4s><CL bk="checklist.nprac" pfx="np" />
              </Coll>
              <Coll title="Pagi Hari-H" icon="☀️">
                <H4s>1 Jam Sebelum:</H4s><CL bk="checklist.m1h" pfx="m1h" />
                <H4s mt>5 Menit Sebelum:</H4s><CL bk="checklist.m5m" pfx="m5m" />
                <E bk="checklist.mantra" type="mantra">
                  <div className="mg-mantra">
                    <div className="mg-mantra-main">{c['checklist.mantra']?.main}</div>
                    <div className="mg-mantra-sub">{c['checklist.mantra']?.sub}</div>
                  </div>
                </E>
              </Coll>
            </section></Sec>

            {/* Closing */}
            <E bk="closing.main" type="closing">
              <div style={{ background: `linear-gradient(135deg, ${t.ink} 0%, #3730A3 100%)`, borderRadius: '36px', padding: '46px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', fontFamily: font.jp, fontSize: '150px', color: 'rgba(255,255,255,0.03)', pointerEvents: 'none', userSelect: 'none', lineHeight: 1 }}>頑</div>
                <div style={{ fontFamily: font.jp, fontSize: '1.9rem', color: 'white', marginBottom: '12px', fontWeight: 700 }}>💪 がんばってください！</div>
                <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.92rem', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: c['closing.main']?.text || '' }} />
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.82rem', marginTop: '10px' }}>{c['closing.main']?.sub || c['closing.sub']?.text}</p>
              </div>
            </E>

          </main>
        </div>
        <button className={`mg-btt ${showBtt ? 'show' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Kembali ke atas">↑</button>
      </div>
    </>
  );
};

export default MensetsuGuide;
