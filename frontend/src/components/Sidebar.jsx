import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    MdDashboard, MdPeople, MdSchool, MdClass, MdBook,
    MdAnnouncement, MdNewspaper, MdGrade, MdSchedule,
    MdCheckCircle, MdLogout, MdChevronLeft, MdChevronRight,
    MdAdminPanelSettings, MdClose, MdAccountCircle
} from 'react-icons/md';
import './Sidebar.css';

const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: MdDashboard, end: true },
    { to: '/admin/siswa', label: 'Data Siswa', icon: MdSchool },
    { to: '/admin/guru', label: 'Data Guru', icon: MdPeople },
    { to: '/admin/kelas', label: 'Data Kelas', icon: MdClass },
    { to: '/admin/mapel', label: 'Mata Pelajaran', icon: MdBook },
    { to: '/admin/pengumuman', label: 'Pengumuman', icon: MdAnnouncement },
    { to: '/admin/berita', label: 'Berita', icon: MdNewspaper },
    { to: '/admin/profil', label: 'Profil Saya', icon: MdAccountCircle },
];

const guruLinks = [
    { to: '/guru', label: 'Dashboard', icon: MdDashboard, end: true },
    { to: '/guru/kelas', label: 'Kelas Saya', icon: MdClass },
    { to: '/guru/nilai', label: 'Input Nilai', icon: MdGrade },
    { to: '/guru/absensi', label: 'Absensi', icon: MdCheckCircle },
    { to: '/guru/profil', label: 'Profil Saya', icon: MdAccountCircle },
];

const siswaLinks = [
    { to: '/siswa', label: 'Dashboard', icon: MdDashboard, end: true },
    { to: '/siswa/nilai', label: 'Nilai Saya', icon: MdGrade },
    { to: '/siswa/jadwal', label: 'Jadwal', icon: MdSchedule },
    { to: '/siswa/absensi', label: 'Absensi', icon: MdCheckCircle },
    { to: '/siswa/pengumuman', label: 'Pengumuman', icon: MdAnnouncement },
    { to: '/siswa/profil', label: 'Profil Saya', icon: MdAccountCircle },
];

const roles = { admin: adminLinks, guru: guruLinks, siswa: siswaLinks };
const roleLabels = { admin: 'Administrator', guru: 'Guru', siswa: 'Siswa' };
const roleColors = { admin: '#F59E0B', guru: '#2563EB', siswa: '#059669' };

export default function Sidebar({ mobileOpen, onMobileClose }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const links = roles[user?.role] || [];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleLinkClick = () => {
        // Close mobile sidebar when a link is clicked
        if (onMobileClose) onMobileClose();
    };

    const initials = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U';

    return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div className="sidebar-overlay" onClick={onMobileClose} />
            )}

            <aside className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <MdAdminPanelSettings size={22} />
                    </div>
                    {!collapsed && (
                        <div className="sidebar-logo-text">
                            <span className="sidebar-school-name">SMP IT</span>
                            <span className="sidebar-school-sub">Portal Akademik</span>
                        </div>
                    )}
                    {/* Mobile Close Button */}
                    <button className="sidebar-mobile-close" onClick={onMobileClose}>
                        <MdClose size={22} />
                    </button>
                </div>

                {/* Desktop Collapse Toggle */}
                <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? <MdChevronRight size={20} /> : <MdChevronLeft size={20} />}
                </button>

                {/* User Info */}
                <div className="sidebar-user">
                    <div className="sidebar-avatar" style={user?.avatar ? {} : { background: roleColors[user?.role] }}>
                        {user?.avatar
                            ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            : initials}
                    </div>
                    {!collapsed && (
                        <div className="sidebar-user-info">
                            <span className="sidebar-user-name">{user?.name}</span>
                            <span className="sidebar-user-role">{roleLabels[user?.role]}</span>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {!collapsed && <div className="sidebar-section-label">MENU</div>}
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                            onClick={handleLinkClick}
                        >
                            <link.icon size={20} className="sidebar-link-icon" />
                            {!collapsed && <span>{link.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="sidebar-footer">
                    <button className="sidebar-logout" onClick={handleLogout}>
                        <MdLogout size={20} />
                        {!collapsed && <span>Keluar</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
