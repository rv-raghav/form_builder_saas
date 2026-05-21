import React from 'react';
import { ComponentPermission } from '../types';

interface ComponentRowProps {
    component: ComponentPermission;
    onToggle: (slug: string) => void;
    disabled?: boolean;
}

const ComponentRow: React.FC<ComponentRowProps> = ({ component, onToggle, disabled }) => {
    return (
        <div
            className={`
                flex items-center justify-between py-2 px-3 sm:py-2.5 sm:px-4 pl-8 sm:pl-12
                hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer
            `}
            onClick={() => !disabled && onToggle(component.slug)}
        >
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <input
                    type="checkbox"
                    checked={component.has_access}
                    onChange={() => onToggle(component.slug)}
                    disabled={disabled}
                    onClick={(e) => e.stopPropagation()}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 cursor-pointer flex-shrink-0"
                />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate font-medium">
                            {component.name}
                        </span>
                        {component.has_access && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-full">
                                Active
                            </span>
                        )}
                    </div>
                    {component.description && (
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {component.description}
                        </p>
                    )}
                </div>
            </div>

            <code className="hidden xs:block text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono flex-shrink-0 ml-2">
                {component.slug}
            </code>
        </div>
    );
};

export default ComponentRow;
