const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sekolah_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
});

// Test connection
pool.getConnection()
    .then(conn => {
        console.log('✅ Database terhubung:', process.env.DB_NAME);
        conn.release();
    })
    .catch(err => {
        console.error('❌ Gagal koneksi database:', err.message);
    });

module.exports = pool;
