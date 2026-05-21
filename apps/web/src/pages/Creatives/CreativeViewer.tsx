// Creative Viewer - Enhanced with modern UI/UX design
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import type { Creative } from '../../types/creative';

// Import creative data from JSON
import threeDCubeData from '../../data/creatives/3d-cube.json';

// Import modular components
import BackButton from './components/BackButton';
import VariantSelector from './components/VariantSelector';
import SizeSelector from './components/SizeSelector';
import CreativePreview from './components/CreativePreview';

// Map creative keys to their data
const creativeDataMap: Record<string, Creative> = {
    '3d-cube': threeDCubeData as Creative,
};

function CreativeViewer() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Get creative type from URL parameter
    const creativeKey = searchParams.get('creative') || '3d-cube';
    const creative = creativeDataMap[creativeKey] || creativeDataMap['3d-cube'];

    // Get variant from URL or default to first variant
    const initialVariant = searchParams.get('variant') || creative.variants[0].variantKey;
    const [selectedVariant, setSelectedVariant] = useState<string>(initialVariant);

    // Get current variant data
    const currentVariant =
        creative.variants.find((v) => v.variantKey === selectedVariant) || creative.variants[0];

    const initialSize = searchParams.get('size') || currentVariant.sizes[0].size;
    const [selectedSize, setSelectedSize] = useState<string>(initialSize);
    const [isLoading, setIsLoading] = useState(true);
    const [iframeKey, setIframeKey] = useState(0);
    const [showGuide, setShowGuide] = useState(true);

    // Reset selections when creative changes
    useEffect(() => {
        const newVariant = creative.variants[0];
        setSelectedVariant(newVariant.variantKey);
        setSelectedSize(newVariant.sizes[0].size);
        setIsLoading(true);
        setIframeKey((prev) => prev + 1);
        setShowGuide(true);
    }, [creativeKey, creative.variants]);

    // Sync URL parameters with current state
    useEffect(() => {
        const currentCreative = searchParams.get('creative');
        const currentVariant = searchParams.get('variant');
        const currentSize = searchParams.get('size');

        if (
            currentCreative !== creativeKey ||
            currentVariant !== selectedVariant ||
            currentSize !== selectedSize
        ) {
            setSearchParams(
                { creative: creativeKey, variant: selectedVariant, size: selectedSize },
                { replace: true }
            );
        }
    }, [creativeKey, selectedVariant, selectedSize, searchParams, setSearchParams]);

    const getPreviewUrl = () => {
        const sizeConfig = currentVariant.sizes.find((s) => s.size === selectedSize);
        return sizeConfig?.url || '';
    };

    const getDimensions = () => {
        const [width, height] = selectedSize.split('x').map(Number);
        return { width, height };
    };

    const { width, height } = getDimensions();

    const handleVariantChange = (variantKey: string) => {
        setSelectedVariant(variantKey);
        const newVariant = creative.variants.find((v) => v.variantKey === variantKey);
        if (newVariant) {
            const firstSize = newVariant.sizes[0].size;
            setSelectedSize(firstSize);
            setSearchParams({ creative: creativeKey, variant: variantKey, size: firstSize });
            setIsLoading(true);
        }
    };

    const handleSizeChange = (size: string) => {
        if (size === selectedSize) return;
        setSelectedSize(size);
        setSearchParams({ creative: creativeKey, variant: selectedVariant, size });
        setIsLoading(true);
    };

    return (
        <div>
            <PageMeta
                title={`${creative.label} - Creative Viewer | Creative Dashboard`}
                description={creative.description || 'View creative preview'}
            />
            <PageBreadcrumb pageTitle={creative.label} />

            <div className="space-y-6">
                {/* Main Content */}
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/50 backdrop-blur-sm px-6 py-8 xl:px-12 xl:py-10 shadow-sm">
                    {/* Header Section */}
                    <header className="mb-8 space-y-6">
                        {/* Title Section with Context */}
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                            <div className="space-y-4 flex-1">
                                <div className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                                {creative.label}
                                            </h1>
                                            <span className="px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-200 dark:border-blue-800">
                                                {creative.type}
                                            </span>
                                        </div>

                                        {creative.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {creative.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Controls Section - Right Side */}
                            <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
                                <div className="flex items-center gap-2">
                                    {!showGuide && (
                                        <button
                                            onClick={() => setShowGuide(true)}
                                            className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200"
                                            title="Show guide"
                                            aria-label="Show preview guide"
                                        >
                                            <svg
                                                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                {/* Back Button - Right Side */}
                                <BackButton to="/creatives" label="Back to Creatives" />
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800"></div>

                        {/* Variant Selector - Moved before Size Selector */}
                        <VariantSelector
                            variants={creative.variants}
                            selectedVariant={selectedVariant}
                            onVariantChange={handleVariantChange}
                        />

                        {/* Size Selector with Context */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <SizeSelector
                                    sizes={currentVariant.sizes}
                                    selectedSize={selectedSize}
                                    onSizeChange={handleSizeChange}
                                />
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Dimensions:{' '}
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                                            {width} × {height}px
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Preview Section with Instructions */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <svg
                                        className="w-4 h-4 text-blue-600 dark:text-blue-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Live Preview
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Interactive preview - try clicking on the creative
                                    </p>
                                </div>
                            </div>
                            {getPreviewUrl() && (
                                <a
                                    href={getPreviewUrl()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                >
                                    <span>Open in New Tab</span>
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                        />
                                    </svg>
                                </a>
                            )}
                        </div>

                        <CreativePreview
                            previewUrl={getPreviewUrl()}
                            width={width}
                            height={height}
                            isLoading={isLoading}
                            onLoad={() => setIsLoading(false)}
                            iframeKey={iframeKey}
                            creativeLabel={creative.label}
                            selectedSize={selectedSize}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreativeViewer;
