import React, { memo } from 'react';
import { PageOverridePermission, Override } from './types';
import ComponentPermissionRow from './ComponentPermissionRow';
import Badge from '../../../../components/ui/badge/Badge';

interface PageDetailsPanelProps {
    page: PageOverridePermission | null;
    onPageOverrideChange: (slug: string, action: Override) => void;
    onComponentOverrideChange: (slug: string, action: Override) => void;
    disabled?: boolean;
}

const PageDetailsPanel: React.FC<PageDetailsPanelProps> = memo(
    ({ page, onPageOverrideChange, onComponentOverrideChange, disabled }) => {
        if (!page) {
            return (
                <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500 p-8">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <svg
                                className="w-8 h-8 opacity-50"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <p className="text-sm font-medium">Select a page</p>
                        <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">
                            Choose a page from the list to manage permissions
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="h-full flex flex-col overflow-hidden">
                {/* Page Header */}
                <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                            {/* Final Access Badge */}
                            <div
                                className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm ${
                                    page.final
                                        ? 'bg-success-100 text-success-600 dark:bg-success-500/20 dark:text-success-400'
                                        : 'bg-gray-100 text-gray-400 dark:bg-gray-700/50 dark:text-gray-500'
                                }`}
                            >
                                {page.final ? '✓' : '✕'}
                            </div>

                            <div className="min-w-0 flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                    {page.name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    <span className="flex items-center gap-1.5">
                                        Role Default:
                                        {page.role_default ? (
                                            <Badge variant="light" color="success" size="sm">
                                                Allowed
                                            </Badge>
                                        ) : (
                                            <Badge variant="light" color="light" size="sm">
                                                Denied
                                            </Badge>
                                        )}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        Final:
                                        {page.final ? (
                                            <Badge variant="light" color="success" size="sm">
                                                Has Access
                                            </Badge>
                                        ) : (
                                            <Badge variant="light" color="error" size="sm">
                                                No Access
                                            </Badge>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Page Override Control */}
                        <div className="flex-shrink-0 ml-16 sm:ml-0">
                            <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                Override
                            </label>
                            <div className="inline-flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm">
                                <button
                                    onClick={() => onPageOverrideChange(page.slug, null)}
                                    disabled={disabled}
                                    className={`px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 ${
                                        page.override === null
                                            ? 'bg-gray-700 text-white dark:bg-gray-500'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    None
                                </button>
                                <button
                                    onClick={() => onPageOverrideChange(page.slug, 'grant')}
                                    disabled={disabled}
                                    className={`px-4 py-2 text-sm font-medium transition-all border-x border-gray-200 dark:border-gray-600 disabled:opacity-50 ${
                                        page.override === 'grant'
                                            ? 'bg-success-500 text-white'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-success-50 dark:hover:bg-success-900/20'
                                    }`}
                                >
                                    Grant
                                </button>
                                <button
                                    onClick={() => onPageOverrideChange(page.slug, 'revoke')}
                                    disabled={disabled}
                                    className={`px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 ${
                                        page.override === 'revoke'
                                            ? 'bg-error-500 text-white'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-error-50 dark:hover:bg-error-900/20'
                                    }`}
                                >
                                    Revoke
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Components Section */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-900/30">
                    {page.components.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                    />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                No components
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                This page has no controllable components
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Components
                                </h4>
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {page.components.filter((c) => c.final).length}/
                                    {page.components.length} enabled
                                </span>
                            </div>
                            <div className="space-y-3">
                                {page.components.map((component) => (
                                    <ComponentPermissionRow
                                        key={component.slug}
                                        component={component}
                                        onOverrideChange={onComponentOverrideChange}
                                        disabled={disabled}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }
);

PageDetailsPanel.displayName = 'PageDetailsPanel';

export default PageDetailsPanel;
