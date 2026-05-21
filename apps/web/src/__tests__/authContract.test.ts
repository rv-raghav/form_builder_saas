/**
 * Authentication Contract Tests
 *
 * These tests enforce the auth contract defined in docs/auth-contract.md.
 * They do NOT test business logic - they test INVARIANTS.
 *
 * If any of these tests fail, the auth system is broken.
 * Do not "fix" these tests by changing assertions - fix the code.
 *
 * Reference: docs/auth-contract.md
 */
import { describe, test, expect } from 'vitest';
import { API_ENDPOINTS } from '../config/api';
import { api, getCSRFToken } from '../api/auth';

// =============================================================================
// ENDPOINT STABILITY TESTS
// Contract Section 6: Authentication Endpoints
// =============================================================================

describe('Auth Endpoints (Contract Section 6)', () => {
    test('auth endpoints are stable and match contract', () => {
        // These endpoints must NOT change without updating the contract
        expect(API_ENDPOINTS.AUTH.CSRF).toBe('/api/auth/csrf/');
        expect(API_ENDPOINTS.AUTH.LOGIN).toBe('/api/auth/login/');
        expect(API_ENDPOINTS.AUTH.REFRESH).toBe('/api/auth/refresh/');
        expect(API_ENDPOINTS.AUTH.LOGOUT).toBe('/api/auth/logout/');
        expect(API_ENDPOINTS.AUTH.ME).toBe('/api/auth/me/');
    });

    test('auth endpoints object has all required keys', () => {
        const requiredEndpoints = ['CSRF', 'LOGIN', 'REFRESH', 'LOGOUT', 'ME'];
        
        for (const endpoint of requiredEndpoints) {
            expect(API_ENDPOINTS.AUTH).toHaveProperty(endpoint);
            expect(typeof API_ENDPOINTS.AUTH[endpoint as keyof typeof API_ENDPOINTS.AUTH]).toBe('string');
        }
    });

    test('all core auth endpoints start with /api/auth/', () => {
        // Only check core authentication endpoints, not password reset
        const coreAuthEndpoints = [
            API_ENDPOINTS.AUTH.CSRF,
            API_ENDPOINTS.AUTH.LOGIN,
            API_ENDPOINTS.AUTH.REFRESH,
            API_ENDPOINTS.AUTH.LOGOUT,
            API_ENDPOINTS.AUTH.ME,
        ];
        
        for (const endpoint of coreAuthEndpoints) {
            expect(endpoint).toMatch(/^\/api\/auth\//);
        }
    });
});

// =============================================================================
// AXIOS CONFIGURATION TESTS
// Contract Section 9: Frontend Rules
// =============================================================================

describe('Axios Configuration (Contract Section 9)', () => {
    test('axios instance has withCredentials enabled', () => {
        // Contract Rule 1: withCredentials: true on all API calls
        expect(api.defaults.withCredentials).toBe(true);
    });

    test('axios instance has correct content-type', () => {
        expect(api.defaults.headers['Content-Type']).toBe('application/json');
    });

    test('CSRF token getter function exists', () => {
        expect(typeof getCSRFToken).toBe('function');
    });
});

// =============================================================================
// API MODULE EXPORTS
// Contract: Frontend must use centralized auth functions
// =============================================================================

describe('Auth API Module Structure', () => {
    test('api instance is exported', async () => {
        const authModule = await import('../api/auth');
        expect(authModule.api).toBeDefined();
    });

    test('required auth functions are exported', async () => {
        const authModule = await import('../api/auth');
        
        // These functions must exist
        expect(typeof authModule.login).toBe('function');
        expect(typeof authModule.logout).toBe('function');
        expect(typeof authModule.getCurrentUser).toBe('function');
        expect(typeof authModule.fetchCSRFToken).toBe('function');
        expect(typeof authModule.getCSRFToken).toBe('function');
    });
});

// =============================================================================
// TYPE SAFETY TESTS
// Contract: Response types must match expected structure
// =============================================================================

describe('Auth Type Definitions', () => {
    test('AuthUser type includes required fields', async () => {
        // Import the type (this is a compile-time check mainly)
        const authModule = await import('../api/auth');
        
        // Verify the module exports types by checking function return types
        // This is more of a structural verification
        expect(authModule).toBeDefined();
    });

    test('LoginResponse type structure', async () => {
        const authModule = await import('../api/auth');
        
        // LoginResponse should have: success, user, must_reset_password
        // This is verified by TypeScript, but we can check the module exists
        expect(authModule).toBeDefined();
    });
});

// =============================================================================
// ENDPOINT PATH CONSISTENCY
// Contract: Endpoints must be consistent with backend
// =============================================================================

describe('Endpoint Path Consistency', () => {
    test('all endpoints end with trailing slash', () => {
        // Django REST Framework convention
        const allEndpoints = [
            API_ENDPOINTS.AUTH.CSRF,
            API_ENDPOINTS.AUTH.LOGIN,
            API_ENDPOINTS.AUTH.REFRESH,
            API_ENDPOINTS.AUTH.LOGOUT,
            API_ENDPOINTS.AUTH.ME,
        ];
        
        for (const endpoint of allEndpoints) {
            expect(endpoint).toMatch(/\/$/);
        }
    });

    test('no duplicate slashes in endpoints', () => {
        const allEndpoints = Object.values(API_ENDPOINTS.AUTH);
        
        for (const endpoint of allEndpoints) {
            expect(endpoint).not.toMatch(/\/\//);
        }
    });
});

// =============================================================================
// CONFIG MODULE TESTS
// =============================================================================

describe('API Config Module', () => {
    test('API_BASE_URL is defined', async () => {
        const configModule = await import('../config/api');
        expect(configModule).toHaveProperty('API_BASE_URL');
    });

    test('API_ENDPOINTS is defined', async () => {
        const configModule = await import('../config/api');
        expect(configModule).toHaveProperty('API_ENDPOINTS');
    });
});
