// src/routes/RoleBasedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RoleBasedRouteProps {
    allowedRoles: string[];
}

export default function RoleBasedRoute({ allowedRoles }: RoleBasedRouteProps) {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }

    // Check if user has one of the allowed roles
    const hasAccess = user?.role && allowedRoles.includes(user.role);

    if (!hasAccess) {
        // Redirect to home page if user doesn't have required role
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
