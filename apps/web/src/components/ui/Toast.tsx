import { memo } from 'react';
import { useToast, ToastType } from '../../context/ToastContext';

interface ToastItemProps {
    id: string;
    message: string;
    type: ToastType;
    onDismiss: (id: string) => void;
}

const toastStyles: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
    success: {
        bg: 'bg-green-50 dark:bg-green-900/10',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-600 dark:text-green-400',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    error: {
        bg: 'bg-red-50 dark:bg-red-900/10',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-600 dark:text-red-400',
        icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    warning: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/10',
        border: 'border-yellow-200 dark:border-yellow-800',
        text: 'text-yellow-600 dark:text-yellow-400',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    },
    info: {
        bg: 'bg-blue-50 dark:bg-blue-900/10',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-600 dark:text-blue-400',
        icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
};

const ToastItem = memo(function ToastItem({ id, message, type, onDismiss }: ToastItemProps) {
    const styles = toastStyles[type];

    return (
        <div
            className={`flex items-center justify-between p-4 rounded-lg border ${styles.bg} ${styles.border} shadow-lg animate-slide-in`}
            role="alert"
        >
            <div className="flex items-center gap-3">
                <svg
                    className={`w-5 h-5 ${styles.text}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={styles.icon}
                    />
                </svg>
                <p className={`text-sm ${styles.text}`}>{message}</p>
            </div>
            <button
                onClick={() => onDismiss(id)}
                className={`${styles.text} hover:opacity-70 transition-opacity ml-4`}
                aria-label="Dismiss"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </div>
    );
});

/**
 * Toast container component that renders all active toasts.
 * Should be placed near the root of your app.
 */
export function ToastContainer() {
    const { toasts, dismissToast } = useToast();

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-2 max-w-sm w-full pointer-events-auto">
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    id={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onDismiss={dismissToast}
                />
            ))}
        </div>
    );
}

export default ToastContainer;
