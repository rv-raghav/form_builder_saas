import Label from '../../../../../../components/form/Label';
import Input from '../../../../../../components/form/input/InputField';
import SelectField from '../../../../../../components/form/input/SelectField';
import Checkbox from '../../../../../../components/form/input/Checkbox';
import { LandingPageConfig } from '../../../../../../api/landingPages';

interface Props {
    config: LandingPageConfig;
    updateConfig: (path: string, value: unknown) => void;
}

// Timezone options
const timezoneOptions = [
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'America/New_York (EST)' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
    { value: 'Europe/London', label: 'Europe/London (GMT)' },
];

export default function EventDetailsSection({ config, updateConfig }: Props) {
    return (
        <section>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                        id="start-date"
                        name="start-date"
                        type="date"
                        value={config.event.startDate}
                        onChange={(e) => updateConfig('event.startDate', e.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                        id="start-time"
                        name="start-time"
                        type="time"
                        value={config.event.startTime}
                        onChange={(e) => updateConfig('event.startTime', e.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                        id="end-date"
                        name="end-date"
                        type="date"
                        value={config.event.endDate}
                        onChange={(e) => updateConfig('event.endDate', e.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor="end-time">End Time</Label>
                    <Input
                        id="end-time"
                        name="end-time"
                        type="time"
                        value={config.event.endTime}
                        onChange={(e) => updateConfig('event.endTime', e.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                        id="location"
                        name="location"
                        type="text"
                        value={config.event.location}
                        onChange={(e) => updateConfig('event.location', e.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <SelectField
                        id="timezone"
                        name="timezone"
                        options={timezoneOptions}
                        value={config.event.timezone}
                        onChange={(e) => updateConfig('event.timezone', e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4">
                    <Checkbox
                        id="show-countdown"
                        label="Show Countdown"
                        checked={config.event.showCountdown}
                        onChange={(checked) => updateConfig('event.showCountdown', checked)}
                    />
                    <Checkbox
                        id="all-day"
                        label="All Day Event"
                        checked={config.event.allDay}
                        onChange={(checked) => updateConfig('event.allDay', checked)}
                    />
                </div>
            </div>
        </section>
    );
}
