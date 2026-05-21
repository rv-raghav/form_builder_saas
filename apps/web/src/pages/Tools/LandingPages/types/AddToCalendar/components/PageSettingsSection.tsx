import Label from '../../../../../../components/form/Label';
import Input from '../../../../../../components/form/input/InputField';
import { LandingPageConfig } from '../../../../../../api/landingPages';

interface Props {
    config: LandingPageConfig;
    updateConfig: (path: string, value: unknown) => void;
}

export default function PageSettingsSection({ config, updateConfig }: Props) {
    return (
        <section>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Page Settings</h3>
            <div>
                <Label htmlFor="page-title">Page Title (SEO)</Label>
                <Input
                    id="page-title"
                    name="page-title"
                    type="text"
                    value={config.meta.pageTitle}
                    onChange={(e) => updateConfig('meta.pageTitle', e.target.value)}
                    placeholder="Event Page"
                />
            </div>
        </section>
    );
}
