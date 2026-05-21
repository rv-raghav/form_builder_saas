import { useState, useEffect, useCallback } from 'react';
import { Modal } from '../../../../components/ui/modal';
import Button from '../../../../components/ui/button/Button';
import Label from '../../../../components/form/Label';
import Input from '../../../../components/form/input/InputField';
import SelectField from '../../../../components/form/input/SelectField';
import { fetchRoles, type Role } from '../../../../api/users';

interface AddUserModalProps {
    onClose: () => void;
    onSubmit: (payload: {
        username: string;
        email: string;
        password: string;
        first_name: string;
        last_name: string;
        role_id: number | null;
    }) => void;
}

function AddUserModal({ onClose, onSubmit }: AddUserModalProps) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [roleId, setRoleId] = useState<number | null>(null);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);

    const loadRoles = useCallback(async () => {
        try {
            const fetchedRoles = await fetchRoles();
            setRoles(fetchedRoles);
        } catch (error) {
            console.error('Error loading roles:', error);
        } finally {
            setLoadingRoles(false);
        }
    }, []);

    useEffect(() => {
        loadRoles();
    }, [loadRoles]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !email.trim() || !password.trim()) return;

        onSubmit({
            username: username.trim(),
            email: email.trim(),
            password: password,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            role_id: roleId,
        });
    };

    return (
        <Modal isOpen={true} onClose={onClose} showCloseButton={false} className="max-w-lg p-0">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold dark:text-white">Add New User</h2>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none"
                    aria-label="Close"
                >
                    ×
                </button>
            </div>

            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
                <div>
                    <Label htmlFor="username">
                        Username <span className="text-error-500">*</span>
                    </Label>
                    <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="johndoe"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="email">
                        Email Address <span className="text-error-500">*</span>
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john.doe@example.com"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="password">
                        Password <span className="text-error-500">*</span>
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="John"
                        />
                    </div>

                    <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Doe"
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="role">Role</Label>
                    <SelectField
                        id="role"
                        value={roleId}
                        onChange={(e) => setRoleId(e.target.value ? Number(e.target.value) : null)}
                        options={roles.map((role) => ({
                            value: role.id,
                            label: role.name,
                        }))}
                        placeholder="No role (optional)"
                        disabled={loadingRoles}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        type="submit"
                        disabled={!username.trim() || !email.trim() || !password.trim()}
                    >
                        Add User
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default AddUserModal;
