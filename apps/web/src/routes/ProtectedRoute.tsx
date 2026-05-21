// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    // Don't redirect while still checking auth status
    if (isLoading) {
        return null; // or a loading spinner
    }

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace state={{ from: location }} />;
    }

    // Redirect users who must reset password (first-time login)
    if (user?.must_reset_password) {
        return <Navigate to="/set-password" replace />;
    }

    return <Outlet />;
}
