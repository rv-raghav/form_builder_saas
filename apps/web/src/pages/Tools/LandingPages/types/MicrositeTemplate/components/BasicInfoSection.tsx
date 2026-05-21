import { useState } from 'react';
import Label from '../../../../../../components/form/Label';
import Input from '../../../../../../components/form/input/InputField';
import SelectField from '../../../../../../components/form/input/SelectField';
import Button from '../../../../../../components/ui/button/Button';

interface Props {
    name: string;
    onNameChange: (value: string) => void;
    selectedBrand: string;
    onBrandChange: (brandId: string) => void;
    selectedCampaign: string;
    onCampaignChange: (campaignId: string) => void;
    brandOptions: { value: number; label: string }[];
    campaignOptions: { value: number; label: string }[];
    editingId: number | null;
    errors: Record<string, string>;
    onCreateBrand: (name: string) => Promise<void>;
    onCreateCampaign: (name: string) => Promise<void>;
}

export default function BasicInfoSection({
    name,
    onNameChange,
    selectedBrand,
    onBrandChange,
    selectedCampaign,
    onCampaignChange,
    brandOptions,
    campaignOptions,
    editingId,
    errors,
    onCreateBrand,
    onCreateCampaign,
}: Props) {
    const [showNewBrand, setShowNewBrand] = useState(false);
    const [newBrandName, setNewBrandName] = useState('');
    const [showNewCampaign, setShowNewCampaign] = useState(false);
    const [newCampaignName, setNewCampaignName] = useState('');

    const handleBrandSubmit = async () => {
        await onCreateBrand(newBrandName);
        setNewBrandName('');
        setShowNewBrand(false);
    };

    const handleCampaignSubmit = async () => {
        await onCreateCampaign(newCampaignName);
        setNewCampaignName('');
        setShowNewCampaign(false);
    };

    return (
        <section>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="lp-name">
                        Landing Page Name <span className="text-error-500">*</span>
                    </Label>
                    <Input
                        id="lp-name"
                        name="lp-name"
                        type="text"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        error={!!errors.name}
                        hint={errors.name}
                    />
                </div>

                {/* Brand Selection */}
                <div>
                    <Label htmlFor="lp-brand">
                        Brand <span className="text-error-500">*</span>
                    </Label>
                    {showNewBrand ? (
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Input
                                    id="new-brand"
                                    name="new-brand"
                                    type="text"
                                    value={newBrandName}
                                    onChange={(e) => setNewBrandName(e.target.value)}
                                    placeholder="New brand name"
                                />
                            </div>
                            <Button variant="success" size="sm" onClick={handleBrandSubmit}>
                                Add
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setShowNewBrand(false)}>
                                Cancel
                            </Button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <SelectField
                                    id="lp-brand"
                                    name="lp-brand"
                                    options={brandOptions.map(o => ({ value: o.value, label: o.label }))}
                                    value={selectedBrand}
                                    onChange={(e) => {
                                        onBrandChange(e.target.value);
                                        onCampaignChange('');
                                    }}
                                    placeholder="Select Brand"
                                    disabled={editingId !== null}
                                />
                            </div>
                            {!editingId && (
                                <Button variant="outline" size="sm" onClick={() => setShowNewBrand(true)}>
                                    + New
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Campaign Selection */}
                <div>
                    <Label htmlFor="lp-campaign">
                        Campaign <span className="text-error-500">*</span>
                    </Label>
                    {showNewCampaign ? (
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Input
                                    id="new-campaign"
                                    name="new-campaign"
                                    type="text"
                                    value={newCampaignName}
                                    onChange={(e) => setNewCampaignName(e.target.value)}
                                    placeholder="New campaign name"
                                />
                            </div>
                            <Button variant="success" size="sm" onClick={handleCampaignSubmit}>
                                Add
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setShowNewCampaign(false)}>
                                Cancel
                            </Button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <SelectField
                                    id="lp-campaign"
                                    name="lp-campaign"
                                    options={campaignOptions.map(o => ({ value: o.value, label: o.label }))}
                                    value={selectedCampaign}
                                    onChange={(e) => onCampaignChange(e.target.value)}
                                    placeholder="Select Campaign"
                                    disabled={editingId !== null || !selectedBrand}
                                />
                            </div>
                            {!editingId && selectedBrand && (
                                <Button variant="outline" size="sm" onClick={() => setShowNewCampaign(true)}>
                                    + New
                                </Button>
                            )}
                        </div>
                    )}
                    {errors.campaign && (
                        <p className="mt-1 text-sm text-error-500">{errors.campaign}</p>
                    )}
                </div>
            </div>
        </section>
    );
}
