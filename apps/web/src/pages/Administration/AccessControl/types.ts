export interface ComponentPermission {
    slug: string;
    name: string;
    description: string;
    has_access: boolean;
}

export interface PagePermission {
    slug: string;
    name: string;
    path: string | null;
    category: string;
    has_access: boolean;
    components: ComponentPermission[];
}

export interface Role {
    id: number;
    name: string;
    slug: string;
}

export interface RoleAccessControl {
    role: Role;
    pages: PagePermission[];
}
