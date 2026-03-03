const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, authorize } = require('../middleware/auth');

const isSiswa = [authMiddleware, authorize('siswa', 'admin')];

// Dashboard siswa
router.get('/dashboard', isSiswa, async (req, res) => {
    try {
        // Get siswa data
        const [siswaRows] = await db.query(`
      SELECT s.*, k.nama_kelas, k.tingkat FROM siswa s
      LEFT JOIN kelas k ON s.kelas_id = k.id
      WHERE s.user_id = ?`, [req.user.id]);
        if (!siswaRows.length) return res.status(404).json({ success: false, message: 'Data siswa tidak ditemukan.' });
        const siswa = siswaRows[0];

        // Count values
        const [[{ avg_nilai }]] = await db.query(`
      SELECT AVG(nilai_akhir) as avg_nilai FROM nilai WHERE siswa_id = ?`, [siswa.id]);
        const [[{ total_hadir }]] = await db.query(`
      SELECT COUNT(*) as total_hadir FROM absensi WHERE siswa_id = ? AND status = 'hadir'`, [siswa.id]);
        const [[{ total_absen }]] = await db.query(`
      SELECT COUNT(*) as total_absen FROM absensi WHERE siswa_id = ?`, [siswa.id]);

        // Recent announcements
        const [pengumuman] = await db.query(`
      SELECT p.id, p.judul, p.isi, p.created_at FROM pengumuman p
      WHERE (p.target_role = 'semua' OR p.target_role = 'siswa') AND p.is_published = TRUE
      ORDER BY p.created_at DESC LIMIT 3`);

        res.json({
            success: true,
            data: {
                siswa, avg_nilai: parseFloat(avg_nilai || 0).toFixed(2),
                kehadiran: total_absen > 0 ? Math.round((total_hadir / total_absen) * 100) : 100,
                pengumuman
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// GET Nilai siswa
router.get('/nilai', isSiswa, async (req, res) => {
    try {
        const [siswaRows] = await db.query('SELECT id FROM siswa WHERE user_id = ?', [req.user.id]);
        if (!siswaRows.length) return res.status(404).json({ success: false, message: 'Data siswa tidak ditemukan.' });
        const siswa_id = siswaRows[0].id;

        const { semester, tahun_ajaran_id } = req.query;
        let query = `
      SELECT n.*, m.nama as mapel_nama, m.kode, ta.tahun, ta.semester as semester_ta
      FROM nilai n
      JOIN mata_pelajaran m ON n.mapel_id = m.id
      JOIN tahun_ajaran ta ON n.tahun_ajaran_id = ta.id
      WHERE n.siswa_id = ?`;
        const params = [siswa_id];
        if (semester) { query += ' AND n.semester = ?'; params.push(semester); }
        if (tahun_ajaran_id) { query += ' AND n.tahun_ajaran_id = ?'; params.push(tahun_ajaran_id); }
        query += ' ORDER BY m.nama';

        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// GET Jadwal siswa (berdasarkan kelas)
router.get('/jadwal', isSiswa, async (req, res) => {
    try {
        const [siswaRows] = await db.query('SELECT id, kelas_id FROM siswa WHERE user_id = ?', [req.user.id]);
        if (!siswaRows.length) return res.status(404).json({ success: false, message: 'Data siswa tidak ditemukan.' });
        const { kelas_id } = siswaRows[0];

        const [rows] = await db.query(`
      SELECT m.*, u.name as guru_nama
      FROM mata_pelajaran m
      LEFT JOIN users u ON m.guru_id = u.id
      WHERE m.kelas_id = ?
      ORDER BY FIELD(m.hari,'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'), m.jam_mulai`, [kelas_id]);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// GET Absensi siswa
router.get('/absensi', isSiswa, async (req, res) => {
    try {
        const [siswaRows] = await db.query('SELECT id FROM siswa WHERE user_id = ?', [req.user.id]);
        if (!siswaRows.length) return res.status(404).json({ success: false, message: 'Data siswa tidak ditemukan.' });
        const siswa_id = siswaRows[0].id;

        const [rows] = await db.query(`
      SELECT a.*, m.nama as mapel_nama FROM absensi a
      LEFT JOIN mata_pelajaran m ON a.mapel_id = m.id
      WHERE a.siswa_id = ?
      ORDER BY a.tanggal DESC`, [siswa_id]);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// GET Pengumuman untuk siswa
router.get('/pengumuman', isSiswa, async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT p.*, u.name as author_name FROM pengumuman p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE (p.target_role = 'semua' OR p.target_role = 'siswa') AND p.is_published = TRUE
      ORDER BY p.created_at DESC`);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// GET Berita (public)
router.get('/berita', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT b.*, u.name as author_name FROM berita b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.is_published = TRUE
      ORDER BY b.created_at DESC`);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

module.exports = router;
