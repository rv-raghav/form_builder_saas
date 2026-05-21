// src/components/auth/SignInForm.tsx
import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeCloseIcon, EyeIcon } from '../../icons';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import Checkbox from '../form/input/Checkbox';
import Button from '../ui/button/Button';
import { useAuth } from '../../context/AuthContext';
import { Base64 } from 'js-base64';

export default function SignInForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { login, user } = useAuth();
    const navigate = useNavigate();

    // Prefill email with the last successfully used login email (if any)
    useEffect(() => {
        const lastLoginEmail = localStorage.getItem('lastLoginEmail');
        if (lastLoginEmail) {
            setEmail(lastLoginEmail);
        }
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            // Create a promise that resolves after 2 seconds
            const delayPromise = new Promise((resolve) => setTimeout(resolve, 2000));

            // Start both the login and the delay simultaneously
            await Promise.all([login(email, password, isChecked), delayPromise]);

            // Remember this email for the next visit (password is never stored).
            localStorage.setItem('lastLoginEmail', email);

            // Check if user needs to reset password and navigate accordingly
            // We check the user from context after login completes
        } catch (err: unknown) {
            // Even on error, wait for the minimum 2 seconds to complete
            setError((err as Error).message || 'Invalid email or password');
            setSubmitting(false);
            return;
        }

        // Navigation after successful login
        // Give a small delay for state to update, then check user
        setSubmitting(false);
    };

    // Effect to handle navigation after successful login
    // Only runs when user changes from null to a valid user (not during initial load)
    useEffect(() => {
        // Skip if no user or still in submitting state
        if (!user) return;
        
        if (user.must_reset_password) {
            navigate('/set-password', { replace: true });
        } else {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    return (
        <div className="flex flex-col flex-1 relative">
            {/* Loading Overlay */}
            {submitting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-gray-700 dark:border-t-brand-400"></div>
                        <p className="text-sm font-medium text-white">Signing in...</p>
                    </div>
                </div>
            )}

            <div className="w-full max-w-md pt-10 mx-auto" />

            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div>
                    {/* Logo for mobile view only */}
                    <div className="mb-16 flex justify-center lg:hidden">
                        <img width={200} height={60} src="/assets/logo/logo.svg" alt="Logo" />
                    </div>

                    <div className="mb-5 sm:mb-8">
                        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                            Sign In
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enter your email and password to sign in!
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-md border border-red-500 bg-red-50 p-2 text-sm text-red-700 dark:border-red-600 dark:bg-red-900/30 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            <div>
                                <Label>
                                    Username or Email <span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    placeholder="superadmin or info@gmail.com"
                                    type="text"
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setEmail(e.target.value)
                                    }
                                    autoComplete="username"
                                    required
                                    disabled={submitting}
                                />
                            </div>

                            <div>
                                <Label>
                                    Password <span className="text-error-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setPassword(e.target.value)
                                        }
                                        autoComplete="current-password"
                                        required
                                        disabled={submitting}
                                    />
                                    <span
                                        onClick={() =>
                                            !submitting && setShowPassword(!showPassword)
                                        }
                                        className={`absolute z-30 -translate-y-1/2 right-4 top-1/2 ${
                                            submitting
                                                ? 'cursor-not-allowed opacity-50'
                                                : 'cursor-pointer'
                                        }`}
                                    >
                                        {showPassword ? (
                                            <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                                        ) : (
                                            <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        checked={isChecked}
                                        onChange={setIsChecked}
                                        disabled={submitting}
                                    />
                                    <span
                                        className={`block font-normal text-gray-700 text-theme-sm dark:text-gray-400 ${
                                            submitting ? 'opacity-50' : ''
                                        }`}
                                    >
                                        Keep me logged in
                                    </span>
                                </div>
                                <Link
                                    to={`/forgot-password?email=${Base64.encode(email)}`}
                                    className={`text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 ${
                                        submitting ? 'pointer-events-none opacity-50' : ''
                                    }`}
                                    tabIndex={submitting ? -1 : 0}
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <div>
                                <Button
                                    className="w-full"
                                    size="sm"
                                    type="submit"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Signing in...' : 'Sign in'}
                                </Button>
                            </div>
                        </div>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Don&apos;t have an account?{' '}
                        <Link to="/signup" className="text-brand-500 hover:text-brand-600">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
