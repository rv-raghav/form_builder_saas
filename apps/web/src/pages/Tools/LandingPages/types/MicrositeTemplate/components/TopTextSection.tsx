import Label from '../../../../../../components/form/Label';
import Input from '../../../../../../components/form/input/InputField';
import TextArea from '../../../../../../components/form/input/TextArea';
import { MicrositeConfig } from '../../../../../../api/landingPages';

interface Props {
    config: MicrositeConfig;
    updateConfig: (path: string, value: unknown) => void;
}

export default function TopTextSection({ config, updateConfig }: Props) {
    return (
        <section>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Text</h3>
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <Label htmlFor="top-title">Title</Label>
                    <Input
                        id="top-title"
                        name="top-title"
                        type="text"
                        value={config.top_text.title}
                        onChange={(e) => updateConfig('top_text.title', e.target.value)}
                        placeholder="Shop Now with Our Partners"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use &lt;br&gt; for line breaks</p>
                </div>
                <div>
                    <Label htmlFor="top-description">Description</Label>
                    <TextArea
                        id="top-description"
                        name="top-description"
                        value={config.top_text.description}
                        onChange={(value) => updateConfig('top_text.description', value)}
                        rows={2}
                        placeholder="Discover exclusive deals"
                    />
                </div>
            </div>
        </section>
    );
}
