// src/api/auth.tsx
/**
 * Cookie-Based Authentication API
 *
 * This module handles all authentication-related API calls using HttpOnly cookies.
 * Tokens are never exposed to JavaScript - they are stored in secure cookies
 * managed by the browser.
 *
 * Security features:
 * - HttpOnly cookies (no JS access to tokens)
 * - CSRF protection for state-changing requests
 * - Automatic token refresh on 401
 * 
 * Environment handling:
 * - Development: Uses Vite proxy (same-origin, cookies work naturally)
 * - Production: Uses VITE_API_BASE_URL from environment
 */
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

// =============================================================================
// Types
// =============================================================================

export type AllowedPage = {
    slug: string;
    name: string;
    path: string;
};

export type AllowedComponent = {
    slug: string;
    name: string;
    description?: string;
    category?: string;
};

export type AuthUser = {
    id: string;
    email: string;
    name: string;
    username: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    is_superadmin?: boolean;
    must_reset_password?: boolean;
    allowed_pages?: AllowedPage[];
    allowed_components?: AllowedComponent[];
};

export type LoginPayload = {
    email: string;
    password: string;
    rememberMe?: boolean;
};

export type LoginResponse = {
    success: boolean;
    user: AuthUser;
    must_reset_password?: boolean;
};

export type ForgotPasswordPayload = {
    email: string;
};

export type ResetPasswordPayload = {
    token: string;
    password: string;
};

export type ForcePasswordChangePayload = {
    new_password: string;
    new_password_confirm: string;
};

export type RegisterPayload = {
    email: string;
    password: string;
    password_confirm: string;
    name?: string;
};

export type RegisterResponse = {
    user: AuthUser;
    must_reset_password?: boolean;
};

// =============================================================================
// CSRF Token Management
// =============================================================================

let csrfToken: string | null = null;

/**
 * Get CSRF token from cookie
 */
function getCSRFTokenFromCookie(): string | null {
    const name = 'csrftoken';
    const cookieValue = document.cookie
        .split('; ')
        .find((row) => row.startsWith(name + '='))
        ?.split('=')[1];
    return cookieValue || null;
}

/**
 * Fetch a fresh CSRF token from the server.
 * This should be called on app initialization and page refresh.
 */
export async function fetchCSRFToken(): Promise<string> {
    try {
        // API_BASE_URL is already empty in dev (uses proxy) or set for prod
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.AUTH.CSRF}`, {
            withCredentials: true,
        });
        csrfToken = response.data.csrfToken;
        return csrfToken || '';
    } catch {
        // Fall back to reading from cookie if endpoint fails
        csrfToken = getCSRFTokenFromCookie();
        return csrfToken || '';
    }
}

/**
 * Get the current CSRF token (from memory or cookie)
 */
export function getCSRFToken(): string {
    if (csrfToken) {
        return csrfToken;
    }
    return getCSRFTokenFromCookie() || '';
}

// =============================================================================
// Axios Instance Configuration
// =============================================================================

/**
 * Create axios instance configured for cookie-based authentication
 * 
 * Environment handling:
 * - Development: API_BASE_URL is empty, requests go through Vite proxy (same-origin)
 * - Production: API_BASE_URL from VITE_API_BASE_URL env var (or empty for same-domain)
 * 
 * For cookies to work in production with different domains, ensure:
 * - Backend sets proper CORS headers
 * - Backend sets AUTH_COOKIE_SAMESITE=None and AUTH_COOKIE_DOMAIN
 */
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // CRITICAL: This enables sending and receiving cookies
    withCredentials: true,
});

/**
 * Request interceptor - adds CSRF token to state-changing requests
 */
api.interceptors.request.use(
    (config) => {
        // Add CSRF token to all non-GET requests
        if (config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
            const token = getCSRFToken();
            if (token) {
                config.headers['X-CSRFToken'] = token;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// =============================================================================
// Token Refresh Logic
// =============================================================================

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

/**
 * Response interceptor - handles automatic token refresh on 401
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Skip refresh logic for auth endpoints to prevent infinite loops
        const isAuthEndpoint =
            originalRequest.url?.includes('/api/auth/login') ||
            originalRequest.url?.includes('/api/auth/refresh') ||
            originalRequest.url?.includes('/api/auth/logout') ||
            originalRequest.url?.includes('/api/auth/csrf') ||
            originalRequest.url?.includes('/api/auth/me') ||
            originalRequest.url?.includes('/api/auth/register');

        // If 401 and not an auth endpoint and haven't retried yet
        if (error.response?.status === 401 && !isAuthEndpoint && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh the token (reads refresh_token from cookie)
                await axios.post(
                    `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
                    {},
                    {
                        withCredentials: true,
                        headers: {
                            'X-CSRFToken': getCSRFToken(),
                        },
                    }
                );

                processQueue(null);
                isRefreshing = false;

                // Retry the original request (new access_token cookie is set)
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError as Error);
                isRefreshing = false;

                // Refresh failed - redirect to login
                window.location.href = '/signin';

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// =============================================================================
// Authentication API Functions
// =============================================================================

/**
 * Register a new consumer account.
 */
export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
    try {
        const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, {
            email: payload.email,
            password: payload.password,
            password_confirm: payload.password_confirm,
            name: payload.name,
        });

        const userData = response.data.user;
        const mustResetPassword = response.data.must_reset_password || false;

        return {
            user: {
                id: userData.id.toString(),
                email: userData.email,
                name:
                    `${userData.first_name || ''} ${userData.last_name || ''}`.trim() ||
                    userData.username,
                username: userData.username,
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                role: userData.role,
                is_superadmin: userData.is_superadmin || false,
                must_reset_password: mustResetPassword,
                allowed_pages: userData.allowed_pages || [],
                allowed_components: userData.allowed_components || [],
            },
            must_reset_password: mustResetPassword,
        };
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            const message =
                error.response?.data?.detail ||
                error.response?.data?.error ||
                'Registration failed';
            throw new Error(message);
        }
        throw error;
    }
}

/**
 * Login user with credentials.
 * On success, server sets HttpOnly cookies for access and refresh tokens.
 */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
    try {
        const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
            username: payload.email, // Backend accepts both email and username
            password: payload.password,
            remember_me: payload.rememberMe ?? false,
        });

        const userData = response.data.user;
        const mustResetPassword = response.data.must_reset_password || false;

        return {
            success: true,
            must_reset_password: mustResetPassword,
            user: {
                id: userData.id.toString(),
                email: userData.email,
                name:
                    `${userData.first_name || ''} ${userData.last_name || ''}`.trim() ||
                    userData.username,
                username: userData.username,
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                role: userData.role,
                is_superadmin: userData.is_superadmin || false,
                must_reset_password: mustResetPassword,
                allowed_pages: userData.allowed_pages || [],
                allowed_components: userData.allowed_components || [],
            },
        };
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.detail || 'Invalid email or password';
            const err = new Error(message) as Error & { code?: string };
            err.code = 'INVALID_CREDENTIALS';
            throw err;
        }
        throw error;
    }
}

/**
 * Logout user.
 * Clears auth cookies and blacklists refresh token server-side.
 */
export async function logout(): Promise<void> {
    try {
        await api.post(API_ENDPOINTS.AUTH.LOGOUT, {});
    } catch {
        // Ignore errors - we're logging out anyway
    }
}

/**
 * Get current authenticated user.
 * This is the source of truth for authentication state.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    try {
        const response = await api.get(API_ENDPOINTS.AUTH.ME);
        const userData = response.data;

        return {
            id: userData.id.toString(),
            email: userData.email,
            name:
                `${userData.first_name || ''} ${userData.last_name || ''}`.trim() ||
                userData.username,
            username: userData.username,
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            role: userData.role || 'User',
            is_superadmin: userData.is_superadmin || false,
            must_reset_password: userData.must_reset_password || false,
            allowed_pages: userData.allowed_pages || [],
            allowed_components: userData.allowed_components || [],
        };
    } catch {
        // Not authenticated or error
        return null;
    }
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(
    payload: ForgotPasswordPayload
): Promise<{ success: boolean; message: string }> {
    try {
        const response = await api.post(API_ENDPOINTS.AUTH.PASSWORD_RESET, {
            email: payload.email,
        });
        return {
            success: true,
            message: response.data.message || 'Password reset email sent.',
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error || 'Failed to send password reset email.');
        }
        throw error;
    }
}

/**
 * Reset password with token
 */
export async function resetPassword(
    payload: ResetPasswordPayload
): Promise<{ success: boolean; message: string }> {
    try {
        const response = await api.post(API_ENDPOINTS.AUTH.PASSWORD_RESET_CONFIRM, {
            token: payload.token,
            password: payload.password,
            password2: payload.password,
        });
        return {
            success: true,
            message: response.data.message || 'Password reset successfully.',
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(
                error.response?.data?.error ||
                    'Failed to reset password. The link may be invalid or expired.'
            );
        }
        throw error;
    }
}

/**
 * Force password change (first-time login)
 */
export async function forcePasswordChange(
    payload: ForcePasswordChangePayload
): Promise<{ success: boolean; message: string }> {
    try {
        const response = await api.post(API_ENDPOINTS.AUTH.FORCE_PASSWORD_CHANGE, payload);
        return {
            success: true,
            message: response.data.message || 'Password changed successfully.',
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error || 'Failed to change password.');
        }
        throw error;
    }
}

// Export the configured axios instance for use in other API modules
export { api };
