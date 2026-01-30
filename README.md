# 🎌 Mensetsu Practice - Latihan Wawancara Care Giver Jepang

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

Aplikasi interaktif untuk latihan wawancara (mensetsu/面接) posisi Care Giver di Jepang. Dilengkapi dengan 43+ pertanyaan umum, jawaban lengkap dalam 3 bahasa (Jepang/Romaji/Indonesia), dan berbagai mode latihan.

## ✨ Fitur

### 🎯 3 Mode Latihan
- **📖 Mode Latihan** - Belajar santai, bisa lihat jawaban kapan saja
- **⏱️ Mode Ujian** - Simulasi wawancara real dengan timer 30 detik
- **🎲 Mode Random** - Pertanyaan acak agar tidak hafalan urutan

### 📊 Tracking & Progress
- Real-time progress tracking
- Statistik pertanyaan yang sudah dikuasai
- Visual progress bar
- Completion screen dengan hasil akhir

### 🌐 Multi-Language Support
- **Bahasa Jepang** (Hiragana/Kanji)
- **Romaji** (Cara baca)
- **Bahasa Indonesia** (Terjemahan)

### 📱 Responsive Design
- Mobile-friendly
- Tablet-friendly
- Desktop-optimized
- PWA-ready (bisa di-install seperti app native)

## 🚀 Demo

**[Live Demo](https://your-domain.com)** ← Ganti dengan domain kamu

## 📦 Instalasi

### Opsi 1: Langsung Buka (Tanpa Install)
1. Download repository ini
2. Buka file `index.html` di browser
3. Mulai latihan!

### Opsi 2: Deploy ke GitHub Pages
1. Fork repository ini
2. Ke Settings → Pages
3. Source: pilih `main` branch
4. Save
5. Akses di `https://username.github.io/mensetsu-practice`

### Opsi 3: Deploy ke Vercel/Netlify
1. Connect repository ke Vercel/Netlify
2. Deploy otomatis
3. Custom domain (opsional)

## 📚 Resources

### Cheat Sheet
File `assets/cheatsheet.md` berisi rangkuman lengkap semua jawaban untuk dipelajari offline.

**Isi:**
- Jikoshoukai (Perkenalan Diri)
- Data Pribadi
- Informasi Keluarga
- Pengalaman & Pendidikan
- Motivasi & Tujuan
- Kelebihan & Kekurangan
- Tips & Kalimat Darurat

### Daftar Pertanyaan
File `assets/questions.md` berisi pertanyaan yang masih perlu dijawab dengan template yang bisa disesuaikan.

## 🎓 Cara Pakai

### Mode Latihan (Pemula)
1. Pilih **Mode Latihan**
2. Baca pertanyaan
3. Coba jawab sendiri
4. Klik "👁️ Lihat Jawaban" untuk melihat jawaban yang benar
5. Klik "➡️ Soal Berikutnya" untuk lanjut

### Mode Ujian (Advanced)
1. Pilih **Mode Ujian**
2. Baca pertanyaan
3. Jawab dalam 30 detik
4. Timer habis → jawaban muncul otomatis
5. Evaluasi diri sendiri

### Mode Random
1. Pilih **Mode Random**
2. Pertanyaan muncul secara acak
3. Latih daya ingat tanpa menghafal urutan

### Tips Maksimal
- ✅ Tandai pertanyaan yang sudah dikuasai dengan "✅ Saya Bisa!"
- 📊 Pantau progress untuk mengetahui seberapa siap kamu
- 🔄 Ulang pertanyaan yang masih sulit
- 🎯 Target 100% sebelum wawancara sesungguhnya

## 🛠️ Teknologi

- **HTML5** - Struktur
- **CSS3** - Styling dengan gradient dan animasi
- **Vanilla JavaScript** - Logic dan interaktivitas
- **PWA** - Progressive Web App support
- **No Framework** - Lightweight dan cepat

## 📱 PWA Installation

Aplikasi ini bisa di-install seperti aplikasi native:

### Di Android/iOS:
1. Buka di browser (Chrome/Safari)
2. Tap menu (⋮)
3. "Add to Home Screen" / "Tambahkan ke Layar Utama"
4. Buka dari home screen

### Di Desktop:
1. Buka di Chrome/Edge
2. Klik icon install di address bar
3. Confirm
4. Buka dari desktop

## 🎨 Customization

### Mengubah Pertanyaan
Edit array `questions` di `index.html`:

```javascript
const questions = [
    {
        category: "Kategori",
        question: "Pertanyaan dalam Jepang",
        answerJapanese: "Jawaban Jepang",
        answerRomaji: "Jawaban Romaji",
        answerIndo: "Terjemahan Indonesia"
    },
    // tambah pertanyaan lain...
];
```

### Mengubah Warna/Tema
Edit CSS variables di bagian `:root`:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --accent-color: #64b5f6;
}
```

### Menambah Mode Baru
Tambahkan function di JavaScript section dan button di HTML.

## 🤝 Contributing

Kontribusi sangat diterima! Untuk perubahan besar:
1. Fork repository
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 To-Do List

- [ ] Dark mode toggle
- [ ] Export/Import progress
- [ ] Audio pronunciation
- [ ] Spaced repetition algorithm
- [ ] Multiplayer mode
- [ ] Leaderboard
- [ ] Certificate generator

## 📄 License

MIT License - bebas digunakan untuk keperluan pribadi maupun komersial.

## 👨‍💻 Author

**Dwianrita Farras Sejati (Jati)**
- Calon Care Giver Jepang
- 📧 Email: [your-email@example.com]
- 🔗 LinkedIn: [your-linkedin]

## 🙏 Credits

- Materi pertanyaan dikompilasi dari berbagai sumber training mensetsu
- Design inspiration: Modern web apps
- Icons: Emoji (no external dependencies)

## 📞 Support

Jika menemukan bug atau punya saran:
1. Buat issue di GitHub
2. Email ke [your-email@example.com]
3. Pull request welcome!

## ⭐ Star This Repo!

Kalau aplikasi ini membantu, jangan lupa kasih ⭐ ya!

---

**Good luck with your mensetsu! がんばってください！ 🍀**

---

### 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/username/mensetsu-practice)
![GitHub forks](https://img.shields.io/github/forks/username/mensetsu-practice)
![GitHub issues](https://img.shields.io/github/issues/username/mensetsu-practice)
