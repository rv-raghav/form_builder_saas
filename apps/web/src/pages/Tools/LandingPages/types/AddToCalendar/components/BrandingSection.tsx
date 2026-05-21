import Label from '../../../../../../components/form/Label';
import Input from '../../../../../../components/form/input/InputField';
import TextArea from '../../../../../../components/form/input/TextArea';
import { LandingPageConfig } from '../../../../../../api/landingPages';

interface Props {
    config: LandingPageConfig;
    updateConfig: (path: string, value: unknown) => void;
    errors: Record<string, string>;
}

export default function BrandingSection({ config, updateConfig, errors }: Props) {
    return (
        <section>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Branding</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="organizer">
                        Organizer Name <span className="text-error-500">*</span>
                    </Label>
                    <Input
                        id="organizer"
                        name="organizer"
                        type="text"
                        value={config.branding.organizer}
                        onChange={(e) => updateConfig('branding.organizer', e.target.value)}
                        error={!!errors['branding.organizer']}
                        hint={errors['branding.organizer']}
                    />
                </div>
                <div>
                    <Label htmlFor="event-title">
                        Event Title <span className="text-error-500">*</span>
                    </Label>
                    <Input
                        id="event-title"
                        name="event-title"
                        type="text"
                        value={config.branding.eventTitle}
                        onChange={(e) => updateConfig('branding.eventTitle', e.target.value)}
                        error={!!errors['branding.eventTitle']}
                        hint={errors['branding.eventTitle']}
                    />
                </div>
                <div className="md:col-span-2">
                    <Label htmlFor="event-teaser">
                        Event Teaser / Description <span className="text-error-500">*</span>
                    </Label>
                    <TextArea
                        id="event-teaser"
                        name="event-teaser"
                        value={config.branding.eventTeaser}
                        onChange={(value) => updateConfig('branding.eventTeaser', value)}
                        rows={2}
                        error={!!errors['branding.eventTeaser']}
                        hint={errors['branding.eventTeaser']}
                    />
                </div>
            </div>
        </section>
    );
}
