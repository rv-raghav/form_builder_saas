import React, { memo } from 'react';
import { PageOverridePermission } from './types';

interface PageListItemProps {
    page: PageOverridePermission;
    isSelected: boolean;
    onClick: () => void;
}

const PageListItem: React.FC<PageListItemProps> = memo(({ page, isSelected, onClick }) => {
    const hasOverride = page.override !== null || page.components.some((c) => c.override !== null);

    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                isSelected
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
            }`}
        >
            <div className="flex items-center gap-2.5">
                {/* Final Access Indicator */}
                <div
                    className={`flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        isSelected
                            ? page.final
                                ? 'bg-white/20 text-white'
                                : 'bg-white/10 text-white/60'
                            : page.final
                              ? 'bg-success-100 text-success-600 dark:bg-success-500/20 dark:text-success-400'
                              : 'bg-gray-100 text-gray-400 dark:bg-gray-700/50 dark:text-gray-500'
                    }`}
                >
                    {page.final ? '✓' : '✕'}
                </div>

                {/* Page Name */}
                <span className="text-sm font-medium truncate flex-1">{page.name}</span>

                {/* Override Indicator */}
                {hasOverride && (
                    <span
                        className={`flex-shrink-0 w-2 h-2 rounded-full ${
                            isSelected ? 'bg-amber-300' : 'bg-amber-500'
                        }`}
                        title="Has override"
                    />
                )}
            </div>
        </button>
    );
});

PageListItem.displayName = 'PageListItem';

export default PageListItem;
