// Types for UserPermissionsModal and related components

export type Override = 'grant' | 'revoke' | null;

// Component permission with override info (nested inside pages)
export interface ComponentOverridePermission {
    slug: string;
    name: string;
    description: string;
    role_default: boolean;
    override: Override;
    final: boolean;
}

// Page permission with nested components
export interface PageOverridePermission {
    slug: string;
    name: string;
    category: string;
    role_default: boolean;
    override: Override;
    final: boolean;
    components: ComponentOverridePermission[];
}

// API response for effective permissions (nested structure)
export interface EffectivePermissionsResponse {
    user_id: string;
    username: string;
    user_role: string | null;
    pages: PageOverridePermission[];
}

export interface User {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_superadmin: boolean;
}

// Shared handler type for toggling overrides
export type OverrideToggleHandler = (
    type: 'page' | 'component',
    slug: string,
    roleDefault: boolean,
    override: Override
) => void;
