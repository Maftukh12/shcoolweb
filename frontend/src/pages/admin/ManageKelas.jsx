import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

export default function ManageKelas() {
    const [kelas, setKelas] = useState([]);
    const [guru, setGuru] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ nama_kelas: '', tingkat: '7', wali_kelas_id: '' });
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const [k, g] = await Promise.all([api.get('/admin/kelas'), api.get('/admin/list/guru')]);
        setKelas(k.data.data);
        setGuru(g.data.data);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const openAdd = () => { setEditing(null); setForm({ nama_kelas: '', tingkat: '7', wali_kelas_id: '' }); setModal(true); };
    const openEdit = (k) => { setEditing(k); setForm({ nama_kelas: k.nama_kelas, tingkat: k.tingkat, wali_kelas_id: k.wali_kelas_id || '' }); setModal(true); };

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            if (editing) await api.put(`/admin/kelas/${editing.id}`, form);
            else await api.post('/admin/kelas', form);
            setModal(false); fetchData();
        } catch (err) { alert(err.response?.data?.message || 'Gagal menyimpan.'); }
        finally { setSaving(false); }
    };

    return (
        <div className="animate-fadeIn">
            <div className="page-header"><h2 className="page-title">Data Kelas</h2><p className="page-subtitle">Kelola pembagian kelas sekolah</p></div>
            <div className="card">
                <div className="card-header">
                    <div><div className="card-title">Daftar Kelas</div><div className="card-subtitle">Total: {kelas.length} kelas</div></div>
                    <button className="btn btn-primary" onClick={openAdd}><MdAdd size={18} />Tambah Kelas</button>
                </div>
                {loading ? <div className="loading-page" style={{ height: 200 }}><div className="spinner" /></div> : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead><tr><th>Nama Kelas</th><th>Tingkat</th><th>Wali Kelas</th><th>Jumlah Siswa</th><th>Aksi</th></tr></thead>
                            <tbody>
                                {kelas.map(k => (
                                    <tr key={k.id}>
                                        <td><strong>{k.nama_kelas}</strong></td>
                                        <td><span className="badge badge-primary">Kelas {k.tingkat}</span></td>
                                        <td>{k.wali_kelas_nama || <span style={{ color: 'var(--text-muted)' }}>Belum ditentukan</span>}</td>
                                        <td><span className="badge badge-gray">{k.jumlah_siswa || 0} siswa</span></td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn btn-sm btn-outline" onClick={() => openEdit(k)}><MdEdit size={15} /></button>
                                                <button className="btn btn-sm btn-danger" onClick={async () => { if (confirm('Hapus kelas ini?')) { await api.delete(`/admin/kelas/${k.id}`); fetchData(); } }}><MdDelete size={15} /></button>
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
                            <h3 className="modal-title">{editing ? 'Edit Kelas' : 'Tambah Kelas'}</h3>
                            <button className="modal-close" onClick={() => setModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSave} className="modal-form">
                            <div className="form-group"><label className="form-label">Nama Kelas *</label><input className="form-control" placeholder="contoh: X-A" value={form.nama_kelas} onChange={e => setForm(p => ({ ...p, nama_kelas: e.target.value }))} required /></div>
                            <div className="form-group"><label className="form-label">Tingkat *</label>
                                <select className="form-control" value={form.tingkat} onChange={e => setForm(p => ({ ...p, tingkat: e.target.value }))}>
                                    {['7', '8', '9', '10', '11', '12'].map(t => <option key={t} value={t}>Kelas {t}</option>)}
                                </select>
                            </div>
                            <div className="form-group"><label className="form-label">Wali Kelas</label>
                                <select className="form-control" value={form.wali_kelas_id} onChange={e => setForm(p => ({ ...p, wali_kelas_id: e.target.value }))}>
                                    <option value="">Pilih Guru</option>
                                    {guru.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
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
