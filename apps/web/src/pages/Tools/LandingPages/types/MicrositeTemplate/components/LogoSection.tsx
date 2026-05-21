import Label from '../../../../../../components/form/Label';
import Input from '../../../../../../components/form/input/InputField';
import { MicrositeConfig } from '../../../../../../api/landingPages';

interface Props {
    config: MicrositeConfig;
    updateConfig: (path: string, value: unknown) => void;
    onImageUpload: (file: File, callback: (base64: string, filename: string) => void) => void;
    errors: Record<string, string>;
}

export default function LogoSection({ config, updateConfig, onImageUpload, errors }: Props) {
    return (
        <section>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Logo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="logo-upload">
                        Logo Image <span className="text-error-500">*</span>
                    </Label>
                    <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            e.target.files?.[0] &&
                            onImageUpload(e.target.files[0], (b64, filename) => {
                                updateConfig('logo.url', b64);
                                updateConfig('logo_name', filename);
                            })
                        }
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                    />
                    {config.logo.url && (
                        <img src={config.logo.url} alt="Logo preview" className="mt-2 h-16 object-contain" />
                    )}
                    {errors['logo.url'] && (
                        <p className="mt-1 text-sm text-error-500">{errors['logo.url']}</p>
                    )}
                </div>
                <div>
                    <Label htmlFor="logo-height">Logo Height</Label>
                    <Input
                        id="logo-height"
                        name="logo-height"
                        type="text"
                        value={config.logo.logo_height}
                        onChange={(e) => updateConfig('logo.logo_height', e.target.value)}
                        placeholder="60px"
                    />
                </div>
            </div>
        </section>
    );
}
