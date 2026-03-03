import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

export default function ManageMapel() {
    const [mapel, setMapel] = useState([]);
    const [guru, setGuru] = useState([]);
    const [kelas, setKelas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ nama: '', kode: '', guru_id: '', kelas_id: '', hari: '', jam_mulai: '', jam_selesai: '', ruangan: '' });
    const [saving, setSaving] = useState(false);
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const fetchData = async () => {
        setLoading(true);
        const [m, g, k] = await Promise.all([api.get('/admin/mapel'), api.get('/admin/list/guru'), api.get('/admin/list/kelas')]);
        setMapel(m.data.data); setGuru(g.data.data); setKelas(k.data.data);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const openAdd = () => { setEditing(null); setForm({ nama: '', kode: '', guru_id: '', kelas_id: '', hari: '', jam_mulai: '', jam_selesai: '', ruangan: '' }); setModal(true); };
    const openEdit = (m) => { setEditing(m); setForm({ nama: m.nama, kode: m.kode, guru_id: m.guru_id || '', kelas_id: m.kelas_id || '', hari: m.hari || '', jam_mulai: m.jam_mulai || '', jam_selesai: m.jam_selesai || '', ruangan: m.ruangan || '' }); setModal(true); };

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            if (editing) await api.put(`/admin/mapel/${editing.id}`, form);
            else await api.post('/admin/mapel', form);
            setModal(false); fetchData();
        } catch (err) { alert(err.response?.data?.message || 'Gagal.'); }
        finally { setSaving(false); }
    };

    return (
        <div className="animate-fadeIn">
            <div className="page-header"><h2 className="page-title">Mata Pelajaran</h2><p className="page-subtitle">Kelola mata pelajaran dan jadwal</p></div>
            <div className="card">
                <div className="card-header">
                    <div><div className="card-title">Daftar Mata Pelajaran</div><div className="card-subtitle">Total: {mapel.length} mata pelajaran</div></div>
                    <button className="btn btn-primary" onClick={openAdd}><MdAdd size={18} />Tambah</button>
                </div>
                {loading ? <div className="loading-page" style={{ height: 200 }}><div className="spinner" /></div> : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead><tr><th>Nama</th><th>Kode</th><th>Guru</th><th>Kelas</th><th>Jadwal</th><th>Aksi</th></tr></thead>
                            <tbody>
                                {mapel.map(m => (
                                    <tr key={m.id}>
                                        <td><strong>{m.nama}</strong></td>
                                        <td><span className="badge badge-gray">{m.kode}</span></td>
                                        <td>{m.guru_nama || '-'}</td>
                                        <td>{m.nama_kelas || '-'}</td>
                                        <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{m.hari ? `${m.hari}, ${m.jam_mulai?.slice(0, 5)}-${m.jam_selesai?.slice(0, 5)}` : '-'}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn btn-sm btn-outline" onClick={() => openEdit(m)}><MdEdit size={15} /></button>
                                                <button className="btn btn-sm btn-danger" onClick={async () => { if (confirm('Hapus mapel ini?')) { await api.delete(`/admin/mapel/${m.id}`); fetchData(); } }}><MdDelete size={15} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
                    <div className="modal">
                        <div className="modal-header">
                            <h3 className="modal-title">{editing ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}</h3>
                            <button className="modal-close" onClick={() => setModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSave} className="modal-form">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="form-group"><label className="form-label">Nama *</label><input className="form-control" value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} required /></div>
                                <div className="form-group"><label className="form-label">Kode *</label><input className="form-control" value={form.kode} onChange={e => setForm(p => ({ ...p, kode: e.target.value }))} required /></div>
                            </div>
                            <div className="form-group"><label className="form-label">Guru Pengampu</label>
                                <select className="form-control" value={form.guru_id} onChange={e => setForm(p => ({ ...p, guru_id: e.target.value }))}>
                                    <option value="">Pilih Guru</option>
                                    {guru.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group"><label className="form-label">Kelas</label>
                                <select className="form-control" value={form.kelas_id} onChange={e => setForm(p => ({ ...p, kelas_id: e.target.value }))}>
                                    <option value="">Pilih Kelas</option>
                                    {kelas.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                <div className="form-group"><label className="form-label">Hari</label>
                                    <select className="form-control" value={form.hari} onChange={e => setForm(p => ({ ...p, hari: e.target.value }))}>
                                        <option value="">Pilih</option>
                                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="form-group"><label className="form-label">Jam Mulai</label><input type="time" className="form-control" value={form.jam_mulai} onChange={e => setForm(p => ({ ...p, jam_mulai: e.target.value }))} /></div>
                                <div className="form-group"><label className="form-label">Jam Selesai</label><input type="time" className="form-control" value={form.jam_selesai} onChange={e => setForm(p => ({ ...p, jam_selesai: e.target.value }))} /></div>
                            </div>
                            <div className="form-group"><label className="form-label">Ruangan</label><input className="form-control" value={form.ruangan} onChange={e => setForm(p => ({ ...p, ruangan: e.target.value }))} /></div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
