import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../../config/api';
import { api } from '../../../api/auth';
import RoleCard from './components/RoleCard';
import { RoleAccessControl } from './types';
import { ErrorCircleIcon } from '../../../icons';
import { useToast } from '../../../context/ToastContext';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import PageMeta from '../../../components/common/PageMeta';
import ConfirmModal from '../../../components/common/ConfirmModal';

type PendingAction = {
    type: 'togglePage' | 'toggleComponent' | 'selectAll' | 'selectNone';
    roleId: number;
    roleName: string;
    pageSlug?: string;
    pageName?: string;
    componentSlug?: string;
    componentName?: string;
    currentAccess?: boolean; // For toggle actions, tracks current state
} | null;

const AccessControl: React.FC = () => {
    const { showSuccess, showError } = useToast();
    const [rolesData, setRolesData] = useState<RoleAccessControl[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [pendingAction, setPendingAction] = useState<PendingAction>(null);

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            setLoading(true);
            const response = await api.get(API_ENDPOINTS.ACCESS_CONTROL.LIST);
            setRolesData(response.data);
            setError(null);
        } catch (err: unknown) {
            console.error('Failed to fetch permissions:', err);
            setError('Failed to load permissions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Optimistic update helper
    const updateLocalState = (
        roleId: number,
        pageSlug: string | null,
        componentSlug: string | null,
        changeType: 'togglePage' | 'toggleComponent' | 'selectAll' | 'selectNone'
    ) => {
        setRolesData((prevData) =>
            prevData.map((roleData) => {
                if (roleData.role.id !== roleId) return roleData;

                const updatedPages = roleData.pages.map((page) => {
                    // Page match check
                    const isTargetPage = page.slug === pageSlug;
                    // Component match check (find if this page contains the component)
                    const containsComponent =
                        componentSlug && page.components.some((c) => c.slug === componentSlug);

                    if (changeType === 'togglePage' && isTargetPage) {
                        return { ...page, has_access: !page.has_access };
                    }

                    if (changeType === 'toggleComponent' && containsComponent) {
                        return {
                            ...page,
                            components: page.components.map((comp) =>
                                comp.slug === componentSlug
                                    ? { ...comp, has_access: !comp.has_access }
                                    : comp
                            ),
                        };
                    }

                    if (changeType === 'selectAll' && isTargetPage) {
                        return {
                            ...page,
                            has_access: true,
                            components: page.components.map((c) => ({ ...c, has_access: true })),
                        };
                    }

                    if (changeType === 'selectNone' && isTargetPage) {
                        return {
                            ...page,
                            has_access: false,
                            components: page.components.map((c) => ({ ...c, has_access: false })),
                        };
                    }

                    return page;
                });

                return { ...roleData, pages: updatedPages };
            })
        );
    };

    // Helper to find role, page, and component names for confirmation dialog
    const findActionDetails = (roleId: number, pageSlug?: string, componentSlug?: string) => {
        const role = rolesData.find((r) => r.role.id === roleId);
        let page = null;
        let component = null;

        if (pageSlug) {
            page = role?.pages.find((p) => p.slug === pageSlug);
        }

        if (componentSlug) {
            for (const p of role?.pages || []) {
                const comp = p.components.find((c) => c.slug === componentSlug);
                if (comp) {
                    component = comp;
                    page = p;
                    break;
                }
            }
        }

        return {
            roleName: role?.role.name || 'Unknown Role',
            pageName: page?.name || pageSlug || '',
            pageSlug: page?.slug || pageSlug || '',
            componentName: component?.name || componentSlug || '',
            pageHasAccess: page?.has_access || false,
            componentHasAccess: component?.has_access || false,
        };
    };

    // Request confirmation for page toggle
    const requestTogglePage = (roleId: number, pageSlug: string) => {
        const details = findActionDetails(roleId, pageSlug);
        setPendingAction({
            type: 'togglePage',
            roleId,
            roleName: details.roleName,
            pageSlug,
            pageName: details.pageName,
            currentAccess: details.pageHasAccess,
        });
    };

    // Request confirmation for component toggle
    const requestToggleComponent = (roleId: number, componentSlug: string) => {
        const details = findActionDetails(roleId, undefined, componentSlug);
        setPendingAction({
            type: 'toggleComponent',
            roleId,
            roleName: details.roleName,
            pageSlug: details.pageSlug,
            pageName: details.pageName,
            componentSlug,
            componentName: details.componentName,
            currentAccess: details.componentHasAccess,
        });
    };

    // Request confirmation for Select All
    const requestSelectAll = (roleId: number, pageSlug: string) => {
        const details = findActionDetails(roleId, pageSlug);
        setPendingAction({
            type: 'selectAll',
            roleId,
            roleName: details.roleName,
            pageSlug,
            pageName: details.pageName,
        });
    };

    // Request confirmation for Select None
    const requestSelectNone = (roleId: number, pageSlug: string) => {
        const details = findActionDetails(roleId, pageSlug);
        setPendingAction({
            type: 'selectNone',
            roleId,
            roleName: details.roleName,
            pageSlug,
            pageName: details.pageName,
        });
    };

    // Execute confirmed action
    const executeConfirmedAction = async () => {
        if (!pendingAction) return;

        const { type, roleId, pageSlug, componentSlug } = pendingAction;
        setPendingAction(null);

        try {
            setActionLoading(true);

            switch (type) {
                case 'togglePage':
                    updateLocalState(roleId, pageSlug!, null, 'togglePage');
                    await api.post(API_ENDPOINTS.ACCESS_CONTROL.TOGGLE_PAGE(roleId), {
                        page_slug: pageSlug,
                    });
                    break;

                case 'toggleComponent':
                    updateLocalState(roleId, null, componentSlug!, 'toggleComponent');
                    await api.post(API_ENDPOINTS.ACCESS_CONTROL.TOGGLE_COMPONENT(roleId), {
                        component_slug: componentSlug,
                    });
                    break;

                case 'selectAll':
                    updateLocalState(roleId, pageSlug!, null, 'selectAll');
                    await api.post(API_ENDPOINTS.ACCESS_CONTROL.SELECT_ALL_PAGE(roleId), {
                        page_slug: pageSlug,
                    });
                    showSuccess('Access granted for all components');
                    break;

                case 'selectNone':
                    updateLocalState(roleId, pageSlug!, null, 'selectNone');
                    await api.post(API_ENDPOINTS.ACCESS_CONTROL.SELECT_NONE_PAGE(roleId), {
                        page_slug: pageSlug,
                    });
                    showSuccess('Access revoked for all components');
                    break;
            }
        } catch (err) {
            console.error(`Failed to execute ${type}:`, err);
            showError('Failed to update permission');
            fetchPermissions();
        } finally {
            setActionLoading(false);
        }
    };

    // Cancel pending action
    const cancelAction = () => {
        setPendingAction(null);
    };

    // Generate confirmation message based on action type
    const getConfirmationMessage = (): string => {
        if (!pendingAction) return '';

        const { type, roleName, pageName, componentName, currentAccess } = pendingAction;
        const action = currentAccess ? 'revoke' : 'grant';

        switch (type) {
            case 'togglePage':
                return `Are you sure you want to ${action} "${roleName}" access to the "${pageName}" page?`;
            case 'toggleComponent':
                return `Are you sure you want to ${action} "${roleName}" access to the "${componentName}" component?`;
            case 'selectAll':
                return `Are you sure you want to grant "${roleName}" access to "${pageName}" and all its components?`;
            case 'selectNone':
                return `Are you sure you want to revoke "${roleName}" access to "${pageName}" and all its components?`;
            default:
                return '';
        }
    };

    // Get confirmation modal title and type
    const getModalConfig = () => {
        if (!pendingAction) return { title: '', type: 'info' as const, confirmText: 'Confirm' };

        const { type, currentAccess } = pendingAction;

        if (
            type === 'selectAll' ||
            (!currentAccess && (type === 'togglePage' || type === 'toggleComponent'))
        ) {
            return { title: 'Grant Access', type: 'info' as const, confirmText: 'Grant Access' };
        }
        return { title: 'Revoke Access', type: 'danger' as const, confirmText: 'Revoke Access' };
    };

    if (loading && rolesData.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-96 space-y-4">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-500 animate-pulse">Loading permissions...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg flex items-center space-x-3 border border-red-100 dark:border-red-900/30">
                <ErrorCircleIcon className="w-6 h-6" />
                <span>{error}</span>
                <button
                    onClick={fetchPermissions}
                    className="ml-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div>
            <PageMeta
                title="Access Control | Creative Dashboard"
                description="Manage role-based access for pages and their nested components"
            />
            <PageBreadcrumb pageTitle="Access Control" />

            <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Role Permissions
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Select a role below to manage its access for pages and individual
                        components.
                    </p>
                </div>

                <div className="space-y-6">
                    {rolesData.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <p>No roles found to configure.</p>
                        </div>
                    ) : (
                        rolesData.map((roleAccess) => (
                            <RoleCard
                                key={roleAccess.role.id}
                                data={roleAccess}
                                onTogglePage={requestTogglePage}
                                onToggleComponent={requestToggleComponent}
                                onSelectAllPage={requestSelectAll}
                                onSelectNonePage={requestSelectNone}
                                loading={actionLoading}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Confirmation Modal for All Actions */}
            <ConfirmModal
                isOpen={pendingAction !== null}
                title={getModalConfig().title}
                message={getConfirmationMessage()}
                confirmText={getModalConfig().confirmText}
                cancelText="Cancel"
                type={getModalConfig().type}
                onConfirm={executeConfirmedAction}
                onCancel={cancelAction}
            />
        </div>
    );
};

export default AccessControl;
