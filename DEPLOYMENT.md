# 🚀 Deployment Guide - Mensetsu Practice

Panduan lengkap untuk deploy aplikasi Mensetsu Practice ke berbagai platform.

---

## 📋 Persiapan

### 1. Struktur File yang Sudah Siap

```
mensetsu-practice/
├── index.html              ← Aplikasi utama
├── app.js                  ← JavaScript logic + PWA features
├── styles.css              ← Dark mode & additional styles
├── sw.js                   ← Service Worker (offline support)
├── manifest.json           ← PWA manifest
├── favicon.svg             ← Icon browser
├── README.md               ← Dokumentasi
├── .gitignore             ← Git ignore rules
└── assets/
    ├── cheatsheet.md      ← Cheat sheet
    ├── questions.md        ← Daftar pertanyaan
    ├── icon-192.png       ← PWA icon (placeholder)
    └── icon-512.png       ← PWA icon (placeholder)
```

### 2. Install Git (jika belum ada)

**Windows:**
- Download dari https://git-scm.com/
- Install dengan default settings

**Mac:**
```bash
brew install git
```

**Linux:**
```bash
sudo apt-get install git
```

---

## 🌐 Opsi 1: GitHub Pages (RECOMMENDED - Gratis & Mudah)

### Step 1: Buat Repository di GitHub

1. Login ke https://github.com
2. Klik tombol **"New"** (repository baru)
3. Nama repository: `mensetsu-practice`
4. Description: "Aplikasi latihan wawancara Care Giver Jepang"
5. Public (biar bisa pakai GitHub Pages gratis)
6. **JANGAN** centang "Add README" (kita udah punya)
7. Klik **Create repository**

### Step 2: Upload Files ke GitHub

**Via Terminal/Command Prompt:**

```bash
# 1. Masuk ke folder project
cd /path/to/mensetsu-practice

# 2. Initialize Git
git init

# 3. Add semua file
git add .

# 4. Commit
git commit -m "Initial commit - Mensetsu Practice App"

# 5. Connect ke GitHub (ganti USERNAME dengan username GitHub kamu)
git remote add origin https://github.com/USERNAME/mensetsu-practice.git

# 6. Push
git branch -M main
git push -u origin main
```

**Via GitHub Desktop (Lebih Mudah):**

1. Download GitHub Desktop: https://desktop.github.com/
2. Login dengan akun GitHub
3. File → Add Local Repository
4. Pilih folder `mensetsu-practice`
5. Commit changes
6. Publish repository

### Step 3: Aktifkan GitHub Pages

1. Buka repository di GitHub
2. Klik **Settings** (tab paling kanan)
3. Scroll ke bagian **Pages** (sidebar kiri)
4. Source: pilih **main** branch
5. Folder: pilih **/ (root)**
6. Klik **Save**
7. Tunggu 1-2 menit

✅ **Done!** Akses di: `https://USERNAME.github.io/mensetsu-practice/`

### Step 4: Custom Domain (Opsional)

Kalau punya domain sendiri (misalnya: mensetsu.yourname.com):

1. Di GitHub Pages settings, isi **Custom domain**: `mensetsu.yourname.com`
2. Di DNS provider kamu (Cloudflare/Namecheap/dll), tambah:
   ```
   Type: CNAME
   Name: mensetsu (atau subdomain yang kamu mau)
   Value: USERNAME.github.io
   ```
3. Wait 5-10 menit untuk DNS propagation
4. Centang **"Enforce HTTPS"**

✅ Sekarang bisa diakses via domain kamu!

---

## ⚡ Opsi 2: Vercel (Super Fast & Auto Deploy)

### Step 1: Sign Up Vercel

1. Buka https://vercel.com/
2. Sign up with GitHub (recommended)
3. Authorize Vercel

### Step 2: Import Repository

1. Klik **"Add New..."** → **"Project"**
2. Import Git Repository
3. Pilih `mensetsu-practice` repository
4. Click **Import**

### Step 3: Configure & Deploy

1. Framework Preset: **Other** (karena vanilla HTML/JS)
2. Root Directory: `./` (default)
3. Build Command: (kosongkan)
4. Output Directory: (kosongkan)
5. Klik **Deploy**

✅ **Done!** Auto deploy dalam 1-2 menit

**Production URL:** `https://mensetsu-practice.vercel.app`

### Custom Domain di Vercel:

1. Project Settings → Domains
2. Add domain kamu
3. Ikuti instruksi DNS
4. Auto SSL!

**Kelebihan Vercel:**
- ⚡ Super fast (edge network)
- 🔄 Auto deploy setiap push ke GitHub
- 🎯 Preview deployment untuk setiap commit
- 📊 Analytics built-in

---

## 🎯 Opsi 3: Netlify (Drag & Drop Friendly)

### Step 1: Sign Up

1. Buka https://netlify.com/
2. Sign up with GitHub

### Step 2: Deploy via GitHub (Recommended)

1. Click **"Add new site"** → **"Import existing project"**
2. Connect to Git Provider → GitHub
3. Select repository `mensetsu-practice`
4. Build settings:
   - Build command: (kosongkan)
   - Publish directory: (kosongkan atau `.`)
5. Click **Deploy site**

**ATAU Deploy via Drag & Drop:**

1. Click **"Add new site"** → **"Deploy manually"**
2. Drag folder `mensetsu-practice` ke area upload
3. Done!

✅ **Live URL:** `https://random-name-12345.netlify.app`

### Custom Domain di Netlify:

1. Site settings → Domain management
2. Add custom domain
3. Follow DNS instructions
4. Auto SSL!

**Kelebihan Netlify:**
- 🎨 Drag & drop deployment
- 🔄 Auto deploy from Git
- 📝 Form handling (kalau nanti mau tambah contact form)
- 🔀 Split testing

---

## 🔥 Opsi 4: Firebase Hosting (Google Infrastructure)

### Step 1: Setup Firebase

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
cd mensetsu-practice
firebase init hosting
```

### Step 2: Configure

Saat ditanya:
- What do you want to use as your public directory? → **.**
- Configure as single-page app? → **No**
- Set up automatic builds? → **No**
- File index.html already exists. Overwrite? → **No**

### Step 3: Deploy

```bash
firebase deploy
```

✅ **Done!** URL: `https://PROJECT-ID.web.app`

---

## 📱 Generate PWA Icons (Penting!)

Kita perlu bikin icon yang beneran (bukan placeholder):

### Online Tool (Paling Mudah):

1. Buka https://realfavicongenerator.net/
2. Upload logo/emoji 🎌 (ukuran min 512x512px)
3. Generate semua ukuran otomatis
4. Download hasil
5. Extract ke folder `assets/`

### Manual dengan Design Tool:

Kalau kamu bisa design:
1. Bikin logo 512x512px
2. Export jadi PNG
3. Resize jadi 192x192px juga
4. Save di `assets/icon-192.png` dan `assets/icon-512.png`

---

## 🔐 HTTPS & SSL

**GitHub Pages:** Auto HTTPS ✅  
**Vercel:** Auto HTTPS ✅  
**Netlify:** Auto HTTPS ✅  
**Firebase:** Auto HTTPS ✅

Semua platform di atas kasih SSL gratis otomatis!

---

## 🧪 Testing Sebelum Deploy

### Local Testing:

```bash
# Option 1: Python SimpleHTTPServer
python -m http.server 8000

# Option 2: Node.js http-server
npx http-server

# Option 3: PHP built-in server
php -S localhost:8000
```

Buka http://localhost:8000

### PWA Testing:

1. Buka di Chrome
2. F12 (DevTools)
3. Tab **Lighthouse**
4. Check "Progressive Web App"
5. Generate report
6. Target score: 90+

---

## 📊 Analytics (Opsional)

### Google Analytics:

Tambahkan di `<head>` index.html:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Vercel Analytics:

Auto included kalau deploy via Vercel!

---

## 🔄 Update Workflow

Setelah deploy, cara update:

### Via Git:

```bash
# 1. Edit files
# 2. Commit
git add .
git commit -m "Update: tambah pertanyaan baru"

# 3. Push
git push
```

**Auto deploy** di Vercel/Netlify/GitHub Pages!

### Via Drag & Drop (Netlify):

1. Buat ZIP folder terbaru
2. Drag ke Netlify deploys
3. Done!

---

## ✅ Checklist Sebelum Go Live

- [ ] Semua file sudah di upload
- [ ] Test di mobile browser
- [ ] Test dark mode
- [ ] Test PWA install
- [ ] Test offline mode
- [ ] Update README dengan live URL
- [ ] Test share button
- [ ] Ganti placeholder icons dengan icon asli
- [ ] Test keyboard shortcuts
- [ ] Add Google Analytics (opsional)

---

## 🆘 Troubleshooting

### File tidak muncul setelah deploy?

- Check apakah file path-nya benar (case-sensitive!)
- Clear browser cache (Ctrl+Shift+R)
- Check di DevTools → Network tab

### PWA tidak bisa di-install?

- Pastikan sudah HTTPS
- Check manifest.json valid: https://manifest-validator.appspot.com/
- Check Service Worker registered di DevTools → Application

### Dark mode tidak kerja?

- Check `app.js` sudah di-load
- Check `styles.css` sudah di-link
- Clear localStorage: `localStorage.clear()`

### Custom domain tidak connect?

- Wait 24-48 jam untuk DNS propagation
- Check DNS dengan: `nslookup your-domain.com`
- Pastikan CNAME record benar

---

## 📞 Support

Kalau ada masalah deployment:

1. Check dokumentasi platform (GitHub/Vercel/Netlify)
2. Google error message-nya
3. Create issue di GitHub repository

---

## 🎉 Selamat!

Kalau udah deploy, share link-nya! 🚀

**Next steps:**
- Share ke temen-temen yang juga mau mensetsu
- Monitor usage via analytics
- Update content seiring latihan
- Tambah fitur baru (kalau ada ide!)

**Good luck! がんばってください！ 🍀**
