import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { MdClass, MdPeople, MdBook } from 'react-icons/md';

function StatCard({ icon: Icon, label, value, color, bg }) {
    return (
        <div className="stat-card">
            <div className="stat-icon" style={{ background: bg, color }}>
                <Icon size={24} />
            </div>
            <div className="stat-info">
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
            </div>
        </div>
    );
}

export default function GuruDashboard() {
    const [stats, setStats] = useState(null);
    const [mapel, setMapel] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.get('/guru/dashboard'), api.get('/guru/mapel')])
            .then(([s, m]) => { setStats(s.data.data); setMapel(m.data.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h2 className="page-title">Dashboard Guru</h2>
                <p className="page-subtitle">Ringkasan kegiatan mengajar Anda</p>
            </div>

            <div className="stats-grid">
                <StatCard icon={MdClass} label="Kelas Dipegang" value={stats?.total_kelas || 0} color="#2563EB" bg="#DBEAFE" />
                <StatCard icon={MdPeople} label="Siswa Diajar" value={stats?.total_siswa || 0} color="#059669" bg="#D1FAE5" />
                <StatCard icon={MdBook} label="Mata Pelajaran" value={stats?.total_mapel || 0} color="#F59E0B" bg="#FEF3C7" />
            </div>

            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">Mata Pelajaran Saya</div>
                        <div className="card-subtitle">Daftar mata pelajaran yang Anda ampu</div>
                    </div>
                </div>
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr><th>Mata Pelajaran</th><th>Kode</th><th>Kelas</th><th>Jadwal</th><th>Ruangan</th><th>Siswa</th></tr>
                        </thead>
                        <tbody>
                            {mapel.length === 0 ? (
                                <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon">📚</div><h3>Belum ada mata pelajaran</h3></div></td></tr>
                            ) : mapel.map(m => (
                                <tr key={m.id}>
                                    <td><strong>{m.nama}</strong></td>
                                    <td><span className="badge badge-gray">{m.kode}</span></td>
                                    <td>{m.nama_kelas || '-'}</td>
                                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{m.hari ? `${m.hari}, ${m.jam_mulai?.slice(0, 5)}` : '-'}</td>
                                    <td style={{ fontSize: 13 }}>{m.ruangan || '-'}</td>
                                    <td><span className="badge badge-success">{m.jumlah_siswa || 0} siswa</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
