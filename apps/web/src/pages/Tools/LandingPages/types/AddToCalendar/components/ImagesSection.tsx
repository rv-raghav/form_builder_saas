import Label from '../../../../../../components/form/Label';

interface Props {
    primaryImage: string;
    welcomeImage: string;
    onImageUpload: (file: File, type: 'primary' | 'welcome') => void;
}

export default function ImagesSection({ primaryImage, welcomeImage, onImageUpload }: Props) {
    return (
        <section>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="primary-image">Primary Image (Header)</Label>
                    <input
                        id="primary-image"
                        name="primary-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            e.target.files?.[0] && onImageUpload(e.target.files[0], 'primary')
                        }
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/20 dark:file:text-brand-400"
                    />
                    {primaryImage && (
                        <img
                            src={primaryImage}
                            alt="Primary preview"
                            className="mt-2 h-20 object-cover rounded"
                        />
                    )}
                </div>
                <div>
                    <Label htmlFor="welcome-image">Welcome Image (Loading screen)</Label>
                    <input
                        id="welcome-image"
                        name="welcome-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            e.target.files?.[0] && onImageUpload(e.target.files[0], 'welcome')
                        }
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/20 dark:file:text-brand-400"
                    />
                    {welcomeImage && (
                        <img
                            src={welcomeImage}
                            alt="Welcome preview"
                            className="mt-2 h-20 object-cover rounded"
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
