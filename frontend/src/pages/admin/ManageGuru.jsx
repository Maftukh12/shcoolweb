import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { MdAdd, MdEdit, MdDelete, MdSearch } from 'react-icons/md';

export default function ManageGuru() {
    const [guru, setGuru] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', nip: '', phone: '', address: '', specialization: '' });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const { data } = await api.get('/admin/users?role=guru');
        setGuru(data.data);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const openAdd = () => { setEditing(null); setForm({ name: '', email: '', password: '', nip: '', phone: '', address: '', specialization: '' }); setModal(true); };
    const openEdit = (g) => { setEditing(g); setForm({ name: g.name, email: g.email, password: '', nip: '', phone: '', address: '', specialization: '' }); setModal(true); };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg('');
        try {
            if (editing) {
                await api.put(`/admin/users/${editing.id}`, { name: form.name, email: form.email, password: form.password, is_active: true });
            } else {
                await api.post('/admin/users', { ...form, role: 'guru' });
            }
            setMsg('Berhasil!');
            setModal(false);
            fetchData();
        } catch (err) {
            setMsg(err.response?.data?.message || 'Gagal.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus guru ini?')) return;
        await api.delete(`/admin/users/${id}`);
        fetchData();
    };

    const filtered = guru.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.email.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h2 className="page-title">Data Guru</h2>
                <p className="page-subtitle">Kelola data guru & pengajar</p>
            </div>
            <div className="card">
                <div className="card-header">
                    <div className="search-bar" style={{ width: 280 }}>
                        <MdSearch className="search-icon" />
                        <input placeholder="Cari guru..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button className="btn btn-primary" onClick={openAdd}><MdAdd size={18} />Tambah Guru</button>
                </div>
                {loading ? <div className="loading-page" style={{ height: 200 }}><div className="spinner" /></div> : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead><tr><th>#</th><th>Nama</th><th>Email</th><th>Status</th><th>Aksi</th></tr></thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={5}><div className="empty-state"><div className="empty-state-icon">👩‍🏫</div><h3>Belum ada guru</h3></div></td></tr>
                                ) : filtered.map((g, i) => (
                                    <tr key={g.id}>
                                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                        <td><strong>{g.name}</strong></td>
                                        <td style={{ color: 'var(--text-muted)' }}>{g.email}</td>
                                        <td><span className={`badge badge-${g.is_active ? 'success' : 'danger'}`}>{g.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn btn-sm btn-outline" onClick={() => openEdit(g)}><MdEdit size={15} /></button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(g.id)}><MdDelete size={15} /></button>
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
                            <h3 className="modal-title">{editing ? 'Edit Guru' : 'Tambah Guru'}</h3>
                            <button className="modal-close" onClick={() => setModal(false)}>×</button>
                        </div>
                        {msg && <div className={`alert ${msg.includes('Berhasil') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 16 }}>{msg}</div>}
                        <form onSubmit={handleSave} className="modal-form">
                            <div className="form-group"><label className="form-label">Nama *</label><input className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
                            <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-control" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required /></div>
                            <div className="form-group"><label className="form-label">Password {editing ? '(kosongkan jika tidak diubah)' : '*'}</label><input type="password" className="form-control" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required={!editing} /></div>
                            {!editing && <>
                                <div className="form-group"><label className="form-label">NIP</label><input className="form-control" value={form.nip} onChange={e => setForm(p => ({ ...p, nip: e.target.value }))} /></div>
                                <div className="form-group"><label className="form-label">Spesialisasi</label><input className="form-control" placeholder="Matematika, Bahasa Indonesia..." value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} /></div>
                                <div className="form-group"><label className="form-label">No. Telepon</label><input className="form-control" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
                            </>}
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
