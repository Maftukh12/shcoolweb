import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function InputNilai() {
    const [mapel, setMapel] = useState([]);
    const [selectedMapel, setSelectedMapel] = useState('');
    const [siswa, setSiswa] = useState([]);
    const [nilai, setNilai] = useState({});
    const [tahunAjaran, setTahunAjaran] = useState([]);
    const [selectedTA, setSelectedTA] = useState('');
    const [semester, setSemester] = useState('genap');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        Promise.all([api.get('/guru/mapel'), api.get('/guru/tahun-ajaran')])
            .then(([m, t]) => {
                setMapel(m.data.data);
                setTahunAjaran(t.data.data);
                if (t.data.data.length) setSelectedTA(t.data.data[0].id);
            });
    }, []);

    useEffect(() => {
        if (!selectedMapel) { setSiswa([]); setNilai({}); return; }
        setLoading(true);
        const mapelObj = mapel.find(m => m.id === parseInt(selectedMapel));
        if (!mapelObj?.kelas_id) { setLoading(false); return; }

        Promise.all([
            api.get(`/guru/kelas/${mapelObj.kelas_id}/siswa`),
            api.get(`/guru/nilai/${selectedMapel}?semester=${semester}&tahun_ajaran_id=${selectedTA}`)
        ]).then(([s, n]) => {
            setSiswa(s.data.data);
            const nilaiMap = {};
            n.data.data.forEach(item => {
                nilaiMap[item.siswa_id] = { nilai_tugas: item.nilai_tugas, nilai_uts: item.nilai_uts, nilai_uas: item.nilai_uas };
            });
            setNilai(nilaiMap);
        }).finally(() => setLoading(false));
    }, [selectedMapel, semester, selectedTA]);

    const handleNilaiChange = (siswaId, field, val) => {
        setNilai(prev => ({ ...prev, [siswaId]: { ...prev[siswaId], [field]: val } }));
    };

    const handleSave = async () => {
        setSaving(true); setMsg('');
        try {
            for (const s of siswa) {
                const n = nilai[s.id] || {};
                await api.post('/guru/nilai', {
                    siswa_id: s.id, mapel_id: parseInt(selectedMapel),
                    tahun_ajaran_id: parseInt(selectedTA), semester,
                    nilai_tugas: n.nilai_tugas || 0, nilai_uts: n.nilai_uts || 0, nilai_uas: n.nilai_uas || 0,
                });
            }
            setMsg('✅ Nilai berhasil disimpan!');
        } catch (err) {
            setMsg('❌ Gagal menyimpan nilai.');
        } finally {
            setSaving(false);
        }
    };

    const calcFinal = (id) => {
        const n = nilai[id];
        if (!n) return '-';
        const f = (parseFloat(n.nilai_tugas || 0) * 0.3 + parseFloat(n.nilai_uts || 0) * 0.3 + parseFloat(n.nilai_uas || 0) * 0.4).toFixed(1);
        return f;
    };

    const getGrade = (final) => {
        if (final === '-') return '-';
        const f = parseFloat(final);
        if (f >= 90) return 'A';
        if (f >= 80) return 'B';
        if (f >= 70) return 'C';
        if (f >= 60) return 'D';
        return 'E';
    };

    return (
        <div className="animate-fadeIn">
            <div className="page-header"><h2 className="page-title">Input Nilai</h2><p className="page-subtitle">Masukkan nilai siswa per mata pelajaran</p></div>

            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Mata Pelajaran</label>
                        <select className="form-control" value={selectedMapel} onChange={e => setSelectedMapel(e.target.value)}>
                            <option value="">Pilih Mata Pelajaran</option>
                            {mapel.map(m => <option key={m.id} value={m.id}>{m.nama} ({m.nama_kelas})</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Tahun Ajaran</label>
                        <select className="form-control" value={selectedTA} onChange={e => setSelectedTA(e.target.value)}>
                            {tahunAjaran.map(t => <option key={t.id} value={t.id}>{t.tahun} - {t.semester}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Semester</label>
                        <select className="form-control" value={semester} onChange={e => setSemester(e.target.value)}>
                            <option value="ganjil">Ganjil</option>
                            <option value="genap">Genap</option>
                        </select>
                    </div>
                </div>
            </div>

            {msg && <div className={`alert ${msg.includes('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 16 }}>{msg}</div>}

            {selectedMapel && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Daftar Nilai Siswa</div>
                        {siswa.length > 0 && (
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? 'Menyimpan...' : '💾 Simpan Semua'}
                            </button>
                        )}
                    </div>
                    {loading ? <div className="loading-page" style={{ height: 200 }}><div className="spinner" /></div> : (
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>NIS</th><th>Nama Siswa</th>
                                        <th>Tugas (30%)</th><th>UTS (30%)</th><th>UAS (40%)</th>
                                        <th>Nilai Akhir</th><th>Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {siswa.length === 0 ? (
                                        <tr><td colSpan={7}><div className="empty-state" style={{ padding: 24 }}><div>Tidak ada siswa di kelas ini</div></div></td></tr>
                                    ) : siswa.map(s => {
                                        const final = calcFinal(s.id);
                                        const grade = getGrade(final);
                                        return (
                                            <tr key={s.id}>
                                                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{s.nis}</td>
                                                <td><strong>{s.name}</strong></td>
                                                {['nilai_tugas', 'nilai_uts', 'nilai_uas'].map(field => (
                                                    <td key={field}>
                                                        <input
                                                            type="number" min="0" max="100" step="0.5"
                                                            className="form-control"
                                                            style={{ width: 80, textAlign: 'center' }}
                                                            value={nilai[s.id]?.[field] ?? ''}
                                                            onChange={e => handleNilaiChange(s.id, field, e.target.value)}
                                                        />
                                                    </td>
                                                ))}
                                                <td style={{ fontWeight: 700, fontSize: 16 }}>{final}</td>
                                                <td>
                                                    <span className={`badge badge-${grade === 'A' ? 'success' : grade === 'B' ? 'primary' : grade === 'C' ? 'warning' : 'danger'}`}>
                                                        {grade}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
