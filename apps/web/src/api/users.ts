// src/api/users.ts
import { api } from './auth';
import { API_ENDPOINTS } from '../config/api';

export type User = {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
    is_superadmin: boolean;
    has_overrides?: boolean;
    date_joined: string;
    last_login: string | null;
};

export type PaginatedResponse<T> = {
    results: T[];
    count: number;
    next: string | null;
    previous: string | null;
};

// Column definitions for DataTables - must match actual model fields (not computed)
// 'role' is excluded as it's a SerializerMethodField and cannot be searched/sorted
const USER_COLUMNS = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active'];

/**
 * Build DataTables.js format query parameters
 * Transforms simple params to the format expected by djangorestframework-datatables
 */
function buildDataTablesParams(params: {
    page: number;
    pageSize: number;
    search: string;
    ordering: string;
    draw?: number;
}): Record<string, string | number> {
    const { page, pageSize, search, ordering, draw = 1 } = params;
    
    // Calculate start offset (0-indexed)
    const start = (page - 1) * pageSize;
    
    // Build base params
    const queryParams: Record<string, string | number> = {
        format: 'datatables',
        draw,
        start,
        length: pageSize,
        'search[value]': search,
        'search[regex]': 'false',
    };
    
    // Add column definitions (required for DataTables filtering)
    USER_COLUMNS.forEach((col, index) => {
        queryParams[`columns[${index}][data]`] = col;
        queryParams[`columns[${index}][name]`] = col;
        queryParams[`columns[${index}][searchable]`] = 'true';
        queryParams[`columns[${index}][orderable]`] = 'true';
        queryParams[`columns[${index}][search][value]`] = '';
        queryParams[`columns[${index}][search][regex]`] = 'false';
    });
    
    // Add ordering - determine column index and direction
    let orderColumn = 0; // default to id
    let orderDir: 'asc' | 'desc' = 'asc';
    
    if (ordering) {
        const isDesc = ordering.startsWith('-');
        const columnName = isDesc ? ordering.slice(1) : ordering;
        orderDir = isDesc ? 'desc' : 'asc';
        
        const colIndex = USER_COLUMNS.indexOf(columnName);
        if (colIndex !== -1) {
            orderColumn = colIndex;
        }
    }
    
    queryParams['order[0][column]'] = orderColumn;
    queryParams['order[0][dir]'] = orderDir;
    
    return queryParams;
}

/**
 * Fetch all users from the API with DataTables server-side processing
 */
export async function fetchUsers(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    ordering?: string;
} = {}): Promise<PaginatedResponse<User>> {
    try {
        const { page = 1, pageSize = 20, search = '', ordering = 'id' } = params;
        
        // Build DataTables.js format query params
        const queryParams = buildDataTablesParams({ page, pageSize, search, ordering });
        
        const response = await api.get(API_ENDPOINTS.USERS.LIST, {
            params: queryParams,
        });

        // Handle DataTables response format
        if (response.data && 'recordsTotal' in response.data) {
            return {
                results: response.data.data || [],
                count: response.data.recordsTotal || 0,
                next: null,
                previous: null,
            };
        }

        // Handle paginated response from DRF (fallback)
        if (response.data && Array.isArray(response.data.results)) {
            return {
                results: response.data.results,
                count: response.data.count || 0,
                next: response.data.next || null,
                previous: response.data.previous || null,
            };
        }

        // Handle direct array response
        if (Array.isArray(response.data)) {
            return {
                results: response.data,
                count: response.data.length,
                next: null,
                previous: null,
            };
        }

        console.error('Unexpected API response format:', response.data);
        return { results: [], count: 0, next: null, previous: null };
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('Failed to fetch users');
    }
}

export type CreateUserPayload = {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
    role_id?: number | null;
    is_active?: boolean;
};

export type Role = {
    id: number;
    name: string;
    slug: string;
    description: string;
};

/**
 * Fetch all roles from the API
 */
export async function fetchRoles(): Promise<Role[]> {
    try {
        const response = await api.get(API_ENDPOINTS.ROLES.LIST);

        // Handle paginated response
        if (response.data && Array.isArray(response.data.results)) {
            return response.data.results;
        }

        // Handle direct array response
        if (Array.isArray(response.data)) {
            return response.data;
        }

        return [];
    } catch (error) {
        console.error('Error fetching roles:', error);
        throw new Error('Failed to fetch roles');
    }
}

/**
 * Create a new user
 */
export async function createUser(payload: CreateUserPayload): Promise<User> {
    try {
        const response = await api.post(API_ENDPOINTS.USERS.LIST, payload);
        return response.data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

export type UpdateUserPayload = {
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    role_id?: number | null;
    is_active?: boolean;
};

/**
 * Update an existing user
 */
export async function updateUser(userId: string, payload: UpdateUserPayload): Promise<User> {
    try {
        const response = await api.patch(API_ENDPOINTS.USERS.UPDATE(userId), payload);
        return response.data;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string): Promise<void> {
    try {
        await api.delete(API_ENDPOINTS.USERS.DELETE(userId));
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

/**
 * Activate a user account
 */
export async function activateUser(userId: string): Promise<{ detail: string }> {
    try {
        const response = await api.post(API_ENDPOINTS.USERS.ACTIVATE(userId));
        return response.data;
    } catch (error) {
        console.error('Error activating user:', error);
        throw error;
    }
}

/**
 * Deactivate a user account
 */
export async function deactivateUser(userId: string): Promise<{ detail: string }> {
    try {
        const response = await api.post(API_ENDPOINTS.USERS.DEACTIVATE(userId));
        return response.data;
    } catch (error) {
        console.error('Error deactivating user:', error);
        throw error;
    }
}

/**
 * Extract error message from API error response
 * Handles DRF validation errors with field-specific messages
 */
export function getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object') {
        // Axios error with response
        const axiosError = error as {
            response?: {
                data?: Record<string, unknown>;
                status?: number;
            };
            message?: string;
        };

        const data = axiosError.response?.data;

        if (data) {
            // Handle DRF 'detail' field (common for permission errors)
            if (typeof data.detail === 'string') {
                return data.detail;
            }

            // Handle field-specific validation errors
            // DRF returns: { "username": ["A user with this username already exists."] }
            const fieldErrors: string[] = [];
            for (const [field, errors] of Object.entries(data)) {
                if (Array.isArray(errors) && errors.length > 0) {
                    // Capitalize field name and join errors
                    const fieldName =
                        field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ');
                    fieldErrors.push(`${fieldName}: ${errors.join(', ')}`);
                } else if (typeof errors === 'string') {
                    const fieldName =
                        field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ');
                    fieldErrors.push(`${fieldName}: ${errors}`);
                }
            }

            if (fieldErrors.length > 0) {
                return fieldErrors.join(' | ');
            }
        }
        if (axiosError.message) {
            return axiosError.message;
        }
    }
    return 'An unexpected error occurred';
}
