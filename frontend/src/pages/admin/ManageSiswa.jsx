import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { MdAdd, MdEdit, MdDelete, MdSearch } from 'react-icons/md';

export default function ManageSiswa() {
    const [siswa, setSiswa] = useState([]);
    const [kelas, setKelas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', nis: '', kelas_id: '', phone: '', address: '', parent_name: '', parent_phone: '', gender: 'L', birth_date: '' });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const [s, k] = await Promise.all([
            api.get('/admin/users?role=siswa'),
            api.get('/admin/list/kelas'),
        ]);
        setSiswa(s.data.data);
        setKelas(k.data.data);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const openAdd = () => {
        setEditing(null);
        setForm({ name: '', email: '', password: '', nis: '', kelas_id: '', phone: '', address: '', parent_name: '', parent_phone: '', gender: 'L', birth_date: '' });
        setModal(true);
    };

    const openEdit = (s) => {
        setEditing(s);
        setForm({ name: s.name, email: s.email, password: '', nis: '', kelas_id: '', phone: '', address: '', parent_name: '', parent_phone: '', gender: 'L', birth_date: '' });
        setModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg('');
        try {
            if (editing) {
                await api.put(`/admin/users/${editing.id}`, { name: form.name, email: form.email, password: form.password, is_active: true });
            } else {
                await api.post('/admin/users', { ...form, role: 'siswa' });
            }
            setMsg('Berhasil disimpan!');
            setModal(false);
            fetchData();
        } catch (err) {
            setMsg(err.response?.data?.message || 'Gagal menyimpan.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus siswa ini?')) return;
        await api.delete(`/admin/users/${id}`);
        fetchData();
    };

    const filtered = siswa.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h2 className="page-title">Data Siswa</h2>
                <p className="page-subtitle">Kelola data siswa sekolah</p>
            </div>
            <div className="card">
                <div className="card-header">
                    <div className="search-bar" style={{ width: 280 }}>
                        <MdSearch className="search-icon" />
                        <input placeholder="Cari siswa..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button className="btn btn-primary" onClick={openAdd}><MdAdd size={18} />Tambah Siswa</button>
                </div>
                {loading ? <div className="loading-page" style={{ height: 200 }}><div className="spinner" /></div> : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr><th>#</th><th>Nama</th><th>Email</th><th>Status</th><th>Aksi</th></tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={5}><div className="empty-state"><div className="empty-state-icon">👨‍🎓</div><h3>Belum ada siswa</h3></div></td></tr>
                                ) : filtered.map((s, i) => (
                                    <tr key={s.id}>
                                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                        <td><strong>{s.name}</strong></td>
                                        <td style={{ color: 'var(--text-muted)' }}>{s.email}</td>
                                        <td><span className={`badge badge-${s.is_active ? 'success' : 'danger'}`}>{s.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn btn-sm btn-outline" onClick={() => openEdit(s)}><MdEdit size={15} /></button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.id)}><MdDelete size={15} /></button>
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
                            <h3 className="modal-title">{editing ? 'Edit Siswa' : 'Tambah Siswa'}</h3>
                            <button className="modal-close" onClick={() => setModal(false)}>×</button>
                        </div>
                        {msg && <div className={`alert ${msg.includes('Berhasil') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 16 }}>{msg}</div>}
                        <form onSubmit={handleSave} className="modal-form">
                            <div className="form-group"><label className="form-label">Nama Lengkap *</label><input className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
                            <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-control" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required /></div>
                            <div className="form-group"><label className="form-label">Password {editing ? '(kosongkan jika tidak diubah)' : '*'}</label><input type="password" className="form-control" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required={!editing} /></div>
                            {!editing && <>
                                <div className="form-group"><label className="form-label">NIS</label><input className="form-control" value={form.nis} onChange={e => setForm(p => ({ ...p, nis: e.target.value }))} /></div>
                                <div className="form-group"><label className="form-label">Kelas</label>
                                    <select className="form-control" value={form.kelas_id} onChange={e => setForm(p => ({ ...p, kelas_id: e.target.value }))}>
                                        <option value="">Pilih Kelas</option>
                                        {kelas.map(k => <option key={k.id} value={k.id}>{k.nama_kelas} ({k.tingkat})</option>)}
                                    </select>
                                </div>
                                <div className="form-group"><label className="form-label">Jenis Kelamin</label>
                                    <select className="form-control" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>
                                <div className="form-group"><label className="form-label">Nama Orang Tua</label><input className="form-control" value={form.parent_name} onChange={e => setForm(p => ({ ...p, parent_name: e.target.value }))} /></div>
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
