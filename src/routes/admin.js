const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { authMiddleware, authorize } = require('../middleware/auth');

const isAdmin = [authMiddleware, authorize('admin')];

// ========================
// DASHBOARD STATS
// ========================
router.get('/dashboard', isAdmin, async (req, res) => {
    try {
        const [[{ total_siswa }]] = await db.query('SELECT COUNT(*) as total_siswa FROM users WHERE role = "siswa"');
        const [[{ total_guru }]] = await db.query('SELECT COUNT(*) as total_guru FROM users WHERE role = "guru"');
        const [[{ total_kelas }]] = await db.query('SELECT COUNT(*) as total_kelas FROM kelas');
        const [[{ total_mapel }]] = await db.query('SELECT COUNT(*) as total_mapel FROM mata_pelajaran');
        const [recent_users] = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5');
        const [recent_news] = await db.query('SELECT id, judul, created_at FROM berita ORDER BY created_at DESC LIMIT 5');

        res.json({
            success: true,
            data: { total_siswa, total_guru, total_kelas, total_mapel, recent_users, recent_news }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// ========================
// MANAGE USERS
// ========================
router.get('/users', isAdmin, async (req, res) => {
    try {
        const { role, search } = req.query;
        let query = 'SELECT id, name, email, role, avatar, is_active, created_at FROM users WHERE 1=1';
        const params = [];
        if (role) { query += ' AND role = ?'; params.push(role); }
        if (search) { query += ' AND (name LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
        query += ' ORDER BY created_at DESC';
        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

router.post('/users', isAdmin, async (req, res) => {
    try {
        const { name, email, password, role, nip, nis, kelas_id, phone, address, gender, birth_date, parent_name, parent_phone, specialization } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'Nama, email, password, dan role wajib diisi.' });
        }
        const hashed = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashed, role]
        );
        const userId = result.insertId;

        if (role === 'guru') {
            await db.query('INSERT INTO guru (user_id, nip, phone, address, specialization) VALUES (?, ?, ?, ?, ?)',
                [userId, nip || null, phone || null, address || null, specialization || null]);
        } else if (role === 'siswa') {
            await db.query('INSERT INTO siswa (user_id, nis, kelas_id, phone, address, parent_name, parent_phone, birth_date, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [userId, nis || null, kelas_id || null, phone || null, address || null, parent_name || null, parent_phone || null, birth_date || null, gender || null]);
        }
        res.status(201).json({ success: true, message: 'User berhasil ditambahkan.', data: { id: userId } });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' });
        console.error(err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

router.put('/users/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, is_active } = req.body;
        let query = 'UPDATE users SET name = ?, email = ?, is_active = ?';
        const params = [name, email, is_active !== undefined ? is_active : true];
        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            query += ', password = ?';
            params.push(hashed);
        }
        query += ' WHERE id = ?';
        params.push(id);
        await db.query(query, params);
        res.json({ success: true, message: 'User berhasil diupdate.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

router.delete('/users/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (parseInt(id) === req.user.id) return res.status(400).json({ success: false, message: 'Tidak dapat menghapus akun sendiri.' });
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ success: true, message: 'User berhasil dihapus.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// ========================
// MANAGE KELAS
// ========================
router.get('/kelas', isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT k.*, u.name as wali_kelas_nama, ta.tahun, ta.semester,
      (SELECT COUNT(*) FROM siswa WHERE kelas_id = k.id) as jumlah_siswa
      FROM kelas k
      LEFT JOIN users u ON k.wali_kelas_id = u.id
      LEFT JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
      ORDER BY k.tingkat, k.nama_kelas`);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

router.post('/kelas', isAdmin, async (req, res) => {
    try {
        const { nama_kelas, tingkat, wali_kelas_id, tahun_ajaran_id } = req.body;
        const [result] = await db.query(
            'INSERT INTO kelas (nama_kelas, tingkat, wali_kelas_id, tahun_ajaran_id) VALUES (?, ?, ?, ?)',
            [nama_kelas, tingkat, wali_kelas_id || null, tahun_ajaran_id || null]
        );
        res.status(201).json({ success: true, message: 'Kelas berhasil ditambahkan.', data: { id: result.insertId } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

router.put('/kelas/:id', isAdmin, async (req, res) => {
    try {
        const { nama_kelas, tingkat, wali_kelas_id, tahun_ajaran_id } = req.body;
        await db.query('UPDATE kelas SET nama_kelas=?, tingkat=?, wali_kelas_id=?, tahun_ajaran_id=? WHERE id=?',
            [nama_kelas, tingkat, wali_kelas_id || null, tahun_ajaran_id || null, req.params.id]);
        res.json({ success: true, message: 'Kelas berhasil diupdate.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

router.delete('/kelas/:id', isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM kelas WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Kelas berhasil dihapus.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// ========================
// MANAGE MATA PELAJARAN
// ========================
router.get('/mapel', isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT m.*, u.name as guru_nama, k.nama_kelas
      FROM mata_pelajaran m
      LEFT JOIN users u ON m.guru_id = u.id
      LEFT JOIN kelas k ON m.kelas_id = k.id
      ORDER BY m.nama`);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

router.post('/mapel', isAdmin, async (req, res) => {
    try {
        const { nama, kode, guru_id, kelas_id, hari, jam_mulai, jam_selesai, ruangan } = req.body;
        const [result] = await db.query(
            'INSERT INTO mata_pelajaran (nama, kode, guru_id, kelas_id, hari, jam_mulai, jam_selesai, ruangan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nama, kode, guru_id || null, kelas_id || null, hari || null, jam_mulai || null, jam_selesai || null, ruangan || null]
        );
        res.status(201).json({ success: true, message: 'Mata pelajaran berhasil ditambahkan.', data: { id: result.insertId } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

router.put('/mapel/:id', isAdmin, async (req, res) => {
    try {
        const { nama, kode, guru_id, kelas_id, hari, jam_mulai, jam_selesai, ruangan } = req.body;
        await db.query('UPDATE mata_pelajaran SET nama=?, kode=?, guru_id=?, kelas_id=?, hari=?, jam_mulai=?, jam_selesai=?, ruangan=? WHERE id=?',
            [nama, kode, guru_id || null, kelas_id || null, hari || null, jam_mulai || null, jam_selesai || null, ruangan || null, req.params.id]);
        res.json({ success: true, message: 'Mata pelajaran berhasil diupdate.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

router.delete('/mapel/:id', isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM mata_pelajaran WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Mata pelajaran berhasil dihapus.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// ========================
// MANAGE PENGUMUMAN
// ========================
router.get('/pengumuman', isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT p.*, u.name as author_name FROM pengumuman p
      LEFT JOIN users u ON p.author_id = u.id
      ORDER BY p.created_at DESC`);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

router.post('/pengumuman', isAdmin, async (req, res) => {
    try {
        const { judul, isi, target_role } = req.body;
        const [result] = await db.query(
            'INSERT INTO pengumuman (judul, isi, target_role, author_id) VALUES (?, ?, ?, ?)',
            [judul, isi, target_role || 'semua', req.user.id]
        );
        res.status(201).json({ success: true, message: 'Pengumuman berhasil dibuat.', data: { id: result.insertId } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

router.put('/pengumuman/:id', isAdmin, async (req, res) => {
    try {
        const { judul, isi, target_role, is_published } = req.body;
        await db.query('UPDATE pengumuman SET judul=?, isi=?, target_role=?, is_published=? WHERE id=?',
            [judul, isi, target_role, is_published !== undefined ? is_published : true, req.params.id]);
        res.json({ success: true, message: 'Pengumuman berhasil diupdate.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

router.delete('/pengumuman/:id', isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM pengumuman WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Pengumuman berhasil dihapus.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// ========================
// MANAGE BERITA
// ========================
router.get('/berita', isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT b.*, u.name as author_name FROM berita b
      LEFT JOIN users u ON b.author_id = u.id
      ORDER BY b.created_at DESC`);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

router.post('/berita', isAdmin, async (req, res) => {
    try {
        const { judul, isi, image } = req.body;
        const [result] = await db.query(
            'INSERT INTO berita (judul, isi, image, author_id) VALUES (?, ?, ?, ?)',
            [judul, isi, image || null, req.user.id]
        );
        res.status(201).json({ success: true, message: 'Berita berhasil dibuat.', data: { id: result.insertId } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

router.put('/berita/:id', isAdmin, async (req, res) => {
    try {
        const { judul, isi, image, is_published } = req.body;
        await db.query('UPDATE berita SET judul=?, isi=?, image=?, is_published=? WHERE id=?',
            [judul, isi, image || null, is_published !== undefined ? is_published : true, req.params.id]);
        res.json({ success: true, message: 'Berita berhasil diupdate.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

router.delete('/berita/:id', isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM berita WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Berita berhasil dihapus.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// GURU LIST (for dropdown)
router.get('/list/guru', isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name, email FROM users WHERE role = "guru" AND is_active = TRUE ORDER BY name');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// KELAS LIST (for dropdown)
router.get('/list/kelas', isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nama_kelas, tingkat FROM kelas ORDER BY tingkat, nama_kelas');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// TAHUN AJARAN LIST
router.get('/list/tahun-ajaran', isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM tahun_ajaran ORDER BY tahun DESC');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

module.exports = router;
