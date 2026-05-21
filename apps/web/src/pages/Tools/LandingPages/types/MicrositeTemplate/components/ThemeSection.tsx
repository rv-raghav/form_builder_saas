import Label from '../../../../../../components/form/Label';
import Input from '../../../../../../components/form/input/InputField';
import { MicrositeConfig } from '../../../../../../api/landingPages';

interface Props {
    config: MicrositeConfig;
    updateConfig: (path: string, value: unknown) => void;
}

export default function ThemeSection({ config, updateConfig }: Props) {
    return (
        <section>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Theme</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="bg-color">Background Color</Label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={config.theme.background_color}
                            onChange={(e) => updateConfig('theme.background_color', e.target.value)}
                            className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                            id="bg-color"
                            name="bg-color"
                            type="text"
                            value={config.theme.background_color}
                            onChange={(e) => updateConfig('theme.background_color', e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <Label htmlFor="gradient-color1">Gradient Color 1</Label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={config.theme.color1 || '#ffffff'}
                            onChange={(e) => updateConfig('theme.color1', e.target.value)}
                            className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                            id="gradient-color1"
                            name="gradient-color1"
                            type="text"
                            value={config.theme.color1}
                            onChange={(e) => updateConfig('theme.color1', e.target.value)}
                            placeholder="Leave empty for solid color"
                        />
                    </div>
                </div>
                <div>
                    <Label htmlFor="gradient-color2">Gradient Color 2</Label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={config.theme.color2 || '#ffffff'}
                            onChange={(e) => updateConfig('theme.color2', e.target.value)}
                            className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                            id="gradient-color2"
                            name="gradient-color2"
                            type="text"
                            value={config.theme.color2}
                            onChange={(e) => updateConfig('theme.color2', e.target.value)}
                            placeholder="Leave empty for solid color"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
