import { useEffect, useMemo, useRef, useState } from 'react';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import PageMeta from '../../../components/common/PageMeta';
import Button from '../../../components/ui/button/Button';
import AdMockupHelpModal from './components/AdMockupHelpModal';
import { QuestionCircleIcon } from '../../../icons';
import {
    clearImages,
    clearVideos,
    downloadVideo,
    fetchProcessedVideoBlob,
    getFrameUrl,
    getOverlayUrl,
    listFrames,
    listOverlays,
    processVideo,
    setPlatform,
    uploadBaseVideo,
    uploadImages,
    uploadVideos,
} from '../../../api/mockupAdStudio';

const PLATFORM_OPTIONS = [
    { label: 'Zee5', value: 'zee5' },
    { label: 'Jio/Hotstar', value: 'jio_hotstar' },
    { label: 'MX Player', value: 'mx_player' },
    { label: 'AajTak', value: 'aajtak' },
];

const MAX_VIDEO_SIZE_BYTES = 10 * 1024 * 1024;

type VideoOverlayMap = Record<number, string>;
type VideoOverlayImages = Record<number, string>;

export default function AdMockupStudio() {
    // Start empty so the user explicitly picks a platform
    const [selectedPlatform, setSelectedPlatform] = useState<string>('');
    const [videoFiles, setVideoFiles] = useState<File[]>([]);
    const [selectedVideoIndices, setSelectedVideoIndices] = useState<number[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [baseVideoFile, setBaseVideoFile] = useState<File | null>(null);
    const [baseVideoEnabled, setBaseVideoEnabled] = useState<boolean>(false);
    const [baseDuration, setBaseDuration] = useState<number>(5);
    const [videoOverlays, setVideoOverlays] = useState<VideoOverlayMap>({});
    const [overlayImages, setOverlayImages] = useState<string[]>([]);
    const [overlayPreview, setOverlayPreview] = useState<VideoOverlayImages>({});
    const [fixedFrames, setFixedFrames] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [showDownload, setShowDownload] = useState(false);
    const progressTimer = useRef<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showHelpModal, setShowHelpModal] = useState(false);

    const platformLabel = useMemo(
        () =>
            selectedPlatform
                ? PLATFORM_OPTIONS.find((p) => p.value === selectedPlatform)?.label ?? selectedPlatform
                : 'Select platform',
        [selectedPlatform]
    );

    useEffect(() => {
        (async () => {
            // On load, keep platform empty so user explicitly selects one
            // Clear any stale uploads on load (videos/images)
            await Promise.allSettled([clearVideos(), clearImages()]);
            await loadOverlays();
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        loadFrames(selectedPlatform);
        loadOverlays();
        // reset overlay selection when platform changes
        setVideoOverlays({});
        setOverlayPreview({});
    }, [selectedPlatform]);

    useEffect(() => {
        return () => {
            if (progressTimer.current) {
                window.clearInterval(progressTimer.current);
            }
        };
    }, []);

    const loadFrames = async (platform: string) => {
        if (!platform) {
            setFixedFrames([]);
            return;
        }
        try {
            const data = await listFrames(platform);
            setFixedFrames(data.frames || []);
        } catch (err) {
            console.error('Failed to load frames', err);
            setFixedFrames([]);
        }
    };

    const loadOverlays = async () => {
        try {
            const data = await listOverlays();
            setOverlayImages(data.overlays || []);
        } catch (err) {
            console.error('Failed to load overlays', err);
            setOverlayImages([]);
        }
    };

    const handlePlatformChange = async (value: string) => {
        setSelectedPlatform(value);
        if (value) {
            await setPlatform(value);
        }
    };

    const onVideosSelected = (files: FileList | null) => {
        if (!files) return;
        const arr = Array.from(files);
        const tooLarge = arr.find((f) => f.size > MAX_VIDEO_SIZE_BYTES);
        if (tooLarge) {
            setError(`File ${tooLarge.name} exceeds 10MB limit`);
            return;
        }
        setError(null);
        setVideoFiles((prev) => {
            const startIndex = prev.length;
            const next = [...prev, ...arr];
            const newIndices = arr.map((_, i) => startIndex + i);
            setSelectedVideoIndices((prevSel) =>
                [...new Set([...prevSel, ...newIndices])].sort((a, b) => a - b)
            );
            return next;
        });
    };

    const onImagesSelected = (files: FileList | null) => {
        if (!files) return;
        const arr = Array.from(files);
        const tooLarge = arr.find((f) => f.size > MAX_VIDEO_SIZE_BYTES);
        if (tooLarge) {
            setError(`Image ${tooLarge.name} exceeds 10MB limit`);
            return;
        }
        setError(null);
        setImageFiles((prev) => [...prev, ...arr]);
    };

    const onBaseVideoSelected = (file: File | null) => {
        if (!file) return;
        if (file.size > MAX_VIDEO_SIZE_BYTES) {
            setError(`Base video ${file.name} exceeds 10MB limit`);
            return;
        }
        setError(null);
        setBaseVideoFile(file);
        setBaseVideoEnabled(true);
    };

    const toggleVideoSelection = (index: number, checked: boolean) => {
        if (checked) {
            setSelectedVideoIndices((prev) => [...new Set([...prev, index])].sort((a, b) => a - b));
        } else {
            setSelectedVideoIndices((prev) => prev.filter((i) => i !== index));
            setVideoOverlays((prev) => {
                const next = { ...prev };
                delete next[index];
                return next;
            });
            setOverlayPreview((prev) => {
                const next = { ...prev };
                delete next[index];
                return next;
            });
        }
    };

    const handleVideoOverlayChange = (videoIndex: number, overlayFilename: string) => {
        if (overlayFilename) {
            setVideoOverlays((prev) => ({ ...prev, [videoIndex]: overlayFilename }));
            setOverlayPreview((prev) => ({
                ...prev,
                [videoIndex]: getOverlayUrl(overlayFilename, selectedPlatform),
            }));
        } else {
            setVideoOverlays((prev) => {
                const next = { ...prev };
                delete next[videoIndex];
                return next;
            });
            setOverlayPreview((prev) => {
                const next = { ...prev };
                delete next[videoIndex];
                return next;
            });
        }
    };

    const handleProcess = async () => {
        if (!selectedPlatform) {
            setError('Please select a platform.');
            return;
        }
        if (videoFiles.length === 0) {
            setError('Please upload at least one ad video.');
            return;
        }
        if (selectedVideoIndices.length === 0) {
            setError('Please select at least one video to process.');
            return;
        }
        setError(null);
        setShowDownload(false);
        setIsProcessing(true);
        setProcessingProgress(5);

        if (progressTimer.current) {
            window.clearInterval(progressTimer.current);
        }
        progressTimer.current = window.setInterval(() => {
            setProcessingProgress((p) => Math.min(90, p + 3));
        }, 500);

        try {
            // ensure server state matches current selection
            await clearVideos();
            await clearImages();

            if (baseVideoEnabled && baseVideoFile) {
                await uploadBaseVideo(baseVideoFile);
                setProcessingProgress(15);
            }

            const selectedVideos = selectedVideoIndices.map((i) => videoFiles[i]);
            await uploadVideos(selectedVideos);
            setProcessingProgress(30);

            if (imageFiles.length > 0) {
                await uploadImages(imageFiles);
            }
            setProcessingProgress(45);

            const videoOverlaysArray = selectedVideoIndices.map(
                (index) => videoOverlays[index] || null
            );

            await processVideo({
                platform: selectedPlatform,
                base_duration: baseVideoEnabled ? baseDuration : 0,
                overlay: null,
                video_overlays: videoOverlaysArray,
            });

            setProcessingProgress(100);
            if (progressTimer.current) {
                window.clearInterval(progressTimer.current);
            }
            setTimeout(() => {
                setIsProcessing(false);
                setShowDownload(true);
                setPreviewUrl(null);
                // Auto-load preview inline; keep modal available
                void loadPreview();
            }, 400);
        } catch (err) {
            if (progressTimer.current) {
                window.clearInterval(progressTimer.current);
            }
            setIsProcessing(false);
            setProcessingProgress(0);
            const message =
                (err as { message?: string }).message || 'Processing failed. Please try again.';
            setError(message);
        }
    };

    const loadPreview = async () => {
        setError(null);
        try {
            const blob = await fetchProcessedVideoBlob();
            const url = URL.createObjectURL(blob);
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(url);
        } catch (err) {
            setError((err as { message?: string }).message || 'Preview failed.');
        }
    };

    const handleDownload = async () => {
        try {
            await downloadVideo();
        } catch (err) {
            setError((err as { message?: string }).message || 'Download failed.');
        }
    };

    const handleFullscreen = () => {
        if (!previewUrl) return;
        window.open(previewUrl, '_blank', 'noopener,noreferrer');
    };

    const handleClearAll = () => {
        setVideoFiles([]);
        setSelectedVideoIndices([]);
        setImageFiles([]);
        setBaseVideoFile(null);
        setBaseDuration(5);
        setVideoOverlays({});
        setOverlayPreview({});
        setShowDownload(false);
        setError(null);
        setIsProcessing(false);
        setProcessingProgress(0);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const removeVideo = (index: number) => {
        setVideoFiles((prev) => prev.filter((_, i) => i !== index));
        setSelectedVideoIndices((prev) =>
            prev
                .filter((i) => i !== index)
                .map((i) => (i > index ? i - 1 : i))
                .sort((a, b) => a - b)
        );
        setVideoOverlays((prev) => {
            const next: VideoOverlayMap = {};
            Object.entries(prev).forEach(([key, val]) => {
                const k = Number(key);
                if (k < index) next[k] = val;
                else if (k > index) next[k - 1] = val;
            });
            return next;
        });
        setOverlayPreview((prev) => {
            const next: VideoOverlayImages = {};
            Object.entries(prev).forEach(([key, val]) => {
                const k = Number(key);
                if (k < index) next[k] = val;
                else if (k > index) next[k - 1] = val;
            });
            return next;
        });
    };

    const removeImage = (index: number) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const renderFramePreview = () => {
        if (!fixedFrames.length) return null;
        const first = fixedFrames.slice(0, 3);
        return (
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span>Frames loaded:</span>
                <div className="flex gap-2">
                    {first.map((name) => (
                        <img
                            key={name}
                            src={getFrameUrl(name, selectedPlatform)}
                            alt={name}
                            className="h-10 w-16 rounded border border-gray-200 object-cover dark:border-gray-700"
                        />
                    ))}
                    {fixedFrames.length > 3 && (
                        <span className="text-gray-400">+{fixedFrames.length - 3} more</span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            <PageMeta
                title="Ad Mockup Studio | Creative Dashboard"
                description="Create and preview ad mockups for various platforms"
            />
            <PageBreadcrumb pageTitle="Ad Mockup Studio" />

            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-10">
                <header className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Ad Mockup Studio
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Upload platform frames, overlays, and videos to produce stitched
                            mockups.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowHelpModal(true)}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-100 text-brand-600 transition hover:bg-brand-50 dark:border-brand-900/60 dark:text-brand-300 dark:hover:bg-brand-900/30"
                            aria-label="Open Ad Mockup help"
                        >
                            <QuestionCircleIcon className="h-5 w-5" />
                        </button>
                        <Button size="sm" variant="outline" onClick={handleClearAll}>
                            Clear all
                        </Button>
                        {/* Preview button moved to inline panel/modal triggers; removed from header */}
                    </div>
                </header>

                {error && (
                    <div className="mb-4 rounded border border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-600 dark:bg-red-900/30 dark:text-red-200">
                        {error}
                    </div>
                )}

                <section className="space-y-6">
                    <div className="grid gap-6 xl:grid-cols-2">
                        <div className="space-y-6">
                            <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            Platform
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Choose target platform to use matching frames/overlays.
                                        </p>
                                    </div>
                                    <select
                                        value={selectedPlatform}
                                        onChange={(e) => handlePlatformChange(e.target.value)}
                                        className="rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    >
                                        <option value="">Select platform</option>
                                        {PLATFORM_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mt-3">{renderFramePreview()}</div>
                            </div>

                            <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            Upload ad videos (10MB max each)
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Select one or multiple; pick which to process.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-col gap-3">
                                    <input
                                        type="file"
                                        accept="video/*"
                                        multiple
                                        onChange={(e) => onVideosSelected(e.target.files)}
                                        className="text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-300 dark:file:bg-gray-800 dark:file:text-gray-100"
                                    />
                                    {videoFiles.length > 0 && (
                                        <div className="space-y-2">
                                            {videoFiles.map((file, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-sm dark:border-gray-700"
                                                >
                                                    <label className="flex flex-1 items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedVideoIndices.includes(
                                                                idx
                                                            )}
                                                            onChange={(e) =>
                                                                toggleVideoSelection(
                                                                    idx,
                                                                    e.target.checked
                                                                )
                                                            }
                                                            className="h-4 w-4"
                                                        />
                                                        <span className="truncate text-gray-800 dark:text-gray-200">
                                                            {file.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {(file.size / (1024 * 1024)).toFixed(1)}{' '}
                                                            MB
                                                        </span>
                                                    </label>
                                                    <select
                                                        value={videoOverlays[idx] || ''}
                                                        onChange={(e) =>
                                                            handleVideoOverlayChange(
                                                                idx,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="ml-3 rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                                    >
                                                        <option value="">No overlay</option>
                                                        {overlayImages.map((ov) => (
                                                            <option key={ov} value={ov}>
                                                                {ov}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVideo(idx)}
                                                        className="ml-3 text-xs text-red-500 hover:text-red-600"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            Base video (optional)
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Trimmed and prepended to the processed ad.
                                        </p>
                                    </div>
                                    <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={baseVideoEnabled}
                                            onChange={(e) => setBaseVideoEnabled(e.target.checked)}
                                            className="h-4 w-4"
                                        />
                                        Enable base video
                                    </label>
                                </div>
                                <div className="mt-3 flex flex-col gap-3">
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) =>
                                            onBaseVideoSelected(e.target.files?.[0] || null)
                                        }
                                        className="text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-300 dark:file:bg-gray-800 dark:file:text-gray-100"
                                    />
                                    <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                                        Duration (seconds, max 10):
                                        <input
                                            type="number"
                                            min={0}
                                            max={10}
                                            value={baseDuration}
                                            onChange={(e) =>
                                                setBaseDuration(Number(e.target.value))
                                            }
                                            className="w-20 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        />
                                    </label>
                                    {baseVideoFile && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Selected: {baseVideoFile.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {overlayImages.length > 0 && (
                                <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
                                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                        Overlays
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Pick an overlay per video (optional).
                                    </p>
                                    {Object.keys(overlayPreview).length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-3">
                                            {Object.entries(overlayPreview).map(([idx, src]) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-2 rounded border border-gray-200 px-2 py-1 text-xs dark:border-gray-700"
                                                >
                                                    <span className="text-gray-600 dark:text-gray-300">
                                                        Video {Number(idx) + 1}
                                                    </span>
                                                    <img
                                                        src={src}
                                                        alt={`overlay-${idx}`}
                                                        className="h-10 w-16 rounded border border-gray-200 object-cover dark:border-gray-700"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            Upload user images (optional)
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Images are overlaid after platform frames.
                                        </p>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => onImagesSelected(e.target.files)}
                                    className="mt-3 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-300 dark:file:bg-gray-800 dark:file:text-gray-100"
                                />
                                {imageFiles.length > 0 && (
                                    <div className="mt-3 space-y-2 text-xs text-gray-700 dark:text-gray-200">
                                        {imageFiles.map((file, idx) => (
                                            <div
                                                key={`${file.name}-${idx}`}
                                                className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 dark:border-gray-700"
                                            >
                                                <span className="truncate">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="ml-3 text-xs text-red-500 hover:text-red-600"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                    Process & Preview
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Runs FFmpeg on the server using {platformLabel} frames.
                                </p>
                            </div>
                            <Button size="sm" onClick={handleProcess} disabled={isProcessing}>
                                {isProcessing ? 'Processing...' : 'Process videos'}
                            </Button>
                        </div>
                        <div className="mt-4">
                            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                                <div
                                    className="h-2 rounded-full bg-blue-500 transition-all"
                                    style={{ width: `${processingProgress}%` }}
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                {isProcessing
                                    ? 'Working...'
                                    : showDownload
                                      ? 'Ready to download'
                                      : 'Idle'}
                            </p>
                            {previewUrl && (
                                <div className="mt-4 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                                        <span>Inline preview (processed video)</span>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleDownload}
                                            >
                                                Download
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleFullscreen}
                                            >
                                                View fullscreen
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="aspect-video w-full overflow-hidden rounded bg-black">
                                        <video
                                            key={previewUrl}
                                            src={previewUrl}
                                            controls
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
            {/* Help Modal */}
            <AdMockupHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
        </div>
    );
}
