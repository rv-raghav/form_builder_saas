import { Modal } from '../../../../components/ui/modal';

interface AdMockupHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AdMockupHelpModal({ isOpen, onClose }: AdMockupHelpModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="w-full h-[95vh] mx-4 md:mx-8 lg:mx-16 max-h-[95vh] overflow-y-auto p-0"
        >
            <div className="space-y-10 rounded-3xl bg-gradient-to-br from-white via-white to-brand-50/40 p-10 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/60">
                <header className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.25em] text-brand-600 dark:text-brand-300">
                        Help Center
                    </p>
                    <h1 className="text-3xl font-semibold leading-tight text-brand-700 dark:text-brand-200">
                        Ad Mockup Studio Guide
                    </h1>
                    <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
                        A concise walkthrough to combine your ads with platform frames, overlays,
                        and extras.
                    </p>
                </header>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-brand-700 dark:text-brand-200">
                        Where to find it
                    </h2>
                    <ul className="list-disc space-y-2 pl-6 text-base text-gray-700 dark:text-gray-200">
                        <li>Open the sidebar: Tools → Ad Mockup Studio.</li>
                        <li>
                            Direct link:{' '}
                            <code className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                                /tools/ad-mockup-studio
                            </code>
                        </li>
                        <li>Make sure you're logged in.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-brand-700 dark:text-brand-200">
                        Quick steps
                    </h2>
                    <ol className="list-decimal space-y-3 pl-6 text-base text-gray-800 dark:text-gray-100">
                        <li>
                            <strong>Choose platform</strong> (Zee5, Jio/Hotstar, MX Player, AajTak).
                        </li>
                        <li>
                            <strong>Upload ad videos</strong> (one or many, ≤10MB each). You can add
                            more later and remove any. Leave the checkbox on for videos you want to
                            process.
                        </li>
                        <li>
                            <strong>Optional overlays</strong>: only Jio/Hotstar and MX Player have
                            overlay images. Pick one per video if you like.
                        </li>
                        <li>
                            <strong>Optional images</strong>: upload extra images to place over the
                            video; remove any you don't need.
                        </li>
                        <li>
                            <strong>Optional base video</strong>: upload a clip to play first and
                            set how many seconds (0–10) to include.
                        </li>
                        <li>
                            <strong>Process & Preview</strong>: click "Process videos." When done,
                            an inline preview appears. You can Download or View fullscreen.
                        </li>
                    </ol>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-brand-700 dark:text-brand-200">
                        Rules & limits
                    </h2>
                    <ul className="list-disc space-y-2 pl-6 text-base text-gray-800 dark:text-gray-100">
                        <li>Max size: 10MB per video or image.</li>
                        <li>Video types: mp4, mov, mkv, webm.</li>
                        <li>
                            Overlays: available only for Jio/Hotstar and MX Player; none for
                            Zee5/AajTak.
                        </li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-brand-700 dark:text-brand-200">
                        If something isn't working
                    </h2>
                    <ul className="list-disc space-y-2 pl-6 text-base text-gray-800 dark:text-gray-100">
                        <li>
                            No overlays: pick Jio/Hotstar or MX Player (other platforms don't have
                            overlays).
                        </li>
                        <li>
                            Processing fails: ensure at least one video is uploaded and each file is
                            under 10MB.
                        </li>
                        <li>
                            No preview: wait for processing to finish; if still missing, try smaller
                            files and re-run.
                        </li>
                    </ul>
                </section>
            </div>
        </Modal>
    );
}
