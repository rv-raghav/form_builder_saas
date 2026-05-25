// src/routes/PermissionRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PermissionRouteProps {
    pageSlug: string;
}

/**
 * Welcoming message component for users without dashboard access.
 */
function WelcomeMessage() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md px-6">
                <div className="mb-6">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                            />
                        </svg>
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                    Welcome to LoomForm!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Navigate to your authorized pages using the sidebar menu.
                </p>
            </div>
        </div>
    );
}

/**
 * Route guard that checks if user has access to a specific page.
 * Uses the allowed_pages from the user's profile.
 */
export default function PermissionRoute({ pageSlug }: PermissionRouteProps) {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }

    // SuperAdmin always has access
    if (user?.is_superadmin) {
        return <Outlet />;
    }

    // Check if user has this page in their allowed_pages
    const hasAccess = user?.allowed_pages?.some((page) => page.slug === pageSlug);

    if (!hasAccess) {
        // If user is on dashboard route but doesn't have access, show welcome message
        if (location.pathname === '/' || pageSlug === 'dashboard') {
            return <WelcomeMessage />;
        }
        // For other pages, redirect to home
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
