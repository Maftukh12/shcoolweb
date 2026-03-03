import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function InputAbsensi() {
    const [mapel, setMapel] = useState([]);
    const [selectedMapel, setSelectedMapel] = useState('');
    const [siswa, setSiswa] = useState([]);
    const [absensi, setAbsensi] = useState({});
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        api.get('/guru/mapel').then(m => setMapel(m.data.data));
    }, []);

    useEffect(() => {
        if (!selectedMapel) { setSiswa([]); setAbsensi({}); return; }
        const mapelObj = mapel.find(m => m.id === parseInt(selectedMapel));
        if (!mapelObj?.kelas_id) return;
        setLoading(true);
        api.get(`/guru/kelas/${mapelObj.kelas_id}/siswa`).then(s => {
            setSiswa(s.data.data);
            const map = {};
            s.data.data.forEach(siswa => { map[siswa.id] = 'hadir'; });
            setAbsensi(map);
        }).finally(() => setLoading(false));
    }, [selectedMapel]);

    const handleSave = async () => {
        setSaving(true); setMsg('');
        const mapelObj = mapel.find(m => m.id === parseInt(selectedMapel));
        try {
            const data = siswa.map(s => ({
                siswa_id: s.id, kelas_id: mapelObj.kelas_id, mapel_id: parseInt(selectedMapel),
                tanggal, status: absensi[s.id] || 'hadir',
            }));
            await api.post('/guru/absensi', data);
            setMsg('✅ Absensi berhasil disimpan!');
        } catch { setMsg('❌ Gagal menyimpan absensi.'); }
        finally { setSaving(false); }
    };

    const statusColors = { hadir: 'success', sakit: 'warning', izin: 'primary', alpha: 'danger' };

    return (
        <div className="animate-fadeIn">
            <div className="page-header"><h2 className="page-title">Absensi</h2><p className="page-subtitle">Catat kehadiran siswa di kelas</p></div>

            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Mata Pelajaran</label>
                        <select className="form-control" value={selectedMapel} onChange={e => setSelectedMapel(e.target.value)}>
                            <option value="">Pilih Mata Pelajaran</option>
                            {mapel.map(m => <option key={m.id} value={m.id}>{m.nama} ({m.nama_kelas})</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Tanggal</label>
                        <input type="date" className="form-control" value={tanggal} onChange={e => setTanggal(e.target.value)} />
                    </div>
                </div>
            </div>

            {msg && <div className={`alert ${msg.includes('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 16 }}>{msg}</div>}

            {selectedMapel && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Daftar Kehadiran - {tanggal}</div>
                        {siswa.length > 0 && (
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? 'Menyimpan...' : '💾 Simpan Absensi'}
                            </button>
                        )}
                    </div>
                    {loading ? <div className="loading-page" style={{ height: 200 }}><div className="spinner" /></div> : (
                        <div className="table-wrapper">
                            <table className="table">
                                <thead><tr><th>No</th><th>NIS</th><th>Nama</th><th>Status Kehadiran</th></tr></thead>
                                <tbody>
                                    {siswa.length === 0 ? (
                                        <tr><td colSpan={4}><div className="empty-state" style={{ padding: 24 }}><div>Tidak ada siswa di kelas ini</div></div></td></tr>
                                    ) : siswa.map((s, i) => (
                                        <tr key={s.id}>
                                            <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                            <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.nis}</td>
                                            <td><strong>{s.name}</strong></td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    {['hadir', 'sakit', 'izin', 'alpha'].map(st => (
                                                        <button
                                                            key={st}
                                                            type="button"
                                                            className={`badge badge-${absensi[s.id] === st ? statusColors[st] : 'gray'}`}
                                                            style={{ cursor: 'pointer', border: 'none', padding: '6px 14px', fontSize: 13 }}
                                                            onClick={() => setAbsensi(prev => ({ ...prev, [s.id]: st }))}
                                                        >
                                                            {st.charAt(0).toUpperCase() + st.slice(1)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
