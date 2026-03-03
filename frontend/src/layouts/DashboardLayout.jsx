import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import './DashboardLayout.css';

export default function DashboardLayout({ title }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="dashboard-layout">
            <Sidebar
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />
            <div className="dashboard-main">
                <Navbar title={title} onMenuClick={() => setMobileOpen(true)} />
                <main className="dashboard-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
