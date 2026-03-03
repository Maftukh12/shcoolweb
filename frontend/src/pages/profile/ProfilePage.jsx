import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
    MdPerson, MdEmail, MdPhone, MdHome, MdLock,
    MdSchool, MdBadge, MdClass, MdEdit, MdSave, MdClose,
    MdVerifiedUser, MdCameraAlt, MdDelete
} from 'react-icons/md';
import './ProfilePage.css';

const roleLabel = { admin: 'Administrator', guru: 'Guru', siswa: 'Siswa' };
const roleColor = { admin: '#F59E0B', guru: '#2563EB', siswa: '#059669' };
const roleBg = { admin: '#FEF3C7', guru: '#DBEAFE', siswa: '#D1FAE5' };

/** Render avatar: real photo or coloured initials */
function AvatarDisplay({ avatar, name, color, size = 96, fontSize = 32 }) {
    const initials = name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U';
    if (avatar) {
        return (
            <img
                src={avatar}
                alt="Avatar"
                style={{
                    width: size, height: size, borderRadius: '50%', objectFit: 'cover',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }}
            />
        );
    }
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%', background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize, fontWeight: 800, color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
            {initials}
        </div>
    );
}

export default function ProfilePage() {
    const { user, setUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef(null);

    // Avatar upload state
    const [uploading, setUploading] = useState(false);
    const [avatarMsg, setAvatarMsg] = useState({ text: '', type: '' });
    const [previewUrl, setPreviewUrl] = useState(null);

    // Edit info state
    const [editInfo, setEditInfo] = useState(false);
    const [infoForm, setInfoForm] = useState({ name: '', email: '', phone: '', address: '' });
    const [infoSaving, setInfoSaving] = useState(false);
    const [infoMsg, setInfoMsg] = useState({ text: '', type: '' });

    // Change password state
    const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg, setPwMsg] = useState({ text: '', type: '' });

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/profile');
            if (data.success) {
                setProfile(data.data);
                setPreviewUrl(data.data.avatar || null);
                setInfoForm({
                    name: data.data.name || '',
                    email: data.data.email || '',
                    phone: data.data.profile?.phone || '',
                    address: data.data.profile?.address || '',
                });
            }
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchProfile(); }, []);

    // ── Avatar upload ──────────────────────────────────────────────────────────
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Local preview immediately
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);

        const formData = new FormData();
        formData.append('avatar', file);
        setUploading(true);
        setAvatarMsg({ text: '', type: '' });
        try {
            const { data } = await api.post('/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (data.success) {
                setAvatarMsg({ text: '✅ Foto profil diperbarui!', type: 'success' });
                setPreviewUrl(data.data.avatar);
                // Update auth context so sidebar/navbar refresh
                const stored = JSON.parse(localStorage.getItem('user') || '{}');
                const updated = { ...stored, avatar: data.data.avatar };
                localStorage.setItem('user', JSON.stringify(updated));
                if (setUser) setUser(updated);
            }
        } catch (err) {
            setAvatarMsg({ text: err.response?.data?.message || 'Gagal mengunggah foto.', type: 'error' });
            setPreviewUrl(profile?.avatar || null);
        }
        finally { setUploading(false); e.target.value = ''; }
    };

    const handleDeleteAvatar = async () => {
        if (!confirm('Hapus foto profil?')) return;
        setUploading(true);
        try {
            await api.delete('/profile/avatar');
            setPreviewUrl(null);
            setAvatarMsg({ text: '✅ Foto dihapus.', type: 'success' });
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            const updated = { ...stored, avatar: null };
            localStorage.setItem('user', JSON.stringify(updated));
            if (setUser) setUser(updated);
        } catch {
            setAvatarMsg({ text: 'Gagal menghapus foto.', type: 'error' });
        }
        finally { setUploading(false); }
    };

    // ── Save info ──────────────────────────────────────────────────────────────
    const handleSaveInfo = async (e) => {
        e.preventDefault();
        setInfoSaving(true);
        setInfoMsg({ text: '', type: '' });
        try {
            await api.put('/profile', infoForm);
            setInfoMsg({ text: 'Profil berhasil diperbarui!', type: 'success' });
            setEditInfo(false);
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            const updated = { ...stored, name: infoForm.name, email: infoForm.email };
            localStorage.setItem('user', JSON.stringify(updated));
            if (setUser) setUser(updated);
            fetchProfile();
        } catch (err) {
            setInfoMsg({ text: err.response?.data?.message || 'Gagal menyimpan.', type: 'error' });
        }
        finally { setInfoSaving(false); }
    };

    // ── Change password ────────────────────────────────────────────────────────
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwMsg({ text: '', type: '' });
        if (pwForm.new_password !== pwForm.confirm_password) {
            setPwMsg({ text: 'Konfirmasi password tidak cocok.', type: 'error' });
            return;
        }
        setPwSaving(true);
        try {
            await api.put('/profile/password', pwForm);
            setPwMsg({ text: 'Password berhasil diubah!', type: 'success' });
            setPwForm({ current_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            setPwMsg({ text: err.response?.data?.message || 'Gagal mengubah password.', type: 'error' });
        }
        finally { setPwSaving(false); }
    };

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;

    const p = profile?.profile || {};

    const extraFields = [];
    if (profile?.role === 'guru') {
        if (p.nip) extraFields.push({ icon: MdBadge, label: 'NIP', value: p.nip });
        if (p.specialization) extraFields.push({ icon: MdSchool, label: 'Spesialisasi', value: p.specialization });
    } else if (profile?.role === 'siswa') {
        if (p.nis) extraFields.push({ icon: MdBadge, label: 'NIS', value: p.nis });
        if (p.nama_kelas) extraFields.push({ icon: MdClass, label: 'Kelas', value: p.nama_kelas });
        if (p.parent_name) extraFields.push({ icon: MdPerson, label: 'Nama Orang Tua', value: p.parent_name });
        if (p.parent_phone) extraFields.push({ icon: MdPhone, label: 'Telp Orang Tua', value: p.parent_phone });
    }

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h2 className="page-title">Profil Saya</h2>
                <p className="page-subtitle">Kelola informasi akun dan keamanan Anda</p>
            </div>

            <div className="profile-grid">
                {/* ── Left: Avatar card ── */}
                <div className="profile-avatar-card card">

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleAvatarChange}
                        style={{ display: 'none' }}
                    />

                    {/* Avatar with camera overlay */}
                    <div className="profile-avatar-wrapper">
                        <AvatarDisplay
                            avatar={previewUrl}
                            name={profile?.name}
                            color={roleColor[profile?.role]}
                            size={96}
                            fontSize={32}
                        />
                        <button
                            className="avatar-upload-btn"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            title="Ganti foto"
                        >
                            {uploading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <MdCameraAlt size={18} />}
                        </button>
                    </div>

                    {/* Upload feedback */}
                    {avatarMsg.text && (
                        <div style={{
                            fontSize: 12, fontWeight: 600,
                            color: avatarMsg.type === 'success' ? 'var(--secondary-dark)' : 'var(--danger)',
                            textAlign: 'center'
                        }}>
                            {avatarMsg.text}
                        </div>
                    )}

                    {/* Avatar action buttons */}
                    <div className="avatar-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                            <MdCameraAlt size={14} /> Ganti Foto
                        </button>
                        {previewUrl && (
                            <button className="btn btn-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}
                                onClick={handleDeleteAvatar} disabled={uploading}>
                                <MdDelete size={14} /> Hapus
                            </button>
                        )}
                    </div>
                    <p className="avatar-hint">JPG, PNG, WebP, GIF • Maks. 3 MB</p>

                    <h3 className="profile-name">{profile?.name}</h3>
                    <span className="profile-role-badge" style={{ background: roleBg[profile?.role], color: roleColor[profile?.role] }}>
                        <MdVerifiedUser size={13} />
                        {roleLabel[profile?.role]}
                    </span>
                    <p className="profile-email">{profile?.email}</p>

                    <div className="profile-since">
                        Bergabung sejak {new Date(profile?.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                    </div>

                    {extraFields.length > 0 && (
                        <div className="profile-extra">
                            {extraFields.map(f => (
                                <div key={f.label} className="profile-extra-item">
                                    <f.icon size={15} /> <span>{f.label}:</span> <strong>{f.value}</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Right: Forms ── */}
                <div className="profile-forms">

                    {/* Edit Info */}
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <div className="card-title">Informasi Pribadi</div>
                                <div className="card-subtitle">Nama, email, dan kontak</div>
                            </div>
                            {!editInfo
                                ? <button className="btn btn-outline btn-sm" onClick={() => { setEditInfo(true); setInfoMsg({ text: '', type: '' }); }}>
                                    <MdEdit size={15} /> Edit
                                </button>
                                : <button className="btn btn-outline btn-sm" onClick={() => setEditInfo(false)}>
                                    <MdClose size={15} /> Batal
                                </button>
                            }
                        </div>

                        {infoMsg.text && (
                            <div className={`alert alert-${infoMsg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: 16 }}>
                                {infoMsg.text}
                            </div>
                        )}

                        {!editInfo ? (
                            <div className="profile-info-list">
                                {[
                                    { icon: MdPerson, label: 'Nama Lengkap', value: profile?.name },
                                    { icon: MdEmail, label: 'Email', value: profile?.email },
                                    { icon: MdPhone, label: 'No. Telepon', value: p.phone || '-' },
                                    { icon: MdHome, label: 'Alamat', value: p.address || '-' },
                                ].map(item => (
                                    <div key={item.label} className="profile-info-row">
                                        <div className="profile-info-label">
                                            <item.icon size={16} className="profile-info-icon" />
                                            {item.label}
                                        </div>
                                        <div className="profile-info-value">{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <form onSubmit={handleSaveInfo} className="modal-form">
                                <div className="profile-form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Nama Lengkap *</label>
                                        <input className="form-control" value={infoForm.name} onChange={e => setInfoForm(p => ({ ...p, name: e.target.value }))} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email *</label>
                                        <input type="email" className="form-control" value={infoForm.email} onChange={e => setInfoForm(p => ({ ...p, email: e.target.value }))} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">No. Telepon</label>
                                        <input className="form-control" value={infoForm.phone} onChange={e => setInfoForm(p => ({ ...p, phone: e.target.value }))} placeholder="08xxxxxxxxxx" />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="form-label">Alamat</label>
                                        <textarea className="form-control" rows={3} value={infoForm.address} onChange={e => setInfoForm(p => ({ ...p, address: e.target.value }))} style={{ resize: 'vertical' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                    <button type="submit" className="btn btn-primary" disabled={infoSaving}>
                                        <MdSave size={16} /> {infoSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Change Password */}
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <div className="card-title">Ganti Password</div>
                                <div className="card-subtitle">Minimal 6 karakter</div>
                            </div>
                            <div className="profile-lock-icon"><MdLock size={20} /></div>
                        </div>

                        {pwMsg.text && (
                            <div className={`alert alert-${pwMsg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: 16 }}>
                                {pwMsg.text}
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="modal-form">
                            <div className="profile-form-grid">
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Password Lama *</label>
                                    <input type="password" className="form-control" value={pwForm.current_password}
                                        onChange={e => setPwForm(p => ({ ...p, current_password: e.target.value }))} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Password Baru *</label>
                                    <input type="password" className="form-control" value={pwForm.new_password}
                                        onChange={e => setPwForm(p => ({ ...p, new_password: e.target.value }))} required minLength={6} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Konfirmasi Password *</label>
                                    <input type="password"
                                        className={`form-control${pwForm.confirm_password && pwForm.confirm_password !== pwForm.new_password ? ' error' : ''}`}
                                        value={pwForm.confirm_password}
                                        onChange={e => setPwForm(p => ({ ...p, confirm_password: e.target.value }))} required />
                                    {pwForm.confirm_password && pwForm.confirm_password !== pwForm.new_password && (
                                        <span className="form-error">Password tidak cocok</span>
                                    )}
                                </div>
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <button type="submit" className="btn btn-primary"
                                    disabled={pwSaving || (!!pwForm.confirm_password && pwForm.confirm_password !== pwForm.new_password)}>
                                    <MdLock size={16} /> {pwSaving ? 'Mengubah...' : 'Ubah Password'}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>{/* end profile-forms */}
            </div>
        </div>
    );
}
