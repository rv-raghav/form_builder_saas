import type React from 'react';
import { useComponentPermission } from '../../hooks/useComponentPermission';

interface PermissionGuardProps {
    slug: string;
    children: React.ReactNode;
}

export function PermissionGuard({ slug, children }: PermissionGuardProps) {
    const hasPermission = useComponentPermission(slug);

    if (!hasPermission) {
        return null;
    }

    return <>{children}</>;
}
