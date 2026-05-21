// pages/Creatives/Creatives.tsx - Enhanced with better UX
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import creativeFormatsData from '../../data/creatives/formats.json';
import {
    ErrorCircleIcon,
    InboxIcon,
    ImageIcon,
    FilterIcon,
    ResizeIcon,
    EyeIcon,
} from '../../icons';

type CreativeTypeKey = 'DISPLAY' | 'CTV' | 'OLV';

interface CreativeFormat {
    id: string;
    key: string;
    label: string;
    type: CreativeTypeKey;
    description?: string;
    thumbnailUrl?: string;
    hasPreview?: boolean;
    supportedSizes?: string[];
}

const MOCK_CREATIVE_FORMATS: CreativeFormat[] = creativeFormatsData as CreativeFormat[];

function Creatives() {
    const navigate = useNavigate();
    const [creatives, setCreatives] = useState<CreativeFormat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<CreativeTypeKey | 'ALL'>('ALL');

    useEffect(() => {
        let isMounted = true;

        const loadCreatives = async () => {
            try {
                const data = MOCK_CREATIVE_FORMATS;
                if (!isMounted) return;

                setCreatives(data);
                setIsLoading(false);
            } catch {
                if (!isMounted) return;
                setError('Failed to load creatives.');
                setIsLoading(false);
            }
        };

        loadCreatives();

        return () => {
            isMounted = false;
        };
    }, []);

    const filteredCreatives =
        activeFilter === 'ALL' ? creatives : creatives.filter((c) => c.type === activeFilter);

    const typeCount = (type: CreativeTypeKey) => creatives.filter((c) => c.type === type).length;

    if (isLoading) {
        return (
            <div>
                <PageMeta
                    title="Creatives | Creative Dashboard"
                    description="Available creative formats (templates) for all brands."
                />
                <PageBreadcrumb pageTitle="Creatives" />
                <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
                                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                Loading creative formats...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <PageMeta
                    title="Creatives | Creative Dashboard"
                    description="Available creative formats (templates) for all brands."
                />
                <PageBreadcrumb pageTitle="Creatives" />
                <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                            <ErrorCircleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                Failed to Load Creatives
                            </h3>
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (creatives.length === 0) {
        return (
            <div>
                <PageMeta
                    title="Creatives | Creative Dashboard"
                    description="Available creative formats (templates) for all brands."
                />
                <PageBreadcrumb pageTitle="Creatives" />
                <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <InboxIcon className="w-10 h-10 text-gray-400" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                No Creatives Available
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                No creative formats are configured yet.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageMeta
                title="Creatives | Creative Dashboard"
                description="Available creative formats (templates) for all brands."
            />
            <PageBreadcrumb pageTitle="Creatives" />

            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                {/* Hero Section with Clear Purpose */}
                <header className="mb-8">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Creative Templates
                            </h1>
                            <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl">
                                Browse and preview creative formats. Click "Preview" to see how each
                                template looks across different sizes and variants.
                            </p>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2">
                        <FilterButton
                            active={activeFilter === 'ALL'}
                            onClick={() => setActiveFilter('ALL')}
                            count={creatives.length}
                        >
                            All Templates
                        </FilterButton>
                        <FilterButton
                            active={activeFilter === 'DISPLAY'}
                            onClick={() => setActiveFilter('DISPLAY')}
                            count={typeCount('DISPLAY')}
                        >
                            Display Ads
                        </FilterButton>
                        <FilterButton
                            active={activeFilter === 'CTV'}
                            onClick={() => setActiveFilter('CTV')}
                            count={typeCount('CTV')}
                        >
                            CTV Ads
                        </FilterButton>
                        <FilterButton
                            active={activeFilter === 'OLV'}
                            onClick={() => setActiveFilter('OLV')}
                            count={typeCount('OLV')}
                        >
                            Video Ads
                        </FilterButton>
                    </div>
                </header>

                {/* Results Count */}
                <div className="mb-6 flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700"></div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {filteredCreatives.length}{' '}
                        {filteredCreatives.length === 1 ? 'template' : 'templates'}
                        {activeFilter !== 'ALL' && ` in ${activeFilter}`}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-l from-gray-200 to-transparent dark:from-gray-700"></div>
                </div>

                {/* Creative Grid */}
                {filteredCreatives.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <FilterIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                No templates found
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Try selecting a different filter
                            </p>
                        </div>
                    </div>
                ) : (
                    <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredCreatives.map((creative) => (
                            <CreativeCard
                                key={creative.id}
                                creative={creative}
                                onView={() =>
                                    navigate(
                                        `/creatives/viewer?creative=${creative.key.toLowerCase().replace('display_', '')}`
                                    )
                                }
                            />
                        ))}
                    </section>
                )}
            </div>
        </div>
    );
}

// Filter Button Component
interface FilterButtonProps {
    active: boolean;
    onClick: () => void;
    count: number;
    children: React.ReactNode;
}

function FilterButton({ active, onClick, count, children }: FilterButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`
        px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
        ${
            active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }
      `}
        >
            {children}
            <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    active
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
            >
                {count}
            </span>
        </button>
    );
}

// Enhanced Creative Card Component
interface CreativeCardProps {
    creative: CreativeFormat;
    onView: () => void;
}

function CreativeCard({ creative, onView }: CreativeCardProps) {
    return (
        <div className="group border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1">
            {/* Thumbnail */}
            <div className="h-40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 dark:from-blue-600/20 dark:to-purple-600/20"></div>
                <div className="relative z-10 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Preview Available
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {creative.label}
                        </h2>
                        <span className="px-2.5 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-full whitespace-nowrap">
                            {creative.type}
                        </span>
                    </div>

                    {creative.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {creative.description}
                        </p>
                    )}
                </div>

                {/* Sizes Info */}
                {creative.supportedSizes && creative.supportedSizes.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <ResizeIcon className="w-4 h-4" />
                        <span>{creative.supportedSizes.length} sizes available</span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    {creative.hasPreview ? (
                        <button
                            onClick={onView}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm shadow-sm hover:shadow-md"
                        >
                            <EyeIcon className="w-4 h-4" />
                            Preview
                        </button>
                    ) : (
                        <div className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-lg text-sm font-semibold text-center">
                            Preview Unavailable
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Creatives;
