import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextValue {
    toasts: Toast[];
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
    dismissToast: (id: string) => void;
    clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DEFAULT_DURATION = 5000; // 5 seconds

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback(
        (message: string, type: ToastType = 'info', duration: number = DEFAULT_DURATION) => {
            const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const newToast: Toast = { id, message, type, duration };

            setToasts((prev) => [...prev, newToast]);

            // Auto dismiss after duration
            if (duration > 0) {
                setTimeout(() => {
                    dismissToast(id);
                }, duration);
            }
        },
        [dismissToast]
    );

    const showSuccess = useCallback(
        (message: string, duration?: number) => showToast(message, 'success', duration),
        [showToast]
    );

    const showError = useCallback(
        (message: string, duration?: number) => showToast(message, 'error', duration),
        [showToast]
    );

    const showWarning = useCallback(
        (message: string, duration?: number) => showToast(message, 'warning', duration),
        [showToast]
    );

    const showInfo = useCallback(
        (message: string, duration?: number) => showToast(message, 'info', duration),
        [showToast]
    );

    const clearAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    const value = useMemo<ToastContextValue>(
        () => ({
            toasts,
            showToast,
            showSuccess,
            showError,
            showWarning,
            showInfo,
            dismissToast,
            clearAllToasts,
        }),
        [
            toasts,
            showToast,
            showSuccess,
            showError,
            showWarning,
            showInfo,
            dismissToast,
            clearAllToasts,
        ]
    );

    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
