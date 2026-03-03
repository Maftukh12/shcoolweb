import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { MdPeople, MdSchool, MdClass, MdBook } from 'react-icons/md';

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

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/dashboard')
            .then(r => setStats(r.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h2 className="page-title">Dashboard Admin</h2>
                <p className="page-subtitle">Selamat datang! Berikut ringkasan data sekolah.</p>
            </div>

            <div className="stats-grid">
                <StatCard icon={MdSchool} label="Total Siswa" value={stats?.total_siswa || 0} color="#2563EB" bg="#DBEAFE" />
                <StatCard icon={MdPeople} label="Total Guru" value={stats?.total_guru || 0} color="#059669" bg="#D1FAE5" />
                <StatCard icon={MdClass} label="Total Kelas" value={stats?.total_kelas || 0} color="#F59E0B" bg="#FEF3C7" />
                <StatCard icon={MdBook} label="Mata Pelajaran" value={stats?.total_mapel || 0} color="#7C3AED" bg="#EDE9FE" />
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">User Terbaru</div>
                            <div className="card-subtitle">Pendaftaran akun terkini</div>
                        </div>
                    </div>
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(stats?.recent_users || []).map(u => (
                                    <tr key={u.id}>
                                        <td><strong>{u.name}</strong></td>
                                        <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                                        <td>
                                            <span className={`badge badge-${u.role === 'admin' ? 'warning' : u.role === 'guru' ? 'primary' : 'success'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Berita Terbaru</div>
                            <div className="card-subtitle">Artikel yang baru dipublikasikan</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {(stats?.recent_news || []).map(n => (
                            <div key={n.id} style={{ padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{n.judul}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(n.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
