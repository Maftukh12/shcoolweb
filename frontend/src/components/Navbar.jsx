import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MdNotifications, MdMenu, MdAnnouncement, MdNewspaper, MdDoneAll } from 'react-icons/md';
import api from '../api/axios';
import './Navbar.css';

function timeAgo(dateStr) {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export default function Navbar({ title, onMenuClick }) {
    const { user } = useAuth();
    const roleColors = { admin: '#F59E0B', guru: '#2563EB', siswa: '#059669' };
    const initials = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U';

    const [notifications, setNotifications] = useState([]);
    const [newCount, setNewCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [read, setRead] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch notifications
    const fetchNotifs = async () => {
        try {
            const { data } = await api.get('/notifications?limit=8');
            if (data.success) {
                setNotifications(data.data.notifications);
                if (!read) setNewCount(data.data.new_count);
            }
        } catch { /* silent */ }
    };

    useEffect(() => {
        fetchNotifs();
        // Auto-refresh every 60 seconds
        const interval = setInterval(fetchNotifs, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleBellClick = () => {
        setOpen(prev => !prev);
        if (!open) {
            // Mark as read when opening
            setNewCount(0);
            setRead(true);
        }
    };

    return (
        <header className="navbar">
            <div className="navbar-left">
                <button className="navbar-hamburger" onClick={onMenuClick} aria-label="Buka menu">
                    <MdMenu size={24} />
                </button>
                <h1 className="navbar-title">{title}</h1>
            </div>

            <div className="navbar-right">
                {/* Notification Bell */}
                <div className="notif-wrapper" ref={dropdownRef}>
                    <button
                        className={`btn-icon btn-outline navbar-notif${open ? ' active' : ''}`}
                        onClick={handleBellClick}
                        aria-label="Notifikasi"
                    >
                        <MdNotifications size={20} />
                        {newCount > 0 && (
                            <span className="notif-badge">{newCount > 9 ? '9+' : newCount}</span>
                        )}
                    </button>

                    {/* Dropdown Panel */}
                    {open && (
                        <div className="notif-dropdown">
                            <div className="notif-dropdown-header">
                                <span className="notif-dropdown-title">Notifikasi</span>
                                {notifications.length > 0 && (
                                    <span className="notif-dropdown-count">{notifications.length} item</span>
                                )}
                            </div>

                            <div className="notif-dropdown-body">
                                {notifications.length === 0 ? (
                                    <div className="notif-empty">
                                        <MdDoneAll size={36} color="var(--text-muted)" />
                                        <p>Tidak ada notifikasi</p>
                                    </div>
                                ) : notifications.map((n, i) => (
                                    <div key={`${n.type}-${n.id}`} className={`notif-item${i === 0 && !read ? ' notif-item-new' : ''}`}>
                                        <div className={`notif-item-icon notif-icon-${n.type}`}>
                                            {n.type === 'pengumuman'
                                                ? <MdAnnouncement size={16} />
                                                : <MdNewspaper size={16} />}
                                        </div>
                                        <div className="notif-item-content">
                                            <div className="notif-item-type">
                                                {n.type === 'pengumuman' ? 'Pengumuman' : 'Berita'}
                                            </div>
                                            <div className="notif-item-title">{n.title}</div>
                                            <div className="notif-item-body">
                                                {n.body?.length > 80 ? n.body.slice(0, 80) + '…' : n.body}
                                            </div>
                                            <div className="notif-item-time">{timeAgo(n.created_at)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Info */}
                <div className="navbar-user">
                    <div className="avatar" style={user?.avatar ? { padding: 0, overflow: 'hidden' } : { background: roleColors[user?.role] }}>
                        {user?.avatar
                            ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : initials}
                    </div>
                    <div className="navbar-user-info">
                        <span className="navbar-user-name">{user?.name}</span>
                        <span className="navbar-user-email">{user?.email}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
