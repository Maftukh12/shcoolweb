/**
 * Script untuk update/reset password semua user demo
 * Jalankan: node database/reset-password.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function resetPasswords() {
    console.log('🔑 Mereset password akun demo...\n');

    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sekolah_db',
    });

    try {
        const password = 'Admin@123';
        const hash = await bcrypt.hash(password, 10);
        console.log('Hash baru:', hash);

        await conn.query('UPDATE users SET password = ?', [hash]);
        console.log('✅ Password semua user berhasil diupdate!\n');
        console.log('📋 Akun Demo (semua pakai password yang sama):');
        console.log('   Admin  : admin@sekolah.com / Admin@123');
        console.log('   Guru   : budi@sekolah.com  / Admin@123');
        console.log('   Siswa  : ahmad@sekolah.com / Admin@123');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await conn.end();
    }
}

resetPasswords();
