// src/pages/AuthPages/SetPassword.tsx
import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import PageMeta from '../../components/common/PageMeta';
import AuthLayout from './AuthPageLayout';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Button from '../../components/ui/button/Button';
import { forcePasswordChange } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

export default function SetPassword() {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();
    const { user, isAuthenticated, updateUser } = useAuth();

    // Redirect unauthenticated users to signin
    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }

    // Redirect users who don't need password reset to home
    if (!user?.must_reset_password) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!password || !confirm) {
            setError('Please fill both password fields.');
            return;
        }

        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        try {
            setSubmitting(true);
            await forcePasswordChange({
                new_password: password,
                new_password_confirm: confirm,
            });

            // Update user context to clear must_reset_password
            updateUser({ must_reset_password: false });

            setSuccess(true);

            // After short delay, redirect to dashboard
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 1500);
        } catch (err: unknown) {
            console.error(err);
            const errorMessage = (err as Error)?.message || 'Could not change password.';
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <PageMeta
                title="Set Your Password | LoomForm"
                description="Set your password for LoomForm"
            />
            <AuthLayout>
                <div className="flex flex-col flex-1">
                    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                        <div>
                            <div className="mb-5 sm:mb-8">
                                <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                                    Set Your Password
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Welcome! Please create a new password for your account.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-4 rounded-md border border-red-500 bg-red-50 p-2 text-sm text-red-700 dark:border-red-600 dark:bg-red-900/30 dark:text-red-300">
                                    {error}
                                </div>
                            )}

                            {success ? (
                                <div className="space-y-4">
                                    <div className="rounded-md border border-green-500 bg-green-50 p-4 text-sm text-green-700 dark:border-green-600 dark:bg-green-900/30 dark:text-green-300">
                                        ✓ Password set successfully! Redirecting to dashboard...
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-6">
                                        <div>
                                            <Label>
                                                New Password{' '}
                                                <span className="text-error-500">*</span>
                                            </Label>
                                            <Input
                                                type="password"
                                                placeholder="Enter new password"
                                                value={password}
                                                onChange={(
                                                    e: React.ChangeEvent<HTMLInputElement>
                                                ) => setPassword(e.target.value)}
                                                autoComplete="new-password"
                                                required
                                            />
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                Minimum 8 characters with uppercase, lowercase, and
                                                number
                                            </p>
                                        </div>

                                        <div>
                                            <Label>
                                                Confirm Password{' '}
                                                <span className="text-error-500">*</span>
                                            </Label>
                                            <Input
                                                type="password"
                                                placeholder="Re-enter new password"
                                                value={confirm}
                                                onChange={(
                                                    e: React.ChangeEvent<HTMLInputElement>
                                                ) => setConfirm(e.target.value)}
                                                autoComplete="new-password"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Button
                                                className="w-full"
                                                size="sm"
                                                type="submit"
                                                disabled={submitting}
                                            >
                                                {submitting
                                                    ? 'Setting password...'
                                                    : 'Set Password'}
                                            </Button>
                                        </div>

                                        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-600 dark:bg-amber-900/20 dark:text-amber-300">
                                            ⚠️ You must set a new password before accessing the
                                            dashboard.
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </AuthLayout>
        </>
    );
}
