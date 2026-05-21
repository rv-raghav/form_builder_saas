// src/routes/PublicRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PublicRoute - Redirects authenticated users to home page.
 * Used for auth pages (signin, forgot-password, etc.) that should
 * not be accessible to logged-in users.
 */
export default function PublicRoute() {
    const { isAuthenticated, isLoading } = useAuth();

    // Don't redirect while still checking auth status
    if (isLoading) {
        return null;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
