import { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal } from '../../../../components/ui/modal';
import Button from '../../../../components/ui/button/Button';
import Badge from '../../../../components/ui/badge/Badge';
import ConfirmModal from '../../../../components/common/ConfirmModal';
import { api } from '../../../../api/auth';
import { API_ENDPOINTS } from '../../../../config/api';
import { useToast } from '../../../../context/ToastContext';
import PageList from './PageList';
import PageDetailsPanel from './PageDetailsPanel';
import { EffectivePermissionsResponse, User, Override, PageOverridePermission } from './types';
import { ChevronRightIcon } from '../../../../icons';

interface UserPermissionsModalProps {
    user: User;
    onClose: () => void;
}

export default function UserPermissionsModal({ user, onClose }: UserPermissionsModalProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [permissions, setPermissions] = useState<EffectivePermissionsResponse | null>(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [selectedPageSlug, setSelectedPageSlug] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showMobileNav, setShowMobileNav] = useState(false);
    const { showToast } = useToast();

    const loadPermissions = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(API_ENDPOINTS.USERS.EFFECTIVE_PERMISSIONS(user.id));
            setPermissions(response.data);
        } catch (err) {
            console.error('Failed to load permissions:', err);
            showToast('Failed to load permissions', 'error');
        } finally {
            setLoading(false);
        }
    }, [user.id, showToast]);

    useEffect(() => {
        loadPermissions();
    }, [loadPermissions]);

    // Auto-select first page when data loads
    useEffect(() => {
        if (permissions?.pages && permissions.pages.length > 0 && !selectedPageSlug) {
            setSelectedPageSlug(permissions.pages[0].slug);
        }
    }, [permissions, selectedPageSlug]);

    // Get selected page
    const selectedPage = useMemo<PageOverridePermission | null>(() => {
        if (!permissions?.pages || !selectedPageSlug) return null;
        return permissions.pages.find((p) => p.slug === selectedPageSlug) || null;
    }, [permissions, selectedPageSlug]);

    // Handle search - auto-select first visible if current disappears
    useEffect(() => {
        if (searchTerm.trim() && permissions?.pages) {
            const term = searchTerm.toLowerCase();
            const visiblePages = permissions.pages.filter(
                (page) =>
                    page.name.toLowerCase().includes(term) ||
                    page.slug.toLowerCase().includes(term) ||
                    page.components.some(
                        (c) =>
                            c.name.toLowerCase().includes(term) ||
                            c.slug.toLowerCase().includes(term)
                    )
            );
            const currentVisible = visiblePages.some((p) => p.slug === selectedPageSlug);
            if (!currentVisible && visiblePages.length > 0) {
                setSelectedPageSlug(visiblePages[0].slug);
            }
        }
    }, [searchTerm, permissions, selectedPageSlug]);

    const handleSelectPage = useCallback((slug: string) => {
        setSelectedPageSlug(slug);
        setShowMobileNav(false); // Close mobile nav on selection
    }, []);

    const handleOverrideChange = useCallback(
        async (type: 'page' | 'component', slug: string, newAction: Override) => {
            let currentOverride: Override = null;
            if (type === 'page') {
                const page = permissions?.pages.find((p) => p.slug === slug);
                currentOverride = page?.override || null;
            } else {
                for (const page of permissions?.pages || []) {
                    const comp = page.components.find((c) => c.slug === slug);
                    if (comp) {
                        currentOverride = comp.override;
                        break;
                    }
                }
            }

            if (currentOverride === newAction) return;

            setSaving(slug);

            try {
                if (newAction === null) {
                    await api.delete(
                        API_ENDPOINTS.USERS.DELETE_OVERRIDE_BY_SLUG(user.id, type, slug)
                    );
                } else {
                    await api.post(API_ENDPOINTS.USERS.PERMISSION_OVERRIDES(user.id), {
                        override_type: type,
                        slug,
                        action: newAction,
                    });
                }

                await loadPermissions();
                showToast('Permission updated', 'success');
            } catch (err) {
                console.error('Failed to update permission:', err);
                showToast('Failed to update permission', 'error');
            } finally {
                setSaving(null);
            }
        },
        [user.id, permissions, loadPermissions, showToast]
    );

    const handlePageOverrideChange = useCallback(
        (slug: string, action: Override) => {
            handleOverrideChange('page', slug, action);
        },
        [handleOverrideChange]
    );

    const handleComponentOverrideChange = useCallback(
        (slug: string, action: Override) => {
            handleOverrideChange('component', slug, action);
        },
        [handleOverrideChange]
    );

    const handleClearAll = useCallback(async () => {
        try {
            setSaving('clear-all');
            await api.post(API_ENDPOINTS.USERS.CLEAR_OVERRIDES(user.id));
            await loadPermissions();
            showToast('All overrides cleared', 'success');
            setShowClearConfirm(false);
        } catch (err) {
            console.error('Failed to clear overrides:', err);
            showToast('Failed to clear overrides', 'error');
        } finally {
            setSaving(null);
        }
    }, [user.id, loadPermissions, showToast]);

    const hasOverrides = useMemo(() => {
        if (!permissions?.pages) return false;
        return permissions.pages.some(
            (p) => p.override !== null || p.components.some((c) => c.override !== null)
        );
    }, [permissions]);

    // Stats
    const stats = useMemo(() => {
        if (!permissions?.pages)
            return { pages: 0, totalPages: 0, components: 0, totalComponents: 0 };
        const totalPages = permissions.pages.length;
        const pagesWithAccess = permissions.pages.filter((p) => p.final).length;
        const totalComponents = permissions.pages.reduce((acc, p) => acc + p.components.length, 0);
        const componentsWithAccess = permissions.pages.reduce(
            (acc, p) => acc + p.components.filter((c) => c.final).length,
            0
        );
        return { pages: pagesWithAccess, totalPages, components: componentsWithAccess, totalComponents };
    }, [permissions]);

    return (
        <>
            <Modal
                isOpen={true}
                onClose={onClose}
                className="relative z-10 w-[calc(100vw-1rem)] h-[calc(100vh-1rem)] sm:w-[95vw] sm:h-[90vh] md:w-[900px] md:h-[600px] max-w-5xl"
            >
                <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="flex-shrink-0 px-4 py-4 sm:px-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Permission Overrides
                                </h2>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {user.username}
                                    </span>
                                    {permissions?.user_role && (
                                        <Badge variant="light" color="primary" size="sm">
                                            {permissions.user_role}
                                        </Badge>
                                    )}
                                    {!loading && (
                                        <>
                                            <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">•</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                                                {stats.pages}/{stats.totalPages} pages, {stats.components}/{stats.totalComponents} components
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {hasOverrides && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowClearConfirm(true)}
                                        disabled={saving !== null}
                                    >
                                        <span className="hidden sm:inline">Clear All</span>
                                        <span className="sm:hidden">Clear</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content - Master-Detail Layout */}
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-brand-500 mx-auto" />
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Loading permissions...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex overflow-hidden relative">
                            {/* Mobile Nav Toggle */}
                            <button
                                onClick={() => setShowMobileNav(!showMobileNav)}
                                className="md:hidden absolute top-2 left-2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium shadow-sm border border-gray-200 dark:border-gray-700"
                            >
                                {selectedPage?.name || 'Select Page'}
                                <ChevronRightIcon className={`w-4 h-4 transition-transform ${showMobileNav ? 'rotate-90' : ''}`} />
                            </button>

                            {/* Left Panel - Page List (Navigation) */}
                            <div
                                className={`
                                    absolute inset-0 md:relative md:inset-auto
                                    w-full md:w-64 flex-shrink-0 
                                    border-r border-gray-200 dark:border-gray-700 
                                    bg-gray-50 dark:bg-gray-900
                                    z-10 transition-transform duration-200
                                    ${showMobileNav ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                                `}
                            >
                                {/* Mobile Close */}
                                <div className="md:hidden p-3 border-b border-gray-200 dark:border-gray-700 flex justify-end">
                                    <button
                                        onClick={() => setShowMobileNav(false)}
                                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <PageList
                                    pages={permissions?.pages || []}
                                    selectedSlug={selectedPageSlug}
                                    onSelectPage={handleSelectPage}
                                    searchTerm={searchTerm}
                                    onSearchChange={setSearchTerm}
                                />
                            </div>

                            {/* Right Panel - Page Details (Editing) */}
                            <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800 md:pt-0 pt-10">
                                <PageDetailsPanel
                                    page={selectedPage}
                                    onPageOverrideChange={handlePageOverrideChange}
                                    onComponentOverrideChange={handleComponentOverrideChange}
                                    disabled={saving !== null}
                                />
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex-shrink-0 px-4 py-3 sm:px-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Clear All Confirmation */}
            <ConfirmModal
                isOpen={showClearConfirm}
                title="Clear All Overrides"
                message="Are you sure you want to clear all permission overrides? This will reset all permissions to their role defaults."
                confirmText="Clear All"
                cancelText="Cancel"
                type="warning"
                onConfirm={handleClearAll}
                onCancel={() => setShowClearConfirm(false)}
            />
        </>
    );
}
