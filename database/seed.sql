-- =============================================
-- SEED DATA WEBSITE SEKOLAH
-- Password untuk semua user: admin123 / guru123 / siswa123
-- Hash bcrypt di-generate dengan saltRounds = 10
-- =============================================
USE sekolah_db;

-- Tahun Ajaran
INSERT INTO
    tahun_ajaran (tahun, semester, is_active)
VALUES ('2024/2025', 'genap', TRUE),
    ('2023/2024', 'ganjil', FALSE);

-- Users (password: Admin@123 untuk admin, Guru@123 untuk guru, Siswa@123 untuk siswa)
-- Hash dibuat dengan bcryptjs rounds=10
INSERT INTO
    users (name, email, password, role)
VALUES (
        'Administrator',
        'admin@sekolah.com',
        '$2b$10$79/QpP.76KW7bXYiAc42DOf8chbNBLEWT15G1.6Tp75iLbbvf/QKGe',
        'admin'
    ),
    (
        'Budi Santoso, S.Pd',
        'budi@sekolah.com',
        '$2b$10$79/QpP.76KW7bXYiAc42DOf8chbNBLEWT15G1.6Tp75iLbbvf/QKGe',
        'guru'
    ),
    (
        'Siti Rahayu, M.Pd',
        'siti@sekolah.com',
        '$2b$10$79/QpP.76KW7bXYiAc42DOf8chbNBLEWT15G1.6Tp75iLbbvf/QKGe',
        'guru'
    ),
    (
        'Ahmad Fauzi',
        'ahmad@sekolah.com',
        '$2b$10$79/QpP.76KW7bXYiAc42DOf8chbNBLEWT15G1.6Tp75iLbbvf/QKGe',
        'siswa'
    ),
    (
        'Dewi Lestari',
        'dewi@sekolah.com',
        '$2b$10$79/QpP.76KW7bXYiAc42DOf8chbNBLEWT15G1.6Tp75iLbbvf/QKGe',
        'siswa'
    ),
    (
        'Rizky Pratama',
        'rizky@sekolah.com',
        '$2b$10$79/QpP.76KW7bXYiAc42DOf8chbNBLEWT15G1.6Tp75iLbbvf/QKGe',
        'siswa'
    );

-- Data Guru
INSERT INTO
    guru (
        user_id,
        nip,
        phone,
        address,
        specialization,
        join_date
    )
VALUES (
        2,
        '198501012010011001',
        '081234567890',
        'Jl. Merdeka No. 10, Jakarta',
        'Matematika',
        '2010-01-01'
    ),
    (
        3,
        '198701052012022002',
        '081234567891',
        'Jl. Sudirman No. 25, Jakarta',
        'Bahasa Indonesia',
        '2012-02-01'
    );

-- Kelas
INSERT INTO
    kelas (
        nama_kelas,
        tingkat,
        wali_kelas_id,
        tahun_ajaran_id
    )
VALUES ('X-A', '10', 2, 1),
    ('X-B', '10', 3, 1),
    ('XI-IPA', '11', 2, 1),
    ('XII-IPS', '12', 3, 1);

-- Data Siswa
INSERT INTO
    siswa (
        user_id,
        nis,
        kelas_id,
        phone,
        address,
        parent_name,
        parent_phone,
        birth_date,
        gender
    )
VALUES (
        4,
        '20240001',
        1,
        '081111111111',
        'Jl. Kenangan No. 1',
        'Fauzi Sr.',
        '08122222222',
        '2008-05-15',
        'L'
    ),
    (
        5,
        '20240002',
        1,
        '081111111112',
        'Jl. Mawar No. 5',
        'Lestari Sr.',
        '08122222223',
        '2008-08-20',
        'P'
    ),
    (
        6,
        '20240003',
        2,
        '081111111113',
        'Jl. Melati No. 3',
        'Pratama Sr.',
        '08122222224',
        '2008-03-10',
        'L'
    );

-- Mata Pelajaran
INSERT INTO
    mata_pelajaran (
        nama,
        kode,
        guru_id,
        kelas_id,
        hari,
        jam_mulai,
        jam_selesai,
        ruangan
    )
VALUES (
        'Matematika',
        'MTK10A',
        2,
        1,
        'Senin',
        '07:00:00',
        '08:30:00',
        'R.101'
    ),
    (
        'Bahasa Indonesia',
        'BIN10A',
        3,
        1,
        'Selasa',
        '07:00:00',
        '08:30:00',
        'R.101'
    ),
    (
        'Matematika',
        'MTK10B',
        2,
        2,
        'Rabu',
        '07:00:00',
        '08:30:00',
        'R.102'
    ),
    (
        'Bahasa Indonesia',
        'BIN10B',
        3,
        2,
        'Kamis',
        '07:00:00',
        '08:30:00',
        'R.102'
    ),
    (
        'IPA Terpadu',
        'IPA10A',
        2,
        1,
        'Rabu',
        '09:00:00',
        '10:30:00',
        'R.Lab'
    ),
    (
        'Bahasa Inggris',
        'BIG10A',
        3,
        1,
        'Kamis',
        '09:00:00',
        '10:30:00',
        'R.101'
    );

-- Nilai
INSERT INTO
    nilai (
        siswa_id,
        mapel_id,
        tahun_ajaran_id,
        semester,
        nilai_tugas,
        nilai_uts,
        nilai_uas,
        nilai_akhir,
        grade
    )
VALUES (
        1,
        1,
        1,
        'genap',
        85,
        78,
        82,
        82,
        'B'
    ),
    (
        1,
        2,
        1,
        'genap',
        90,
        85,
        88,
        88,
        'A'
    ),
    (
        1,
        5,
        1,
        'genap',
        80,
        75,
        78,
        78,
        'B'
    ),
    (
        2,
        1,
        1,
        'genap',
        92,
        88,
        90,
        90,
        'A'
    ),
    (
        2,
        2,
        1,
        'genap',
        87,
        82,
        85,
        85,
        'B'
    ),
    (
        3,
        3,
        1,
        'genap',
        75,
        70,
        72,
        72,
        'C'
    );

-- Absensi
INSERT INTO
    absensi (
        siswa_id,
        kelas_id,
        mapel_id,
        tanggal,
        status
    )
VALUES (
        1,
        1,
        1,
        '2025-01-06',
        'hadir'
    ),
    (
        1,
        1,
        1,
        '2025-01-13',
        'hadir'
    ),
    (
        1,
        1,
        1,
        '2025-01-20',
        'sakit'
    ),
    (
        2,
        1,
        1,
        '2025-01-06',
        'hadir'
    ),
    (2, 1, 1, '2025-01-13', 'izin'),
    (
        3,
        2,
        3,
        '2025-01-07',
        'hadir'
    );

-- Pengumuman
INSERT INTO
    pengumuman (
        judul,
        isi,
        target_role,
        author_id
    )
VALUES (
        'Ujian Tengah Semester',
        'UTS akan dilaksanakan pada tanggal 17-21 Maret 2025. Semua siswa diharapkan mempersiapkan diri dengan baik.',
        'siswa',
        1
    ),
    (
        'Rapat Guru Bulanan',
        'Rapat guru bulanan akan dilaksanakan pada Jumat, 7 Maret 2025 pukul 13.00 WIB di ruang rapat.',
        'guru',
        1
    ),
    (
        'Libur Nasional',
        'Sekolah akan libur tanggal 28-29 Maret 2025 dalam rangka Hari Raya Nyepi dan Wafat Yesus Kristus.',
        'semua',
        1
    );

-- Berita
INSERT INTO
    berita (
        judul,
        isi,
        author_id,
        is_published
    )
VALUES (
        'Selamat Datang di Website SMPN 1 Cerdas',
        'Kami dengan bangga mempersembahkan website resmi SMPN 1 Cerdas yang baru. Website ini hadir untuk memudahkan komunikasi antara sekolah, guru, dan siswa.',
        1,
        TRUE
    ),
    (
        'Prestasi Siswa di Olimpiade Sains',
        'Selamat kepada siswa-siswi kami yang berhasil meraih juara di Olimpiade Sains tingkat Kabupaten. Ini adalah kebanggaan bagi seluruh warga sekolah.',
        1,
        TRUE
    ),
    (
        'Program Ekstrakurikuler Baru',
        'Semester ini kami membuka program ekstrakurikuler baru yaitu Robotika, Coding Club, dan English Debate. Pendaftaran dibuka mulai 1 Maret 2025.',
        1,
        TRUE
    );