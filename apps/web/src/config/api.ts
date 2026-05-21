// src/config/api.ts
/**
 * API Configuration
 * 
 * Environment Variables:
 * - VITE_API_BASE_URL: Backend API URL (only used in production)
 * 
 * Development: Vite proxy handles /api/* requests (see vite.config.ts)
 * Production: Set VITE_API_BASE_URL or leave empty for same-domain deployment
 */

// Determine if we're in development mode
export const IS_DEV = import.meta.env.DEV;
export const IS_PROD = import.meta.env.PROD;

// API Base URL
// - Development: Empty string (uses Vite proxy for same-origin requests)
// - Production: From env var, or empty for same-domain deployment
export const API_BASE_URL = IS_DEV 
    ? '' 
    : (import.meta.env.VITE_API_BASE_URL || '');

export const API_ENDPOINTS = {
    AUTH: {
        // Cookie-based authentication endpoints
        CSRF: '/api/auth/csrf/',
        LOGIN: '/api/auth/login/',
        REFRESH: '/api/auth/refresh/',
        LOGOUT: '/api/auth/logout/',
        ME: '/api/auth/me/',
        REGISTER: '/api/auth/register/',
        FORCE_PASSWORD_CHANGE: '/api/auth/force-password-change/',
        // Password reset (standalone)
        PASSWORD_RESET: '/api/password-reset/',
        PASSWORD_RESET_CONFIRM: '/api/password-reset-confirm/',
    },
    USERS: {
        LIST: '/api/users/',
        DETAIL: (id: string | number) => `/api/users/${id}/`,
        UPDATE: (id: string | number) => `/api/users/${id}/`,
        DELETE: (id: string | number) => `/api/users/${id}/`,
        ACTIVATE: (id: string | number) => `/api/users/${id}/activate/`,
        DEACTIVATE: (id: string | number) => `/api/users/${id}/deactivate/`,
        ASSIGN_ROLE: (id: string | number) => `/api/users/${id}/assign-role/`,
        REMOVE_ROLE: (id: string | number) => `/api/users/${id}/remove-role/`,
        CHANGE_PASSWORD: (id: string | number) => `/api/users/${id}/change-password/`,
        EFFECTIVE_PERMISSIONS: (id: string) => `/api/users/${id}/effective-permissions/`,
        PERMISSION_OVERRIDES: (id: string) => `/api/users/${id}/permission-overrides/`,
        DELETE_OVERRIDE: (id: string, overrideId: number) =>
            `/api/users/${id}/permission-overrides/${overrideId}/`,
        DELETE_OVERRIDE_BY_SLUG: (id: string, type: string, slug: string) =>
            `/api/users/${id}/permission-overrides/by-slug/?type=${type}&slug=${slug}`,
        CLEAR_OVERRIDES: (id: string) => `/api/users/${id}/permission-overrides/clear/`,
    },
    ROLES: {
        LIST: '/api/roles/',
    },
    PAGES: {
        LIST: '/api/pages/',
    },
    COMPONENTS: {
        LIST: '/api/components/',
    },
    FORMS: {
        LIST: '/api/forms/',
        DETAIL: (id: string) => `/api/forms/${id}/`,
        UPDATE: (id: string) => `/api/forms/${id}/`,
        DELETE: (id: string) => `/api/forms/${id}/`,
        PUBLISH: (id: string) => `/api/forms/${id}/publish/`,
        UNPUBLISH: (id: string) => `/api/forms/${id}/unpublish/`,
        DUPLICATE: (id: string) => `/api/forms/${id}/duplicate/`,
        ANALYTICS: (formId: string) => `/api/forms/${formId}/analytics/`,
        RESPONSES: (formId: string) => `/api/forms/${formId}/responses/`,
        RESPONSE_DETAIL: (formId: string, responseId: string) =>
            `/api/forms/${formId}/responses/${responseId}/`,
    },
    PUBLIC: {
        EXPLORE: '/api/public/explore/',
        FORM: (slug: string) => `/api/public/forms/${slug}/`,
        SUBMIT: (slug: string) => `/api/public/forms/${slug}/submit/`,
    },
    ACCESS_CONTROL: {
        LIST: '/api/access-control/',
        DETAIL: (roleId: number) => `/api/access-control/${roleId}/`,
        TOGGLE_PAGE: (roleId: number) => `/api/access-control/${roleId}/toggle_page/`,
        TOGGLE_COMPONENT: (roleId: number) => `/api/access-control/${roleId}/toggle_component/`,
        SELECT_ALL_PAGE: (roleId: number) => `/api/access-control/${roleId}/select_all_page/`,
        SELECT_NONE_PAGE: (roleId: number) => `/api/access-control/${roleId}/select_none_page/`,
    },
    MOCKUP: {
        UPLOAD: '/api/mockup-ad-studio/upload',
        CLEAR_VIDEOS: '/api/mockup-ad-studio/clear-videos',
        UPLOAD_IMAGES: '/api/mockup-ad-studio/upload-images',
        CLEAR_IMAGES: '/api/mockup-ad-studio/clear-images',
        LIST_USER_IMAGES: '/api/mockup-ad-studio/list-user-images',
        UPLOAD_BASE: '/api/mockup-ad-studio/upload-base',
        PROCESS: '/api/mockup-ad-studio/process',
        DOWNLOAD: '/api/mockup-ad-studio/download',
        LIST_FRAMES: '/api/mockup-ad-studio/list-frames',
        FRAME_URL: '/api/mockup-ad-studio/frames/:filename',
        SET_PLATFORM: '/api/mockup-ad-studio/set-platform',
        GET_PLATFORM: '/api/mockup-ad-studio/get-platform',
        LIST_OVERLAYS: '/api/mockup-ad-studio/list-overlays',
        OVERLAY_URL: '/api/mockup-ad-studio/overlay/:filename',
        SET_OVERLAY: '/api/mockup-ad-studio/set-overlay',
        GET_OVERLAY: '/api/mockup-ad-studio/get-overlay',
    },
    LANDING_PAGES: {
        BRANDS: '/api/landing-pages/brands/',
        BRAND_DETAIL: (id: number) => `/api/landing-pages/brands/${id}/`,
        CAMPAIGNS: '/api/landing-pages/campaigns/',
        CAMPAIGN_DETAIL: (id: number) => `/api/landing-pages/campaigns/${id}/`,
        LIST: '/api/landing-pages/landing-pages/',
        DETAIL: (id: number) => `/api/landing-pages/landing-pages/${id}/`,
        PREVIEW: (id: number) => `/api/landing-pages/landing-pages/${id}/preview/`,
        PREVIEW_NEW: '/api/landing-pages/landing-pages/preview_new/',
        PUBLISH: (id: number) => `/api/landing-pages/landing-pages/${id}/publish/`,
        UNPUBLISH: (id: number) => `/api/landing-pages/landing-pages/${id}/unpublish/`,
        VERSIONS: '/api/landing-pages/generator-versions/',
    },
};
