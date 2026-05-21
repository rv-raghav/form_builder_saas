import { Modal } from '../ui/modal';

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
    const buttonStyles = {
        danger: 'bg-red-600 hover:bg-red-500 text-white',
        warning: 'bg-orange-600 hover:bg-orange-500 text-white',
        info: 'bg-blue-600 hover:bg-blue-500 text-white',
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            showCloseButton={false}
            className="w-full max-w-md"
        >
            <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-950 dark:text-white">{title}</h2>
                </div>

                <div className="px-5 py-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
                </div>

                <div className="px-5 py-4 border-t border-slate-100 dark:border-gray-800 flex justify-end gap-2 bg-gray-50 dark:bg-gray-850/50">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${buttonStyles[type]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default ConfirmModal;
