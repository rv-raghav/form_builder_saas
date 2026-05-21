import Label from '../../../../../../components/form/Label';
import Checkbox from '../../../../../../components/form/input/Checkbox';
import SelectField from '../../../../../../components/form/input/SelectField';
import { MicrositeConfig } from '../../../../../../api/landingPages';

interface Props {
    config: MicrositeConfig;
    updateConfig: (path: string, value: unknown) => void;
    onImageUpload: (file: File, callback: (base64: string, filename: string) => void) => void;
}

const animationOptions = [
    { value: 'right', label: 'Slide from Right' },
    { value: 'left', label: 'Slide from Left' },
    { value: 'bottom', label: 'Slide from Bottom' },
];

export default function ProductSection({ config, updateConfig, onImageUpload }: Props) {
    return (
        <section>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Product Display</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="product-image">Product Image</Label>
                    <input
                        id="product-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            e.target.files?.[0] &&
                            onImageUpload(e.target.files[0], (b64, filename) => {
                                updateConfig('product_conf.image', b64);
                                updateConfig('product_conf.image_name', filename);
                            })
                        }
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700"
                    />
                    {config.product_conf.image && (
                        <img
                            src={config.product_conf.image}
                            alt="Product preview"
                            className="mt-2 h-20 object-contain"
                        />
                    )}
                    <p className="text-xs text-gray-500 mt-1">Default: Shopping cart image</p>
                </div>
                <div>
                    <Label htmlFor="animation">Animation</Label>
                    <div className="flex items-center gap-4 mb-2">
                        <Checkbox
                            id="enable-animation"
                            label="Enable Animation"
                            checked={config.product_conf.animation}
                            onChange={(checked) => updateConfig('product_conf.animation', checked)}
                        />
                    </div>
                    {config.product_conf.animation && (
                        <SelectField
                            id="animation"
                            name="animation"
                            options={animationOptions}
                            value={config.product_conf.animation_key}
                            onChange={(e) =>
                                updateConfig('product_conf.animation_key', e.target.value)
                            }
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
