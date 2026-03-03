import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { MdGrade, MdCheckCircle, MdSchool } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

export default function SiswaDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        api.get('/siswa/dashboard').then(r => setData(r.data.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;

    const siswa = data?.siswa;
    const pengumuman = data?.pengumuman || [];

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h2 className="page-title">Selamat Datang, {user?.name?.split(' ')[0]}!</h2>
                <p className="page-subtitle">{siswa?.nama_kelas ? `Kelas ${siswa.nama_kelas} · ` : ''}Portal Siswa SMPN 1 Cerdas</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#DBEAFE', color: '#2563EB' }}><MdGrade size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{data?.avg_nilai || '0'}</div>
                        <div className="stat-label">Rata-rata Nilai</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#D1FAE5', color: '#059669' }}><MdCheckCircle size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{data?.kehadiran || 100}%</div>
                        <div className="stat-label">Kehadiran</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#FEF3C7', color: '#F59E0B' }}><MdSchool size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{siswa?.nis || '-'}</div>
                        <div className="stat-label">Nomor Induk Siswa</div>
                    </div>
                </div>
            </div>

            <div className="grid-2">
                {/* Info Siswa */}
                <div className="card">
                    <div className="card-header"><div className="card-title">Info Saya</div></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { label: 'Nama Lengkap', value: user?.name },
                            { label: 'Kelas', value: siswa?.nama_kelas || '-' },
                            { label: 'NIS', value: siswa?.nis || '-' },
                            { label: 'Nama Orang Tua', value: siswa?.parent_name || '-' },
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
                                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.label}</span>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pengumuman Terbaru */}
                <div className="card">
                    <div className="card-header"><div className="card-title">Pengumuman Terbaru</div></div>
                    {pengumuman.length === 0 ? (
                        <div className="empty-state"><div className="empty-state-icon">📢</div><h3>Belum ada pengumuman</h3></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {pengumuman.map(p => (
                                <div key={p.id} style={{ padding: '12px 14px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary)' }}>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.judul}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(p.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
