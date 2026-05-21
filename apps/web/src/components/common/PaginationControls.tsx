interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPrevious: boolean;
    hasNext: boolean;
    loading: boolean;
    itemLabel?: string;
    onPageChange: (page: number) => void;
}

export default function PaginationControls({
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    hasPrevious,
    hasNext,
    loading,
    itemLabel = 'items',
    onPageChange,
}: PaginationControlsProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="mt-4 flex items-center justify-between px-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, totalCount)} of {totalCount} {itemLabel}
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!hasPrevious || loading}
                    className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>
                <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                            (page) =>
                                page === 1 ||
                                page === totalPages ||
                                Math.abs(page - currentPage) <= 1
                        )
                        .map((page, index, array) => (
                            <span key={page} className="flex items-center">
                                {index > 0 && page - array[index - 1] > 1 && (
                                    <span className="px-2 text-gray-400">...</span>
                                )}
                                <button
                                    onClick={() => onPageChange(page)}
                                    disabled={loading}
                                    className={`min-w-[32px] h-8 text-sm font-medium rounded-md transition-colors ${
                                        currentPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {page}
                                </button>
                            </span>
                        ))}
                </div>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!hasNext || loading}
                    className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
