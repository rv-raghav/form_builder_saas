// src/pages/AuthPages/ResetPassword.tsx
import { FormEvent, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

import PageMeta from '../../components/common/PageMeta';
import AuthLayout from './AuthPageLayout';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Button from '../../components/ui/button/Button';
import { resetPassword } from '../../api/auth';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

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

        if (!token) {
            // In a real backend flow, this should be a hard error.
            setError(
                'Reset token is missing. Please open this page from the reset link sent to your email.'
            );
            return;
        }

        try {
            setSubmitting(true);
            await resetPassword({ token, password });
            setSuccess(true);

            // After short delay, send to signin
            setTimeout(() => {
                navigate('/signin', { replace: true });
            }, 1200);
        } catch (err: unknown) {
            console.error(err);

            // The resetPassword function already throws an Error with the backend's message
            const errorMessage =
                (err as Error)?.message ||
                'Could not reset password. The link may be invalid or expired.';

            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <PageMeta
                title="Reset Password | Creative Dashboard"
                description="Reset password page for Creative Dashboard"
            />
            <AuthLayout>
                <div className="flex flex-col flex-1">
                    <div className="w-full max-w-md pt-10 mx-auto">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/signin')}
                            startIcon={
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M15 18L9 12L15 6"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            }
                        >
                            Back to sign in
                        </Button>
                    </div>

                    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                        <div>
                            <div className="mb-5 sm:mb-8">
                                <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                                    Reset password
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Choose a new password for your account.
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
                                        Your password has been reset. Redirecting you to sign in...
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => navigate('/signin', { replace: true })}
                                    >
                                        Go to sign in
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-6">
                                        <div>
                                            <Label>
                                                New password{' '}
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
                                                Confirm password{' '}
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
                                                {submitting ? 'Resetting...' : 'Reset password'}
                                            </Button>
                                        </div>

                                        <div className="text-sm text-center text-gray-500 dark:text-gray-400">
                                            Changed your mind?{' '}
                                            <Link
                                                to="/signin"
                                                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                                            >
                                                Back to sign in
                                            </Link>
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
