import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function PengumumanSiswa() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/siswa/pengumuman').then(r => setData(r.data.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    return (
        <div className="animate-fadeIn">
            <div className="page-header"><h2 className="page-title">Pengumuman</h2><p className="page-subtitle">Informasi terbaru dari sekolah</p></div>
            {loading ? <div className="loading-page"><div className="spinner" /></div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {data.length === 0 ? (
                        <div className="empty-state"><div className="empty-state-icon">📢</div><h3>Belum ada pengumuman</h3></div>
                    ) : data.map(p => (
                        <div key={p.id} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{p.judul}</h3>
                                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{p.isi}</p>
                                </div>
                            </div>
                            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                                <span>📅 {new Date(p.created_at).toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
                                <span>✍️ {p.author_name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
