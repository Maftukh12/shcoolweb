/**
 * Script untuk setup database sekolah
 * Jalankan: node database/setup.js
 * 
 * Pastikan .env sudah dikonfigurasi dengan benar
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setup() {
    console.log('🚀 Memulai setup database...\n');

    // Connect tanpa database dulu
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true,
    });

    try {
        console.log('✅ Koneksi MySQL berhasil\n');

        // Run schema
        console.log('📄 Membuat schema database...');
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await conn.query(schema);
        console.log('✅ Schema berhasil dibuat\n');

        // Run seed
        console.log('🌱 Mengisi data awal (seed)...');
        const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
        await conn.query(seed);
        console.log('✅ Data awal berhasil diisi\n');

        console.log('🎉 Setup selesai! Database siap digunakan.');
        console.log('\n📋 Akun Demo:');
        console.log('   Admin  : admin@sekolah.com / Admin@123');
        console.log('   Guru   : budi@sekolah.com  / Admin@123');
        console.log('   Siswa  : ahmad@sekolah.com / Admin@123');
        console.log('\n🚀 Jalankan server: node server.js');
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY' || err.message.includes('already exists')) {
            console.log('⚠️  Database sudah ada. Skip seed data (tidak akan duplikasi).');
        } else {
            console.error('❌ Error:', err.message);
            process.exit(1);
        }
    } finally {
        await conn.end();
    }
}

setup();
