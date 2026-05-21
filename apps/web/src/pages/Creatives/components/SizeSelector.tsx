// Enhanced Size selector with modern design
import type { CreativeSize } from '../../../types/creative';

interface SizeSelectorProps {
    sizes: CreativeSize[];
    selectedSize: string;
    onSizeChange: (size: string) => void;
}

export default function SizeSelector({ sizes, selectedSize, onSizeChange }: SizeSelectorProps) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Ad Size
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700"></div>
            </div>
            <div className="flex gap-2 flex-wrap">
                {sizes.map(({ size }) => (
                    <button
                        key={size}
                        onClick={() => onSizeChange(size)}
                        className={`
                            px-4 py-2.5 text-sm font-semibold rounded-lg 
                            transition-all duration-200 whitespace-nowrap
                            ${
                                selectedSize === size
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105'
                                    : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 hover:shadow-md'
                            }
                        `}
                    >
                        {size}
                    </button>
                ))}
            </div>
        </div>
    );
}
