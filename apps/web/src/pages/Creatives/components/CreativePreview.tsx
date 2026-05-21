// Creative preview with clean white background

interface CreativePreviewProps {
    previewUrl: string;
    width: number;
    height: number;
    isLoading: boolean;
    onLoad: () => void;
    iframeKey: number;
    creativeLabel: string;
    selectedSize: string;
}

export default function CreativePreview({
    previewUrl,
    width,
    height,
    isLoading,
    onLoad,
    iframeKey,
    creativeLabel,
    selectedSize,
}: CreativePreviewProps) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-8 min-h-[600px] flex items-center justify-center">
            <div
                className="relative"
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    maxWidth: '100%',
                }}
            >
                {/* Loading State */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-10">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="w-14 h-14 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
                                <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                                    Loading Preview
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                    {selectedSize}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Iframe */}
                {previewUrl ? (
                    <iframe
                        key={iframeKey}
                        src={previewUrl}
                        className="w-full h-full border-0"
                        title={`${creativeLabel} - ${selectedSize}`}
                        allow="autoplay; fullscreen"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        onLoad={onLoad}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        <div className="text-center p-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                <svg
                                    className="w-10 h-10 text-gray-400"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                No Preview Available
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                This size doesn't have a preview URL configured
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
