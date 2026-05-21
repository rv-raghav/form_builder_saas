import Label from '../../../../../../components/form/Label';
import Input from '../../../../../../components/form/input/InputField';
import SelectField from '../../../../../../components/form/input/SelectField';
import { LandingPageConfig, CTA_TYPES } from '../../../../../../api/landingPages';

interface Props {
    config: LandingPageConfig;
    updateConfig: (path: string, value: unknown) => void;
    errors: Record<string, string>;
}

// CTA type options
const ctaTypeOptions = Object.entries(CTA_TYPES).map(([key, label]) => ({
    value: Number(key),
    label: label || '(None)',
}));

export default function CtaShareSection({ config, updateConfig, errors }: Props) {
    return (
        <section>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">CTA & Share</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="cta-type">CTA Button Type</Label>
                    <SelectField
                        id="cta-type"
                        name="cta-type"
                        options={ctaTypeOptions}
                        value={config.cta.type}
                        onChange={(e) => updateConfig('cta.type', Number(e.target.value))}
                    />
                </div>
                <div>
                    <Label htmlFor="cta-url">CTA URL</Label>
                    <Input
                        id="cta-url"
                        name="cta-url"
                        type="url"
                        value={config.cta.url}
                        onChange={(e) => updateConfig('cta.url', e.target.value)}
                        placeholder="https://..."
                        error={!!errors['cta.url']}
                        hint={errors['cta.url']}
                    />
                </div>
                <div className="md:col-span-2">
                    <Label htmlFor="share-url">Share URL</Label>
                    <Input
                        id="share-url"
                        name="share-url"
                        type="url"
                        value={config.share.url}
                        onChange={(e) => updateConfig('share.url', e.target.value)}
                        placeholder="https://..."
                        error={!!errors['share.url']}
                        hint={errors['share.url']}
                    />
                </div>
            </div>
        </section>
    );
}
