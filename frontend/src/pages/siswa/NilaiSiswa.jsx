import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function NilaiSiswa() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [semester, setSemester] = useState('');

    useEffect(() => {
        api.get(`/siswa/nilai${semester ? `?semester=${semester}` : ''}`)
            .then(r => setData(r.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [semester]);

    const gradeColor = { A: 'success', B: 'primary', C: 'warning', D: 'danger', E: 'danger' };
    const avg = data.length ? (data.reduce((s, n) => s + parseFloat(n.nilai_akhir || 0), 0) / data.length).toFixed(2) : 0;

    return (
        <div className="animate-fadeIn">
            <div className="page-header"><h2 className="page-title">Nilai Saya</h2><p className="page-subtitle">Rekap nilai akademik</p></div>

            {data.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
                    <div className="stat-card">
                        <div className="stat-info" style={{ width: '100%', textAlign: 'center' }}>
                            <div className="stat-value" style={{ color: 'var(--primary)' }}>{avg}</div>
                            <div className="stat-label">Rata-rata Nilai</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-info" style={{ width: '100%', textAlign: 'center' }}>
                            <div className="stat-value" style={{ color: 'var(--secondary)' }}>{data.length}</div>
                            <div className="stat-label">Mata Pelajaran</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <div className="card-title">Rekap Nilai</div>
                    <select className="form-control" style={{ width: 'auto' }} value={semester} onChange={e => setSemester(e.target.value)}>
                        <option value="">Semua Semester</option>
                        <option value="ganjil">Ganjil</option>
                        <option value="genap">Genap</option>
                    </select>
                </div>
                {loading ? <div className="loading-page" style={{ height: 200 }}><div className="spinner" /></div> : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr><th>Mata Pelajaran</th><th>Semester</th><th>Tugas</th><th>UTS</th><th>UAS</th><th>Nilai Akhir</th><th>Grade</th></tr>
                            </thead>
                            <tbody>
                                {data.length === 0 ? (
                                    <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-icon">📊</div><h3>Belum ada nilai</h3><p>Nilai akan muncul setelah guru menginputkan</p></div></td></tr>
                                ) : data.map(n => (
                                    <tr key={n.id}>
                                        <td><strong>{n.mapel_nama}</strong><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{n.kode}</div></td>
                                        <td><span className="badge badge-gray">{n.semester} {n.tahun}</span></td>
                                        <td>{parseFloat(n.nilai_tugas).toFixed(1)}</td>
                                        <td>{parseFloat(n.nilai_uts).toFixed(1)}</td>
                                        <td>{parseFloat(n.nilai_uas).toFixed(1)}</td>
                                        <td style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary)' }}>{parseFloat(n.nilai_akhir).toFixed(1)}</td>
                                        <td><span className={`badge badge-${gradeColor[n.grade] || 'gray'}`}>{n.grade}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
