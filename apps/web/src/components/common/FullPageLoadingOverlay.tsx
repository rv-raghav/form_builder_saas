interface FullPageLoadingOverlayProps {
    isVisible: boolean;
    title: string;
    subtitle?: string;
}

export default function FullPageLoadingOverlay({
    isVisible,
    title,
    subtitle,
}: FullPageLoadingOverlayProps) {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-800">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400"></div>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-200">{title}</p>
                {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
        </div>
    );
}
