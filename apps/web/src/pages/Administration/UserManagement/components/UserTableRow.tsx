import { TableCell, TableRow } from '../../../../components/ui/table';
import Button from '../../../../components/ui/button/Button';
import Badge from '../../../../components/ui/badge/Badge';
import type { User } from '../../../../api/users';

interface UserTableRowProps {
    user: User;
    index: number;
    currentPage: number;
    pageSize: number;
    isViewOnly: boolean;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
    onToggleStatus: (user: User) => void;
    onPermissions?: (user: User) => void;
}

export default function UserTableRow({
    user,
    index,
    currentPage,
    pageSize,
    isViewOnly,
    onEdit,
    onDelete,
    onToggleStatus,
    onPermissions,
}: UserTableRowProps) {
    return (
        <TableRow>
            <TableCell className="px-5 py-4 text-gray-600 text-start text-theme-sm dark:text-gray-300">
                {(currentPage - 1) * pageSize + index + 1}
            </TableCell>
            <TableCell className="px-5 py-4 text-start">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {user.username}
                    </span>
                    {user.is_superadmin && (
                        <Badge size="sm" color="purple">
                            SuperAdmin
                        </Badge>
                    )}
                    {user.has_overrides && !user.is_superadmin && (
                        <Badge size="sm" color="info">
                            Override
                        </Badge>
                    )}
                </div>
            </TableCell>
            <TableCell className="px-5 py-4 text-gray-600 text-start text-theme-sm dark:text-gray-300">
                {user.email || '-'}
            </TableCell>
            <TableCell className="px-5 py-4 text-gray-600 text-start text-theme-sm dark:text-gray-300">
                {user.first_name || user.last_name
                    ? `${user.first_name} ${user.last_name}`.trim()
                    : '-'}
            </TableCell>
            <TableCell className="px-5 py-4 text-gray-600 text-start text-theme-sm dark:text-gray-300">
                {user.role || '-'}
            </TableCell>
            <TableCell className="px-5 py-4 text-start">
                <Badge size="sm" color={user.is_active ? 'success' : 'light'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
            </TableCell>
            {!isViewOnly && (
                <TableCell className="px-5 py-4 text-end">
                    <div className="flex items-center justify-end gap-2">
                        {!user.is_superadmin && onPermissions && (
                            <Button variant="outline" size="sm" onClick={() => onPermissions(user)}>
                                Permissions
                            </Button>
                        )}
                        <Button
                            variant={user.is_active ? 'warning' : 'success'}
                            size="sm"
                            onClick={() => onToggleStatus(user)}
                            disabled={user.is_superadmin}
                        >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onEdit(user)}
                            disabled={user.is_superadmin}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDelete(user)}
                            disabled={user.is_superadmin}
                        >
                            Delete
                        </Button>
                    </div>
                </TableCell>
            )}
        </TableRow>
    );
}
