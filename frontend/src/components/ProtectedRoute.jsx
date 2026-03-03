import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-page">
                <div className="spinner" />
                <p>Memuat...</p>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role)) {
        // Redirect to their own dashboard
        const dashMap = { admin: '/admin', guru: '/guru', siswa: '/siswa' };
        return <Navigate to={dashMap[user.role] || '/login'} replace />;
    }
    return children;
}
