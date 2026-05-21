// src/context/AuthContext.tsx
/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the app.
 * Uses cookie-based authentication - no tokens are stored in JavaScript.
 *
 * The `/api/auth/me/` endpoint is the source of truth for authentication state.
 */
import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
    ReactNode,
} from 'react';
import type { AuthUser, LoginResponse } from '../api/auth';
import {
    login as apiLogin,
    logout as apiLogout,
    register as apiRegister,
    getCurrentUser,
    fetchCSRFToken,
} from '../api/auth';
import type { RegisterPayload } from '../api/auth';

type AuthContextValue = {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (updates: Partial<AuthUser>) => void;
    refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Initialize auth state on mount.
     * Fetches CSRF token and checks if user is authenticated via /me endpoint.
     */
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Always fetch a fresh CSRF token on page load
                await fetchCSRFToken();

                // Check if user is authenticated by calling /me
                const currentUser = await getCurrentUser();
                setUser(currentUser);
            } catch {
                // Not authenticated - this is normal
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    /**
     * Login user with credentials.
     * Server sets HttpOnly cookies - we just update local state.
     */
    const login = useCallback(
        async (email: string, password: string, rememberMe: boolean = false) => {
            const response: LoginResponse = await apiLogin({
                email,
                password,
                rememberMe,
            });

            setUser(response.user);
        },
        []
    );

    const register = useCallback(async (payload: RegisterPayload) => {
        const response = await apiRegister(payload);
        setUser(response.user);
    }, []);

    /**
     * Logout user.
     * Calls server to clear cookies and blacklist tokens.
     */
    const logout = useCallback(async () => {
        await apiLogout();
        setUser(null);
    }, []);

    /**
     * Update user state locally.
     * Use after profile updates to reflect changes without refetching.
     */
    const updateUser = useCallback((updates: Partial<AuthUser>) => {
        setUser((currentUser) => {
            if (!currentUser) return null;
            return { ...currentUser, ...updates };
        });
    }, []);

    /**
     * Refresh user data from server.
     * Call after actions that might change user permissions.
     */
    const refreshUser = useCallback(async () => {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch {
            setUser(null);
        }
    }, []);

    // Memoized context value to prevent consumer re-renders
    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout,
            updateUser,
            refreshUser,
        }),
        [user, isLoading, login, register, logout, updateUser, refreshUser]
    );

    // Show nothing until we know auth state (prevents flash of login screen)
    if (isLoading) {
        return null; // or a loading spinner
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return ctx;
}
