import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

export default function ManagePengumuman() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ judul: '', isi: '', target_role: 'semua', is_published: true });
    const [saving, setSaving] = useState(false);

    const fetchData = async () => { setLoading(true); const r = await api.get('/admin/pengumuman'); setData(r.data.data); setLoading(false); };
    useEffect(() => { fetchData(); }, []);

    const openAdd = () => { setEditing(null); setForm({ judul: '', isi: '', target_role: 'semua', is_published: true }); setModal(true); };
    const openEdit = (p) => { setEditing(p); setForm({ judul: p.judul, isi: p.isi, target_role: p.target_role, is_published: p.is_published }); setModal(true); };

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            if (editing) await api.put(`/admin/pengumuman/${editing.id}`, form);
            else await api.post('/admin/pengumuman', form);
            setModal(false); fetchData();
        } catch (err) { alert('Gagal menyimpan.'); }
        finally { setSaving(false); }
    };

    const targetBadge = { semua: 'gray', guru: 'primary', siswa: 'success' };

    return (
        <div className="animate-fadeIn">
            <div className="page-header"><h2 className="page-title">Pengumuman</h2><p className="page-subtitle">Kelola pengumuman sekolah</p></div>
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Daftar Pengumuman</div>
                    <button className="btn btn-primary" onClick={openAdd}><MdAdd size={18} />Buat Pengumuman</button>
                </div>
                {loading ? <div className="loading-page" style={{ height: 200 }}><div className="spinner" /></div> : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead><tr><th>Judul</th><th>Target</th><th>Status</th><th>Tanggal</th><th>Aksi</th></tr></thead>
                            <tbody>
                                {data.map(p => (
                                    <tr key={p.id}>
                                        <td><strong>{p.judul}</strong><div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>oleh {p.author_name}</div></td>
                                        <td><span className={`badge badge-${targetBadge[p.target_role]}`}>{p.target_role}</span></td>
                                        <td><span className={`badge badge-${p.is_published ? 'success' : 'gray'}`}>{p.is_published ? 'Aktif' : 'Draft'}</span></td>
                                        <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(p.created_at).toLocaleDateString('id-ID')}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn btn-sm btn-outline" onClick={() => openEdit(p)}><MdEdit size={15} /></button>
                                                <button className="btn btn-sm btn-danger" onClick={async () => { if (confirm('Hapus?')) { await api.delete(`/admin/pengumuman/${p.id}`); fetchData(); } }}><MdDelete size={15} /></button>
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
                    <div className="modal" style={{ maxWidth: 640 }}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editing ? 'Edit' : 'Buat'} Pengumuman</h3>
                            <button className="modal-close" onClick={() => setModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSave} className="modal-form">
                            <div className="form-group"><label className="form-label">Judul *</label><input className="form-control" value={form.judul} onChange={e => setForm(p => ({ ...p, judul: e.target.value }))} required /></div>
                            <div className="form-group"><label className="form-label">Isi *</label><textarea className="form-control" rows={5} value={form.isi} onChange={e => setForm(p => ({ ...p, isi: e.target.value }))} required style={{ resize: 'vertical' }} /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="form-group"><label className="form-label">Target</label>
                                    <select className="form-control" value={form.target_role} onChange={e => setForm(p => ({ ...p, target_role: e.target.value }))}>
                                        <option value="semua">Semua</option>
                                        <option value="guru">Guru</option>
                                        <option value="siswa">Siswa</option>
                                    </select>
                                </div>
                                <div className="form-group"><label className="form-label">Status</label>
                                    <select className="form-control" value={form.is_published ? '1' : '0'} onChange={e => setForm(p => ({ ...p, is_published: e.target.value === '1' }))}>
                                        <option value="1">Aktif</option>
                                        <option value="0">Draft</option>
                                    </select>
                                </div>
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
