// src/pages/AuthPages/ForgotPassword.tsx
import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Base64 } from 'js-base64';

import PageMeta from '../../components/common/PageMeta';
import AuthLayout from './AuthPageLayout';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Button from '../../components/ui/button/Button';
import { requestPasswordReset } from '../../api/auth';

export default function ForgotPassword() {
    const location = useLocation();

    // 1) Try to read from location.state.email (if coming from SignIn with state)
    const stateEmail = (location.state as { email?: string } | undefined)?.email || '';

    // 2) Try to read from ?email=<base64>
    const searchParams = new URLSearchParams(location.search);
    const encodedEmail = searchParams.get('email');

    let emailFromQuery = '';
    if (encodedEmail) {
        try {
            emailFromQuery = Base64.decode(encodedEmail);
        } catch {
            // if decoding fails, ignore and fall back to empty
            emailFromQuery = '';
        }
    }

    // 3) Final initial email (priority: state > query > empty)
    const initialEmail = stateEmail || emailFromQuery || '';

    const [email, setEmail] = useState(initialEmail);
    const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            // Currently mocked via src/api/auth.tsx; later this becomes real HTTP.
            await requestPasswordReset({ email });
            setSubmittedEmail(email);
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            setError("We couldn't process your request right now. Please try again in a moment.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <PageMeta
                title="Forgot Password | Creative Dashboard"
                description="Request a password reset link."
            />
            <AuthLayout>
                <div className="flex flex-col flex-1">
                    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                        <div>
                            <div className="mb-5 sm:mb-8">
                                <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                                    Forgot password
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Enter your email and we&apos;ll send you a reset link.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-4 rounded-md border border-red-500 bg-red-50 p-2 text-sm text-red-700 dark:border-red-600 dark:bg-red-900/30 dark:text-red-300">
                                    {error}
                                </div>
                            )}

                            {submitted && submittedEmail && (
                                <div className="mb-4 rounded-md border border-emerald-500 bg-emerald-50 p-2 text-sm text-emerald-700 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
                                    If an account exists for <strong>{submittedEmail}</strong>, a
                                    reset link has been sent.
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label>
                                        Email <span className="text-error-500">*</span>
                                    </Label>
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                        autoComplete="email"
                                    />
                                </div>

                                <div>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="sm"
                                        disabled={submitting || !email}
                                    >
                                        {submitting ? 'Sending reset link...' : 'Send reset link'}
                                    </Button>
                                </div>

                                <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
                                    Remember your password?{' '}
                                    <Link
                                        to="/signin"
                                        className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                                    >
                                        Back to sign in
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </AuthLayout>
        </>
    );
}
