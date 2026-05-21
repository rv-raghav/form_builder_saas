import React, { useState } from 'react';
import { RoleAccessControl } from '../types';
import PageRow from './PageRow';
import { ChevronDownIcon, ChevronRightIcon } from '../../../../icons';

interface RoleCardProps {
    data: RoleAccessControl;
    onTogglePage: (roleId: number, pageSlug: string) => void;
    onToggleComponent: (roleId: number, componentSlug: string) => void;
    onSelectAllPage: (roleId: number, pageSlug: string) => void;
    onSelectNonePage: (roleId: number, pageSlug: string) => void;
    loading?: boolean;
}

const RoleCard: React.FC<RoleCardProps> = ({
    data,
    onTogglePage,
    onToggleComponent,
    onSelectAllPage,
    onSelectNonePage,
    loading,
}) => {
    const [expanded, setExpanded] = useState(false);
    const { role, pages } = data;

    // Calculate stats
    const totalPages = pages.length;
    const activePages = pages.filter((p) => p.has_access).length;
    const totalComponents = pages.reduce((acc, p) => acc + p.components.length, 0);
    const activeComponents = pages.reduce(
        (acc, p) => acc + p.components.filter((c) => c.has_access).length,
        0
    );

    return (
        <div
            className={`
            rounded-lg overflow-hidden border transition-shadow duration-200
            ${
                expanded
                    ? 'border-primary-300 dark:border-primary-700 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 hover:shadow-sm'
            }
            bg-white dark:bg-gray-800
        `}
        >
            {/* Role Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className={`
                    w-full flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 text-left
                    transition-colors duration-150 gap-4
                    ${
                        expanded
                            ? 'bg-gray-50 dark:bg-gray-800'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
                    }
                `}
            >
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                    {/* Expand Icon */}
                    <div className="text-gray-400 dark:text-gray-500 flex-shrink-0">
                        {expanded ? (
                            <ChevronDownIcon className="w-5 h-5" />
                        ) : (
                            <ChevronRightIcon className="w-5 h-5" />
                        )}
                    </div>

                    {/* Role Info */}
                    <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                            {role.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {activePages}/{totalPages} pages · {activeComponents}/{totalComponents}{' '}
                            components enabled
                        </p>
                    </div>
                </div>

                {/* Status Indicators */}
                <div className="flex items-center space-x-3 sm:space-x-6 ml-8 sm:ml-0">
                    {/* Pages Badge */}
                    <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden xs:inline">
                            Pages
                        </span>
                        <span
                            className={`
                            px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full
                            ${
                                activePages > 0
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }
                        `}
                        >
                            {activePages}/{totalPages}
                        </span>
                    </div>

                    {/* Components Badge */}
                    <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden xs:inline">
                            Comps
                        </span>
                        <span
                            className={`
                            px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full
                            ${
                                activeComponents > 0
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }
                        `}
                        >
                            {activeComponents}/{totalComponents}
                        </span>
                    </div>
                </div>
            </button>

            {/* Expanded Content */}
            {expanded && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                    {/* Pages List */}
                    <div className="p-3 sm:p-5 bg-gray-50/50 dark:bg-gray-900/40">
                        {pages.length > 0 ? (
                            Object.entries(
                                pages.reduce(
                                    (acc, page) => {
                                        const category = page.category || 'Other';
                                        if (!acc[category]) acc[category] = [];
                                        acc[category].push(page);
                                        return acc;
                                    },
                                    {} as Record<string, typeof pages>
                                )
                            ).map(([category, categoryPages]) => (
                                <div key={category} className="mb-4 sm:mb-6 last:mb-0">
                                    <h4 className="text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 sm:mb-3 px-1">
                                        {category}
                                    </h4>
                                    <div className="space-y-2 sm:space-y-3">
                                        {categoryPages.map((page) => (
                                            <PageRow
                                                key={page.slug}
                                                page={page}
                                                onTogglePage={(slug) => onTogglePage(role.id, slug)}
                                                onToggleComponent={(slug) =>
                                                    onToggleComponent(role.id, slug)
                                                }
                                                onSelectAllComponents={(slug) =>
                                                    onSelectAllPage(role.id, slug)
                                                }
                                                onSelectNoneComponents={(slug) =>
                                                    onSelectNonePage(role.id, slug)
                                                }
                                                disabled={loading}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm">
                                No pages configured for this role.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleCard;
