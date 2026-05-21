// src/pages/Tools/LandingPages/components/LandingPagesDataTable.tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import Button from '../../../../components/ui/button/Button';
import Badge from '../../../../components/ui/badge/Badge';
import {
    customStyles,
    SearchInput,
    TableWrapper,
} from '../../../../components/ui/datatable/dataTableStyles';
import {
    fetchLandingPages,
    deleteLandingPage,
    publishLandingPage,
    createProdUrl,
    purgeProdUrl,
    unpublishLandingPage,
    type LandingPageListItem,
} from '../../../../api/landingPages';
import { useToast } from '../../../../context/ToastContext';
import { useTheme } from '../../../../context/ThemeContext';
import ConfirmModal from '../../../../components/common/ConfirmModal';

interface Props {
    onEdit: (lp: LandingPageListItem) => void;
    onRefresh?: () => void;
}

// Status badge colors
const STATUS_COLORS: Record<string, 'light' | 'warning' | 'success'> = {
    draft: 'light',
    staging: 'warning',
    production: 'success',
};

// LP Type labels
const LP_TYPE_LABELS: Record<string, string> = {
    add_to_calendar: 'Calendar',
    microsite: 'Microsite',
    calculator: 'Calculator',
};

export default function LandingPagesDataTable({ onEdit, onRefresh }: Props) {
    const { showSuccess, showError } = useToast();
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    // Data state
    const [landingPages, setLandingPages] = useState<LandingPageListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRows, setTotalRows] = useState(0);

    // Pagination & sorting state
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [sortColumn, setSortColumn] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Modal states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [lpToDelete, setLpToDelete] = useState<{ id: number; name: string } | null>(null);
    const [actionInProgress, setActionInProgress] = useState<number | null>(null);
    
    // Action confirmation modal state
    const [actionModal, setActionModal] = useState<{
        isOpen: boolean;
        type: 'publish-staging' | 'republish-staging' | 'publish-prod' | 'republish-prod' | 'unpublish' | null;
        lp: LandingPageListItem | null;
    }>({ isOpen: false, type: null, lp: null });

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch landing pages
    const loadLandingPages = useCallback(async () => {
        try {
            setLoading(true);
            const ordering = sortDirection === 'desc' ? `-${sortColumn}` : sortColumn;
            const response = await fetchLandingPages({
                page: currentPage,
                pageSize: perPage,
                search: debouncedSearch,
                ordering,
            });
            setLandingPages(response.results);
            setTotalRows(response.count);
        } catch (err) {
            showError('Failed to load landing pages');
            console.error('Error loading landing pages:', err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, perPage, debouncedSearch, sortColumn, sortDirection, showError]);

    useEffect(() => {
        loadLandingPages();
    }, [loadLandingPages]);

    const handlePageChange = (page: number) => setCurrentPage(page);
    const handlePerRowsChange = async (newPerPage: number, page: number) => {
        setPerPage(newPerPage);
        setCurrentPage(page);
    };
    const handleSort = (column: TableColumn<LandingPageListItem>, sortDir: 'asc' | 'desc') => {
        if (column.sortField) {
            setSortColumn(column.sortField);
            setSortDirection(sortDir);
        }
    };

    // Delete handlers
    const handleOpenDeleteModal = (lp: LandingPageListItem) => {
        setLpToDelete({ id: lp.id, name: lp.name });
        setIsDeleteModalOpen(true);
    };
    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setLpToDelete(null);
    };
    const handleConfirmDelete = async () => {
        if (!lpToDelete) return;
        try {
            await deleteLandingPage(lpToDelete.id);
            await loadLandingPages();
            setIsDeleteModalOpen(false);
            showSuccess(`"${lpToDelete.name}" deleted.`);
            setLpToDelete(null);
            onRefresh?.();
        } catch (err) {
            showError('Failed to delete landing page');
        }
    };

    // Action modal helpers
    const openActionModal = (type: typeof actionModal.type, lp: LandingPageListItem) => {
        setActionModal({ isOpen: true, type, lp });
    };
    const closeActionModal = () => {
        setActionModal({ isOpen: false, type: null, lp: null });
    };
    
    const getActionModalConfig = () => {
        const { type, lp } = actionModal;
        if (!type || !lp) return { title: '', message: '', confirmText: '', type: 'info' as const };
        
        switch (type) {
            case 'publish-staging':
                return {
                    title: 'Publish to Staging',
                    message: `Are you sure you want to publish "${lp.name}" to staging?`,
                    confirmText: 'Publish',
                    type: 'info' as const,
                };
            case 'republish-staging':
                return {
                    title: 'Republish to Staging',
                    message: `Are you sure you want to republish "${lp.name}" to staging? This will regenerate the staging HTML with the latest changes.`,
                    confirmText: 'Republish',
                    type: 'warning' as const,
                };
            case 'publish-prod':
                return {
                    title: 'Publish to Production',
                    message: `Are you sure you want to publish "${lp.name}" to production? This will make it publicly accessible.`,
                    confirmText: 'Publish',
                    type: 'info' as const,
                };
            case 'republish-prod':
                return {
                    title: 'Republish to Production',
                    message: `Are you sure you want to republish "${lp.name}" to production? This will update the live page with the latest changes.`,
                    confirmText: 'Republish',
                    type: 'warning' as const,
                };
            case 'unpublish':
                return {
                    title: 'Unpublish Landing Page',
                    message: `Are you sure you want to unpublish "${lp.name}"? This will revert it to draft status.`,
                    confirmText: 'Unpublish',
                    type: 'danger' as const,
                };
            default:
                return { title: '', message: '', confirmText: '', type: 'info' as const };
        }
    };
    
    const handleConfirmAction = async () => {
        const { type, lp } = actionModal;
        if (!type || !lp) return;
        
        closeActionModal();
        setActionInProgress(lp.id);
        
        try {
            switch (type) {
                case 'publish-staging':
                case 'republish-staging':
                    await publishLandingPage(lp.id);
                    showSuccess(`"${lp.name}" published to staging.`);
                    break;
                case 'publish-prod':
                    await createProdUrl(lp.id);
                    showSuccess(`"${lp.name}" published to production.`);
                    break;
                case 'republish-prod':
                    await purgeProdUrl(lp.id);
                    showSuccess(`"${lp.name}" republished to production.`);
                    break;
                case 'unpublish':
                    await unpublishLandingPage(lp.id);
                    showSuccess(`"${lp.name}" unpublished (reverted to draft).`);
                    break;
            }
            await loadLandingPages();
        } catch (err) {
            showError(`Failed to ${type.replace('-', ' ')}`);
        } finally {
            setActionInProgress(null);
        }
    };

    // Column definitions
    const columns: TableColumn<LandingPageListItem>[] = useMemo(() => [
        {
            name: 'S.No',
            width: '60px',
            cell: (_row, index) => (currentPage - 1) * perPage + (index || 0) + 1,
        },
        {
            name: 'Name',
            width: '200px',
            selector: (row) => row.name,
            sortable: true,
            sortField: 'name',
            cell: (row) => (
                <div className="py-2">
                    <div className="font-medium text-gray-800 dark:text-white/90 truncate max-w-[180px]" title={row.name}>{row.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]" title={row.slug}>{row.slug}</div>
                </div>
            ),
        },
        {
            name: 'Brand',
            width: '120px',
            selector: (row) => row.brand_name || '-',
            sortable: false,
        },
        {
            name: 'Campaign',
            width: '120px',
            selector: (row) => row.campaign_name || '-',
            sortable: true,
            sortField: 'campaign__name',
            cell: (row) => (
                <span className="truncate max-w-[110px]" title={row.campaign_name}>{row.campaign_name || '-'}</span>
            )
        },
        {
            name: 'Type',
            width: '100px',
            selector: (row) => LP_TYPE_LABELS[row.lp_type] || row.lp_type,
            sortable: true,
            sortField: 'lp_type',
        },
        {
            name: 'Status',
            width: '90px',
            selector: (row) => row.status,
            sortable: true,
            sortField: 'status',
            cell: (row) => (
                <Badge size="sm" color={STATUS_COLORS[row.status] || 'light'}>
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </Badge>
            ),
        },
        {
            name: <div className="w-full text-right">Actions</div>,
            width: '650px',
            cell: (row) => {
                // Check if there are unpublished changes for staging
                const isStagingDirty = row.staging_published_at 
                    ? new Date(row.updated_at) > new Date(row.staging_published_at)
                    : true;
                
                // Check if there are unpublished changes for production
                const isProdDirty = row.production_published_at 
                    ? new Date(row.updated_at) > new Date(row.production_published_at)
                    : true;
                
                return (
                    <div className="flex items-center justify-end gap-2 w-full py-2">
                        {/* Publishing Action Row */}
                        <div className="flex items-center gap-1.5">
                            {/* If on Production, show View Prod and conditional Republish */}
                            {row.production_url ? (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(row.production_url, '_blank')}
                                        disabled={actionInProgress === row.id}
                                        className="text-xs h-8 px-3 justify-center whitespace-nowrap"
                                        startIcon={<span>View</span>}
                                    >
                                        Prod ↗
                                    </Button>
                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={() => openActionModal('republish-prod', row)}
                                        disabled={actionInProgress === row.id || !isProdDirty}
                                        className="h-8 px-2"
                                        title={isProdDirty ? "Republish Prod (Changes detected)" : "Up to date on Production"}
                                    >
                                        ↻
                                    </Button>
                                </>
                            ) : (
                                /* Staging & Staging-to-Prod controls */
                                <>
                                    {/* Staging Action */}
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant={row.staging_url ? 'outline' : 'primary'}
                                            size="sm"
                                            onClick={() => row.staging_url ? window.open(row.staging_url, '_blank') : openActionModal('publish-staging', row)}
                                            disabled={actionInProgress === row.id}
                                            className="text-xs h-8 px-3 justify-center whitespace-nowrap"
                                        >
                                            {actionInProgress === row.id ? '...' : row.staging_url ? 'View Staging ↗' : 'Publish Staging'}
                                        </Button>
                                        {row.staging_url && (
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                onClick={() => openActionModal('republish-staging', row)}
                                                disabled={actionInProgress === row.id || !isStagingDirty}
                                                className="h-8 px-2"
                                                title={isStagingDirty ? "Republish Staging (Changes detected)" : "Up to date on Staging"}
                                            >
                                                ↻
                                            </Button>
                                        )}
                                    </div>
                                    {/* Production Publish: Enabled only after Staging */}
                                    {!row.production_url && (
                                        <Button
                                            variant={row.staging_url ? 'success' : 'outline'}
                                            size="sm"
                                            onClick={() => row.staging_url && openActionModal('publish-prod', row)}
                                            disabled={actionInProgress === row.id || !row.staging_url}
                                            className="text-xs h-8 px-3 justify-center whitespace-nowrap"
                                        >
                                            {actionInProgress === row.id ? '...' : 'Publish Prod'}
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

                        {/* Management Group */}
                        <div className="flex items-center gap-1.5">
                            {row.status !== 'draft' && (
                                <Button
                                    variant="warning"
                                    size="sm"
                                    onClick={() => openActionModal('unpublish', row)}
                                    disabled={actionInProgress === row.id}
                                    className="text-xs h-8 px-3"
                                    title="Unpublish (revert to draft)"
                                >
                                    Unpublish
                                </Button>
                            )}
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => onEdit(row)}
                                className="text-xs h-8 px-4 font-semibold"
                            >
                                Edit
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleOpenDeleteModal(row)}
                                className="text-xs h-8 px-3"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                );
            },
        },
    ], [currentPage, perPage, actionInProgress, onEdit]);

    return (
        <>
            <div className="mb-4">
                <SearchInput
                    type="text"
                    placeholder="Search landing pages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search landing pages"
                />
            </div>

            <TableWrapper>
                <DataTable
                    columns={columns}
                    data={landingPages}
                    progressPending={loading}
                    progressComponent={
                        <div className="py-12 text-gray-500 dark:text-gray-400">
                            Loading landing pages...
                        </div>
                    }
                    noDataComponent={
                        <div className="py-12 text-gray-500 dark:text-gray-400">
                            No landing pages found
                        </div>
                    }
                    pagination
                    paginationServer
                    paginationTotalRows={totalRows}
                    paginationPerPage={perPage}
                    paginationDefaultPage={currentPage}
                    onChangePage={handlePageChange}
                    onChangeRowsPerPage={handlePerRowsChange}
                    paginationRowsPerPageOptions={[10, 20, 50, 100]}
                    sortServer
                    onSort={handleSort}
                    customStyles={customStyles}
                    theme={isDarkMode ? 'creativeDashDark' : 'creativeDashLight'}
                    highlightOnHover
                    responsive
                />
            </TableWrapper>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Delete Landing Page"
                message={`Are you sure you want to delete "${lpToDelete?.name}"? This will remove all files and cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                onConfirm={handleConfirmDelete}
                onCancel={handleCloseDeleteModal}
            />

            {/* Action Confirmation Modal */}
            <ConfirmModal
                isOpen={actionModal.isOpen}
                title={getActionModalConfig().title}
                message={getActionModalConfig().message}
                confirmText={getActionModalConfig().confirmText}
                cancelText="Cancel"
                type={getActionModalConfig().type}
                onConfirm={handleConfirmAction}
                onCancel={closeActionModal}
            />
        </>
    );
}
