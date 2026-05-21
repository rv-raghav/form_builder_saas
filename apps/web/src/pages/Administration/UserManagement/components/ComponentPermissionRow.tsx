import React, { memo } from 'react';
import { ComponentOverridePermission, Override } from './types';
import Badge from '../../../../components/ui/badge/Badge';

interface ComponentPermissionRowProps {
    component: ComponentOverridePermission;
    onOverrideChange: (slug: string, action: Override) => void;
    disabled?: boolean;
}

const ComponentPermissionRow: React.FC<ComponentPermissionRowProps> = memo(
    ({ component, onOverrideChange, disabled }) => {
        return (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 transition-all hover:border-gray-200 dark:hover:border-gray-600">
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    {/* Final Access Indicator */}
                    <div
                        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                            component.final
                                ? 'bg-success-100 text-success-600 dark:bg-success-500/20 dark:text-success-400'
                                : 'bg-gray-100 text-gray-400 dark:bg-gray-700/50 dark:text-gray-500'
                        }`}
                    >
                        {component.final ? '✓' : '✕'}
                    </div>

                    {/* Component Info */}
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {component.name}
                            </span>
                            {component.role_default && (
                                <Badge variant="light" color="info" size="sm">
                                    Role Default
                                </Badge>
                            )}
                        </div>
                        {component.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                                {component.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Override Control - Segmented Buttons */}
                <div className="flex-shrink-0 ml-11 sm:ml-0">
                    <div className="inline-flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm">
                        <button
                            onClick={() => onOverrideChange(component.slug, null)}
                            disabled={disabled}
                            className={`px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 ${
                                component.override === null
                                    ? 'bg-gray-700 text-white dark:bg-gray-500'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            None
                        </button>
                        <button
                            onClick={() => onOverrideChange(component.slug, 'grant')}
                            disabled={disabled}
                            className={`px-3 py-1.5 text-xs font-medium transition-all border-x border-gray-200 dark:border-gray-600 disabled:opacity-50 ${
                                component.override === 'grant'
                                    ? 'bg-success-500 text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-success-50 dark:hover:bg-success-900/20'
                            }`}
                        >
                            Grant
                        </button>
                        <button
                            onClick={() => onOverrideChange(component.slug, 'revoke')}
                            disabled={disabled}
                            className={`px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 ${
                                component.override === 'revoke'
                                    ? 'bg-error-500 text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-error-50 dark:hover:bg-error-900/20'
                            }`}
                        >
                            Revoke
                        </button>
                    </div>
                </div>
            </div>
        );
    }
);

ComponentPermissionRow.displayName = 'ComponentPermissionRow';

export default ComponentPermissionRow;
