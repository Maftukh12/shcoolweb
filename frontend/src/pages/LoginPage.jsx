import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdSchool } from 'react-icons/md';
import './LoginPage.css';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(form.email, form.password);
            const dashMap = { admin: '/admin', guru: '/guru', siswa: '/siswa' };
            navigate(dashMap[user.role] || '/');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Login gagal.');
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = (role) => {
        const demos = {
            admin: { email: 'admin@sekolah.com', password: 'Admin@123' },
            guru: { email: 'budi@sekolah.com', password: 'Admin@123' },
            siswa: { email: 'ahmad@sekolah.com', password: 'Admin@123' },
        };
        setForm(demos[role]);
    };

    return (
        <div className="login-page">
            {/* Left Panel */}
            <div className="login-hero">
                <div className="login-hero-content">
                    <div className="login-hero-icon">
                        <MdSchool size={48} />
                    </div>
                    <h1>SMP IT</h1>
                    <p>Portal Akademik - Sistem manajemen sekolah terintegrasi untuk admin, guru, dan siswa.</p>
                    <div className="login-features">
                        {['Dashboard Akademik', 'Manajemen Nilai', 'Absensi Digital', 'Pengumuman Sekolah'].map(f => (
                            <div key={f} className="login-feature-item">
                                <span className="login-feature-dot" />
                                {f}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="login-hero-bg" />
            </div>

            {/* Right Panel */}
            <div className="login-form-panel">
                {/* Mobile Header - only visible on small screens */}
                <div className="login-mobile-header">
                    <div className="login-mobile-icon">
                        <MdSchool size={28} />
                    </div>
                    <div className="login-mobile-text">
                        <h2>SMP IT</h2>
                        <p>Portal Akademik</p>
                    </div>
                </div>

                <div className="login-form-wrapper">
                    <div className="login-top">
                        <h2>Selamat Datang</h2>
                        <p>Masuk ke portal akademik sekolah</p>
                    </div>

                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: 16 }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <div className="input-with-icon">
                                <MdEmail className="input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="email@sekolah.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-with-icon">
                                <MdLock className="input-icon" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    name="password"
                                    className="form-control"
                                    placeholder="Password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    style={{ paddingRight: 44 }}
                                />
                                <button type="button" className="input-eye" onClick={() => setShowPass(!showPass)}>
                                    {showPass ? <MdVisibilityOff /> : <MdVisibility />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Masuk'}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="login-demo">
                        <p className="login-demo-title">Login Cepat (Demo)</p>
                        <div className="login-demo-buttons">
                            {['admin', 'guru', 'siswa'].map(r => (
                                <button key={r} className="login-demo-btn" onClick={() => fillDemo(r)}>
                                    {r.charAt(0).toUpperCase() + r.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="login-footer">
                        &copy; 2025 SMP IT. Semua hak dilindungi.
                    </p>
                </div>
            </div>
        </div>
    );
}
