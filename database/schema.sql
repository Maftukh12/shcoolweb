-- =============================================
-- SCHEMA DATABASE WEBSITE SEKOLAH
-- =============================================

CREATE DATABASE IF NOT EXISTS sekolah_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE sekolah_db;

-- Tabel Users (semua role)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'guru', 'siswa') NOT NULL DEFAULT 'siswa',
    avatar VARCHAR(255) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Tahun Ajaran
CREATE TABLE IF NOT EXISTS tahun_ajaran (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tahun VARCHAR(9) NOT NULL,
    semester ENUM('ganjil', 'genap') NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Kelas
CREATE TABLE IF NOT EXISTS kelas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_kelas VARCHAR(20) NOT NULL,
    tingkat ENUM(
        '7',
        '8',
        '9',
        '10',
        '11',
        '12'
    ) NOT NULL,
    wali_kelas_id INT DEFAULT NULL,
    tahun_ajaran_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wali_kelas_id) REFERENCES users (id) ON DELETE SET NULL,
    FOREIGN KEY (tahun_ajaran_id) REFERENCES tahun_ajaran (id) ON DELETE SET NULL
);

-- Tabel Data Guru
CREATE TABLE IF NOT EXISTS guru (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    nip VARCHAR(20) DEFAULT NULL,
    phone VARCHAR(15) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    specialization VARCHAR(100) DEFAULT NULL,
    join_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Tabel Data Siswa
CREATE TABLE IF NOT EXISTS siswa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    nis VARCHAR(20) DEFAULT NULL UNIQUE,
    kelas_id INT DEFAULT NULL,
    phone VARCHAR(15) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    parent_name VARCHAR(100) DEFAULT NULL,
    parent_phone VARCHAR(15) DEFAULT NULL,
    birth_date DATE DEFAULT NULL,
    gender ENUM('L', 'P') DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (kelas_id) REFERENCES kelas (id) ON DELETE SET NULL
);

-- Tabel Mata Pelajaran
CREATE TABLE IF NOT EXISTS mata_pelajaran (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    kode VARCHAR(10) NOT NULL UNIQUE,
    guru_id INT DEFAULT NULL,
    kelas_id INT DEFAULT NULL,
    hari ENUM(
        'Senin',
        'Selasa',
        'Rabu',
        'Kamis',
        'Jumat',
        'Sabtu'
    ) DEFAULT NULL,
    jam_mulai TIME DEFAULT NULL,
    jam_selesai TIME DEFAULT NULL,
    ruangan VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guru_id) REFERENCES users (id) ON DELETE SET NULL,
    FOREIGN KEY (kelas_id) REFERENCES kelas (id) ON DELETE SET NULL
);

-- Tabel Nilai
CREATE TABLE IF NOT EXISTS nilai (
    id INT AUTO_INCREMENT PRIMARY KEY,
    siswa_id INT NOT NULL,
    mapel_id INT NOT NULL,
    tahun_ajaran_id INT NOT NULL,
    semester ENUM('ganjil', 'genap') NOT NULL,
    nilai_tugas DECIMAL(5, 2) DEFAULT 0,
    nilai_uts DECIMAL(5, 2) DEFAULT 0,
    nilai_uas DECIMAL(5, 2) DEFAULT 0,
    nilai_akhir DECIMAL(5, 2) DEFAULT 0,
    grade VARCHAR(2) DEFAULT NULL,
    catatan TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_nilai (
        siswa_id,
        mapel_id,
        tahun_ajaran_id,
        semester
    ),
    FOREIGN KEY (siswa_id) REFERENCES siswa (id) ON DELETE CASCADE,
    FOREIGN KEY (mapel_id) REFERENCES mata_pelajaran (id) ON DELETE CASCADE,
    FOREIGN KEY (tahun_ajaran_id) REFERENCES tahun_ajaran (id) ON DELETE CASCADE
);

-- Tabel Absensi
CREATE TABLE IF NOT EXISTS absensi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    siswa_id INT NOT NULL,
    kelas_id INT NOT NULL,
    mapel_id INT DEFAULT NULL,
    tanggal DATE NOT NULL,
    status ENUM(
        'hadir',
        'sakit',
        'izin',
        'alpha'
    ) NOT NULL DEFAULT 'hadir',
    catatan VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (siswa_id) REFERENCES siswa (id) ON DELETE CASCADE,
    FOREIGN KEY (kelas_id) REFERENCES kelas (id) ON DELETE CASCADE,
    FOREIGN KEY (mapel_id) REFERENCES mata_pelajaran (id) ON DELETE SET NULL
);

-- Tabel Pengumuman
CREATE TABLE IF NOT EXISTS pengumuman (
    id INT AUTO_INCREMENT PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    isi TEXT NOT NULL,
    target_role ENUM('semua', 'guru', 'siswa') DEFAULT 'semua',
    author_id INT NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Tabel Berita
CREATE TABLE IF NOT EXISTS berita (
    id INT AUTO_INCREMENT PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    isi TEXT NOT NULL,
    image VARCHAR(255) DEFAULT NULL,
    author_id INT NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
);