# Website Sekolah - Full Stack App

Website sekolah lengkap dengan React.js (frontend), Node.js (backend), dan MySQL (database).

## Struktur Project

```
d:\pro\
├── database/
│   ├── schema.sql         # DDL schema database
│   └── seed.sql           # Data awal (admin, guru, siswa)
├── src/
│   ├── config/db.js       # Koneksi MySQL
│   ├── middleware/auth.js  # JWT middleware
│   └── routes/            # API routes
│       ├── auth.js        # Login, me
│       ├── admin.js       # CRUD semua data
│       ├── guru.js        # Nilai & absensi
│       └── siswa.js       # View data siswa
├── frontend/              # React + Vite
│   └── src/
│       ├── pages/admin/   # 7 halaman admin
│       ├── pages/guru/    # 3 halaman guru
│       └── pages/siswa/   # 4 halaman siswa
├── server.js              # Entry point backend
└── .env                   # Konfigurasi (edit DB credentials)
```

## Setup Database MySQL

1. Buka MySQL Workbench atau terminal MySQL
2. Jalankan file schema: `source d:\pro\database\schema.sql`
3. Jalankan seed data: `source d:\pro\database\seed.sql`

Atau via CLI:
```bash
mysql -u root -p < d:\pro\database\schema.sql
mysql -u root -p < d:\pro\database\seed.sql
```

## Konfigurasi `.env`

Edit `d:\pro\.env` sesuai kredensial MySQL Anda:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=       # Kosong jika tidak ada password
DB_NAME=sekolah_db
JWT_SECRET=sekolah_secret_jwt_2025_very_secure_key
```

## Menjalankan Aplikasi

### Backend (Terminal 1)
```bash
cd d:\pro
node server.js
# Server berjalan di http://localhost:5000
```

### Frontend (Terminal 2)
```bash
cd d:\pro\frontend
npm run dev
# Buka http://localhost:5173
```

## Akun Demo

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sekolah.com | Admin@123 |
| Guru | budi@sekolah.com | Admin@123 |
| Siswa | ahmad@sekolah.com | Admin@123 |

> **Catatan:** Password di seed.sql sudah di-hash dengan bcrypt.
> Jika login gagal, generate ulang hash dengan:
> ```bash
> cd d:\pro && node -e "const b=require('bcryptjs'); b.hash('Admin@123',10).then(h=>console.log(h))"
> ```
> Lalu update tabel users dengan hash baru.

## Fitur

### Admin
- Dashboard statistik sekolah
- CRUD Siswa, Guru, Kelas, Mata Pelajaran
- Kelola Pengumuman & Berita

### Guru
- Dashboard kelas yang diajar
- Input nilai dengan kalkulasi otomatis (Tugas 30% + UTS 30% + UAS 40%)
- Input absensi per kelas

### Siswa
- Dashboard personal (rata-rata nilai, kehadiran)
- Lihat rekap nilai & grade
- Jadwal pelajaran per hari
- Pengumuman sekolah
