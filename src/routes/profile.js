const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// ─── Multer setup for avatar uploads ──────────────────────────────────────────
const avatarDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, avatarDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `avatar_${req.user.id}_${Date.now()}${ext}`);
    },
});
const fileFilter = (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.'));
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 3 * 1024 * 1024 } }); // 3 MB

// GET /api/profile — get current user's full profile
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (!users.length) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
        const user = users[0];

        let profile = {};
        if (user.role === 'guru') {
            const [rows] = await db.query('SELECT * FROM guru WHERE user_id = ?', [user.id]);
            if (rows.length) profile = rows[0];
        } else if (user.role === 'siswa') {
            const [rows] = await db.query(`
        SELECT s.*, k.nama_kelas, k.tingkat FROM siswa s
        LEFT JOIN kelas k ON s.kelas_id = k.id
        WHERE s.user_id = ?`, [user.id]);
            if (rows.length) profile = rows[0];
        }

        res.json({ success: true, data: { ...user, profile } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// PUT /api/profile — update name, email, phone, address
router.put('/', authMiddleware, async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        if (!name || !email) return res.status(400).json({ success: false, message: 'Nama dan email wajib diisi.' });

        await db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, req.user.id]);

        const { role } = req.user;
        if (role === 'guru') {
            await db.query('UPDATE guru SET phone = ?, address = ? WHERE user_id = ?', [phone || null, address || null, req.user.id]);
        } else if (role === 'siswa') {
            await db.query('UPDATE siswa SET phone = ?, address = ? WHERE user_id = ?', [phone || null, address || null, req.user.id]);
        }

        res.json({ success: true, message: 'Profil berhasil diperbarui.' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Email sudah digunakan.' });
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// PUT /api/profile/password — change password
router.put('/password', authMiddleware, async (req, res) => {
    try {
        const { current_password, new_password } = req.body;
        if (!current_password || !new_password)
            return res.status(400).json({ success: false, message: 'Password lama dan baru wajib diisi.' });
        if (new_password.length < 6)
            return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });

        const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
        const isMatch = await bcrypt.compare(current_password, rows[0].password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Password lama tidak sesuai.' });

        const hashed = await bcrypt.hash(new_password, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);

        res.json({ success: true, message: 'Password berhasil diubah.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// POST /api/profile/avatar — upload profile photo
router.post('/avatar', authMiddleware, (req, res) => {
    upload.single('avatar')(req, res, async (err) => {
        if (err) {
            const msg = err.code === 'LIMIT_FILE_SIZE'
                ? 'Ukuran file maksimal 3 MB.'
                : err.message || 'Gagal mengunggah foto.';
            return res.status(400).json({ success: false, message: msg });
        }
        if (!req.file) return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah.' });

        try {
            // Delete previous avatar file if exists
            const [rows] = await db.query('SELECT avatar FROM users WHERE id = ?', [req.user.id]);
            const oldAvatar = rows[0]?.avatar;
            if (oldAvatar) {
                const oldPath = path.join(__dirname, '../../', oldAvatar.replace('/uploads/', 'uploads/'));
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }

            const avatarUrl = `/uploads/avatars/${req.file.filename}`;
            await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, req.user.id]);

            res.json({ success: true, message: 'Foto profil berhasil diperbarui.', data: { avatar: avatarUrl } });
        } catch (dbErr) {
            console.error(dbErr);
            res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
        }
    });
});

// DELETE /api/profile/avatar — remove profile photo
router.delete('/avatar', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT avatar FROM users WHERE id = ?', [req.user.id]);
        const oldAvatar = rows[0]?.avatar;
        if (oldAvatar) {
            const oldPath = path.join(__dirname, '../../', oldAvatar.replace('/uploads/', 'uploads/'));
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        await db.query('UPDATE users SET avatar = NULL WHERE id = ?', [req.user.id]);
        res.json({ success: true, message: 'Foto profil berhasil dihapus.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

module.exports = router;
