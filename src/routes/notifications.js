const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

/**
 * GET /api/notifications
 * Mengembalikan daftar notifikasi (pengumuman + berita terbaru)
 * sesuai role user yang login.
 * Query: ?limit=10&since=<ISO date>
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { role, id: userId } = req.user;
        const limit = parseInt(req.query.limit) || 10;

        const notifications = [];

        // ---- Pengumuman ----
        let announcementQuery = `
      SELECT
        p.id,
        p.judul        AS title,
        p.isi          AS body,
        p.target_role,
        p.created_at,
        'pengumuman'   AS type,
        u.name         AS author
      FROM pengumuman p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.is_published = TRUE
    `;
        const announcementParams = [];

        if (role === 'siswa') {
            announcementQuery += " AND (p.target_role = 'semua' OR p.target_role = 'siswa')";
        } else if (role === 'guru') {
            announcementQuery += " AND (p.target_role = 'semua' OR p.target_role = 'guru')";
        }
        // admin sees all

        announcementQuery += ' ORDER BY p.created_at DESC LIMIT ?';
        announcementParams.push(limit);

        const [pengumuman] = await db.query(announcementQuery, announcementParams);
        notifications.push(...pengumuman);

        // ---- Berita (everyone sees published news) ----
        const [berita] = await db.query(`
      SELECT
        b.id,
        b.judul      AS title,
        b.isi        AS body,
        NULL         AS target_role,
        b.created_at,
        'berita'     AS type,
        u.name       AS author
      FROM berita b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.is_published = TRUE
      ORDER BY b.created_at DESC
      LIMIT ?
    `, [limit]);
        notifications.push(...berita);

        // Sort combined list by created_at desc, take top `limit`
        notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const top = notifications.slice(0, limit);

        // Count "new" — items from the last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newCount = top.filter(n => new Date(n.created_at) > sevenDaysAgo).length;

        res.json({
            success: true,
            data: {
                notifications: top,
                new_count: newCount,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

module.exports = router;
