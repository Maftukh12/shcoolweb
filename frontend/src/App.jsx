import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/profile/ProfilePage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageSiswa from './pages/admin/ManageSiswa';
import ManageGuru from './pages/admin/ManageGuru';
import ManageKelas from './pages/admin/ManageKelas';
import ManageMapel from './pages/admin/ManageMapel';
import ManagePengumuman from './pages/admin/ManagePengumuman';
import ManageBerita from './pages/admin/ManageBerita';

// Guru
import GuruDashboard from './pages/guru/GuruDashboard';
import InputNilai from './pages/guru/InputNilai';
import InputAbsensi from './pages/guru/InputAbsensi';

// Siswa
import SiswaDashboard from './pages/siswa/SiswaDashboard';
import NilaiSiswa from './pages/siswa/NilaiSiswa';
import JadwalSiswa from './pages/siswa/JadwalSiswa';
import PengumumanSiswa from './pages/siswa/PengumumanSiswa';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={
                        <ProtectedRoute roles={['admin']}>
                            <DashboardLayout title="Admin Panel" />
                        </ProtectedRoute>
                    }>
                        <Route index element={<AdminDashboard />} />
                        <Route path="siswa" element={<ManageSiswa />} />
                        <Route path="guru" element={<ManageGuru />} />
                        <Route path="kelas" element={<ManageKelas />} />
                        <Route path="mapel" element={<ManageMapel />} />
                        <Route path="pengumuman" element={<ManagePengumuman />} />
                        <Route path="berita" element={<ManageBerita />} />
                        <Route path="profil" element={<ProfilePage />} />
                    </Route>

                    {/* Guru Routes */}
                    <Route path="/guru" element={
                        <ProtectedRoute roles={['guru']}>
                            <DashboardLayout title="Portal Guru" />
                        </ProtectedRoute>
                    }>
                        <Route index element={<GuruDashboard />} />
                        <Route path="kelas" element={<GuruDashboard />} />
                        <Route path="nilai" element={<InputNilai />} />
                        <Route path="absensi" element={<InputAbsensi />} />
                        <Route path="profil" element={<ProfilePage />} />
                    </Route>

                    {/* Siswa Routes */}
                    <Route path="/siswa" element={
                        <ProtectedRoute roles={['siswa']}>
                            <DashboardLayout title="Portal Siswa" />
                        </ProtectedRoute>
                    }>
                        <Route index element={<SiswaDashboard />} />
                        <Route path="nilai" element={<NilaiSiswa />} />
                        <Route path="jadwal" element={<JadwalSiswa />} />
                        <Route path="absensi" element={<NilaiSiswa />} />
                        <Route path="pengumuman" element={<PengumumanSiswa />} />
                        <Route path="profil" element={<ProfilePage />} />
                    </Route>

                    {/* Catch All */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
