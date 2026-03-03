const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, authorize } = require('../middleware/auth');

const isGuru = [authMiddleware, authorize('guru', 'admin')];

// Dashboard guru
router.get('/dashboard', isGuru, async (req, res) => {
    try {
        const [[{ total_kelas }]] = await db.query(`
      SELECT COUNT(DISTINCT kelas_id) as total_kelas FROM mata_pelajaran WHERE guru_id = ?`, [req.user.id]);
        const [[{ total_siswa }]] = await db.query(`
      SELECT COUNT(DISTINCT s.id) as total_siswa FROM siswa s
      JOIN kelas k ON s.kelas_id = k.id
      JOIN mata_pelajaran m ON m.kelas_id = k.id
      WHERE m.guru_id = ?`, [req.user.id]);
        const [[{ total_mapel }]] = await db.query(`
      SELECT COUNT(*) as total_mapel FROM mata_pelajaran WHERE guru_id = ?`, [req.user.id]);

        res.json({ success: true, data: { total_kelas, total_siswa, total_mapel } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Mata pelajaran yang diajar guru ini
router.get('/mapel', isGuru, async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT m.*, k.nama_kelas, k.tingkat,
      (SELECT COUNT(*) FROM siswa WHERE kelas_id = m.kelas_id) as jumlah_siswa
      FROM mata_pelajaran m
      LEFT JOIN kelas k ON m.kelas_id = k.id
      WHERE m.guru_id = ?`, [req.user.id]);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// Siswa dalam kelas tertentu
router.get('/kelas/:kelasId/siswa', isGuru, async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT s.id, s.nis, u.name, s.gender, s.phone, s.parent_name
      FROM siswa s
      JOIN users u ON s.user_id = u.id
      WHERE s.kelas_id = ?
      ORDER BY u.name`, [req.params.kelasId]);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// GET nilai untuk mapel tertentu
router.get('/nilai/:mapelId', isGuru, async (req, res) => {
    try {
        const { semester, tahun_ajaran_id } = req.query;
        const [mapel] = await db.query('SELECT * FROM mata_pelajaran WHERE id = ? AND guru_id = ?', [req.params.mapelId, req.user.id]);
        if (!mapel.length) return res.status(403).json({ success: false, message: 'Anda tidak berhak mengakses mapel ini.' });

        let query = `
      SELECT n.*, u.name as siswa_name, s.nis
      FROM nilai n
      JOIN siswa s ON n.siswa_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE n.mapel_id = ?`;
        const params = [req.params.mapelId];
        if (semester) { query += ' AND n.semester = ?'; params.push(semester); }
        if (tahun_ajaran_id) { query += ' AND n.tahun_ajaran_id = ?'; params.push(tahun_ajaran_id); }
        query += ' ORDER BY u.name';

        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// POST/PUT nilai - upsert
router.post('/nilai', isGuru, async (req, res) => {
    try {
        const { siswa_id, mapel_id, tahun_ajaran_id, semester, nilai_tugas, nilai_uts, nilai_uas, catatan } = req.body;

        // Verify guru owns mapel
        const [mapel] = await db.query('SELECT * FROM mata_pelajaran WHERE id = ? AND guru_id = ?', [mapel_id, req.user.id]);
        if (!mapel.length) return res.status(403).json({ success: false, message: 'Anda tidak berhak mengubah nilai mapel ini.' });

        const tugas = parseFloat(nilai_tugas) || 0;
        const uts = parseFloat(nilai_uts) || 0;
        const uas = parseFloat(nilai_uas) || 0;
        const final = Math.round((tugas * 0.3 + uts * 0.3 + uas * 0.4) * 100) / 100;

        let grade = 'D';
        if (final >= 90) grade = 'A';
        else if (final >= 80) grade = 'B';
        else if (final >= 70) grade = 'C';
        else if (final >= 60) grade = 'D';

        await db.query(`
      INSERT INTO nilai (siswa_id, mapel_id, tahun_ajaran_id, semester, nilai_tugas, nilai_uts, nilai_uas, nilai_akhir, grade, catatan)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE nilai_tugas=?, nilai_uts=?, nilai_uas=?, nilai_akhir=?, grade=?, catatan=?`,
            [siswa_id, mapel_id, tahun_ajaran_id, semester, tugas, uts, uas, final, grade, catatan,
                tugas, uts, uas, final, grade, catatan]);

        res.json({ success: true, message: 'Nilai berhasil disimpan.', data: { nilai_akhir: final, grade } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// GET Absensi
router.get('/absensi/:mapelId', isGuru, async (req, res) => {
    try {
        const { tanggal, kelas_id } = req.query;
        let query = `
      SELECT a.*, u.name as siswa_name, s.nis
      FROM absensi a
      JOIN siswa s ON a.siswa_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE a.mapel_id = ?`;
        const params = [req.params.mapelId];
        if (tanggal) { query += ' AND a.tanggal = ?'; params.push(tanggal); }
        if (kelas_id) { query += ' AND a.kelas_id = ?'; params.push(kelas_id); }
        query += ' ORDER BY u.name';

        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// POST Absensi
router.post('/absensi', isGuru, async (req, res) => {
    try {
        const absensiData = req.body; // array of {siswa_id, kelas_id, mapel_id, tanggal, status, catatan}
        if (!Array.isArray(absensiData) || !absensiData.length) {
            return res.status(400).json({ success: false, message: 'Data absensi tidak valid.' });
        }

        for (const item of absensiData) {
            await db.query(`
        INSERT INTO absensi (siswa_id, kelas_id, mapel_id, tanggal, status, catatan)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status=?, catatan=?`,
                [item.siswa_id, item.kelas_id, item.mapel_id, item.tanggal, item.status, item.catatan || null,
                item.status, item.catatan || null]);
        }
        res.json({ success: true, message: 'Absensi berhasil disimpan.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// GET Tahun Ajaran list
router.get('/tahun-ajaran', isGuru, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM tahun_ajaran ORDER BY tahun DESC');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

module.exports = router;
