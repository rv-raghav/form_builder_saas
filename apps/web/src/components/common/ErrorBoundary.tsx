import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * Error boundary component that catches JavaScript errors anywhere in their child
 * component tree, logs those errors, and displays a fallback UI.
 */
export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console in development
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        // In production, you could send this to an error tracking service
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
                    <div className="text-red-500 mb-4">
                        <svg
                            className="w-16 h-16"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                        Something went wrong
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        We encountered an error loading this section.
                    </p>
                    <button
                        onClick={this.handleRetry}
                        className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Compact error fallback for smaller components like charts
 */
export function CompactErrorFallback({ onRetry }: { onRetry?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center h-[200px] text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <svg
                className="w-8 h-8 text-gray-400 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Failed to load</p>
            {onRetry && (
                <button onClick={onRetry} className="text-xs text-brand-500 hover:text-brand-600">
                    Retry
                </button>
            )}
        </div>
    );
}
