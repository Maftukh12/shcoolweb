import { useState, useEffect } from 'react';
import api from '../../api/axios';

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const dayColors = ['#2563EB', '#059669', '#F59E0B', '#7C3AED', '#DC2626', '#0891B2'];

export default function JadwalSiswa() {
    const [jadwal, setJadwal] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/siswa/jadwal').then(r => setJadwal(r.data.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    const grouped = days.reduce((acc, day) => {
        acc[day] = jadwal.filter(j => j.hari === day);
        return acc;
    }, {});

    return (
        <div className="animate-fadeIn">
            <div className="page-header"><h2 className="page-title">Jadwal Pelajaran</h2><p className="page-subtitle">Jadwal pelajaran mingguan Anda</p></div>
            {loading ? <div className="loading-page"><div className="spinner" /></div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {days.map((day, i) => grouped[day].length > 0 && (
                        <div key={day}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: dayColors[i] }} />
                                <h3 style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>{day}</h3>
                                <span className="badge badge-gray">{grouped[day].length} pelajaran</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                                {grouped[day].map(j => (
                                    <div key={j.id} style={{ background: '#fff', border: `1px solid var(--border)`, borderLeft: `4px solid ${dayColors[i]}`, borderRadius: 'var(--radius-sm)', padding: '16px 18px' }}>
                                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{j.nama}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <div>👩‍🏫 {j.guru_nama || 'Belum ditentukan'}</div>
                                            <div>🕐 {j.jam_mulai?.slice(0, 5)} - {j.jam_selesai?.slice(0, 5)}</div>
                                            {j.ruangan && <div>🚪 {j.ruangan}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {jadwal.length === 0 && (
                        <div className="empty-state"><div className="empty-state-icon">📅</div><h3>Belum ada jadwal</h3><p>Jadwal akan muncul setelah admin mengaturnya</p></div>
                    )}
                </div>
            )}
        </div>
    );
}
