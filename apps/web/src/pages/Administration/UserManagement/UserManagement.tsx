import { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import Button from '../../../components/ui/button/Button';
import Badge from '../../../components/ui/badge/Badge';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import PageMeta from '../../../components/common/PageMeta';
import FullPageLoadingOverlay from '../../../components/common/FullPageLoadingOverlay';
import {
    customStyles,
    SearchInput,
    TableWrapper,
} from '../../../components/ui/datatable/dataTableStyles';
import {
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    activateUser,
    deactivateUser,
    getErrorMessage,
    type User,
} from '../../../api/users';
import AddUserModal from './components/AddUserModal';
import EditUserModal from './components/EditUserModal';
import UserPermissionsModal from './components/UserPermissionsModal';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useTheme } from '../../../context/ThemeContext';

function UserManagement() {
    const { user: currentUser } = useAuth();
    const { showSuccess, showError } = useToast();
    const { theme } = useTheme();
    // Admin users (not superadmin) have view-only access
    const isViewOnly = !currentUser?.is_superadmin;
    const isDarkMode = theme === 'dark';

    // Data state
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRows, setTotalRows] = useState(0);

    // Pagination & sorting state
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [sortColumn, setSortColumn] = useState('id');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<{ id: string; username: string } | null>(null);
    const [isToggleStatusModalOpen, setIsToggleStatusModalOpen] = useState(false);
    const [userToToggle, setUserToToggle] = useState<{
        id: string;
        username: string;
        is_active: boolean;
    } | null>(null);
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [permissionsUser, setPermissionsUser] = useState<User | null>(null);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset to first page on search
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch users with DataTables parameters
    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const ordering = sortDirection === 'desc' ? `-${sortColumn}` : sortColumn;
            const response = await fetchUsers({
                page: currentPage,
                pageSize: perPage,
                search: debouncedSearch,
                ordering,
            });
            setUsers(response.results);
            setTotalRows(response.count);
        } catch (err) {
            showError(getErrorMessage(err));
            console.error('Error loading users:', err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, perPage, debouncedSearch, sortColumn, sortDirection, showError]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Handle rows per page change
    const handlePerRowsChange = async (newPerPage: number, page: number) => {
        setPerPage(newPerPage);
        setCurrentPage(page);
    };

    // Handle sort
    const handleSort = (column: TableColumn<User>, sortDir: 'asc' | 'desc') => {
        if (column.sortField) {
            setSortColumn(column.sortField);
            setSortDirection(sortDir);
        }
    };

    // Modal handlers
    const handleOpenAddModal = () => setIsAddModalOpen(true);
    const handleCloseAddModal = () => setIsAddModalOpen(false);

    const handleOpenEditModal = (user: User) => {
        if (user.is_superadmin) {
            showError('Cannot edit another Super Admin.');
            return;
        }
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedUser(null);
    };

    const handleCreateUser = async (payload: {
        username: string;
        email: string;
        password: string;
        first_name: string;
        last_name: string;
        role_id: number | null;
    }) => {
        setIsAddModalOpen(false);
        setIsCreatingUser(true);
        try {
            await createUser({
                username: payload.username,
                email: payload.email,
                password: payload.password,
                password_confirm: payload.password,
                first_name: payload.first_name,
                last_name: payload.last_name,
                role_id: payload.role_id,
            });

            await loadUsers();
            showSuccess(`User "${payload.username}" created successfully.`);
        } catch (err) {
            showError(getErrorMessage(err));
        } finally {
            setIsCreatingUser(false);
        }
    };

    const handleUpdateUser = async (
        userId: string,
        payload: {
            username: string;
            email: string;
            first_name: string;
            last_name: string;
            role_id: number | null;
        }
    ) => {
        try {
            await updateUser(userId, payload);

            await loadUsers();
            setIsEditModalOpen(false);
            setSelectedUser(null);
            showSuccess('User updated successfully.');
        } catch (err) {
            showError(getErrorMessage(err));
        }
    };

    const handleOpenDeleteModal = (user: User) => {
        if (user.is_superadmin) {
            showError('Cannot delete another Super Admin.');
            return;
        }
        setUserToDelete({ id: user.id, username: user.username });
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        try {
            await deleteUser(userToDelete.id);
            await loadUsers();
            setIsDeleteModalOpen(false);
            showSuccess(`User "${userToDelete.username}" deleted successfully.`);
            setUserToDelete(null);
        } catch (err) {
            showError(getErrorMessage(err));
        }
    };

    const handleOpenToggleStatusModal = (user: User) => {
        if (user.is_superadmin) {
            showError('Cannot change status of another Super Admin.');
            return;
        }
        setUserToToggle({ id: user.id, username: user.username, is_active: user.is_active });
        setIsToggleStatusModalOpen(true);
    };

    const handleCloseToggleStatusModal = () => {
        setIsToggleStatusModalOpen(false);
        setUserToToggle(null);
    };

    const handleConfirmToggleStatus = async () => {
        if (!userToToggle) return;

        try {
            if (userToToggle.is_active) {
                await deactivateUser(userToToggle.id);
                showSuccess(`User "${userToToggle.username}" has been deactivated.`);
            } else {
                await activateUser(userToToggle.id);
                showSuccess(`User "${userToToggle.username}" has been activated.`);
            }
            await loadUsers();
            setIsToggleStatusModalOpen(false);
            setUserToToggle(null);
        } catch (err) {
            showError(getErrorMessage(err));
        }
    };

    const handleOpenPermissionsModal = (user: User) => {
        if (user.is_superadmin) {
            showError('SuperAdmin has all permissions, overrides not applicable.');
            return;
        }
        setPermissionsUser(user);
    };

    const handleClosePermissionsModal = () => {
        setPermissionsUser(null);
        loadUsers();
    };

    // Define columns for DataTable
    const columns: TableColumn<User>[] = useMemo(() => {
        const baseColumns: TableColumn<User>[] = [
            {
                name: 'S.No',
                width: '70px',
                cell: (_row, index) => (currentPage - 1) * perPage + (index || 0) + 1,
            },
            {
                name: 'Username',
                selector: (row) => row.username,
                sortable: true,
                sortField: 'username',
                cell: (row) => (
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 dark:text-white/90">
                            {row.username}
                        </span>
                        {row.is_superadmin && (
                            <Badge size="sm" color="purple">
                                SuperAdmin
                            </Badge>
                        )}
                        {row.has_overrides && !row.is_superadmin && (
                            <Badge size="sm" color="info">
                                Override
                            </Badge>
                        )}
                    </div>
                ),
            },
            {
                name: 'Email Address',
                selector: (row) => row.email || '-',
                sortable: true,
                sortField: 'email',
            },
            {
                name: 'Name',
                selector: (row) =>
                    row.first_name || row.last_name
                        ? `${row.first_name} ${row.last_name}`.trim()
                        : '-',
                sortable: true,
                sortField: 'first_name',
            },
            {
                name: 'Role',
                selector: (row) => row.role || '-',
            },
            {
                name: 'Status',
                selector: (row) => row.is_active,
                sortable: true,
                sortField: 'is_active',
                cell: (row) => (
                    <Badge size="sm" color={row.is_active ? 'success' : 'light'}>
                        {row.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                ),
            },
        ];

        // Add actions column for non-view-only users
        if (!isViewOnly) {
            baseColumns.push({
                name: 'Actions',
                width: '420px',
                cell: (row) => (
                    <div className="flex items-center justify-end gap-2 w-full">
                        {!row.is_superadmin && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenPermissionsModal(row)}
                                className="min-w-[85px]"
                            >
                                Permissions
                            </Button>
                        )}
                        <Button
                            variant={row.is_active ? 'warning' : 'success'}
                            size="sm"
                            onClick={() => handleOpenToggleStatusModal(row)}
                            disabled={row.is_superadmin}
                            className="min-w-[85px]"
                        >
                            {row.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenEditModal(row)}
                            disabled={row.is_superadmin}
                            className="min-w-[50px]"
                        >
                            Edit
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleOpenDeleteModal(row)}
                            disabled={row.is_superadmin}
                            className="min-w-[55px]"
                        >
                            Delete
                        </Button>
                    </div>
                ),
            });
        }

        return baseColumns;
    }, [isViewOnly, currentPage, perPage]);

    return (
        <>
            <FullPageLoadingOverlay
                isVisible={isCreatingUser}
                title="Creating user..."
                subtitle="Please wait while we set up the new account"
            />

            <div>
                <PageMeta
                    title="User Management | LoomForm"
                    description="Manage users and their roles"
                />
                <PageBreadcrumb pageTitle="User Management" />

                <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                    <header className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                                User Management
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {isViewOnly
                                    ? 'View user accounts (read-only)'
                                    : 'View and manage user accounts and roles'}
                            </p>
                        </div>
                        {!isViewOnly && (
                            <Button
                                type="button"
                                onClick={handleOpenAddModal}
                                variant="primary"
                                size="md"
                            >
                                Add User
                            </Button>
                        )}
                    </header>

                    {/* Search Input */}
                    <div className="mb-4">
                        <SearchInput
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search users"
                        />
                    </div>

                    {/* DataTable */}
                    <TableWrapper>
                        <DataTable
                            columns={columns}
                            data={users}
                            progressPending={loading}
                            progressComponent={
                                <div className="py-12 text-gray-500 dark:text-gray-400">
                                    Loading users...
                                </div>
                            }
                            noDataComponent={
                                <div className="py-12 text-gray-500 dark:text-gray-400">
                                    No users found
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

                    {isAddModalOpen && (
                        <AddUserModal onClose={handleCloseAddModal} onSubmit={handleCreateUser} />
                    )}

                    {isEditModalOpen && selectedUser && (
                        <EditUserModal
                            user={selectedUser}
                            onClose={handleCloseEditModal}
                            onSubmit={handleUpdateUser}
                        />
                    )}

                    <ConfirmModal
                        isOpen={isDeleteModalOpen}
                        title="Delete User"
                        message={`Are you sure you want to delete user "${userToDelete?.username}"? This action cannot be undone.`}
                        confirmText="Delete"
                        cancelText="Cancel"
                        type="danger"
                        onConfirm={handleConfirmDelete}
                        onCancel={handleCloseDeleteModal}
                    />

                    <ConfirmModal
                        isOpen={isToggleStatusModalOpen}
                        title={userToToggle?.is_active ? 'Deactivate User' : 'Activate User'}
                        message={
                            userToToggle?.is_active
                                ? `Are you sure you want to deactivate user "${userToToggle?.username}"? They will not be able to log in.`
                                : `Are you sure you want to activate user "${userToToggle?.username}"? They will be able to log in.`
                        }
                        confirmText={userToToggle?.is_active ? 'Deactivate' : 'Activate'}
                        cancelText="Cancel"
                        type={userToToggle?.is_active ? 'warning' : 'info'}
                        onConfirm={handleConfirmToggleStatus}
                        onCancel={handleCloseToggleStatusModal}
                    />

                    {permissionsUser && (
                        <UserPermissionsModal
                            user={permissionsUser}
                            onClose={handleClosePermissionsModal}
                        />
                    )}
                </div>
            </div>
        </>
    );
}

export default UserManagement;
