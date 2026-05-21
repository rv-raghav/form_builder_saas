import React, { useState } from 'react';
import { PagePermission } from '../types';
import ComponentRow from './ComponentRow';
import { ChevronDownIcon, ChevronRightIcon } from '../../../../icons';

interface PageRowProps {
    page: PagePermission;
    onTogglePage: (slug: string) => void;
    onToggleComponent: (componentSlug: string) => void;
    onSelectAllComponents: (pageSlug: string) => void;
    onSelectNoneComponents: (pageSlug: string) => void;
    disabled?: boolean;
}

const PageRow: React.FC<PageRowProps> = ({
    page,
    onTogglePage,
    onToggleComponent,
    onSelectAllComponents,
    onSelectNoneComponents,
    disabled,
}) => {
    const [expanded, setExpanded] = useState(true);
    const hasComponents = page.components.length > 0;
    const activeComponents = page.components.filter((c) => c.has_access).length;
    const totalComponents = page.components.length;

    return (
        <div
            className={`
            rounded-md border overflow-hidden
            ${
                page.has_access
                    ? 'border-primary-200 dark:border-primary-800 bg-white dark:bg-gray-800'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }
        `}
        >
            {/* Page Header */}
            <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    {/* Expand Toggle */}
                    {hasComponents ? (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded flex-shrink-0"
                        >
                            {expanded ? (
                                <ChevronDownIcon className="w-4 h-4" />
                            ) : (
                                <ChevronRightIcon className="w-4 h-4" />
                            )}
                        </button>
                    ) : (
                        <div className="w-6 flex-shrink-0" />
                    )}

                    {/* Checkbox */}
                    <input
                        type="checkbox"
                        checked={page.has_access}
                        onChange={() => onTogglePage(page.slug)}
                        disabled={disabled}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 cursor-pointer flex-shrink-0"
                    />

                    {/* Page Info */}
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-none">
                                {page.name}
                            </span>
                            {page.category && (
                                <span className="px-1.5 py-0.5 text-[10px] sm:hidden font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full">
                                    {page.category}
                                </span>
                            )}
                            {page.has_access && (
                                <span className="px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-full">
                                    Enabled
                                </span>
                            )}
                        </div>
                        {hasComponents && (
                            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 block mt-0.5">
                                {activeComponents}/{totalComponents} components
                            </span>
                        )}
                    </div>
                </div>

                {/* Bulk Actions */}
                {hasComponents && (
                    <div className="flex items-center space-x-2 ml-8 sm:ml-0">
                        <button
                            onClick={() => onSelectAllComponents(page.slug)}
                            disabled={disabled}
                            className="flex-1 sm:flex-none px-2.5 py-1.5 sm:py-1 text-[10px] sm:text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg sm:rounded disabled:opacity-50 transition-colors text-center"
                        >
                            Enable All
                        </button>
                        <button
                            onClick={() => onSelectNoneComponents(page.slug)}
                            disabled={disabled}
                            className="flex-1 sm:flex-none px-2.5 py-1.5 sm:py-1 text-[10px] sm:text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg sm:rounded disabled:opacity-50 transition-colors text-center"
                        >
                            Disable All
                        </button>
                    </div>
                )}
            </div>

            {/* Components List */}
            {hasComponents && expanded && (
                <div className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800/50">
                    {page.components.map((component) => (
                        <ComponentRow
                            key={component.slug}
                            component={component}
                            onToggle={onToggleComponent}
                            disabled={disabled}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PageRow;
