import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

export default function ManageBerita() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ judul: '', isi: '', is_published: true });
    const [saving, setSaving] = useState(false);

    const fetchData = async () => { setLoading(true); const r = await api.get('/admin/berita'); setData(r.data.data); setLoading(false); };
    useEffect(() => { fetchData(); }, []);

    const openAdd = () => { setEditing(null); setForm({ judul: '', isi: '', is_published: true }); setModal(true); };
    const openEdit = (b) => { setEditing(b); setForm({ judul: b.judul, isi: b.isi, is_published: b.is_published }); setModal(true); };

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            if (editing) await api.put(`/admin/berita/${editing.id}`, form);
            else await api.post('/admin/berita', form);
            setModal(false); fetchData();
        } catch { alert('Gagal menyimpan.'); }
        finally { setSaving(false); }
    };

    return (
        <div className="animate-fadeIn">
            <div className="page-header"><h2 className="page-title">Berita Sekolah</h2><p className="page-subtitle">Kelola artikel dan berita sekolah</p></div>
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Daftar Berita</div>
                    <button className="btn btn-primary" onClick={openAdd}><MdAdd size={18} />Tulis Berita</button>
                </div>
                {loading ? <div className="loading-page" style={{ height: 200 }}><div className="spinner" /></div> : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead><tr><th>Judul</th><th>Status</th><th>Views</th><th>Tanggal</th><th>Aksi</th></tr></thead>
                            <tbody>
                                {data.length === 0 ? (
                                    <tr><td colSpan={5}><div className="empty-state"><div className="empty-state-icon">📰</div><h3>Belum ada berita</h3></div></td></tr>
                                ) : data.map(b => (
                                    <tr key={b.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{b.judul}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>oleh {b.author_name}</div>
                                        </td>
                                        <td><span className={`badge badge-${b.is_published ? 'success' : 'gray'}`}>{b.is_published ? 'Aktif' : 'Draft'}</span></td>
                                        <td><span className="badge badge-gray">👁 {b.views}</span></td>
                                        <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(b.created_at).toLocaleDateString('id-ID')}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn btn-sm btn-outline" onClick={() => openEdit(b)}><MdEdit size={15} /></button>
                                                <button className="btn btn-sm btn-danger" onClick={async () => { if (confirm('Hapus berita ini?')) { await api.delete(`/admin/berita/${b.id}`); fetchData(); } }}><MdDelete size={15} /></button>
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
                    <div className="modal" style={{ maxWidth: 680 }}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editing ? 'Edit' : 'Tulis'} Berita</h3>
                            <button className="modal-close" onClick={() => setModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSave} className="modal-form">
                            <div className="form-group"><label className="form-label">Judul *</label><input className="form-control" value={form.judul} onChange={e => setForm(p => ({ ...p, judul: e.target.value }))} required /></div>
                            <div className="form-group"><label className="form-label">Isi Berita *</label><textarea className="form-control" rows={7} value={form.isi} onChange={e => setForm(p => ({ ...p, isi: e.target.value }))} required style={{ resize: 'vertical' }} /></div>
                            <div className="form-group"><label className="form-label">Status</label>
                                <select className="form-control" value={form.is_published ? '1' : '0'} onChange={e => setForm(p => ({ ...p, is_published: e.target.value === '1' }))}>
                                    <option value="1">Publikasikan</option>
                                    <option value="0">Simpan sebagai Draft</option>
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
