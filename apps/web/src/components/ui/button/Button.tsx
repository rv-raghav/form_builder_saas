import { ReactNode } from 'react';

type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonVariant =
    | 'primary'
    | 'outline'
    | 'danger'
    | 'success'
    | 'warning'
    | 'secondary'
    | 'ghost';

interface ButtonProps {
    children: ReactNode; // Button text or content
    size?: ButtonSize; // Button size
    variant?: ButtonVariant; // Button variant
    startIcon?: ReactNode; // Icon before the text
    endIcon?: ReactNode; // Icon after the text
    onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void; // Click handler
    disabled?: boolean; // Disabled state
    className?: string; // Additional CSS classes
    type?: 'button' | 'submit' | 'reset'; // Button type
    fullWidth?: boolean; // Full width button
    title?: string; // HTML title attribute
}

const Button: React.FC<ButtonProps> = ({
    children,
    size = 'md',
    variant = 'primary',
    startIcon,
    endIcon,
    onClick,
    className = '',
    disabled = false,
    type = 'button',
    fullWidth = false,
    title,
}) => {
    // Size Classes
    const sizeClasses: Record<ButtonSize, string> = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-3 text-base',
    };

    // Variant Classes
    const variantClasses: Record<ButtonVariant, string> = {
        primary: 'bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300',
        outline:
            'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700',
        danger: 'bg-red-600 text-white hover:bg-red-500 dark:bg-red-600 dark:hover:bg-red-500',
        success:
            'bg-green-600 text-white hover:bg-green-500 dark:bg-green-600 dark:hover:bg-green-500',
        warning:
            'bg-amber-600 text-white hover:bg-amber-500 dark:bg-amber-600 dark:hover:bg-amber-500',
        secondary:
            'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
    };

    return (
        <button
            type={type}
            title={title}
            className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors ${
                sizeClasses[size]
            } ${variantClasses[variant]} ${
                disabled ? 'cursor-not-allowed opacity-50' : ''
            } ${fullWidth ? 'w-full' : ''} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {startIcon && <span className="flex items-center">{startIcon}</span>}
            {children}
            {endIcon && <span className="flex items-center">{endIcon}</span>}
        </button>
    );
};

export default Button;
