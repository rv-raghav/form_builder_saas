import { useAuth } from '../context/AuthContext';

/**
 * Hook to check if user can view a specific component.
 * @param componentSlug - The slug of the component to check
 * @returns boolean indicating if the component should be shown
 */
export function useComponentPermission(componentSlug: string): boolean {
    const { user } = useAuth();

    if (!user) return false;

    // SuperAdmin can see everything
    if (user.is_superadmin) return true;

    // Check if component is in allowed list
    return user.allowed_components?.some((c) => c.slug === componentSlug) ?? false;
}

/**
 * Hook to get all allowed component slugs for quick lookup.
 */
export function useAllowedComponents(): Set<string> {
    const { user } = useAuth();

    if (!user) return new Set();
    if (user.is_superadmin) return new Set(['*']); // All components

    return new Set(user.allowed_components?.map((c) => c.slug) ?? []);
}
