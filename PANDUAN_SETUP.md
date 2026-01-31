# 📜 Gabungan SQL Final JATI MENSETSU

Gunakan kode di bawah ini di **SQL Editor Supabase** (Klik "New Query", paste, lalu "Run").



-- ========================================

-- JATI MENSETSU - SUPABASE SCHEMA

-- ========================================

-- VERSI: Final - Fix 409 Conflict

-- UPDATE: Reset user\_settings \& doc\_notes, force disable RLS

-- ========================================



-- ========================================

-- HAPUS TABLE YANG SALAH

-- ========================================

DROP TABLE IF EXISTS document\_notes CASCADE;



-- ========================================

-- RESET DATA: Hapus duplicate

-- ========================================

DELETE FROM user\_settings;

DELETE FROM doc\_notes;



-- ========================================

-- TABEL 1: USER\_SETTINGS

-- Untuk menyimpan pengaturan user (nama, target date, sertifikasi)

-- ========================================

CREATE TABLE IF NOT EXISTS user\_settings (

&nbsp;   id BIGSERIAL PRIMARY KEY,

&nbsp;   user\_id TEXT NOT NULL,

&nbsp;   user\_name TEXT DEFAULT 'Jati',

&nbsp;   target\_date TEXT DEFAULT 'Q4 2025',

&nbsp;   cert\_status TEXT DEFAULT 'JFT-A2 Lulus',

&nbsp;   created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

&nbsp;   updated\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

&nbsp;   CONSTRAINT unique\_user\_id UNIQUE (user\_id)

);



-- Insert default user settings (FRESH)

INSERT INTO user\_settings (user\_id, user\_name, target\_date, cert\_status)

VALUES ('default-user', 'Jati', 'Q4 2025', 'JFT-A2 Lulus');



-- FORCE Disable RLS

ALTER TABLE user\_settings DISABLE ROW LEVEL SECURITY;



-- ========================================

-- TABEL 2: QUESTIONS

-- Untuk Management.tsx - Database pertanyaan interview

-- ========================================

CREATE TABLE IF NOT EXISTS questions (

&nbsp;   id BIGSERIAL PRIMARY KEY,

&nbsp;   user\_id TEXT DEFAULT 'default-user',

&nbsp;   category TEXT DEFAULT 'Umum',

&nbsp;   question TEXT NOT NULL,

&nbsp;   answer\_japanese TEXT DEFAULT '',

&nbsp;   answer\_romaji TEXT DEFAULT '',

&nbsp;   answer\_indo TEXT DEFAULT '',

&nbsp;   time\_limit INTEGER DEFAULT 30,

&nbsp;   mastered BOOLEAN DEFAULT false,

&nbsp;   created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

&nbsp;   updated\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);



-- Index untuk performa (skip kalau sudah ada)

CREATE INDEX IF NOT EXISTS idx\_questions\_user\_id ON questions(user\_id);

CREATE INDEX IF NOT EXISTS idx\_questions\_category ON questions(category);



-- FORCE Disable RLS

ALTER TABLE questions DISABLE ROW LEVEL SECURITY;



-- ========================================

-- TABEL 3: VOCAB

-- Untuk VocabHub.tsx - Daftar kosakata Jepang

-- ========================================

CREATE TABLE IF NOT EXISTS vocab (

&nbsp;   id BIGSERIAL PRIMARY KEY,

&nbsp;   user\_id TEXT DEFAULT 'default-user',

&nbsp;   word TEXT NOT NULL,

&nbsp;   meaning TEXT NOT NULL,

&nbsp;   category TEXT DEFAULT 'Umum',

&nbsp;   created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);



-- Index untuk performa (skip kalau sudah ada)

CREATE INDEX IF NOT EXISTS idx\_vocab\_user\_id ON vocab(user\_id);

CREATE INDEX IF NOT EXISTS idx\_vocab\_category ON vocab(category);



-- FORCE Disable RLS

ALTER TABLE vocab DISABLE ROW LEVEL SECURITY;



-- ========================================

-- TABEL 4: TSK\_APPLICATIONS

-- Untuk TSKTracker.tsx - Tracking lamaran kerja

-- ========================================

CREATE TABLE IF NOT EXISTS tsk\_applications (

&nbsp;   id BIGSERIAL PRIMARY KEY,

&nbsp;   user\_id TEXT DEFAULT 'default-user',

&nbsp;   name TEXT NOT NULL,

&nbsp;   status TEXT DEFAULT 'Screening',

&nbsp;   salary INTEGER DEFAULT 0,

&nbsp;   rounds JSONB DEFAULT '\[]'::jsonb,

&nbsp;   notes TEXT DEFAULT '',

&nbsp;   retro TEXT DEFAULT '',

&nbsp;   created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

&nbsp;   updated\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);



-- Index untuk performa (skip kalau sudah ada)

CREATE INDEX IF NOT EXISTS idx\_tsk\_user\_id ON tsk\_applications(user\_id);

CREATE INDEX IF NOT EXISTS idx\_tsk\_status ON tsk\_applications(status);



-- FORCE Disable RLS

ALTER TABLE tsk\_applications DISABLE ROW LEVEL SECURITY;



-- ========================================

-- TABEL 5: DOCUMENTS

-- Untuk DocumentHub.tsx - Checklist dokumen

-- ========================================

CREATE TABLE IF NOT EXISTS documents (

&nbsp;   id BIGSERIAL PRIMARY KEY,

&nbsp;   user\_id TEXT DEFAULT 'default-user',

&nbsp;   label TEXT NOT NULL,

&nbsp;   is\_done BOOLEAN DEFAULT false,

&nbsp;   file\_url TEXT,

&nbsp;   file\_name TEXT,

&nbsp;   created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);



-- Index untuk performa (skip kalau sudah ada)

CREATE INDEX IF NOT EXISTS idx\_documents\_user\_id ON documents(user\_id);



-- FORCE Disable RLS

ALTER TABLE documents DISABLE ROW LEVEL SECURITY;



-- ========================================

-- TABEL 6: DOC\_NOTES

-- Untuk DocumentHub.tsx - Catatan digital / notepad

-- ========================================

CREATE TABLE IF NOT EXISTS doc\_notes (

&nbsp;   id BIGSERIAL PRIMARY KEY,

&nbsp;   user\_id TEXT NOT NULL,

&nbsp;   content TEXT DEFAULT '',

&nbsp;   updated\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

&nbsp;   CONSTRAINT unique\_doc\_notes\_user\_id UNIQUE (user\_id)

);



-- Insert default doc notes (FRESH)

INSERT INTO doc\_notes (user\_id, content)

VALUES ('default-user', '');



-- FORCE Disable RLS

ALTER TABLE doc\_notes DISABLE ROW LEVEL SECURITY;



-- ========================================

-- TABEL 7: ROADMAP\_STEPS

-- Untuk Dashboard.tsx - Recruitment journey steps

-- ========================================

CREATE TABLE IF NOT EXISTS roadmap\_steps (

&nbsp;   id BIGSERIAL PRIMARY KEY,

&nbsp;   user\_id TEXT DEFAULT 'default-user',

&nbsp;   label TEXT NOT NULL,

&nbsp;   status TEXT DEFAULT 'pending',

&nbsp;   order\_index INTEGER,

&nbsp;   created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);



-- Index untuk performa (skip kalau sudah ada)

CREATE INDEX IF NOT EXISTS idx\_roadmap\_user\_id ON roadmap\_steps(user\_id);

CREATE INDEX IF NOT EXISTS idx\_roadmap\_order ON roadmap\_steps(order\_index);



-- FORCE Disable RLS

ALTER TABLE roadmap\_steps DISABLE ROW LEVEL SECURITY;



-- ========================================

-- TABEL 8: INTERVIEW\_POINTS

-- Untuk StudyMode.tsx - Poin-poin penting interview

-- ========================================

CREATE TABLE IF NOT EXISTS interview\_points (

&nbsp;   id BIGSERIAL PRIMARY KEY,

&nbsp;   user\_id TEXT DEFAULT 'default-user',

&nbsp;   point TEXT NOT NULL,

&nbsp;   created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);



-- Index untuk performa (skip kalau sudah ada)

CREATE INDEX IF NOT EXISTS idx\_interview\_points\_user\_id ON interview\_points(user\_id);



-- FORCE Disable RLS

ALTER TABLE interview\_points DISABLE ROW LEVEL SECURITY;



-- ========================================

-- TABEL 9: EMERGENCY\_PHRASES

-- Untuk StudyMode.tsx - Frasa darurat Jepang

-- ========================================

CREATE TABLE IF NOT EXISTS emergency\_phrases (

&nbsp;   id BIGSERIAL PRIMARY KEY,

&nbsp;   user\_id TEXT DEFAULT 'default-user',

&nbsp;   phrase TEXT NOT NULL,

&nbsp;   translation TEXT DEFAULT '',

&nbsp;   created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);



-- Index untuk performa (skip kalau sudah ada)

CREATE INDEX IF NOT EXISTS idx\_emergency\_phrases\_user\_id ON emergency\_phrases(user\_id);



-- FORCE Disable RLS

ALTER TABLE emergency\_phrases DISABLE ROW LEVEL SECURITY;



-- ========================================

-- TABEL 10: STUDY\_NOTES

-- Untuk StudyMode.tsx - Catatan belajar

-- ========================================

CREATE TABLE IF NOT EXISTS study\_notes (

&nbsp;   id BIGSERIAL PRIMARY KEY,

&nbsp;   user\_id TEXT DEFAULT 'default-user',

&nbsp;   note TEXT NOT NULL,

&nbsp;   created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);



-- Index untuk performa (skip kalau sudah ada)

CREATE INDEX IF NOT EXISTS idx\_study\_notes\_user\_id ON study\_notes(user\_id);



-- FORCE Disable RLS

ALTER TABLE study\_notes DISABLE ROW LEVEL SECURITY;



-- ========================================

-- AUTO-UPDATE TIMESTAMP FUNCTION

-- ========================================

CREATE OR REPLACE FUNCTION update\_updated\_at\_column()

RETURNS TRIGGER AS $$

BEGIN

&nbsp;   NEW.updated\_at = NOW();

&nbsp;   RETURN NEW;

END;

$$ LANGUAGE plpgsql;



-- Apply trigger ke tabel yang punya updated\_at

DROP TRIGGER IF EXISTS update\_user\_settings\_updated\_at ON user\_settings;

CREATE TRIGGER update\_user\_settings\_updated\_at

&nbsp;   BEFORE UPDATE ON user\_settings

&nbsp;   FOR EACH ROW

&nbsp;   EXECUTE FUNCTION update\_updated\_at\_column();



DROP TRIGGER IF EXISTS update\_questions\_updated\_at ON questions;

CREATE TRIGGER update\_questions\_updated\_at

&nbsp;   BEFORE UPDATE ON questions

&nbsp;   FOR EACH ROW

&nbsp;   EXECUTE FUNCTION update\_updated\_at\_column();



DROP TRIGGER IF EXISTS update\_tsk\_applications\_updated\_at ON tsk\_applications;

CREATE TRIGGER update\_tsk\_applications\_updated\_at

&nbsp;   BEFORE UPDATE ON tsk\_applications

&nbsp;   FOR EACH ROW

&nbsp;   EXECUTE FUNCTION update\_updated\_at\_column();



DROP TRIGGER IF EXISTS update\_doc\_notes\_updated\_at ON doc\_notes;

CREATE TRIGGER update\_doc\_notes\_updated\_at

&nbsp;   BEFORE UPDATE ON doc\_notes

&nbsp;   FOR EACH ROW

&nbsp;   EXECUTE FUNCTION update\_updated\_at\_column();



-- ========================================

-- SELESAI! ✅

-- ========================================

-- Yang dilakukan script ini:

-- ✅ Hapus table document\_notes (yang salah)

-- ✅ Reset user\_settings (hapus duplicate) - BARU!

-- ✅ Reset doc\_notes (hapus duplicate)

-- ✅ Insert 1 row fresh di user\_settings - BARU!

-- ✅ Insert 1 row fresh di doc\_notes

-- ✅ FORCE disable RLS semua table

-- ✅ Keep semua table lain \& data-nya

-- ✅ Auto-update timestamp triggers

-- 

-- PERUBAHAN dari versi sebelumnya:

-- 🔥 Tambah: DELETE FROM user\_settings; (line 17)

-- 🔥 Ganti: INSERT user\_settings dari ON CONFLICT jadi direct INSERT (line 39)

-- 🔥 Ganti: INSERT doc\_notes dari ON CONFLICT jadi direct INSERT (line 152)

-- 

-- Total 10 tabel siap dipakai:

-- 1. user\_settings ✅ (FIXED - no more 409!)

-- 2. questions ✅

-- 3. vocab ✅

-- 4. tsk\_applications ✅

-- 5. documents ✅

-- 6. doc\_notes ✅ (FIXED - no more 409!)

-- 7. roadmap\_steps ✅

-- 8. interview\_points ✅

-- 9. emergency\_phrases ✅

-- 10. study\_notes ✅

