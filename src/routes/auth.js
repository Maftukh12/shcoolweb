const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email dan password harus diisi.' });
        }

        const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND is_active = TRUE', [email]);
        if (!rows.length) {
            return res.status(401).json({ success: false, message: 'Email atau password salah.' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Email atau password salah.' });
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Get extra profile data based on role
        let profileData = {};
        if (user.role === 'guru') {
            const [guru] = await db.query('SELECT * FROM guru WHERE user_id = ?', [user.id]);
            if (guru.length) profileData = guru[0];
        } else if (user.role === 'siswa') {
            const [siswa] = await db.query(`
        SELECT s.*, k.nama_kelas, k.tingkat FROM siswa s
        LEFT JOIN kelas k ON s.kelas_id = k.id
        WHERE s.user_id = ?`, [user.id]);
            if (siswa.length) profileData = siswa[0];
        }

        res.json({
            success: true,
            message: 'Login berhasil.',
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                    profile: profileData,
                },
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?', [req.user.id]);
        if (!rows.length) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });

        const user = rows[0];
        let profileData = {};
        if (user.role === 'guru') {
            const [guru] = await db.query('SELECT * FROM guru WHERE user_id = ?', [user.id]);
            if (guru.length) profileData = guru[0];
        } else if (user.role === 'siswa') {
            const [siswa] = await db.query(`
        SELECT s.*, k.nama_kelas, k.tingkat FROM siswa s
        LEFT JOIN kelas k ON s.kelas_id = k.id
        WHERE s.user_id = ?`, [user.id]);
            if (siswa.length) profileData = siswa[0];
        }

        res.json({ success: true, data: { ...user, profile: profileData } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

module.exports = router;
