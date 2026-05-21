import { useEffect } from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info';
}

function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    type = 'danger',
}: ConfirmModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const buttonStyles = {
        danger: 'bg-red-600 hover:bg-red-500 text-white',
        warning: 'bg-orange-600 hover:bg-orange-500 text-white',
        info: 'bg-blue-600 hover:bg-blue-500 text-white',
    };

    return (
        <div
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40"
            onClick={onCancel}
        >
            <div
                className="w-full max-w-md rounded-2xl bg-white shadow-lg border border-slate-200 dark:bg-gray-800 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-5 py-4 border-b border-slate-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold dark:text-white">{title}</h2>
                </div>

                <div className="px-5 py-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
                </div>

                <div className="px-5 py-4 border-t border-slate-100 dark:border-gray-700 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm rounded-md border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm rounded-md transition-colors ${buttonStyles[type]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
