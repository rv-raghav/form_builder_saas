import type React from 'react';
import type { FC, ReactNode } from 'react';
import { ChevronDownIcon } from '../../../icons';

interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectFieldProps {
    id?: string;
    name?: string;
    value: string | number | null;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: SelectOption[];
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    success?: boolean;
    error?: boolean;
    hint?: string;
    required?: boolean;
    children?: ReactNode; // For custom options
}

const SelectField: FC<SelectFieldProps> = ({
    id,
    name,
    value,
    onChange,
    options,
    placeholder = 'Select an option',
    className = '',
    disabled = false,
    success = false,
    error = false,
    hint,
    required = false,
    children,
}) => {
    let selectClasses = `h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-10 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${className}`;

    if (disabled) {
        selectClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
    } else if (error) {
        selectClasses += ` border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:border-error-500 dark:focus:border-error-800`;
    } else if (success) {
        selectClasses += ` border-success-500 focus:border-success-300 focus:ring-success-500/20 dark:border-success-500 dark:focus:border-success-800`;
    } else {
        selectClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800`;
    }

    return (
        <div className="relative">
            <select
                id={id}
                name={name}
                value={value ?? ''}
                onChange={onChange}
                disabled={disabled}
                required={required}
                className={selectClasses}
            >
                {placeholder && (
                    <option value="" disabled={required}>
                        {placeholder}
                    </option>
                )}
                {children ||
                    options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
            </select>

            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </span>

            {hint && (
                <p
                    className={`mt-1.5 text-xs ${
                        error ? 'text-error-500' : success ? 'text-success-500' : 'text-gray-500'
                    }`}
                >
                    {hint}
                </p>
            )}
        </div>
    );
};

export default SelectField;
